/**
 * ============================================================================
 * Cypress Configuration for ShadowNews Frontend
 * ============================================================================
 * 
 * Comprehensive Cypress testing configuration for end-to-end and component testing
 * of the ShadowNews email-first social platform React frontend application.
 * 
 * Configuration Features:
 * - End-to-End Testing: Full application testing with browser automation
 * - Component Testing: Isolated React component testing in browser environment
 * - Code Coverage: Integrated test coverage reporting and analysis
 * - Custom Tasks: Database seeding, user creation, and test data management
 * - Browser Support: Chrome, Firefox, and Electron testing environments
 * - Screenshot/Video: Automatic failure capture and test execution recording
 * 
 * Testing Capabilities:
 * - Authentication Flows: Login, registration, and session management testing
 * - Email Repository: CSV import, email processing, and repository management
 * - Snowball Distribution: Community voting and content distribution algorithms
 * - User Interactions: Post creation, commenting, voting, and social features
 * - UI Components: React component isolation and interaction testing
 * - API Integration: Backend service communication and data flow validation
 * 
 * Performance Optimizations:
 * - Parallel Testing: Concurrent test execution for faster feedback cycles
 * - Retry Logic: Automatic test retry on failure for reliability
 * - Custom Timeouts: Optimized waiting periods for various operations
 * - Browser Flags: Chromium and Firefox optimization for testing environment
 * 
 * ShadowNews Platform Testing:
 * - Email-First Features: Email repository creation and management workflows
 * - Community Features: User karma, voting systems, and social interactions
 * - Content Management: Post creation, editing, and distribution mechanisms
 * - Responsive Design: Multi-device and viewport testing capabilities
 * 
 * Dependencies:
 * - Cypress framework for modern web application testing
 * - @cypress/code-coverage for test coverage analysis and reporting
 * - Custom task modules for database and test data management
 * - Webpack configuration for component testing build pipeline
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 * ============================================================================
 */

const { defineConfig } = require('cypress')

module.exports = defineConfig({
 /**
  * ========================================================================
  * End-to-End Testing Configuration
  * ========================================================================
  * 
  * Configures Cypress for full-stack application testing including user
  * workflows, API interactions, and complete feature testing scenarios.
  */
 e2e: {
   /**
    * Application URL Configuration
    * 
    * Base URL for the ShadowNews React development server during testing.
    * Points to localhost development environment for e2e test execution.
    */
   baseUrl: 'http://localhost:3000',
   
   /**
    * Test File Discovery
    * 
    * Pattern for locating e2e test files supporting JavaScript and TypeScript.
    * Searches cypress/e2e directory for comprehensive test suite organization.
    */
   specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
   
   /**
    * Support File Configuration
    * 
    * Global commands, utilities, and setup for all e2e tests.
    * Provides shared functionality across the entire test suite.
    */
   supportFile: 'cypress/support/e2e.js',
   
   /**
    * Test Data and Asset Configuration
    * 
    * Directories for test fixtures, screenshots, and video recordings.
    * Organizes test artifacts for debugging and CI/CD pipeline integration.
    */
   fixturesFolder: 'cypress/fixtures',
   screenshotsFolder: 'cypress/screenshots',
   videosFolder: 'cypress/videos',
   
   /**
    * Viewport Configuration
    * 
    * Default browser window size for consistent test execution.
    * Simulates desktop environment for primary ShadowNews user experience.
    */
   viewportWidth: 1280,
   viewportHeight: 720,
   
   /**
    * Test Recording Configuration
    * 
    * Enables video recording of test execution for debugging failures.
    * Captures screenshots automatically when tests fail for analysis.
    */
   video: true,
   screenshotOnRunFailure: true,
   
   /**
    * Timeout Configuration
    * 
    * Optimized timeout values for ShadowNews application performance.
    * Balances test reliability with execution speed for various operations.
    */
   defaultCommandTimeout: 10000,  // General command timeout for UI interactions
   requestTimeout: 10000,         // API request timeout for backend communication
   responseTimeout: 10000,        // API response timeout for data retrieval
   pageLoadTimeout: 30000,        // Page load timeout for full application loading
   
   /**
    * Test Retry Configuration
    * 
    * Automatic retry logic for handling flaky tests and network issues.
    * Different retry counts for CI (runMode) vs local development (openMode).
    */
   retries: {
     runMode: 2,    // CI environment: retry failed tests twice
     openMode: 0    // Local development: no retries for immediate feedback
   },
   
   /**
    * Environment Variables
    * 
    * Test-specific environment configuration for API endpoints and features.
    * Provides flexibility for different testing environments and scenarios.
    */
   env: {
     apiUrl: 'http://localhost:5000/api',  // Backend API endpoint for testing
     coverage: false,                      // Code coverage toggle for performance
     codeCoverage: {
       url: 'http://localhost:5000/__coverage__'  // Coverage report endpoint
     }
   },
   
   /**
    * Experimental Features
    * 
    * Enables cutting-edge Cypress features for enhanced testing capabilities.
    * Provides access to latest testing tools and browser support.
    */
   experimentalStudio: true,        // Visual test authoring and editing
   experimentalWebKitSupport: true, // Safari/WebKit browser testing support
   
   /**
    * Security and Compatibility Configuration
    * 
    * Disables certain browser security features for testing flexibility.
    * Allows testing of cross-origin scenarios and embedded content.
    */
   chromeWebSecurity: false,     // Disables Chrome security for cross-origin testing
   modifyObstructiveCode: false, // Preserves original application code during testing
   
   /**
    * ======================================================================
    * Node Event Handlers and Custom Tasks
    * ======================================================================
    * 
    * Configures server-side functionality for database management,
    * test data creation, and custom testing utilities.
    */
   setupNodeEvents(on, config) {
     /**
      * Code Coverage Integration
      * 
      * Enables test coverage collection and reporting for ShadowNews frontend.
      * Provides insights into test effectiveness and code quality metrics.
      */
     require('@cypress/code-coverage/task')(on, config)
     
     /**
      * Custom Task Registration
      * 
      * Registers custom tasks for database operations and test data management.
      * Enables sophisticated test scenarios with controlled data states.
      */
     on('task', {
       /**
        * Logging Utilities
        * 
        * Custom logging functions for debugging test execution and data flow.
        * Provides enhanced visibility into test behavior and application state.
        */
       log(message) {
         console.log(message)
         return null
       },
       
       table(message) {
         console.table(message)
         return null
       },
       
       /**
        * Database Management Tasks
        * 
        * Custom tasks for controlling test database state and ensuring
        * consistent test environments across different execution contexts.
        */
       seedDatabase() {
         return require('./cypress/tasks/seedDatabase')()
       },
       
       clearDatabase() {
         return require('./cypress/tasks/clearDatabase')()
       },
       
       /**
        * Test Data Creation Tasks
        * 
        * Tasks for creating realistic test data including users, posts,
        * and repositories for comprehensive ShadowNews feature testing.
        */
       createUser(userData) {
         return require('./cypress/tasks/createUser')(userData)
       },
       
       createPost(postData) {
         return require('./cypress/tasks/createPost')(postData)
       },
       
       createRepository(repoData) {
         return require('./cypress/tasks/createRepository')(repoData)
       }
     })
     
     /**
      * ====================================================================
      * Browser Launch Configuration
      * ====================================================================
      * 
      * Optimizes browser startup parameters for stable test execution
      * across different browser engines and testing environments.
      */
     on('before:browser:launch', (browser = {}, launchOptions) => {
       /**
        * Chromium Browser Optimization
        * 
        * Configures Chrome/Chromium browsers for stable testing performance.
        * Disables problematic features that can cause test flakiness.
        */
       if (browser.family === 'chromium' && browser.name !== 'electron') {
         launchOptions.args.push('--disable-dev-shm-usage')      // Prevents memory issues
         launchOptions.args.push('--disable-gpu')               // Disables GPU acceleration
         launchOptions.args.push('--no-sandbox')                // Disables sandboxing for CI
         launchOptions.args.push('--disable-setuid-sandbox')    // Disables setuid sandbox
         launchOptions.args.push('--disable-web-security')      // Allows cross-origin testing
         launchOptions.args.push('--disable-features=IsolateOrigins,site-per-process') // Simplifies testing
       }
       
       /**
        * Firefox Browser Optimization
        * 
        * Configures Firefox browser preferences for ShadowNews testing.
        * Adjusts cookie and security settings for test compatibility.
        */
       if (browser.family === 'firefox') {
         launchOptions.preferences['network.cookie.sameSite.laxByDefault'] = false
       }
       
       return launchOptions
     })
     
     return config
   }
 },
 
 /**
  * ========================================================================
  * Component Testing Configuration
  * ========================================================================
  * 
  * Configures Cypress for isolated React component testing in browser
  * environment with real DOM rendering and user interaction simulation.
  */
 component: {
   /**
    * Development Server Configuration
    * 
    * Configures component testing build pipeline using Webpack and React.
    * Provides isolated testing environment for individual UI components.
    */
   devServer: {
     framework: 'react',                           // React framework for component rendering
     bundler: 'webpack',                           // Webpack bundler for component compilation
     webpackConfig: require('./webpack.config.js') // Custom webpack configuration
   },
   
   /**
    * Component Test Discovery
    * 
    * Pattern for locating component test files within the src directory.
    * Enables co-location of tests with component source code.
    */
   specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
   
   /**
    * Component Testing Support
    * 
    * Support file and HTML template for component testing environment.
    * Provides isolated testing context for React component evaluation.
    */
   supportFile: 'cypress/support/component.js',
   indexHtmlFile: 'cypress/support/component-index.html',
   
   /**
    * Component Testing Viewport
    * 
    * Default viewport size for component testing ensuring consistent
    * rendering and interaction testing across component test suite.
    */
   viewportWidth: 1280,
   viewportHeight: 720,
   
   /**
    * Component Testing Recording
    * 
    * Disables video recording for component tests to improve performance.
    * Component tests typically execute faster and with less need for video.
    */
   video: false
 },
 
 /**
  * ========================================================================
  * Configuration Summary
  * ========================================================================
  * 
  * This Cypress configuration provides comprehensive testing capabilities
  * for the ShadowNews email-first social platform including:
  * 
  * E2E Testing Features:
  * - Full application workflow testing with real browser automation
  * - API integration testing with backend service communication
  * - User authentication and session management validation
  * - Email repository and snowball distribution feature testing
  * - Cross-browser compatibility testing with Chrome, Firefox, and Electron
  * 
  * Component Testing Features:
  * - Isolated React component testing in real browser environment
  * - Component interaction and state management validation
  * - UI behavior testing with user event simulation
  * - Component rendering and accessibility testing
  * 
  * Development Workflow Integration:
  * - Code coverage reporting for test effectiveness measurement
  * - Custom database tasks for controlled test data management
  * - Debugging tools with screenshots and video recording
  * - CI/CD pipeline integration with retry logic and artifact collection
  * ========================================================================
  */
})