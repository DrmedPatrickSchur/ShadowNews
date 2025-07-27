# ShadowNews - Complete File List for Commenting (157 Files)

## Summary by Category

### Backend Files (60 files)
#### Core Application (4 files)
- backend/src/app.js ✅ (commented)
- backend/src/server.js ✅ (commented)
- backend/package.json
- backend/.eslintrc.json

#### Configuration (6 files)
- backend/src/config/ai.config.js
- backend/src/config/database.config.js
- backend/src/config/email.config.js
- backend/src/config/index.js ✅ (partially commented)
- backend/src/config/redis.config.js
- backend/src/config/server.config.js

#### Database Models (6 files)
- backend/src/models/Comment.model.js
- backend/src/models/email.model.js
- backend/src/models/index.js
- backend/src/models/Karma.model.js
- backend/src/models/Post.model.js
- backend/src/models/Repository.model.js
- backend/src/models/User.model.js ✅ (partially commented)

#### API Controllers (6 files)
- backend/src/api/controller/auth.controller.js
- backend/src/api/controller/comments.controller.js
- backend/src/api/controller/csv.controller.js
- backend/src/api/controller/posts.controller.js
- backend/src/api/controller/repositories.controller.js
- backend/src/api/controller/users.controller.js

#### API Middleware (5 files)
- backend/src/api/middleware/auth.middleware.js
- backend/src/api/middleware/errorHandler.middleware.js
- backend/src/api/middleware/rateLimit.middleware.js
- backend/src/api/middleware/upload.middleware.js
- backend/src/api/middleware/validation.middleware.js

#### API Routes (7 files)
- backend/src/api/routes/auth-routes-file.js
- backend/src/api/routes/comments.routes.js
- backend/src/api/routes/email.routes.js
- backend/src/api/routes/index.js
- backend/src/api/routes/posts-routes-file.js
- backend/src/api/routes/repositories.routes.js
- backend/src/api/routes/users.routes.js

#### Services (9 files)
- backend/src/services/ai.service.js
- backend/src/services/auth.service.js ✅ (partially commented)
- backend/src/services/csv.service.js
- backend/src/services/email.service.js
- backend/src/services/emailParser.service.js
- backend/src/services/karma.service.js
- backend/src/services/notification.service.js
- backend/src/services/repository.service.js
- backend/src/services/snowball.service.js

#### Utilities (7 files)
- backend/src/utils/csvParser.js
- backend/src/utils/database.js
- backend/src/utils/emailTemplates.js
- backend/src/utils/helpers.js
- backend/src/utils/logger.js
- backend/src/utils/redis.js
- backend/src/utils/validators.js

#### Workers (5 files)
- backend/src/workers/cleanup.worker.js ✅ (partially commented)
- backend/src/workers/digest.worker.js
- backend/src/workers/email.worker.js
- backend/src/workers/index.js
- backend/src/workers/snowball.worker.js

#### WebSocket (3 files)
- backend/src/websocket/handlers/comments.handler.js
- backend/src/websocket/handlers/posts.handler.js
- backend/src/websocket/index.js

#### Scripts (3 files)
- backend/scripts/generateApiDocs.js
- backend/scripts/migrateData.js
- backend/scripts/seedDatabase.js

#### Tests (4 files)
- backend/tests/fixtures/testData.js
- backend/tests/integration/auth.test.js
- backend/tests/integration/posts.test.js
- backend/tests/integration/repositories.test.js

#### Build Config (3 files)
- backend/jest.config.js
- backend/nodemon.json

### Frontend Files (67 files)
#### Core Application (3 files)
- frontend/src/App.tsx
- frontend/src/index.tsx
- frontend/src/routes.tsx

#### Components (9 files)
- frontend/src/components/common/Button/Button.styles.ts
- frontend/src/components/common/Button/Button.test.tsx
- frontend/src/components/common/Button/Button.tsx
- frontend/src/components/layout/Header/Header.styles.ts
- frontend/src/components/layout/Header/Header.tsx
- frontend/src/components/layout/Header/SearchBar.tsx
- frontend/src/components/layout/pages/Home/Home.styles.ts
- frontend/src/components/layout/pages/Home/Home.test.tsx
- frontend/src/components/layout/pages/Home/Home.tsx

#### Hooks (7 files)
- frontend/src/hooks/useAuth.ts
- frontend/src/hooks/useDebounce.ts.ts
- frontend/src/hooks/useInfiniteScroll.ts
- frontend/src/hooks/useLocalStorage.ts
- frontend/src/hooks/usePosts.ts
- frontend/src/hooks/useRepositories.ts
- frontend/src/hooks/useWebSocket.ts

#### Services (7 files)
- frontend/src/services/api.ts
- frontend/src/services/auth.service.ts
- frontend/src/services/comments.service.ts
- frontend/src/services/email.service.ts
- frontend/src/services/posts.service.ts
- frontend/src/services/repositories.service.ts
- frontend/src/services/websocket.service.ts

#### Store/State Management (6 files)
- frontend/src/store/middleware/websocket.middleware.ts
- frontend/src/store/slices/auth.slice.ts
- frontend/src/store/slices/comments.slice.ts
- frontend/src/store/slices/posts.slice.ts
- frontend/src/store/slices/repositories.slice.ts
- frontend/src/store/slices/ui.slice.ts
- frontend/src/store/store.ts

#### Styles (5 files)
- frontend/src/styles/globals.css
- frontend/src/styles/tailwind.css
- frontend/src/styles/themes/dark.css
- frontend/src/styles/themes/light.css
- frontend/src/styles/variables.css

#### Types (5 files)
- frontend/src/types/api.types.ts
- frontend/src/types/index.ts
- frontend/src/types/post.types.ts
- frontend/src/types/repository.types.ts
- frontend/src/types/user.types.ts

#### Utilities (5 files)
- frontend/src/utiles/analytics.ts
- frontend/src/utiles/constants.ts
- frontend/src/utiles/formatters.ts
- frontend/src/utiles/helpers.ts
- frontend/src/utiles/validators.ts

#### Public Files (4 files)
- frontend/public/index.html
- frontend/public/manifest-json-file.json
- frontend/public/service-worker.js
- frontend/public/shadownews-favicon-svg.svg
- frontend/public/shadownews-favicon-svg.ico

#### Config Files (4 files)
- frontend/.eslintrc.json
- frontend/cypress.config.js
- frontend/jest.config.js
- frontend/package.json
- frontend/tailwind.config.js
- frontend/tsconfig.json

### Shared Files (10 files)
#### Constants (3 files)
- shared/constants/api.constants.ts
- shared/constants/email.constants.ts
- shared/constants/karma.constants.ts

#### Types (4 files)
- shared/types/index.ts
- shared/types/post.interface.ts
- shared/types/repository.interface.ts
- shared/types/user.interface.ts

#### Validators (2 files)
- shared/validators/csv.validator.ts
- shared/validators/email.validator.ts

### Documentation Files (12 files)
#### API Documentation (3 files)
- docs/api/authentication.md
- docs/api/endpoints.md
- docs/api/websocket.md

#### Architecture Documentation (3 files)
- docs/architecture/database-schema.md
- docs/architecture/deployment.md
- docs/architecture/overview.md

#### Features Documentation (3 files)
- docs/features/email-repository.md
- docs/features/karma-system.md
- docs/features/snowball-distribution.md

#### Setup Documentation (3 files)
- docs/setup/development.md
- docs/setup/environment.md
- docs/setup/production.md

### Testing Files (3 files)
#### E2E Tests (3 files)
- cypress/e2e/auth.cy.js
- cypress/e2e/posts.cy.js
- cypress/e2e/repositories.cy.js

### Infrastructure Files (5 files)
#### Docker (2 files)
- docker/nginx/nginx.conf
- docker/redis/redis.conf

#### GitHub Actions (2 files)
- .github/workflows/aws.yml
- .github/workflows/node.js.yml

#### Project Root (1 file)
- README.md

### Generated Files (2 files)
- auto-comment-script.js
- COMMENTING_GUIDE.md

## Commenting Progress
✅ Completed: 5 files
🔄 In Progress: 0 files
❌ Remaining: 152 files

## Priority Order for Commenting
1. **High Priority (Core Architecture)** - 40 files
   - Database models (6 files)
   - Core services (9 files)
   - API controllers (6 files)
   - Main routes (7 files)
   - Core application files (4 files)
   - Configuration files (6 files)

2. **Medium Priority (Business Logic)** - 45 files
   - Workers and background jobs (5 files)
   - Utility functions (7 files)
   - Middleware (5 files)
   - WebSocket handlers (3 files)
   - Frontend services (7 files)
   - Frontend components (9 files)
   - State management (6 files)
   - Hooks (7 files)

3. **Lower Priority (Supporting Files)** - 67 files
   - Test files (7 files)
   - Configuration files (12 files)
   - Documentation files (12 files)
   - Style files (5 files)
   - Type definitions (9 files)
   - Infrastructure files (5 files)
   - Static assets (5 files)
   - Build/deploy configs (12 files)
