/**
 * ============================================================================
 * Jest Testing Configuration for ShadowNews Frontend
 * ============================================================================
 * 
 * Comprehensive Jest testing framework configuration for unit and integration
 * testing of the ShadowNews email-first social platform React frontend.
 * 
 * Testing Capabilities:
 * - Unit Testing: Individual function and component testing with isolation
 * - Integration Testing: Component interaction and data flow validation
 * - Snapshot Testing: UI component regression testing and change detection
 * - Coverage Reporting: Code coverage analysis with configurable thresholds
 * - Mock Support: API mocking, module mocking, and dependency injection
 * - TypeScript Support: Full TypeScript testing with type checking
 * 
 * ShadowNews Platform Testing:
 * - Authentication: Login, registration, and session management testing
 * - Email Repository: CSV parsing, email processing, and repository creation
 * - Snowball Distribution: Community voting algorithms and content ranking
 * - User Interface: React component rendering and user interaction testing
 * - State Management: Redux store testing with action and reducer validation
 * - API Services: HTTP client testing with request/response mocking
 * 
 * Performance Optimizations:
 * - Parallel Testing: Multi-process test execution for faster feedback
 * - Watch Mode: Intelligent test re-execution on file changes
 * - Transform Caching: Compilation caching for improved test startup time
 * - Coverage Optimization: Strategic coverage collection for essential code paths
 * 
 * Quality Assurance:
 * - Coverage Thresholds: Minimum 70% coverage across all metrics
 * - Test Organization: Structured test discovery and execution patterns
 * - Path Mapping: TypeScript path aliases for clean test imports
 * - Environment Simulation: DOM simulation with jsdom for React components
 * 
 * Dependencies:
 * - Jest testing framework for JavaScript and TypeScript applications
 * - React Testing Library for React component testing utilities
 * - jsdom for browser environment simulation in Node.js testing
 * - Babel transforms for modern JavaScript and TypeScript compilation
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 * ============================================================================
 */

module.exports = {
 /**
  * ========================================================================
  * Test Discovery and Execution Configuration
  * ========================================================================
  */
 
 /**
  * Test Root Directory
  * 
  * Specifies the root directory for test discovery and execution.
  * Focuses testing on the src directory containing application source code.
  */
 roots: ['<rootDir>/src'],
 
 /**
  * Test File Patterns
  * 
  * Defines patterns for locating test files throughout the application.
  * Supports both __tests__ directories and co-located .test/.spec files.
  */
 testMatch: [
   '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',  // Tests in __tests__ directories
   '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',   // Co-located test files
 ],
 
 /**
  * Test Environment Configuration
  * 
  * Configures jsdom environment for browser API simulation in Node.js.
  * Enables DOM testing for React components and browser-specific functionality.
  */
 testEnvironment: 'jsdom',
 
 /**
  * Test Timeout Configuration
  * 
  * Sets maximum execution time for individual tests to prevent hanging.
  * Optimized for ShadowNews application performance characteristics.
  */
 testTimeout: 10000,
 
 /**
  * Verbose Output Configuration
  * 
  * Enables detailed test execution reporting for debugging and monitoring.
  * Provides comprehensive feedback during test development and CI execution.
  */
 verbose: true,
 
 /**
  * ========================================================================
  * Code Coverage Configuration
  * ========================================================================
  */
 
 /**
  * Coverage Collection Patterns
  * 
  * Specifies which files to include in code coverage analysis.
  * Excludes type definitions, configuration, and non-testable files.
  */
 collectCoverageFrom: [
   'src/**/*.{js,jsx,ts,tsx}',  // Include all source code files
   '!src/**/*.d.ts',            // Exclude TypeScript declaration files
   '!src/index.tsx',            // Exclude application entry point
   '!src/serviceWorker.ts',     // Exclude service worker registration
   '!src/reportWebVitals.ts',   // Exclude performance monitoring setup
 ],
 
 /**
  * Coverage Thresholds
  * 
  * Enforces minimum code coverage percentages for quality assurance.
  * Requires 70% coverage across all metrics for ShadowNews codebase.
  */
 coverageThreshold: {
   global: {
     branches: 70,    // 70% branch coverage for conditional logic testing
     functions: 70,   // 70% function coverage for comprehensive testing
     lines: 70,       // 70% line coverage for code execution verification
     statements: 70,  // 70% statement coverage for complete code testing
   },
 },
 
 /**
  * Coverage Reporting Formats
  * 
  * Generates multiple coverage report formats for different use cases.
  * Supports CI integration, local development, and web-based viewing.
  */
 coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
 
 /**
  * Coverage Exclusion Patterns
  * 
  * Excludes specific directories and file types from coverage analysis.
  * Focuses coverage on testable application logic and functionality.
  */
 coveragePathIgnorePatterns: [
   '/node_modules/',           // Exclude third-party dependencies
   '<rootDir>/src/styles/',    // Exclude CSS and styling files
   '<rootDir>/src/types/',     // Exclude TypeScript type definitions
   '<rootDir>/src/stories/',   // Exclude Storybook story files
   '.stories.tsx',             // Exclude individual story files
   '.stories.ts',              // Exclude TypeScript story files
 ],
 
 /**
  * ========================================================================
  * Setup and Environment Configuration
  * ========================================================================
  */
 
 /**
  * Polyfill Configuration
  * 
  * Loads React App polyfills for browser API compatibility in testing.
  * Ensures consistent behavior across different Node.js versions.
  */
 setupFiles: ['react-app-polyfill/jsdom'],
 
 /**
  * Test Setup Configuration
  * 
  * Executes setup file after Jest environment initialization.
  * Configures testing library matchers and global test utilities.
  */
 setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
 
 /**
  * Mock Reset Configuration
  * 
  * Automatically resets all mocks between tests for isolation.
  * Prevents test interference and ensures predictable behavior.
  */
 resetMocks: true,
 
 /**
  * ========================================================================
  * Module Resolution and Transformation
  * ========================================================================
  */
 
 /**
  * Module Search Paths
  * 
  * Adds src directory to module resolution paths for absolute imports.
  * Enables clean import statements without relative path complexity.
  */
 modulePaths: ['<rootDir>/src'],
 
 /**
  * Module Name Mapping (Path Aliases)
  * 
  * Maps TypeScript path aliases to actual file locations for testing.
  * Maintains consistency with application import patterns and tsconfig.json.
  */
 moduleNameMapper: {
   '^react-native$': 'react-native-web',                    // React Native Web compatibility
   '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy', // CSS Modules proxy for styling
   '^@/(.*)$': '<rootDir>/src/$1',                          // General src directory alias
   '^@components/(.*)$': '<rootDir>/src/components/$1',     // Component directory alias
   '^@pages/(.*)$': '<rootDir>/src/pages/$1',              // Pages directory alias
   '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',              // Custom hooks alias
   '^@services/(.*)$': '<rootDir>/src/services/$1',        // API services alias
   '^@store/(.*)$': '<rootDir>/src/store/$1',              // Redux store alias
   '^@utils/(.*)$': '<rootDir>/src/utils/$1',              // Utilities alias
   '^@types/(.*)$': '<rootDir>/src/types/$1',              // Type definitions alias
   '^@styles/(.*)$': '<rootDir>/src/styles/$1',            // Styles directory alias
 },
 
 /**
  * File Extension Priority
  * 
  * Defines resolution order for module file extensions.
  * Prioritizes web-specific files and TypeScript over JavaScript.
  */
 moduleFileExtensions: [
   'web.js',   // Web-specific JavaScript files
   'js',       // Standard JavaScript files
   'web.ts',   // Web-specific TypeScript files
   'ts',       // Standard TypeScript files
   'web.tsx',  // Web-specific React TypeScript files
   'tsx',      // React TypeScript files
   'json',     // JSON configuration and data files
   'web.jsx',  // Web-specific React JavaScript files
   'jsx',      // React JavaScript files
   'node',     // Node.js specific files
 ],
 
 /**
  * ========================================================================
  * Code Transformation Configuration
  * ========================================================================
  */
 
 /**
  * File Transformation Rules
  * 
  * Defines how different file types are processed during testing.
  * Handles JavaScript, TypeScript, CSS, and static asset transformation.
  */
 transform: {
   // JavaScript and TypeScript files - Babel transformation for modern syntax
   '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/config/jest/babelTransform.js',
   
   // CSS files - Mock transformation for styling imports
   '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
   
   // Static assets - File path transformation for imports
   '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
 },
 
 /**
  * Transform Ignore Patterns
  * 
  * Specifies files that should not be transformed during testing.
  * Optimizes performance by skipping transformation of node_modules.
  */
 transformIgnorePatterns: [
   '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$', // Ignore node_modules
   '^.+\\.module\\.(css|sass|scss)$',                         // Ignore CSS modules
 ],
 
 /**
  * ========================================================================
  * Development and Watch Mode Configuration
  * ========================================================================
  */
 
 /**
  * Watch Mode Plugins
  * 
  * Enhances Jest watch mode with intelligent test filtering and execution.
  * Provides interactive test running during development workflows.
  */
 watchPlugins: [
   'jest-watch-typeahead/filename',  // Filename-based test filtering
   'jest-watch-typeahead/testname',  // Test name-based filtering
 ],
 
 /**
  * ========================================================================
  * TypeScript and Global Configuration
  * ========================================================================
  */
 
 /**
  * TypeScript Jest Configuration
  * 
  * Configures TypeScript compilation settings for testing environment.
  * Uses React JSX transform for component testing compatibility.
  */
 globals: {
   'ts-jest': {
     tsconfig: {
       jsx: 'react-jsx',  // React 17+ JSX transform for testing
     },
   },
 },
 
 /**
  * ========================================================================
  * Configuration Summary
  * ========================================================================
  * 
  * This Jest configuration provides comprehensive testing capabilities
  * for the ShadowNews email-first social platform including:
  * 
  * Core Testing Features:
  * - Unit and integration testing for React components and utilities
  * - TypeScript support with path alias resolution and type checking
  * - Code coverage reporting with 70% minimum thresholds
  * - DOM simulation with jsdom for browser API testing
  * - Mock management with automatic reset between tests
  * 
  * ShadowNews-Specific Testing:
  * - Authentication flow testing with user session management
  * - Email repository testing with CSV parsing and data validation
  * - Snowball distribution algorithm testing with voting mechanics
  * - Redux state management testing with action and reducer validation
  * - API service testing with HTTP client mocking and response handling
  * 
  * Development Workflow:
  * - Watch mode with intelligent test filtering and execution
  * - Multiple coverage report formats for CI and local development
  * - Path alias support matching application import patterns
  * - Optimized performance with transform caching and parallel execution
  * ========================================================================
  */
};