# ============================================================================
# ShadowNews - Comprehensive File Commenting Guide
# ============================================================================
#
# Standardized documentation guidelines for the ShadowNews project.
# This guide ensures consistent, comprehensive commenting across all files
# in the codebase, improving maintainability and developer onboarding.
#
# Documentation Philosophy:
# - Every file should have a clear purpose and responsibility
# - Code should be self-documenting with meaningful names and structure
# - Comments should explain "why" not just "what"
# - JSDoc standards for JavaScript/TypeScript files
# - Comprehensive examples for common patterns
#
# Target Audience:
# - New developers joining the ShadowNews team
# - Existing team members maintaining consistency
# - External contributors understanding the codebase
# - Future developers working on platform evolution
#
# Last Updated: 2025-07-27
# Version: 1.0.0
# ============================================================================\n\n# ShadowNews - File Commenting Guide

This guide provides standardized templates for adding detailed comments to all files in the ShadowNews project.

## File Header Template

```javascript
/**
 * @fileoverview [Brief description of file purpose]
 * 
 * [Detailed description of what this file does, its responsibilities,
 * and how it fits into the overall application architecture]
 * 
 * Key Features:
 * - [Feature 1 description]
 * - [Feature 2 description]
 * - [Feature 3 description]
 * 
 * Dependencies:
 * - [Key dependency 1]: [Why it's used]
 * - [Key dependency 2]: [Why it's used]
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 */
```

## Comment Templates by File Type

### 1. **Controllers** (backend/src/api/controller/*.js)
```javascript
/**
 * @fileoverview [Controller Name] Controller
 * 
 * Handles HTTP requests for [resource name] operations including:
 * - CRUD operations ([Create/Read/Update/Delete])
 * - Business logic validation
 * - Response formatting
 * - Error handling
 * 
 * Route Handlers:
 * - GET /[resource] - List/search [resources]
 * - GET /[resource]/:id - Get single [resource]
 * - POST /[resource] - Create new [resource]
 * - PUT /[resource]/:id - Update [resource]
 * - DELETE /[resource]/:id - Delete [resource]
 */
```

### 2. **Services** (backend/src/services/*.js)
```javascript
/**
 * @fileoverview [Service Name] Service
 * 
 * Business logic layer for [functionality] operations.
 * Encapsulates complex operations and integrates with:
 * - Database models
 * - External APIs
 * - Other services
 * 
 * Key Operations:
 * - [Operation 1]: [Description]
 * - [Operation 2]: [Description]
 * - [Operation 3]: [Description]
 */
```

### 3. **Models** (backend/src/models/*.js)
```javascript
/**
 * @fileoverview [Model Name] Database Model
 * 
 * Mongoose schema definition for [entity] documents.
 * Defines data structure, validation rules, and database interactions.
 * 
 * Schema Fields:
 * - [field1]: [type] - [description]
 * - [field2]: [type] - [description]
 * 
 * Relationships:
 * - [relationship]: [description]
 * 
 * Indexes:
 * - [index]: [purpose]
 */
```

### 4. **Routes** (backend/src/api/routes/*.js)
```javascript
/**
 * @fileoverview [Resource] API Routes
 * 
 * Defines HTTP routes for [resource] endpoints.
 * Applies middleware for authentication, validation, and rate limiting.
 * 
 * Endpoints:
 * - [METHOD] /path - [description]
 * - [METHOD] /path - [description]
 * 
 * Middleware Applied:
 * - Authentication: [when required]
 * - Validation: [what is validated]
 * - Rate Limiting: [limits applied]
 */
```

### 5. **Middleware** (backend/src/api/middleware/*.js)
```javascript
/**
 * @fileoverview [Middleware Name] Middleware
 * 
 * Express middleware for [purpose].
 * Processes requests before they reach route handlers.
 * 
 * Functionality:
 * - [What it does]
 * - [When it's applied]
 * - [What it validates/modifies]
 * 
 * Usage:
 * - Applied to: [which routes]
 * - Order: [when in middleware stack]
 */
```

### 6. **Workers** (backend/src/workers/*.js)
```javascript
/**
 * @fileoverview [Worker Name] Background Worker
 * 
 * Background process for [purpose].
 * Runs independently of HTTP requests to handle:
 * - [Task 1]
 * - [Task 2]
 * - [Task 3]
 * 
 * Scheduling:
 * - Frequency: [how often it runs]
 * - Triggers: [what starts it]
 * - Dependencies: [what it needs]
 */
```

### 7. **React Components** (frontend/src/components/*/*.tsx)
```typescript
/**
 * @fileoverview [Component Name] Component
 * 
 * React component for [purpose].
 * Renders [what it displays] and handles [user interactions].
 * 
 * Features:
 * - [Feature 1]
 * - [Feature 2]
 * - [Feature 3]
 * 
 * Props:
 * - [prop]: [type] - [description]
 * 
 * State:
 * - [state]: [description]
 * 
 * @component
 */
```

### 8. **React Services** (frontend/src/services/*.ts)
```typescript
/**
 * @fileoverview [Service Name] API Service
 * 
 * Frontend service for [API resource] operations.
 * Handles HTTP requests to backend API and data transformation.
 * 
 * API Endpoints:
 * - [endpoint]: [description]
 * - [endpoint]: [description]
 * 
 * Data Flow:
 * - [how data flows]
 * - [transformations applied]
 */
```

### 9. **Utils** (*/src/utils/*.js|ts)
```javascript
/**
 * @fileoverview [Utility Name] Utilities
 * 
 * Utility functions for [purpose].
 * Provides reusable helper functions used across the application.
 * 
 * Functions:
 * - [function1]: [description]
 * - [function2]: [description]
 * 
 * Usage:
 * - Used by: [which modules]
 * - Purpose: [why these utilities exist]
 */
```

### 10. **Configuration Files** (backend/src/config/*.js)
```javascript
/**
 * @fileoverview [Config Name] Configuration
 * 
 * Configuration settings for [service/feature].
 * Manages environment-specific settings and defaults.
 * 
 * Settings:
 * - [setting1]: [description]
 * - [setting2]: [description]
 * 
 * Environment Variables:
 * - [ENV_VAR]: [purpose]
 */
```

## Function/Method Comment Template

```javascript
/**
 * [Brief description of what the function does]
 * 
 * [Detailed description including algorithm, business logic, 
 * side effects, and important implementation details]
 * 
 * @param {type} paramName - [Description of parameter]
 * @param {type} paramName - [Description of parameter]
 * @returns {type} [Description of return value]
 * 
 * @throws {ErrorType} [When this error occurs]
 * 
 * @example
 * // Example usage
 * const result = functionName(param1, param2);
 * 
 * @since 1.0.0
 * @async [if async function]
 */
```

## Class Comment Template

```javascript
/**
 * [Class Name] Class
 * 
 * [Description of what the class represents and its purpose]
 * 
 * Key Responsibilities:
 * - [Responsibility 1]
 * - [Responsibility 2]
 * 
 * @class [ClassName]
 * @since 1.0.0
 */
```

## Complex Logic Comment Template

```javascript
/**
 * Complex Algorithm: [Algorithm Name]
 * 
 * Step-by-step explanation:
 * 1. [Step 1 description]
 * 2. [Step 2 description]
 * 3. [Step 3 description]
 * 
 * Time Complexity: O([complexity])
 * Space Complexity: O([complexity])
 * 
 * Edge Cases Handled:
 * - [Edge case 1]
 * - [Edge case 2]
 */
```

## File Priority for Commenting

### High Priority (Core Architecture)
1. ✅ Server entry points (server.js, app.js)
2. ✅ Configuration files (config/*.js)
3. 🔄 Database models (models/*.js)
4. 🔄 Core services (services/*.js)
5. 🔄 API controllers (api/controller/*.js)
6. 🔄 Authentication middleware
7. 🔄 Main routes (api/routes/*.js)

### Medium Priority (Business Logic)
1. Workers and background jobs
2. Utility functions
3. Validation middleware
4. WebSocket handlers
5. Email templates and services

### Lower Priority (Frontend & Tests)
1. React components
2. Frontend services
3. Styling files
4. Test files
5. Configuration files (package.json, etc.)

## Implementation Plan

### Phase 1: Backend Core (Days 1-2)
- Models and database utilities
- Core services (auth, email, repository)
- Main controllers
- Critical middleware

### Phase 2: Backend API (Days 3-4)
- All routes
- Remaining controllers
- Workers and background jobs
- Utility functions

### Phase 3: Frontend Core (Days 5-6)
- Main components
- API services
- Store/state management
- Hooks and utilities

### Phase 4: Documentation & Polish (Day 7)
- Configuration files
- Test files
- Docker and deployment files
- README updates

## Automation Script Ideas

You could create a script to:
1. Scan all files and identify which ones lack proper comments
2. Generate basic comment templates based on file type
3. Insert standard headers automatically
4. Flag complex functions that need detailed documentation

This systematic approach ensures consistent, comprehensive documentation across your entire codebase!
