# ESLint Configuration Documentation

## Overview
This document provides detailed explanations for the ESLint configuration used in the ShadowNews backend API. The configuration enforces code quality, security best practices, and modern JavaScript standards.

## Configuration Structure

### Environment Settings (`env`)
Defines the JavaScript environments and global variables available to the code:

- **`es2021: true`** - Enables ES2021 JavaScript features including:
  - Async/await syntax
  - Optional chaining (`?.`)
  - Nullish coalescing (`??`)
  - Logical assignment operators (`||=`, `&&=`, `??=`)
  - Private methods and accessors in classes

- **`node: true`** - Provides Node.js global variables and scoping:
  - `require`, `module`, `exports`
  - `process`, `__dirname`, `__filename`
  - `global`, `Buffer`
  - Node.js built-in modules

- **`jest: true`** - Enables Jest testing framework globals:
  - `describe`, `test`, `it`
  - `expect`, `beforeEach`, `afterEach`
  - `beforeAll`, `afterAll`
  - `jest` global object

### Extended Configurations (`extends`)
Base rule sets that this configuration builds upon:

1. **`eslint:recommended`**
   - ESLint's core recommended rules
   - Covers common JavaScript issues and best practices
   - Prevents potential runtime errors
   - Enforces readable code patterns

2. **`plugin:node/recommended`**
   - Node.js specific linting rules
   - Server-side JavaScript best practices
   - CommonJS module handling
   - Node.js API usage validation

3. **`plugin:security/recommended`**
   - Security-focused rules to detect vulnerabilities
   - Prevents common security issues like:
     - Potential XSS vulnerabilities
     - SQL injection risks
     - Unsafe regular expressions
     - Insecure random number generation

4. **`prettier`**
   - Disables ESLint formatting rules that conflict with Prettier
   - Ensures code formatting is handled by Prettier only
   - Prevents formatting rule conflicts

### Parser Options (`parserOptions`)
Configures how ESLint parses JavaScript code:

- **`ecmaVersion: 2021`** - Parse using ES2021 syntax features
- **`sourceType: "module"`** - Enable ES6 modules (import/export) instead of CommonJS

### Plugins (`plugins`)
Additional ESLint plugins providing specialized rules:

- **`node`** - Node.js specific rules and best practices
- **`security`** - Security vulnerability detection
- **`jest`** - Jest testing framework specific rules

## Custom Rules Configuration

### Console and Debugging Rules
- **`no-console`** - `["warn", { "allow": ["warn", "error"] }]`
  - Warns about `console.log` usage
  - Allows `console.warn` and `console.error` for proper logging
  - Encourages use of proper logging library (Winston)

### Variable Declaration Rules
- **`no-unused-vars`** - `["error", { "argsIgnorePattern": "^_" }]`
  - Errors on unused variables
  - Ignores parameters starting with underscore (`_req`, `_res`)
  - Helps identify dead code

- **`no-underscore-dangle`** - `["error", { "allow": ["_id"] }]`
  - Prevents underscore dangling in identifiers
  - Allows MongoDB's `_id` field
  - Enforces clean naming conventions

- **`prefer-const`** - `"error"`
  - Requires `const` for variables never reassigned
  - Improves code readability and intent

- **`no-var`** - `"error"`
  - Disallows `var` declarations
  - Enforces `let` and `const` usage
  - Prevents hoisting issues

### Modern JavaScript Syntax Rules
- **`object-shorthand`** - `"error"`
  - Requires object literal shorthand syntax
  - `{ name }` instead of `{ name: name }`

- **`prefer-arrow-callback`** - `"error"`
  - Prefers arrow functions for callbacks
  - Maintains lexical `this` binding

- **`prefer-destructuring`** - `["error", { "object": true, "array": false }]`
  - Requires destructuring for objects
  - Optional for arrays (array destructuring can be unclear)

- **`prefer-template`** - `"error"`
  - Requires template literals over string concatenation
  - `\`Hello \${name}\`` instead of `'Hello ' + name`

### Function and Async/Await Rules
- **`no-param-reassign`** - `["error", { "props": false }]`
  - Disallows parameter reassignment
  - Allows modifying parameter properties
  - Prevents confusing parameter mutations

- **`no-return-await`** - `"error"`
  - Disallows unnecessary `return await`
  - `return promise` instead of `return await promise`

- **`require-await`** - `"error"`
  - Requires `await` in async functions
  - Prevents unnecessary async function declarations

### Node.js Specific Rules
- **`no-path-concat`** - `"error"`
  - Disallows string concatenation with `__dirname` and `__filename`
  - Enforces use of `path.join()` for cross-platform compatibility

- **`node/no-unsupported-features/es-syntax`** - Custom configuration
  - Disallows unsupported Node.js ES syntax
  - Allows ES modules (configured to ignore)

- **`node/no-missing-import`** - `"off"`
  - Disabled: Missing import checks handled by other tools
  - Prevents false positives with complex module resolution

- **`node/no-unpublished-import`** - `"off"`
  - Allows importing devDependencies
  - Necessary for test files and development tools

### Security Rules
- **`security/detect-object-injection`** - `"off"`
  - Disabled due to false positives with MongoDB
  - MongoDB operations often use dynamic property access

### Jest Testing Rules
- **`jest/no-disabled-tests`** - `"warn"`
  - Warns about disabled tests (`describe.skip`, `test.skip`)
  - Helps identify temporarily disabled tests

- **`jest/no-focused-tests`** - `"error"`
  - Errors on focused tests (`describe.only`, `test.only`)
  - Prevents committing debug-only tests

- **`jest/no-identical-title`** - `"error"`
  - Prevents duplicate test titles in same describe block
  - Improves test clarity and debugging

- **`jest/prefer-to-have-length`** - `"warn"`
  - Prefers `toHaveLength()` over manual length comparison
  - Better error messages and readability

- **`jest/valid-expect`** - `"error"`
  - Ensures `expect()` calls are valid and properly formed
  - Prevents common testing mistakes

## File-Specific Overrides

### Test Files (`*.test.js`, `*.spec.js`)
- Enhanced Jest environment
- Ensures Jest globals are available
- Applies Jest-specific rules more strictly

## Usage Guidelines

### Running ESLint
```bash
# Lint all source files
npm run lint

# Auto-fix issues where possible
npm run lint:fix

# Format code with Prettier
npm run format
```

### IDE Integration
- Configure your IDE to show ESLint warnings/errors inline
- Enable auto-fix on save for better development experience
- Ensure Prettier integration is enabled for formatting

### Pre-commit Hooks
Consider adding ESLint to pre-commit hooks to enforce code quality:
```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Configure in package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.js": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## Customization

### Adding New Rules
When adding new ESLint rules:
1. Test thoroughly with existing codebase
2. Document the rule purpose and configuration
3. Consider impact on development workflow
4. Update this documentation

### Plugin Management
When adding new ESLint plugins:
1. Install as devDependency
2. Add to `plugins` array
3. Configure rules in `rules` section
4. Document usage and rationale

This configuration balances code quality enforcement with development productivity, ensuring consistent, secure, and maintainable code across the ShadowNews backend.
