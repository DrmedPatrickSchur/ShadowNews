import { parse, ParseResult } from 'papaparse';
import validator from 'validator';

export interface CSVValidationResult {
 isValid: boolean;
 errors: string[];
 warnings: string[];
 data: any[] | null;
 metadata: CSVMetadata;
}

export interface CSVMetadata {
 totalRows: number;
 validEmails: number;
 invalidEmails: number;
 duplicateEmails: number;
 headers: string[];
 fileSize: number;
 encoding: string;
}

export interface EmailRecord {
 email: string;
 name?: string;
 organization?: string;
 tags?: string[];
 subscribed?: boolean;
 verificationStatus?: 'pending' | 'verified' | 'bounced';
 addedBy?: string;
 addedAt?: Date;
}

export class CSVValidator {
 private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
 private static readonly MAX_ROWS = 10000;
 private static readonly REQUIRED_HEADERS = ['email'];
 private static readonly OPTIONAL_HEADERS = ['name', 'organization', 'tags', 'subscribed'];
 private static readonly VALID_ENCODINGS = ['UTF-8', 'UTF-16', 'ISO-8859-1'];

 static async validateCSVFile(file: File): Promise<CSVValidationResult> {
   const errors: string[] = [];
   const warnings: string[] = [];
   let metadata: CSVMetadata = {
     totalRows: 0,
     validEmails: 0,
     invalidEmails: 0,
     duplicateEmails: 0,
     headers: [],
     fileSize: file.size,
     encoding: 'UTF-8'
   };

   // Validate file size
   if (file.size > this.MAX_FILE_SIZE) {
     errors.push(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
     return this.createValidationResult(false, errors, warnings, null, metadata);
   }

   // Validate file type
   if (!file.name.toLowerCase().endsWith('.csv')) {
     errors.push('File must be a CSV file with .csv extension');
     return this.createValidationResult(false, errors, warnings, null, metadata);
   }

   try {
     const content = await this.readFileContent(file);
     const parseResult = this.parseCSV(content);
     
     if (parseResult.errors.length > 0) {
       errors.push(...parseResult.errors.map(err => err.message));
       return this.createValidationResult(false, errors, warnings, null, metadata);
     }

     const validationResult = this.validateCSVContent(parseResult.data, metadata);
     errors.push(...validationResult.errors);
     warnings.push(...validationResult.warnings);
     metadata = validationResult.metadata;

     const isValid = errors.length === 0 && metadata.validEmails > 0;
     const processedData = isValid ? this.processEmailRecords(parseResult.data, metadata.headers) : null;

     return this.createValidationResult(isValid, errors, warnings, processedData, metadata);
   } catch (error) {
     errors.push(`Failed to process CSV file: ${error.message}`);
     return this.createValidationResult(false, errors, warnings, null, metadata);
   }
 }

 static validateCSVContent(data: any[], metadata: CSVMetadata): {
   errors: string[];
   warnings: string[];
   metadata: CSVMetadata;
 } {
   const errors: string[] = [];
   const warnings: string[] = [];
   const emailSet = new Set<string>();
   const validEmails = new Set<string>();

   if (!data || data.length === 0) {
     errors.push('CSV file is empty');
     return { errors, warnings, metadata };
   }

   // Get headers
   const headers = Object.keys(data[0]);
   metadata.headers = headers;

   // Validate headers
   const headerValidation = this.validateHeaders(headers);
   errors.push(...headerValidation.errors);
   warnings.push(...headerValidation.warnings);

   if (headerValidation.errors.length > 0) {
     return { errors, warnings, metadata };
   }

   // Validate row count
   metadata.totalRows = data.length;
   if (data.length > this.MAX_ROWS) {
     errors.push(`CSV contains ${data.length} rows, which exceeds the maximum of ${this.MAX_ROWS} rows`);
     return { errors, warnings, metadata };
   }

   // Validate each row
   data.forEach((row, index) => {
     const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row

     // Validate email
     const email = row.email?.toString().trim().toLowerCase();
     if (!email) {
       warnings.push(`Row ${rowNumber}: Missing email address`);
       metadata.invalidEmails++;
     } else if (!this.isValidEmail(email)) {
       warnings.push(`Row ${rowNumber}: Invalid email address "${email}"`);
       metadata.invalidEmails++;
     } else if (emailSet.has(email)) {
       warnings.push(`Row ${rowNumber}: Duplicate email address "${email}"`);
       metadata.duplicateEmails++;
     } else {
       emailSet.add(email);
       validEmails.add(email);
       metadata.validEmails++;
     }

     // Validate optional fields
     if (row.name && typeof row.name !== 'string') {
       warnings.push(`Row ${rowNumber}: Name must be a string`);
     }

     if (row.organization && typeof row.organization !== 'string') {
       warnings.push(`Row ${rowNumber}: Organization must be a string`);
     }

     if (row.tags) {
       const tags = this.parseTags(row.tags);
       if (tags.length === 0) {
         warnings.push(`Row ${rowNumber}: Invalid tags format`);
       }
     }

     if (row.subscribed !== undefined) {
       const subscribed = this.parseBoolean(row.subscribed);
       if (subscribed === null) {
         warnings.push(`Row ${rowNumber}: Subscribed must be true/false, yes/no, or 1/0`);
       }
     }
   });

   if (metadata.validEmails === 0) {
     errors.push('No valid email addresses found in CSV');
   }

   return { errors, warnings, metadata };
 }

 private static validateHeaders(headers: string[]): {
   errors: string[];
   warnings: string[];
 } {
   const errors: string[] = [];
   const warnings: string[] = [];
   const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

   // Check for required headers
   for (const required of this.REQUIRED_HEADERS) {
     if (!normalizedHeaders.includes(required)) {
       errors.push(`Missing required column: "${required}"`);
     }
   }

   // Check for unknown headers
   const allKnownHeaders = [...this.REQUIRED_HEADERS, ...this.OPTIONAL_HEADERS];
   const unknownHeaders = normalizedHeaders.filter(h => !allKnownHeaders.includes(h));
   
   if (unknownHeaders.length > 0) {
     warnings.push(`Unknown columns will be ignored: ${unknownHeaders.join(', ')}`);
   }

   // Check for duplicate headers
   const headerCounts = normalizedHeaders.reduce((acc, header) => {
     acc[header] = (acc[header] || 0) + 1;
     return acc;
   }, {} as Record<string, number>);

   Object.entries(headerCounts).forEach(([header, count]) => {
     if (count > 1) {
       errors.push(`Duplicate column header: "${header}"`);
     }
   });

   return { errors, warnings };
 }

 private static processEmailRecords(data: any[], headers: string[]): EmailRecord[] {
   return data
     .filter(row => this.isValidEmail(row.email?.toString().trim().toLowerCase()))
     .map(row => {
       const record: EmailRecord = {
         email: row.email.toString().trim().toLowerCase(),
         verificationStatus: 'pending',
         addedAt: new Date()
       };

       if (row.name) {
         record.name = row.name.toString().trim();
       }

       if (row.organization) {
         record.organization = row.organization.toString().trim();
       }

       if (row.tags) {
         record.tags = this.parseTags(row.tags);
       }

       if (row.subscribed !== undefined) {
         record.subscribed = this.parseBoolean(row.subscribed) ?? true;
       }

       return record;
     });
 }

 private static isValidEmail(email: string): boolean {
   if (!email) return false;
   
   // Basic validation
   if (!validator.isEmail(email)) return false;
   
   // Additional checks
   const parts = email.split('@');
   if (parts.length !== 2) return false;
   
   const [localPart, domain] = parts;
   
   // Check local part length
   if (localPart.length > 64) return false;
   
   // Check total length
   if (email.length > 254) return false;
   
   // Check for consecutive dots
   if (email.includes('..')) return false;
   
   // Check domain has at least one dot
   if (!domain.includes('.')) return false;
   
   // Check for valid TLD
   const tldMatch = domain.match(/\.([a-zA-Z]{2,})$/);
   if (!tldMatch) return false;
   
   return true;
 }

 private static parseTags(input: any): string[] {
   if (!input) return [];
   
   const tagString = input.toString().trim();
   if (!tagString) return [];
   
   // Support multiple formats: "tag1,tag2,tag3" or "tag1;tag2;tag3" or "tag1|tag2|tag3"
   const separators = [',', ';', '|'];
   let tags: string[] = [];
   
   for (const separator of separators) {
     if (tagString.includes(separator)) {
       tags = tagString.split(separator);
       break;
     }
   }
   
   if (tags.length === 0) {
     tags = [tagString];
   }
   
   return tags
     .map(tag => tag.trim())
     .filter(tag => tag.length > 0 && tag.length <= 50)
     .slice(0, 10); // Maximum 10 tags
 }

 private static parseBoolean(input: any): boolean | null {
   if (typeof input === 'boolean') return input;
   
   const stringValue = input.toString().trim().toLowerCase();
   const trueValues = ['true', 'yes', 'y', '1'];
   const falseValues = ['false', 'no', 'n', '0'];
   
   if (trueValues.includes(stringValue)) return true;
   if (falseValues.includes(stringValue)) return false;
   
   return null;
 }

 private static parseCSV(content: string): ParseResult<any> {
   return parse(content, {
     header: true,
     skipEmptyLines: true,
     transformHeader: (header) => header.trim().toLowerCase(),
     dynamicTyping: false,
     encoding: 'UTF-8',
     delimitersToGuess: [',', ';', '\t', '|']
   });
 }

 private static async readFileContent(file: File): Promise<string> {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = (e) => resolve(e.target?.result as string);
     reader.onerror = (e) => reject(new Error('Failed to read file'));
     reader.readAsText(file, 'UTF-8');
   });
 }

 private static createValidationResult(
   isValid: boolean,
   errors: string[],
   warnings: string[],
   data: any[] | null,
   metadata: CSVMetadata
 ): CSVValidationResult {
   return { isValid, errors, warnings, data, metadata };
 }
}

export const validateCSV = CSVValidator.validateCSVFile.bind(CSVValidator);

export const createSampleCSV = (): string => {
 const headers = ['email', 'name', 'organization', 'tags', 'subscribed'];
 const rows = [
   ['john.doe@example.com', 'John Doe', 'Tech Corp', 'AI,blockchain,web3', 'yes'],
   ['jane.smith@example.com', 'Jane Smith', 'StartupXYZ', 'fintech,saas', 'true'],
   ['mike.wilson@example.com', 'Mike Wilson', '', 'developer,opensource', '1'],
   ['sarah.jones@example.com', 'Sarah Jones', 'Innovation Lab', 'research,ml,data', 'no']
 ];
 
 return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const exportEmailsToCSV = (emails: EmailRecord[]): string => {
 if (emails.length === 0) return '';
 
 const headers = ['email', 'name', 'organization', 'tags', 'subscribed', 'verification_status'];
 const rows = emails.map(record => [
   record.email,
   record.name || '',
   record.organization || '',
   record.tags?.join(',') || '',
   record.subscribed ? 'yes' : 'no',
   record.verificationStatus || 'pending'
 ]);
 
 return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
};

export default CSVValidator;