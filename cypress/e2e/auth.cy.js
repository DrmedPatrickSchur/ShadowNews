/**
 * @fileoverview Authentication End-to-End Test Suite
 * 
 * Comprehensive E2E testing suite for ShadowNews authentication system,
 * covering user registration, login/logout flows, password management,
 * OAuth integration, session handling, and security features.
 * 
 * Key Test Areas:
 * - User registration with validation and unique email generation
 * - Login flows including magic links and OAuth providers
 * - Password reset and email verification workflows
 * - Two-factor authentication and security features
 * - Session management and token refresh handling
 * - Protected route access and redirect behavior
 * - Onboarding flow for new users
 * - Error handling and edge cases
 * 
 * Test Data Strategy:
 * - Dynamic user generation with timestamps for uniqueness
 * - Mocked API responses for consistent testing
 * - Fixture data for common test scenarios
 * - Environment-specific configuration handling
 * 
 * Dependencies:
 * - Cypress testing framework
 * - Custom commands for login/register operations
 * - Test fixtures for API response mocking
 * - Data attributes (data-cy) for element selection
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

describe('Authentication', () => {
  /**
   * Setup hook executed before each test case
   * Ensures clean state by navigating to home page
   */
  beforeEach(() => {
    cy.visit('/')
  })

  /**
   * Registration Flow Test Suite
   * 
   * Validates user registration functionality including form display,
   * input validation, successful registration with unique credentials,
   * and error handling for duplicate users.
   */
  describe('Registration Flow', () => {
    /**
     * Test: Registration form visibility and elements
     * Verifies that all required form elements are present and visible
     */
    it('should display registration form', () => {
      cy.get('[data-cy=register-link]').click()
      cy.url().should('include', '/register')
      cy.get('[data-cy=register-form]').should('be.visible')
      cy.get('[data-cy=email-input]').should('be.visible')
      cy.get('[data-cy=username-input]').should('be.visible')
      cy.get('[data-cy=password-input]').should('be.visible')
      cy.get('[data-cy=register-submit]').should('be.visible')
    })

    /**
     * Test: Input validation error handling
     * Validates client-side form validation for empty fields,
     * invalid email formats, and insufficient password strength
     */
    it('should show validation errors for invalid inputs', () => {
      cy.get('[data-cy=register-link]').click()
      
      // Submit empty form
      cy.get('[data-cy=register-submit]').click()
      cy.get('[data-cy=email-error]').should('contain', 'Email is required')
      cy.get('[data-cy=username-error]').should('contain', 'Username is required')
      cy.get('[data-cy=password-error]').should('contain', 'Password is required')
      
      // Invalid email
      cy.get('[data-cy=email-input]').type('invalid-email')
      cy.get('[data-cy=register-submit]').click()
      cy.get('[data-cy=email-error]').should('contain', 'Invalid email format')
      
      // Short password
      cy.get('[data-cy=email-input]').clear().type('test@example.com')
      cy.get('[data-cy=username-input]').type('testuser')
      cy.get('[data-cy=password-input]').type('123')
      cy.get('[data-cy=register-submit]').click()
      cy.get('[data-cy=password-error]').should('contain', 'Password must be at least 8 characters')
    })

    /**
     * Test: Successful user registration
     * Creates unique user credentials and validates successful registration
     * flow including redirect to onboarding and @shadownews.community email generation
     */
    it('should register new user successfully', () => {
      const uniqueEmail = `test${Date.now()}@example.com`
      const uniqueUsername = `testuser${Date.now()}`
      
      cy.get('[data-cy=register-link]').click()
      cy.get('[data-cy=email-input]').type(uniqueEmail)
      cy.get('[data-cy=username-input]').type(uniqueUsername)
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=register-submit]').click()
      
      // Should redirect to onboarding
      cy.url().should('include', '/onboarding')
      cy.get('[data-cy=welcome-message]').should('contain', uniqueUsername)
      cy.get('[data-cy=unique-email]').should('contain', `${uniqueUsername}@shadownews.community`)
    })

    /**
     * Test: Duplicate email validation
     * Verifies that registration fails appropriately when attempting
     * to register with an already existing email address
     */
    it('should show error for duplicate email', () => {
      cy.get('[data-cy=register-link]').click()
      cy.get('[data-cy=email-input]').type('existing@example.com')
      cy.get('[data-cy=username-input]').type('newuser')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=register-submit]').click()
      
      cy.get('[data-cy=register-error]').should('contain', 'Email already registered')
    })

    /**
     * Test: Duplicate username validation
     * Ensures that usernames are unique across the platform
     * and appropriate error messages are displayed
     */
    it('should show error for duplicate username', () => {
      cy.get('[data-cy=register-link]').click()
      cy.get('[data-cy=email-input]').type('new@example.com')
      cy.get('[data-cy=username-input]').type('existinguser')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=register-submit]').click()
      
      cy.get('[data-cy=register-error]').should('contain', 'Username already taken')
    })
  })

  /**
   * Login Flow Test Suite
   * 
   * Comprehensive testing of user authentication including standard
   * email/password login, magic link authentication, remember me
   * functionality, and error handling for invalid credentials.
   */
  describe('Login Flow', () => {
    /**
     * Test: Login form visibility and accessibility
     * Validates that all login form elements are properly displayed
     */
    it('should display login form', () => {
      cy.get('[data-cy=login-link]').click()
      cy.url().should('include', '/login')
      cy.get('[data-cy=login-form]').should('be.visible')
      cy.get('[data-cy=email-input]').should('be.visible')
      cy.get('[data-cy=password-input]').should('be.visible')
      cy.get('[data-cy=login-submit]').should('be.visible')
      cy.get('[data-cy=remember-me]').should('be.visible')
    })

    /**
     * Test: Successful login with valid credentials
     * Verifies authentication flow with correct email/password
     * and validates post-login UI state including user menu and karma display
     */
    it('should login with valid credentials', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=login-submit]').click()
      
      // Should redirect to home
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.get('[data-cy=karma-badge]').should('be.visible')
    })

    /**
     * Test: Invalid credentials error handling
     * Ensures appropriate error messages are displayed when
     * users attempt login with incorrect credentials
     */
    it('should show error for invalid credentials', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=email-input]').type('wrong@example.com')
      cy.get('[data-cy=password-input]').type('wrongpassword')
      cy.get('[data-cy=login-submit]').click()
      
      cy.get('[data-cy=login-error]').should('contain', 'Invalid email or password')
    })

    /**
     * Test: Remember me functionality
     * Validates persistent login state using localStorage tokens
     * and ensures session persists across browser sessions
     */
    it('should persist login with remember me', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=remember-me]').check()
      cy.get('[data-cy=login-submit]').click()
      
      // Check localStorage for token
      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.exist
        expect(win.localStorage.getItem('rememberMe')).to.equal('true')
      })
      
      // Reload page and check if still logged in
      cy.reload()
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

    /**
     * Test: Magic link authentication
     * Validates passwordless login flow using email magic links
     * including link generation and authentication completion
     */
    it('should login via email magic link', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=magic-link-tab]').click()
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=send-magic-link]').click()
      
      cy.get('[data-cy=magic-link-sent]').should('contain', 'Check your email')
      
      // Simulate clicking magic link
      cy.visit('/auth/magic-link?token=test-magic-token')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-cy=user-menu]').should('be.visible')
    })
  })

  /**
   * Logout Flow Test Suite
   * 
   * Tests user logout functionality including session cleanup,
   * UI state changes, and localStorage token removal.
   */
  describe('Logout Flow', () => {
    /**
     * Setup hook for logout tests
     * Ensures user is logged in before testing logout functionality
     */
    beforeEach(() => {
      // Login first
      cy.login('test@example.com', 'password123')
    })

    /**
     * Test: Complete logout process
     * Validates logout button functionality, session cleanup,
     * and proper UI state changes after logout
     */
    it('should logout successfully', () => {
      cy.get('[data-cy=user-menu]').click()
      cy.get('[data-cy=logout-button]').click()
      
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-cy=login-link]').should('be.visible')
      cy.get('[data-cy=user-menu]').should('not.exist')
      
      // Check localStorage cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.be.null
      })
    })
  })

  /**
   * Password Reset Flow Test Suite
   * 
   * Comprehensive testing of password recovery functionality including
   * reset email generation, token validation, and password update process.
   */
  describe('Password Reset Flow', () => {
    /**
     * Test: Password reset email generation
     * Validates forgot password form and successful email dispatch
     */
    it('should send password reset email', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=forgot-password]').click()
      cy.url().should('include', '/forgot-password')
      
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=reset-submit]').click()
      
      cy.get('[data-cy=reset-success]').should('contain', 'Password reset email sent')
    })

    /**
     * Test: Successful password reset
     * Validates password reset process with valid token
     * and confirms successful password update
     */
    it('should reset password with valid token', () => {
      cy.visit('/reset-password?token=valid-reset-token')
      
      cy.get('[data-cy=new-password-input]').type('newpassword123')
      cy.get('[data-cy=confirm-password-input]').type('newpassword123')
      cy.get('[data-cy=reset-password-submit]').click()
      
      cy.get('[data-cy=reset-complete]').should('contain', 'Password reset successful')
      cy.url().should('include', '/login')
    })

    /**
     * Test: Password confirmation validation
     * Ensures password and confirmation fields match
     * during the reset process
     */
    it('should show error for password mismatch', () => {
      cy.visit('/reset-password?token=valid-reset-token')
      
      cy.get('[data-cy=new-password-input]').type('newpassword123')
      cy.get('[data-cy=confirm-password-input]').type('differentpassword')
      cy.get('[data-cy=reset-password-submit]').click()
      
      cy.get('[data-cy=password-mismatch-error]').should('contain', 'Passwords do not match')
    })
  })

  /**
   * OAuth Integration Test Suite
   * 
   * Tests third-party authentication providers including Google and GitHub
   * OAuth flows, popup handling, and authentication completion.
   */
  describe('OAuth Integration', () => {
    /**
     * Test: OAuth provider availability
     * Verifies that OAuth login options are displayed correctly
     */
    it('should display OAuth options', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=google-oauth]').should('be.visible')
      cy.get('[data-cy=github-oauth]').should('be.visible')
    })

    /**
     * Test: Google OAuth flow initiation
     * Validates that Google OAuth popup window opens correctly
     * with proper authorization URL
     */
    it('should initiate Google OAuth flow', () => {
      cy.get('[data-cy=login-link]').click()
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen')
      })
      
      cy.get('[data-cy=google-oauth]').click()
      cy.get('@windowOpen').should('be.calledWithMatch', /google\.com/)
    })
  })

  /**
   * User Onboarding Flow Test Suite
   * 
   * Tests the new user onboarding process including interest selection,
   * privacy settings configuration, and tutorial completion.
   */
  describe('Onboarding Flow', () => {
    /**
     * Setup hook for onboarding tests
     * Registers a new user to test the onboarding flow
     */
    beforeEach(() => {
      // Register new user
      const uniqueEmail = `test${Date.now()}@example.com`
      const uniqueUsername = `testuser${Date.now()}`
      cy.register(uniqueEmail, uniqueUsername, 'password123')
    })

    /**
     * Test: Complete onboarding process
     * Validates all onboarding steps including interests, privacy settings,
     * and tutorial completion with proper navigation
     */
    it('should complete onboarding steps', () => {
      // Step 1: Select interests
      cy.get('[data-cy=interest-ai]').click()
      cy.get('[data-cy=interest-blockchain]').click()
      cy.get('[data-cy=interest-startups]').click()
      cy.get('[data-cy=next-step]').click()
      
      // Step 2: Privacy settings
      cy.get('[data-cy=email-visibility-contacts]').click()
      cy.get('[data-cy=repository-default-public]').click()
      cy.get('[data-cy=next-step]').click()
      
      // Step 3: Tutorial
      cy.get('[data-cy=tutorial-skip]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.get('[data-cy=welcome-banner]').should('be.visible')
    })
  })

  /**
   * Protected Routes Test Suite
   * 
   * Validates authentication requirements for protected pages and
   * proper redirect behavior for unauthenticated users.
   */
  describe('Protected Routes', () => {
    /**
     * Test: Unauthenticated access redirection
     * Ensures protected routes redirect to login page
     * with appropriate messaging
     */
    it('should redirect to login for protected routes', () => {
      cy.visit('/submit')
      cy.url().should('include', '/login')
      cy.get('[data-cy=redirect-message]').should('contain', 'Please login to continue')
      
      cy.visit('/repositories')
      cy.url().should('include', '/login')
      
      cy.visit('/settings')
      cy.url().should('include', '/login')
    })

    /**
     * Test: Post-authentication redirect
     * Validates that users are redirected to their originally
     * requested page after successful authentication
     */
    it('should redirect to original page after login', () => {
      cy.visit('/submit')
      cy.url().should('include', '/login')
      
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=login-submit]').click()
      
      cy.url().should('include', '/submit')
    })
  })

  /**
   * Session Management Test Suite
   * 
   * Tests advanced session handling including token refresh,
   * expiration handling, and automatic re-authentication.
   */
  describe('Session Management', () => {
    /**
     * Setup hook for session tests
     * Ensures user is authenticated before testing session features
     */
    beforeEach(() => {
      cy.login('test@example.com', 'password123')
    })

    /**
     * Test: Automatic token refresh
     * Validates that authentication tokens are refreshed
     * before expiration to maintain session continuity
     */
    it('should refresh token before expiry', () => {
      cy.intercept('POST', '/api/auth/refresh', { fixture: 'refreshToken.json' }).as('refreshToken')
      
      // Wait for token refresh (usually happens automatically)
      cy.wait(30000) // Wait 30 seconds
      cy.wait('@refreshToken')
      
      // Should still be logged in
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

    /**
     * Test: Expired session handling
     * Validates proper handling of expired authentication tokens
     * including logout and redirect to login page
     */
    it('should handle expired session', () => {
      // Simulate expired token
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'expired-token')
      })
      
      cy.reload()
      cy.get('[data-cy=session-expired]').should('contain', 'Session expired')
      cy.url().should('include', '/login')
    })
  })

  /**
   * Email Verification Test Suite
   * 
   * Tests email verification process including token validation,
   * verification completion, and resend functionality.
   */
  describe('Email Verification', () => {
    /**
     * Test: Successful email verification
     * Validates email verification with valid token
     * and proper redirect after verification
     */
    it('should verify email with valid token', () => {
      cy.visit('/verify-email?token=valid-verification-token')
      
      cy.get('[data-cy=verification-success]').should('contain', 'Email verified successfully')
      cy.get('[data-cy=continue-button]').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    /**
     * Test: Invalid verification token handling
     * Ensures proper error messaging and recovery options
     * for invalid or expired verification tokens
     */
    it('should show error for invalid token', () => {
      cy.visit('/verify-email?token=invalid-token')
      
      cy.get('[data-cy=verification-error]').should('contain', 'Invalid or expired verification token')
      cy.get('[data-cy=resend-button]').should('be.visible')
    })

    /**
     * Test: Verification email resend functionality
     * Validates the ability to resend verification emails
     * for users with failed or expired verification attempts
     */
    it('should resend verification email', () => {
      cy.visit('/verify-email?token=invalid-token')
      
      cy.get('[data-cy=resend-button]').click()
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=resend-submit]').click()
      
      cy.get('[data-cy=resend-success]').should('contain', 'Verification email sent')
    })
  })

  /**
   * Two-Factor Authentication Test Suite
   * 
   * Tests 2FA functionality including prompt display, code validation,
   * and security error handling for enhanced account protection.
   */
  describe('Two-Factor Authentication', () => {
    /**
     * Setup hook for 2FA tests
     * Logs in with a 2FA-enabled account to test authentication flow
     */
    beforeEach(() => {
      cy.login('2fa-user@example.com', 'password123')
    })

    /**
     * Test: 2FA prompt display
     * Validates that 2FA input prompt appears correctly
     * for users with 2FA enabled
     */
    it('should prompt for 2FA code', () => {
      cy.get('[data-cy=2fa-prompt]').should('be.visible')
      cy.get('[data-cy=2fa-code-input]').should('be.visible')
    })

    /**
     * Test: Successful 2FA completion
     * Validates successful login completion with valid 2FA code
     * and proper redirect to main application
     */
    it('should complete login with valid 2FA code', () => {
      cy.get('[data-cy=2fa-code-input]').type('123456')
      cy.get('[data-cy=2fa-submit]').click()
      
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

    /**
     * Test: Invalid 2FA code handling
     * Ensures proper error messaging for incorrect 2FA codes
     * and maintains security by preventing unauthorized access
     */
    it('should show error for invalid 2FA code', () => {
      cy.get('[data-cy=2fa-code-input]').type('000000')
      cy.get('[data-cy=2fa-submit]').click()
      
      cy.get('[data-cy=2fa-error]').should('contain', 'Invalid authentication code')
    })
  })
})