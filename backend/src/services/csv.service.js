const fs = require('fs').promises;
const csv = require('csv-parser');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const stream = require('stream');
const util = require('util');
const crypto = require('crypto');
const validator = require('validator');
const Repository = require('../models/Repository.model');
const Email = require('../models/Email.model');
const { logger } = require('../utils/logger');
const { validateEmail, sanitizeEmail } = require('../utils/validators');
const snowballService = require('./snowball.service');
const emailService = require('./email.service');

const pipeline = util.promisify(stream.pipeline);

class CSVService {
 constructor() {
   this.maxFileSize = 10 * 1024 * 1024; // 10MB
   this.allowedMimeTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];
   this.batchSize = 100;
 }

 async parseCSV(filePath, options = {}) {
   try {
     const emails = [];
     const errors = [];
     const stats = {
       total: 0,
       valid: 0,
       invalid: 0,
       duplicate: 0,
       processed: 0
     };

     const parser = fs.createReadStream(filePath)
       .pipe(csv({
         headers: options.headers || ['email', 'name', 'tags', 'verified'],
         skipEmptyLines: true,
         trim: true,
         maxRowBytes: 1024
       }));

     for await (const row of parser) {
       stats.total++;
       
       const processedRow = await this.processRow(row, options);
       
       if (processedRow.valid) {
         emails.push(processedRow.data);
         stats.valid++;
       } else {
         errors.push({
           row: stats.total,
           data: row,
           error: processedRow.error
         });
         stats.invalid++;
       }

       if (emails.length >= this.batchSize) {
         await this.processBatch(emails.splice(0, this.batchSize), options);
         stats.processed += this.batchSize;
       }
     }

     if (emails.length > 0) {
       await this.processBatch(emails, options);
       stats.processed += emails.length;
     }

     await fs.unlink(filePath);

     return {
       success: true,
       stats,
       errors: errors.slice(0, 100)
     };

   } catch (error) {
     logger.error('CSV parsing error:', error);
     throw new Error(`Failed to parse CSV: ${error.message}`);
   }
 }

 async processRow(row, options = {}) {
   try {
     const email = sanitizeEmail(row.email || row.Email || row.EMAIL || '');
     
     if (!validateEmail(email)) {
       return {
         valid: false,
         error: 'Invalid email format'
       };
     }

     const processedData = {
       email: email.toLowerCase(),
       name: this.sanitizeName(row.name || row.Name || ''),
       tags: this.parseTags(row.tags || row.Tags || ''),
       verified: this.parseBoolean(row.verified || row.Verified || false),
       source: options.source || 'csv_upload',
       addedBy: options.userId,
       metadata: {
         originalFileName: options.fileName,
         uploadDate: new Date(),
         rowNumber: options.rowNumber
       }
     };

     if (options.validateDomain) {
       const domain = email.split('@')[1];
       if (!await this.validateDomain(domain)) {
         return {
           valid: false,
           error: 'Invalid or blacklisted domain'
         };
       }
     }

     return {
       valid: true,
       data: processedData
     };

   } catch (error) {
     return {
       valid: false,
       error: error.message
     };
   }
 }

 async processBatch(emails, options = {}) {
   try {
     const uniqueEmails = this.removeDuplicates(emails);
     
     if (options.repositoryId) {
       await this.addToRepository(uniqueEmails, options.repositoryId, options);
     }

     if (options.enableSnowball) {
       await snowballService.processNewEmails(uniqueEmails, options);
     }

     if (options.sendWelcomeEmail) {
       await this.sendWelcomeEmails(uniqueEmails, options);
     }

     return uniqueEmails.length;

   } catch (error) {
     logger.error('Batch processing error:', error);
     throw error;
   }
 }

 async generateCSV(repositoryId, options = {}) {
   try {
     const repository = await Repository.findById(repositoryId)
       .populate('emails', 'email name tags verified addedAt');

     if (!repository) {
       throw new Error('Repository not found');
     }

     const data = repository.emails.map(email => ({
       email: email.email,
       name: email.name || '',
       tags: Array.isArray(email.tags) ? email.tags.join(';') : '',
       verified: email.verified ? 'true' : 'false',
       addedAt: email.addedAt.toISOString()
     }));

     const csvString = await this.arrayToCSV(data, {
       headers: ['email', 'name', 'tags', 'verified', 'addedAt']
     });

     const fileName = `${repository.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
     const hash = crypto.createHash('md5').update(csvString).digest('hex');

     return {
       data: csvString,
       fileName,
       mimeType: 'text/csv',
       size: Buffer.byteLength(csvString),
       hash,
       emailCount: data.length
     };

   } catch (error) {
     logger.error('CSV generation error:', error);
     throw new Error(`Failed to generate CSV: ${error.message}`);
   }
 }

 async mergeCSVFiles(filePaths, options = {}) {
   try {
     const mergedEmails = new Map();
     const stats = {
       totalFiles: filePaths.length,
       totalRows: 0,
       uniqueEmails: 0,
       duplicates: 0
     };

     for (const filePath of filePaths) {
       const result = await this.parseCSV(filePath, {
         ...options,
         skipProcessing: true
       });

       result.emails.forEach(email => {
         if (!mergedEmails.has(email.email)) {
           mergedEmails.set(email.email, email);
         } else {
           stats.duplicates++;
         }
         stats.totalRows++;
       });
     }

     stats.uniqueEmails = mergedEmails.size;
     const mergedArray = Array.from(mergedEmails.values());

     if (!options.skipGeneration) {
       const csvData = await this.arrayToCSV(mergedArray);
       return {
         data: csvData,
         stats,
         emails: mergedArray
       };
     }

     return {
       emails: mergedArray,
       stats
     };

   } catch (error) {
     logger.error('CSV merge error:', error);
     throw new Error(`Failed to merge CSV files: ${error.message}`);
   }
 }

 async validateCSVStructure(filePath) {
   try {
     const fileStats = await fs.stat(filePath);
     
     if (fileStats.size > this.maxFileSize) {
       throw new Error(`File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
     }

     const firstLine = await this.readFirstLine(filePath);
     const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
     
     const requiredHeaders = ['email'];
     const optionalHeaders = ['name', 'tags', 'verified'];
     const allValidHeaders = [...requiredHeaders, ...optionalHeaders];

     const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
     if (!hasRequiredHeaders) {
       throw new Error('CSV must contain "email" column');
     }

     const invalidHeaders = headers.filter(h => !allValidHeaders.includes(h));
     
     return {
       valid: true,
       headers,
       invalidHeaders,
       fileSize: fileStats.size,
       hasAllOptionalHeaders: optionalHeaders.every(h => headers.includes(h))
     };

   } catch (error) {
     return {
       valid: false,
       error: error.message
     };
   }
 }

 async addToRepository(emails, repositoryId, options = {}) {
   try {
     const repository = await Repository.findById(repositoryId);
     if (!repository) {
       throw new Error('Repository not found');
     }

     const existingEmails = new Set(
       repository.emails.map(e => e.email.toLowerCase())
     );

     const newEmails = emails.filter(e => !existingEmails.has(e.email.toLowerCase()));

     if (newEmails.length === 0) {
       return {
         added: 0,
         duplicates: emails.length
       };
     }

     const emailDocs = await Email.insertMany(newEmails, { ordered: false });
     
     repository.emails.push(...emailDocs.map(e => e._id));
     repository.stats.totalEmails += emailDocs.length;
     repository.stats.lastUpdated = new Date();
     
     if (options.updateSnowballStats) {
       repository.stats.snowballGrowth += emailDocs.length;
     }

     await repository.save();

     return {
       added: emailDocs.length,
       duplicates: emails.length - emailDocs.length,
       repositoryId: repository._id
     };

   } catch (error) {
     logger.error('Add to repository error:', error);
     throw error;
   }
 }

 async sendWelcomeEmails(emails, options = {}) {
   try {
     const emailBatches = this.chunkArray(emails, 50);
     let sent = 0;

     for (const batch of emailBatches) {
       const emailPromises = batch.map(email => 
         emailService.sendWelcomeEmail(email, options)
       );
       
       const results = await Promise.allSettled(emailPromises);
       sent += results.filter(r => r.status === 'fulfilled').length;
     }

     return sent;

   } catch (error) {
     logger.error('Welcome email sending error:', error);
     throw error;
   }
 }

 sanitizeName(name) {
   return name
     .trim()
     .replace(/[<>]/g, '')
     .slice(0, 100);
 }

 parseTags(tags) {
   if (!tags) return [];
   
   const delimiter = tags.includes(';') ? ';' : ',';
   return tags
     .split(delimiter)
     .map(tag => tag.trim().toLowerCase())
     .filter(tag => tag.length > 0 && tag.length < 50)
     .slice(0, 10);
 }

 parseBoolean(value) {
   if (typeof value === 'boolean') return value;
   if (typeof value === 'string') {
     return ['true', 'yes', '1', 'verified'].includes(value.toLowerCase());
   }
   return false;
 }

 removeDuplicates(emails) {
   const seen = new Set();
   return emails.filter(email => {
     const key = email.email.toLowerCase();
     if (seen.has(key)) return false;
     seen.add(key);
     return true;
   });
 }

 async validateDomain(domain) {
   const blacklistedDomains = [
     'tempmail.com',
     'throwaway.email',
     'guerrillamail.com'
   ];
   
   return !blacklistedDomains.includes(domain);
 }

 async readFirstLine(filePath) {
   const stream = fs.createReadStream(filePath, {
     encoding: 'utf8',
     end: 1000
   });
   
   for await (const chunk of stream) {
     const lines = chunk.split('\n');
     return lines[0];
   }
 }

 async arrayToCSV(data, options = {}) {
   const stringifyOptions = {
     header: true,
     columns: options.headers || Object.keys(data[0] || {})
   };

   return new Promise((resolve, reject) => {
     stringify(data, stringifyOptions, (err, output) => {
       if (err) reject(err);
       else resolve(output);
     });
   });
 }

 chunkArray(array, size) {
   const chunks = [];
   for (let i = 0; i < array.length; i += size) {
     chunks.push(array.slice(i, i + size));
   }
   return chunks;
 }

 async getCSVStats(filePath) {
   try {
     let rowCount = 0;
     let emailCount = 0;
     const domains = new Set();

     const parser = fs.createReadStream(filePath)
       .pipe(csv());

     for await (const row of parser) {
       rowCount++;
       if (row.email && validateEmail(row.email)) {
         emailCount++;
         domains.add(row.email.split('@')[1]);
       }
     }

     return {
       totalRows: rowCount,
       validEmails: emailCount,
       uniqueDomains: domains.size,
       topDomains: this.getTopItems(Array.from(domains), 10)
     };

   } catch (error) {
     logger.error('CSV stats error:', error);
     throw error;
   }
 }

 getTopItems(items, limit = 10) {
   const counts = {};
   items.forEach(item => {
     counts[item] = (counts[item] || 0) + 1;
   });

   return Object.entries(counts)
     .sort((a, b) => b[1] - a[1])
     .slice(0, limit)
     .map(([item, count]) => ({ item, count }));
 }
}

module.exports = new CSVService();