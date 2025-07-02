describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Registration Flow', () => {
    it('should display registration form', () => {
      cy.get('[data-cy=register-link]').click()
      cy.url().should('include', '/register')
      cy.get('[data-cy=register-form]').should('be.visible')
      cy.get('[data-cy=email-input]').should('be.visible')
      cy.get('[data-cy=username-input]').should('be.visible')
      cy.get('[data-cy=password-input]').should('be.visible')
      cy.get('[data-cy=register-submit]').should('be.visible')
    })

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

    it('should show error for duplicate email', () => {
      cy.get('[data-cy=register-link]').click()
      cy.get('[data-cy=email-input]').type('existing@example.com')
      cy.get('[data-cy=username-input]').type('newuser')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=register-submit]').click()
      
      cy.get('[data-cy=register-error]').should('contain', 'Email already registered')
    })

    it('should show error for duplicate username', () => {
      cy.get('[data-cy=register-link]').click()
      cy.get('[data-cy=email-input]').type('new@example.com')
      cy.get('[data-cy=username-input]').type('existinguser')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=register-submit]').click()
      
      cy.get('[data-cy=register-error]').should('contain', 'Username already taken')
    })
  })

  describe('Login Flow', () => {
    it('should display login form', () => {
      cy.get('[data-cy=login-link]').click()
      cy.url().should('include', '/login')
      cy.get('[data-cy=login-form]').should('be.visible')
      cy.get('[data-cy=email-input]').should('be.visible')
      cy.get('[data-cy=password-input]').should('be.visible')
      cy.get('[data-cy=login-submit]').should('be.visible')
      cy.get('[data-cy=remember-me]').should('be.visible')
    })

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

    it('should show error for invalid credentials', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=email-input]').type('wrong@example.com')
      cy.get('[data-cy=password-input]').type('wrongpassword')
      cy.get('[data-cy=login-submit]').click()
      
      cy.get('[data-cy=login-error]').should('contain', 'Invalid email or password')
    })

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

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Login first
      cy.login('test@example.com', 'password123')
    })

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

  describe('Password Reset Flow', () => {
    it('should send password reset email', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=forgot-password]').click()
      cy.url().should('include', '/forgot-password')
      
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=reset-submit]').click()
      
      cy.get('[data-cy=reset-success]').should('contain', 'Password reset email sent')
    })

    it('should reset password with valid token', () => {
      cy.visit('/reset-password?token=valid-reset-token')
      
      cy.get('[data-cy=new-password-input]').type('newpassword123')
      cy.get('[data-cy=confirm-password-input]').type('newpassword123')
      cy.get('[data-cy=reset-password-submit]').click()
      
      cy.get('[data-cy=reset-complete]').should('contain', 'Password reset successful')
      cy.url().should('include', '/login')
    })

    it('should show error for password mismatch', () => {
      cy.visit('/reset-password?token=valid-reset-token')
      
      cy.get('[data-cy=new-password-input]').type('newpassword123')
      cy.get('[data-cy=confirm-password-input]').type('differentpassword')
      cy.get('[data-cy=reset-password-submit]').click()
      
      cy.get('[data-cy=password-mismatch-error]').should('contain', 'Passwords do not match')
    })
  })

  describe('OAuth Integration', () => {
    it('should display OAuth options', () => {
      cy.get('[data-cy=login-link]').click()
      cy.get('[data-cy=google-oauth]').should('be.visible')
      cy.get('[data-cy=github-oauth]').should('be.visible')
    })

    it('should initiate Google OAuth flow', () => {
      cy.get('[data-cy=login-link]').click()
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen')
      })
      
      cy.get('[data-cy=google-oauth]').click()
      cy.get('@windowOpen').should('be.calledWithMatch', /google\.com/)
    })
  })

  describe('Onboarding Flow', () => {
    beforeEach(() => {
      // Register new user
      const uniqueEmail = `test${Date.now()}@example.com`
      const uniqueUsername = `testuser${Date.now()}`
      cy.register(uniqueEmail, uniqueUsername, 'password123')
    })

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

  describe('Protected Routes', () => {
    it('should redirect to login for protected routes', () => {
      cy.visit('/submit')
      cy.url().should('include', '/login')
      cy.get('[data-cy=redirect-message]').should('contain', 'Please login to continue')
      
      cy.visit('/repositories')
      cy.url().should('include', '/login')
      
      cy.visit('/settings')
      cy.url().should('include', '/login')
    })

    it('should redirect to original page after login', () => {
      cy.visit('/submit')
      cy.url().should('include', '/login')
      
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=login-submit]').click()
      
      cy.url().should('include', '/submit')
    })
  })

  describe('Session Management', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123')
    })

    it('should refresh token before expiry', () => {
      cy.intercept('POST', '/api/auth/refresh', { fixture: 'refreshToken.json' }).as('refreshToken')
      
      // Wait for token refresh (usually happens automatically)
      cy.wait(30000) // Wait 30 seconds
      cy.wait('@refreshToken')
      
      // Should still be logged in
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

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

  describe('Email Verification', () => {
    it('should verify email with valid token', () => {
      cy.visit('/verify-email?token=valid-verification-token')
      
      cy.get('[data-cy=verification-success]').should('contain', 'Email verified successfully')
      cy.get('[data-cy=continue-button]').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    it('should show error for invalid token', () => {
      cy.visit('/verify-email?token=invalid-token')
      
      cy.get('[data-cy=verification-error]').should('contain', 'Invalid or expired verification token')
      cy.get('[data-cy=resend-button]').should('be.visible')
    })

    it('should resend verification email', () => {
      cy.visit('/verify-email?token=invalid-token')
      
      cy.get('[data-cy=resend-button]').click()
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=resend-submit]').click()
      
      cy.get('[data-cy=resend-success]').should('contain', 'Verification email sent')
    })
  })

  describe('Two-Factor Authentication', () => {
    beforeEach(() => {
      cy.login('2fa-user@example.com', 'password123')
    })

    it('should prompt for 2FA code', () => {
      cy.get('[data-cy=2fa-prompt]').should('be.visible')
      cy.get('[data-cy=2fa-code-input]').should('be.visible')
    })

    it('should complete login with valid 2FA code', () => {
      cy.get('[data-cy=2fa-code-input]').type('123456')
      cy.get('[data-cy=2fa-submit]').click()
      
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

    it('should show error for invalid 2FA code', () => {
      cy.get('[data-cy=2fa-code-input]').type('000000')
      cy.get('[data-cy=2fa-submit]').click()
      
      cy.get('[data-cy=2fa-error]').should('contain', 'Invalid authentication code')
    })
  })
})