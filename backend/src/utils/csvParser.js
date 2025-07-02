const Papa = require('papaparse');
const fs = require('fs').promises;
const crypto = require('crypto');
const validator = require('validator');
const { logger } = require('./logger');

class CSVParser {
 constructor(options = {}) {
   this.defaultOptions = {
     maxFileSize: 10 * 1024 * 1024, // 10MB
     maxRows: 10000,
     allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
     requiredColumns: ['email'],
     optionalColumns: ['name', 'company', 'tags', 'subscribed'],
     encoding: 'utf-8',
     delimiter: ',',
     skipEmptyLines: true,
     dynamicTyping: true,
     trimHeaders: true,
     transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_')
   };
   this.options = { ...this.defaultOptions, ...options };
 }

 async parseFile(filePath, customOptions = {}) {
   try {
     const stats = await fs.stat(filePath);
     if (stats.size > this.options.maxFileSize) {
       throw new Error(`File size ${stats.size} exceeds maximum allowed size of ${this.options.maxFileSize} bytes`);
     }

     const fileContent = await fs.readFile(filePath, this.options.encoding);
     return this.parseString(fileContent, customOptions);
   } catch (error) {
     logger.error('Error parsing CSV file:', error);
     throw error;
   }
 }

 parseString(csvString, customOptions = {}) {
   const parseOptions = {
     ...this.options,
     ...customOptions,
     complete: (results) => results,
     error: (error) => {
       logger.error('Papa Parse error:', error);
       throw new Error(`CSV parsing failed: ${error.message}`);
     }
   };

   const results = Papa.parse(csvString, parseOptions);
   
   if (results.errors.length > 0) {
     const errors = results.errors.map(e => `Row ${e.row}: ${e.message}`).join('; ');
     throw new Error(`CSV parsing errors: ${errors}`);
   }

   return this.processResults(results);
 }

 processResults(results) {
   const { data, meta } = results;
   
   if (data.length === 0) {
     throw new Error('CSV file is empty');
   }

   if (data.length > this.options.maxRows) {
     throw new Error(`CSV contains ${data.length} rows, exceeding maximum of ${this.options.maxRows}`);
   }

   // Validate headers
   const headers = meta.fields || Object.keys(data[0] || {});
   const normalizedHeaders = headers.map(h => this.options.transformHeader(h));
   
   const missingRequired = this.options.requiredColumns.filter(
     col => !normalizedHeaders.includes(col)
   );
   
   if (missingRequired.length > 0) {
     throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
   }

   // Process and validate data
   const processedData = this.validateAndCleanData(data, normalizedHeaders);
   
   return {
     data: processedData,
     meta: {
       ...meta,
       originalRowCount: data.length,
       processedRowCount: processedData.length,
       headers: normalizedHeaders,
       hash: this.generateHash(csvString)
     }
   };
 }

 validateAndCleanData(data, headers) {
   const processed = [];
   const errors = [];
   const emailSet = new Set();
   const duplicates = [];

   data.forEach((row, index) => {
     try {
       const cleanRow = {};
       let isValid = true;

       // Normalize keys
       Object.keys(row).forEach(key => {
         const normalizedKey = this.options.transformHeader(key);
         cleanRow[normalizedKey] = row[key];
       });

       // Validate email
       if (cleanRow.email) {
         cleanRow.email = cleanRow.email.toLowerCase().trim();
         
         if (!validator.isEmail(cleanRow.email)) {
           errors.push({ row: index + 1, error: 'Invalid email format' });
           isValid = false;
         } else if (emailSet.has(cleanRow.email)) {
           duplicates.push({ row: index + 1, email: cleanRow.email });
           isValid = false;
         } else {
           emailSet.add(cleanRow.email);
         }
       } else {
         errors.push({ row: index + 1, error: 'Missing email' });
         isValid = false;
       }

       // Clean other fields
       if (cleanRow.name) {
         cleanRow.name = cleanRow.name.trim().substring(0, 100);
       }

       if (cleanRow.company) {
         cleanRow.company = cleanRow.company.trim().substring(0, 100);
       }

       if (cleanRow.tags) {
         cleanRow.tags = this.parseTags(cleanRow.tags);
       }

       if (cleanRow.subscribed !== undefined) {
         cleanRow.subscribed = this.parseBoolean(cleanRow.subscribed);
       }

       // Add metadata
       cleanRow._rowIndex = index + 1;
       cleanRow._isValid = isValid;

       if (isValid) {
         processed.push(cleanRow);
       }
     } catch (error) {
       errors.push({ row: index + 1, error: error.message });
     }
   });

   if (errors.length > 0) {
     logger.warn('CSV validation errors:', errors);
   }

   if (duplicates.length > 0) {
     logger.warn('Duplicate emails found:', duplicates);
   }

   return processed;
 }

 parseTags(tags) {
   if (!tags) return [];
   
   if (Array.isArray(tags)) return tags;
   
   if (typeof tags === 'string') {
     return tags
       .split(/[,;|]/)
       .map(tag => tag.trim())
       .filter(tag => tag.length > 0)
       .slice(0, 10); // Max 10 tags
   }
   
   return [];
 }

 parseBoolean(value) {
   if (typeof value === 'boolean') return value;
   if (typeof value === 'string') {
     const lowercased = value.toLowerCase().trim();
     return ['true', 'yes', '1', 'y', 'on'].includes(lowercased);
   }
   return Boolean(value);
 }

 generateHash(content) {
   return crypto.createHash('sha256').update(content).digest('hex');
 }

 async parseEmailList(csvString) {
   const results = this.parseString(csvString, {
     requiredColumns: ['email'],
     optionalColumns: ['name', 'tags']
   });

   return results.data.map(row => ({
     email: row.email,
     name: row.name || null,
     tags: row.tags || [],
     metadata: {
       rowIndex: row._rowIndex,
       isValid: row._isValid
     }
   }));
 }

 generateCSV(data, options = {}) {
   const csvOptions = {
     quotes: true,
     header: true,
     delimiter: this.options.delimiter,
     ...options
   };

   return Papa.unparse(data, csvOptions);
 }

 async streamParse(filePath, onChunk, options = {}) {
   const streamOptions = {
     ...this.options,
     ...options,
     chunk: (results, parser) => {
       const processed = this.validateAndCleanData(results.data, results.meta.fields);
       onChunk(processed, parser);
     }
   };

   const fileStream = await fs.readFile(filePath, this.options.encoding);
   return Papa.parse(fileStream, streamOptions);
 }

 detectDelimiter(sample) {
   const delimiters = [',', ';', '\t', '|'];
   const counts = {};

   delimiters.forEach(delimiter => {
     counts[delimiter] = (sample.match(new RegExp(delimiter, 'g')) || []).length;
   });

   return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
 }

 validateCSVStructure(headers, requiredColumns = null) {
   const required = requiredColumns || this.options.requiredColumns;
   const normalizedHeaders = headers.map(h => this.options.transformHeader(h));
   
   const missing = required.filter(col => !normalizedHeaders.includes(col));
   const valid = missing.length === 0;

   return {
     valid,
     missing,
     headers: normalizedHeaders,
     extra: normalizedHeaders.filter(h => 
       !required.includes(h) && !this.options.optionalColumns.includes(h)
     )
   };
 }
}

module.exports = new CSVParser();
module.exports.CSVParser = CSVParser;