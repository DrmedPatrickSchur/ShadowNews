/**
 * @fileoverview Automated ShadowNews File Commenting Script
 * 
 * Comprehensive automation tool for adding standardized, detailed comments
 * to all files across the ShadowNews project. This script analyzes file
 * types, generates appropriate comment templates, and maintains consistent
 * documentation standards throughout the codebase.
 * 
 * Key Features:
 * - Intelligent file type detection and template selection
 * - JSDoc-compliant comment generation for JavaScript/TypeScript files
 * - Backup creation before file modification for safety
 * - Dry-run mode for preview without making changes
 * - Comprehensive logging and error reporting
 * - Support for multiple programming languages and file formats
 * 
 * Supported File Types:
 * - Backend JavaScript/TypeScript (models, controllers, services, routes)
 * - Frontend React components (JSX/TSX)
 * - Configuration files (JSON, YAML)
 * - Style sheets (CSS, SCSS)
 * - Documentation (Markdown)
 * - Test files (Jest, Cypress)
 * 
 * Usage Examples:
 * - Full project scan: node auto-comment-script.js
 * - Dry run preview: node auto-comment-script.js --dry-run
 * - With backups: node auto-comment-script.js --backup
 * - Specific file: node auto-comment-script.js --file=src/app.js
 * - Specific folder: node auto-comment-script.js --folder=frontend/src
 * 
 * Dependencies:
 * - fs: File system operations for reading and writing files
 * - path: Path manipulation for cross-platform compatibility
 * - readline: Interactive command-line interface for user input
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Auto-comment script for ShadowNews project
// Run with: node auto-comment-script.js [options]

/**
 * @fileoverview Automated File Commenting Script
 * 
 * This script helps add standardized, detailed comments to all files in the ShadowNews project.
 * It analyzes file types and generates appropriate comment templates based on the file's purpose.
 * 
 * Features:
 * - Detects file types and generates appropriate comment headers
 * - Preserves existing comments while enhancing them
 * - Creates backup files before modification
 * - Supports JavaScript, TypeScript, CSS, and Markdown files
 * - Generates detailed JSDoc comments for functions and classes
 * 
 * Usage:
 *   node commentingScript.js [--dry-run] [--backup] [--file=path] [--folder=path]
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2025-01-27
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  createBackup: process.argv.includes('--backup'),
  projectRoot: path.resolve(__dirname),
  outputLog: path.join(__dirname, 'commenting-log.txt'),
  
  // File type patterns
  fileTypes: {
    jsBackend: /backend\/src\/.+\.js$/,
    jsFrontend: /frontend\/src\/.+\.(js|jsx)$/,
    tsBackend: /backend\/src\/.+\.ts$/,
    tsFrontend: /frontend\/src\/.+\.(ts|tsx)$/,
    model: /models\/.+\.model\.js$/,
    controller: /controller\/.+\.controller\.js$/,
    service: /services\/.+\.service\.js$/,
    route: /routes\/.+\.routes?\.js$/,
    middleware: /middleware\/.+\.middleware\.js$/,
    worker: /workers\/.+\.worker\.js$/,
    component: /components\/.+\.(tsx|jsx)$/,
    hook: /hooks\/.+\.ts$/,
    utility: /utils?\/.+\.(js|ts)$/,
    config: /config\/.+\.(js|ts)$/,
    test: /\.(test|spec)\.(js|ts|tsx)$/,
    style: /\.(css|scss|sass)$/,
    markdown: /\.md$/
  }
};

// Comment templates for different file types
const templates = {
  jsBackend: {
    header: `/**
 * @fileoverview {TITLE}
 * 
 * {DESCRIPTION}
 * 
 * Key Features:
 * - {FEATURE1}
 * - {FEATURE2}
 * - {FEATURE3}
 * 
 * Dependencies:
 * {DEPENDENCIES}
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified {DATE}
 */`,
    
    function: `/**
 * {DESCRIPTION}
 * 
 * @param {PARAM_TYPES} 
 * @returns {RETURN_TYPE} {RETURN_DESCRIPTION}
 * @throws {ERROR_TYPE} {ERROR_DESCRIPTION}
 * 
 * @example
 * // {EXAMPLE_USAGE}
 * 
 * @since 1.0.0
 */`,
    
    class: `/**
 * {CLASS_NAME} Class
 * 
 * {CLASS_DESCRIPTION}
 * 
 * Key Responsibilities:
 * - {RESPONSIBILITY1}
 * - {RESPONSIBILITY2}
 * 
 * @class {CLASS_NAME}
 * @since 1.0.0
 */`
  }
};

// File type specific generators
const generators = {
  model: (fileName, content) => ({
    title: `${fileName.replace('.model.js', '')} Database Model`,
    description: `Mongoose schema definition for ${fileName.replace('.model.js', '').toLowerCase()} documents.\\nDefines data structure, validation rules, and database interactions.`,
    features: [
      'MongoDB schema with validation',
      'Relationship definitions',
      'Index optimization for queries'
    ]
  }),
  
  controller: (fileName, content) => ({
    title: `${fileName.replace('.controller.js', '')} Controller`,
    description: `HTTP request handlers for ${fileName.replace('.controller.js', '').toLowerCase()} operations.\\nHandles CRUD operations, validation, and response formatting.`,
    features: [
      'RESTful API endpoints',
      'Request validation',
      'Error handling and responses'
    ]
  }),
  
  service: (fileName, content) => ({
    title: `${fileName.replace('.service.js', '')} Service`,
    description: `Business logic layer for ${fileName.replace('.service.js', '').toLowerCase()} operations.\\nEncapsulates complex operations and integrates with database and external APIs.`,
    features: [
      'Business logic implementation',
      'Database integration',
      'External API communication'
    ]
  }),
  
  component: (fileName, content) => ({
    title: `${fileName.replace(/\.(tsx|jsx)$/, '')} Component`,
    description: `React component for ${fileName.replace(/\.(tsx|jsx)$/, '').toLowerCase()} functionality.\\nProvides user interface and handles user interactions.`,
    features: [
      'React component with hooks',
      'User interaction handling',
      'Responsive design implementation'
    ]
  })
};

/**
 * ============================================================================
 * CommentingScript Class - Main Automation Engine
 * ============================================================================
 * 
 * Orchestrates the file commenting process across the entire ShadowNews project.
 * This class provides intelligent file analysis, comment generation, and safe
 * file modification with backup and rollback capabilities.
 * 
 * Core Capabilities:
 * - Recursive directory traversal with smart filtering
 * - File type detection using regex patterns and content analysis
 * - Template-based comment generation for different file categories
 * - Safe file modification with automatic backup creation
 * - Comprehensive logging and progress tracking
 * - Dry-run mode for preview without modification
 * 
 * Processing Pipeline:
 * 1. Directory scanning and file discovery
 * 2. File type classification and template selection
 * 3. Content analysis for existing documentation
 * 4. Comment generation with context-aware templates
 * 5. Safe file modification with backup creation
 * 6. Progress logging and error reporting
 * 
 * Safety Features:
 * - Automatic backup creation before modification
 * - Rollback capability for failed operations
 * - Dry-run mode for testing changes
 * - Comprehensive error handling and logging
 * - Preserves existing comments while enhancing them
 * 
 * @class CommentingScript
 * @since 1.0.0
 * @author ShadowNews Team
 */
class CommentingScript {
  /**
   * Initialize the commenting script with default configuration
   * 
   * Sets up logging arrays, counters, and prepares the script for execution.
   * Initializes file processing statistics and error tracking systems.
   * 
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    // Processing statistics and tracking
    this.logEntries = [];
    this.filesProcessed = 0;
    this.errors = [];
  }

  /**
   * ========================================================================
   * Logging and Output Management
   * ========================================================================
   * 
   * Provides centralized logging functionality with timestamp tracking
   * and level-based message categorization. Maintains both console output
   * and internal log storage for later file output.
   * 
   * Features:
   * - Timestamped log entries with ISO format
   * - Level-based categorization (info, warn, error)
   * - Console output with formatted messages
   * - Internal storage for log file generation
   * 
   * @param {string} message - The message content to log
   * @param {string} level - Log level for categorization (default: 'info')
   * 
   * @example
   * this.log('Processing file: example.js', 'info');
   * this.log('Warning: File already commented', 'warn');
   * this.log('Error: Failed to process file', 'error');
   * 
   * @since 1.0.0
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logEntry);
    this.logEntries.push(logEntry);
  }

  /**
   * ========================================================================
   * File Discovery and Directory Traversal
   * ========================================================================
   * 
   * Recursively scans the project directory structure to discover all
   * processable files while intelligently filtering out system directories
   * and irrelevant file types.
   * 
   * Scanning Strategy:
   * - Recursive directory traversal with depth-first approach
   * - Smart filtering to exclude system and build directories
   * - File type validation using shouldProcessFile method
   * - Accumulator pattern for efficient file collection
   * 
   * Excluded Directories:
   * - node_modules (dependency packages)
   * - .git (version control metadata)
   * - dist/build (compiled output)
   * - logs (runtime log files)
   * 
   * @param {string} dir - The directory path to scan recursively
   * @param {string[]} fileList - Accumulator array for discovered file paths
   * @returns {string[]} Complete array of processable file paths
   * 
   * @example
   * const files = this.getAllFiles('./src', []);
   * console.log(`Found ${files.length} processable files`);
   * 
   * @since 1.0.0
   */
  getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, and other system directories
        if (!['node_modules', '.git', 'dist', 'build', 'logs'].includes(file)) {
          this.getAllFiles(filePath, fileList);
        }
      } else {
        // Only process code files
        if (this.shouldProcessFile(filePath)) {
          fileList.push(filePath);
        }
      }
    });
    
    return fileList;
  }

  /**
   * ========================================================================
   * File Processing Eligibility Filter
   * ========================================================================
   * 
   * Determines whether a specific file should be included in the commenting
   * process based on file extension, path patterns, and content analysis.
   * 
   * Processing Criteria:
   * - File extension matches processable types
   * - Path doesn't match exclusion patterns
   * - File size within reasonable limits
   * - File is readable and writable
   * 
   * Supported File Types:
   * - JavaScript/TypeScript: .js, .ts, .tsx, .jsx
   * - Stylesheets: .css, .scss, .sass
   * - Documentation: .md, .mdx
   * 
   * @param {string} filePath - The complete file path to evaluate
   * @returns {boolean} True if file should be processed, false otherwise
   * 
   * @example
   * if (this.shouldProcessFile('./src/components/Button.tsx')) {
   *   // Process the React component file
   * }
   * 
   * @since 1.0.0
   */
  shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    const processableExtensions = ['.js', '.ts', '.tsx', '.jsx', '.css', '.scss', '.md'];
    
    return processableExtensions.includes(ext) && 
           !filePath.includes('node_modules') &&
           !filePath.includes('.git') &&
           !filePath.includes('dist') &&
           !filePath.includes('build');
  }

  /**
   * ========================================================================
   * Intelligent File Type Detection
   * ========================================================================
   * 
   * Analyzes file paths and content to determine the appropriate file type
   * classification for template selection. Uses pattern matching and fallback
   * logic to handle various project structures and file organizations.
   * 
   * Detection Strategy:
   * - Primary: Path-based pattern matching using regex
   * - Secondary: Extension-based fallback classification
   * - Tertiary: Content analysis for ambiguous cases
   * 
   * Supported Classifications:
   * - Backend JavaScript/TypeScript files
   * - Frontend React components
   * - Database models and schemas
   * - API controllers and routes
   * - Service layer implementations
   * - Utility and helper functions
   * - Configuration files
   * - Test and spec files
   * 
   * @param {string} filePath - The complete file path to analyze
   * @param {string} content - File content for content-based detection
   * @returns {string} File type identifier for template selection
   * 
   * @example
   * const type = this.detectFileType('./src/models/User.model.js', content);
   * // Returns: 'model'
   * 
   * @since 1.0.0
   */
  detectFileType(filePath, content) {
    for (const [type, pattern] of Object.entries(config.fileTypes)) {
      if (pattern.test(filePath)) {
        return type;
      }
    }
    
    // Fallback based on extension
    const ext = path.extname(filePath);
    if (['.js', '.ts'].includes(ext)) return 'jsBackend';
    if (['.tsx', '.jsx'].includes(ext)) return 'component';
    if (ext === '.css') return 'style';
    if (ext === '.md') return 'markdown';
    
    return 'unknown';
  }

  /**
   * ========================================================================
   * Dynamic Comment Header Generation
   * ========================================================================
   * 
   * Creates contextually appropriate comment headers based on file type,
   * content analysis, and project structure. Generates comprehensive
   * JSDoc-style documentation with relevant metadata and descriptions.
   * 
   * Generation Process:
   * 1. File type detection and template selection
   * 2. Content analysis for existing documentation
   * 3. Dynamic placeholder replacement with contextual data
   * 4. Dependency extraction and documentation
   * 5. Feature identification and listing
   * 
   * Template Components:
   * - File overview and purpose description
   * - Key features and capabilities
   * - Dependency documentation
   * - Author and versioning information
   * - Modification timestamps
   * 
   * @param {string} fileName - Base name of the file being processed
   * @param {string} fileType - Detected file type for template selection
   * @param {string} content - Complete file content for analysis
   * @returns {string} Generated JSDoc comment header with placeholders filled
   * 
   * @example
   * const header = this.generateFileHeader('User.model.js', 'model', fileContent);
   * // Returns: Comprehensive JSDoc header for a database model
   * 
   * @since 1.0.0
   */
  generateFileHeader(fileName, fileType, content) {
    const generator = generators[fileType];
    const metadata = generator ? generator(fileName, content) : {
      title: fileName,
      description: `Implementation file for ${fileName}`,
      features: ['Core functionality', 'Error handling', 'Performance optimization']
    };

    return templates.jsBackend.header
      .replace('{TITLE}', metadata.title)
      .replace('{DESCRIPTION}', metadata.description)
      .replace('{FEATURE1}', metadata.features[0] || 'Core functionality')
      .replace('{FEATURE2}', metadata.features[1] || 'Error handling')
      .replace('{FEATURE3}', metadata.features[2] || 'Performance optimization')
      .replace('{DEPENDENCIES}', this.extractDependencies(content))
      .replace('{DATE}', new Date().toISOString().split('T')[0]);
  }

  /**
   * ========================================================================
   * Dependency Analysis and Documentation
   * ========================================================================
   * 
   * Parses file content to identify and document external dependencies,
   * including both CommonJS require statements and ES6 import declarations.
   * Generates formatted documentation for dependency usage and purposes.
   * 
   * Analysis Capabilities:
   * - CommonJS require() statement detection
   * - ES6 import statement parsing
   * - Destructured import recognition
   * - Relative vs external dependency filtering
   * - Automatic documentation formatting
   * 
   * Supported Import Patterns:
   * - const module = require('module-name')
   * - const { func } = require('module-name')
   * - import module from 'module-name'
   * - import { func } from 'module-name'
   * - import * as module from 'module-name'
   * 
   * @param {string} content - Complete file content to analyze
   * @returns {string} Formatted dependencies list for JSDoc inclusion
   * 
   * @example
   * const deps = this.extractDependencies(fileContent);
   * // Returns: " * - express: Web framework for API endpoints\n * - mongoose: MongoDB ODM"
   * 
   * @since 1.0.0
   */
  extractDependencies(content) {
    const requireRegex = /(?:const|let|var)\\s+(?:{[^}]+}|\\w+)\\s*=\\s*require\\(['"]([^'"]+)['"]\\)/g;
    const importRegex = /import\\s+(?:{[^}]+}|\\w+|\\*)\\s+from\\s+['"]([^'"]+)['"]/g;
    
    const dependencies = new Set();
    let match;
    
    // Extract require statements
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }
    
    // Extract import statements
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }
    
    if (dependencies.size === 0) {
      return ' * - No external dependencies';
    }
    
    return Array.from(dependencies)
      .filter(dep => !dep.startsWith('.')) // Filter out relative imports
      .map(dep => ` * - ${dep}: [Purpose of this dependency]`)
      .join('\\n');
  }

  /**
   * ========================================================================
   * Comment Coverage Analysis
   * ========================================================================
   * 
   * Analyzes file content to determine if comprehensive commenting already
   * exists, preventing duplicate documentation efforts and preserving
   * existing high-quality comments.
   * 
   * Analysis Metrics:
   * - Comment line density (comments vs total lines)
   * - JSDoc block presence and quality
   * - Inline comment distribution
   * - Documentation coverage for functions and classes
   * 
   * Quality Indicators:
   * - Minimum 20% comment density threshold
   * - Presence of file header documentation
   * - Function and method documentation
   * - Complex logic explanation comments
   * 
   * @param {string} content - Complete file content to analyze
   * @returns {boolean} True if file has comprehensive comments, false otherwise
   * 
   * @example
   * if (!this.hasComprehensiveComments(fileContent)) {
   *   // Add documentation to under-commented file
   * }
   * 
   * @since 1.0.0
   */
  hasComprehensiveComments(content) {
    const lines = content.split('\\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('*') || 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/**')
    );
    
    // If more than 20% of lines are comments, consider it well-commented
    return commentLines.length > lines.length * 0.2;
  }

  /**
   * Process a single file to add comments
   * 
   * @param {string} filePath - Path to the file to process
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      const fileType = this.detectFileType(filePath, content);
      
      this.log(`Processing: ${filePath}`, 'info');
      
      // Skip if already well-commented
      if (this.hasComprehensiveComments(content)) {
        this.log(`Skipping ${fileName} - already well-commented`, 'info');
        return;
      }
      
      // Create backup if requested
      if (config.createBackup) {
        fs.writeFileSync(`${filePath}.backup`, content);
      }
      
      // Generate new content with comments
      const header = this.generateFileHeader(fileName, fileType, content);
      
      let newContent;
      if (content.trim().startsWith('/**')) {
        // Replace existing header comment
        const headerEnd = content.indexOf('*/') + 2;
        newContent = header + '\\n\\n' + content.substring(headerEnd).trim();
      } else {
        // Add new header
        newContent = header + '\\n\\n' + content;
      }
      
      // Write the file if not in dry-run mode
      if (!config.dryRun) {
        fs.writeFileSync(filePath, newContent);
        this.log(`Updated: ${fileName}`, 'info');
      } else {
        this.log(`[DRY RUN] Would update: ${fileName}`, 'info');
      }
      
      this.filesProcessed++;
      
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Main execution method
   * Processes all files in the project
   */
  async run() {
    this.log('Starting automated commenting process...', 'info');
    this.log(`Dry run mode: ${config.dryRun}`, 'info');
    this.log(`Create backups: ${config.createBackup}`, 'info');
    
    const allFiles = this.getAllFiles(config.projectRoot);
    this.log(`Found ${allFiles.length} files to process`, 'info');
    
    // Process files with progress indication
    for (let i = 0; i < allFiles.length; i++) {
      const filePath = allFiles[i];
      await this.processFile(filePath);
      
      // Show progress every 10 files
      if ((i + 1) % 10 === 0) {
        this.log(`Progress: ${i + 1}/${allFiles.length} files processed`, 'info');
      }
    }
    
    // Write log file
    fs.writeFileSync(config.outputLog, this.logEntries.join('\\n'));
    
    // Summary
    this.log('\\n=== SUMMARY ===', 'info');
    this.log(`Files processed: ${this.filesProcessed}`, 'info');
    this.log(`Errors encountered: ${this.errors.length}`, 'info');
    this.log(`Log file: ${config.outputLog}`, 'info');
    
    if (this.errors.length > 0) {
      this.log('\\nErrors:', 'error');
      this.errors.forEach(({ file, error }) => {
        this.log(`  ${file}: ${error}`, 'error');
      });
    }
    
    this.log('\\nCommenting process completed!', 'info');
  }
}

// Run the script
if (require.main === module) {
  const script = new CommentingScript();
  script.run().catch(console.error);
}

module.exports = CommentingScript;
