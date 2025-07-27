/**
 * @fileoverview Posts Feature End-to-End Test Suite
 * 
 * Comprehensive E2E testing suite for ShadowNews posts functionality,
 * covering post viewing, creation, voting, repository integration,
 * real-time updates, and mobile experience optimization.
 * 
 * Key Test Areas:
 * - Post viewing and navigation with metadata display
 * - Post creation via web interface and email formats
 * - Voting system with karma tracking and real-time updates
 * - Repository integration with email distribution and snowball effects
 * - Post details, editing, and deletion capabilities
 * - Real-time WebSocket updates for posts and votes
 * - Mobile responsiveness and gesture support
 * - Hashtag filtering and sorting functionality
 * 
 * ShadowNews-Specific Features:
 * - Email-based post creation with @shadownews.community addresses
 * - Repository attachment with email list distribution
 * - Snowball effect visualization for viral content spread
 * - AI-powered hashtag suggestions for content categorization
 * - Karma system integration with user reputation
 * 
 * Test Data Strategy:
 * - Database seeding for consistent test environment
 * - Dynamic post generation with timestamps
 * - Real-time simulation through background tasks
 * - Mobile viewport testing for responsive design
 * 
 * Dependencies:
 * - Cypress testing framework with custom commands
 * - Database seeding tasks for test data setup
 * - WebSocket testing for real-time functionality
 * - Mobile testing with gesture simulation
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

describe('Posts Feature', () => {
 /**
  * Global setup hook for posts testing
  * Seeds database with test data and navigates to homepage
  */
 beforeEach(() => {
   cy.task('db:seed')
   cy.visit('/')
 })

 /**
  * Post Viewing Test Suite
  * 
  * Tests post display, navigation, filtering, and sorting functionality
  * on the main posts feed with proper metadata rendering.
  */
 describe('Viewing Posts', () => {
   /**
    * Test: Homepage post display
    * Validates that posts are properly loaded and displayed on homepage
    */
   it('should display posts on homepage', () => {
     cy.get('[data-testid="post-list"]').should('exist')
     cy.get('[data-testid="post-card"]').should('have.length.at.least', 1)
   })

   /**
    * Test: Post metadata display validation
    * Ensures all required post information is visible including
    * title, author, karma, comments, hashtags, and repository badges
    */
   it('should display post metadata correctly', () => {
     cy.get('[data-testid="post-card"]').first().within(() => {
       cy.get('[data-testid="post-title"]').should('exist')
       cy.get('[data-testid="post-author"]').should('exist')
       cy.get('[data-testid="post-karma"]').should('exist')
       cy.get('[data-testid="post-comment-count"]').should('exist')
       cy.get('[data-testid="post-hashtags"]').should('exist')
       cy.get('[data-testid="post-repository-badge"]').should('exist')
     })
   })

   /**
    * Test: Post navigation functionality
    * Validates that clicking on posts navigates to detailed view
    * with proper URL structure and content display
    */
   it('should navigate to post detail on click', () => {
     cy.get('[data-testid="post-card"]').first().click()
     cy.url().should('match', /\/posts\/[a-zA-Z0-9]+/)
     cy.get('[data-testid="post-detail"]').should('exist')
   })

   /**
    * Test: Hashtag filtering functionality
    * Tests filtering posts by hashtags with proper URL updates
    * and validation that filtered results contain the selected hashtag
    */
   it('should filter posts by hashtag', () => {
     cy.get('[data-testid="hashtag-link"]').first().then(($tag) => {
       const tagText = $tag.text()
       cy.wrap($tag).click()
       cy.url().should('include', `/hashtag/${tagText.substring(1)}`)
       cy.get('[data-testid="post-card"]').each(($post) => {
         cy.wrap($post).find('[data-testid="post-hashtags"]').should('contain', tagText)
       })
     })
   })

   /**
    * Test: Post sorting functionality
    * Validates sorting options (new, top) with proper URL parameter updates
    * and corresponding changes in post order
    */
   it('should switch between post sorting options', () => {
     cy.get('[data-testid="sort-dropdown"]').click()
     cy.get('[data-testid="sort-option-new"]').click()
     cy.url().should('include', 'sort=new')
     
     cy.get('[data-testid="sort-dropdown"]').click()
     cy.get('[data-testid="sort-option-top"]').click()
     cy.url().should('include', 'sort=top')
   })

   /**
    * Test: Infinite scroll functionality
    * Tests automatic loading of additional posts when scrolling
    * to bottom of page for improved user experience
    */
   it('should load more posts on scroll', () => {
     cy.get('[data-testid="post-card"]').then(($posts) => {
       const initialCount = $posts.length
       cy.scrollTo('bottom')
       cy.wait(1000)
       cy.get('[data-testid="post-card"]').should('have.length.gt', initialCount)
     })
   })
 })

 /**
  * Post Creation Test Suite
  * 
  * Tests various methods of creating posts including web interface,
  * email format, repository attachment, and form validation.
  */
 describe('Creating Posts', () => {
   /**
    * Setup hook for post creation tests
    * Authenticates user before testing creation functionality
    */
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
   })

   /**
    * Test: Web interface post creation
    * Validates complete post creation flow with title, URL, text,
    * AI hashtag suggestions, and repository selection
    */
   it('should create post via web interface', () => {
     cy.get('[data-testid="create-post-button"]').click()
     cy.url().should('include', '/submit')
     
     const postTitle = `Test Post ${Date.now()}`
     cy.get('[data-testid="post-title-input"]').type(postTitle)
     cy.get('[data-testid="post-url-input"]').type('https://example.com/article')
     cy.get('[data-testid="post-text-input"]').type('This is a test post with some interesting content about technology and innovation.')
     
     cy.get('[data-testid="ai-hashtag-suggestions"]').should('exist')
     cy.get('[data-testid="suggested-hashtag"]').first().click()
     
     cy.get('[data-testid="repository-select"]').click()
     cy.get('[data-testid="repository-option"]').first().click()
     
     cy.get('[data-testid="submit-post-button"]').click()
     
     cy.url().should('match', /\/posts\/[a-zA-Z0-9]+/)
     cy.get('[data-testid="post-title"]').should('contain', postTitle)
   })

   /**
    * Test: Email format post creation
    * Tests ShadowNews email-based posting with @shadownews.community
    * addresses, email preview, and email sending functionality
    */
   it('should create post via email format', () => {
     cy.get('[data-testid="create-post-button"]').click()
     cy.get('[data-testid="email-format-toggle"]').click()
     
     const emailSubject = `Email Post ${Date.now()}`
     cy.get('[data-testid="email-to-field"]').should('have.value', 'testuser@shadownews.community')
     cy.get('[data-testid="email-subject-field"]').type(emailSubject)
     cy.get('[data-testid="email-body-field"]').type('Check out this amazing article: https://example.com/news\n\nThis demonstrates our email posting feature.')
     
     cy.get('[data-testid="email-preview-button"]').click()
     cy.get('[data-testid="email-preview-modal"]').should('exist')
     cy.get('[data-testid="close-preview"]').click()
     
     cy.get('[data-testid="send-email-post"]').click()
     cy.get('[data-testid="success-toast"]').should('contain', 'Post created successfully')
   })

   /**
    * Test: Repository attachment functionality
    * Validates attaching email repositories to posts with search
    * functionality and email count display
    */
   it('should attach repository to post', () => {
     cy.get('[data-testid="create-post-button"]').click()
     
     cy.get('[data-testid="post-title-input"]').type('Post with Repository')
     cy.get('[data-testid="post-text-input"]').type('Testing repository attachment')
     
     cy.get('[data-testid="attach-repository-button"]').click()
     cy.get('[data-testid="repository-search"]').type('AI Research')
     cy.get('[data-testid="repository-result"]').first().click()
     
     cy.get('[data-testid="attached-repository"]').should('contain', 'AI Research')
     cy.get('[data-testid="repository-email-count"]').should('exist')
     
     cy.get('[data-testid="submit-post-button"]').click()
     cy.get('[data-testid="post-repository-badge"]').should('contain', 'AI Research')
   })

   /**
    * Test: Form validation for required fields
    * Ensures proper error messages for missing title and content
    * with client-side validation feedback
    */
   it('should validate required fields', () => {
     cy.get('[data-testid="create-post-button"]').click()
     cy.get('[data-testid="submit-post-button"]').click()
     
     cy.get('[data-testid="title-error"]').should('contain', 'Title is required')
     cy.get('[data-testid="content-error"]').should('contain', 'Either URL or text is required')
   })
 })

 /**
  * Post Voting Test Suite
  * 
  * Tests voting functionality including upvotes, vote toggling,
  * and karma system integration with real-time updates.
  */
 describe('Voting on Posts', () => {
   /**
    * Setup hook for voting tests
    * Authenticates user before testing voting functionality
    */
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
   })

   /**
    * Test: Post upvoting functionality
    * Validates upvote button behavior with karma count updates
    * and visual feedback for active vote state
    */
   it('should upvote a post', () => {
     cy.get('[data-testid="post-card"]').first().within(() => {
       cy.get('[data-testid="post-karma"]').then(($karma) => {
         const initialKarma = parseInt($karma.text())
         cy.get('[data-testid="upvote-button"]').click()
         cy.get('[data-testid="post-karma"]').should('contain', initialKarma + 1)
         cy.get('[data-testid="upvote-button"]').should('have.class', 'active')
       })
     })
   })

   /**
    * Test: Vote toggling functionality
    * Tests ability to remove votes by clicking upvote button again
    * with proper visual state changes
    */
   it('should toggle vote on post', () => {
     cy.get('[data-testid="post-card"]').first().within(() => {
       cy.get('[data-testid="upvote-button"]').click()
       cy.get('[data-testid="upvote-button"]').should('have.class', 'active')
       cy.get('[data-testid="upvote-button"]').click()
       cy.get('[data-testid="upvote-button"]').should('not.have.class', 'active')
     })
   })

   /**
    * Test: User karma system integration
    * Validates that voting affects user's own karma score
    * with real-time karma updates in UI
    */
   it('should update user karma after voting', () => {
     cy.get('[data-testid="user-karma"]').then(($userKarma) => {
       const initialUserKarma = parseInt($userKarma.text())
       cy.get('[data-testid="post-card"]').first().find('[data-testid="upvote-button"]').click()
       cy.get('[data-testid="user-karma"]').should('contain', initialUserKarma + 1)
     })
   })
 })

 /**
  * Post Details Test Suite
  * 
  * Tests detailed post view including full content display,
  * email distribution statistics, and post management capabilities.
  */
 describe('Post Details', () => {
   /**
    * Setup hook for post detail tests
    * Authenticates user and navigates to first post detail page
    */
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
     cy.get('[data-testid="post-card"]').first().click()
   })

   /**
    * Test: Full post content display
    * Validates that post detail page shows complete content
    * including text, metadata, and repository information
    */
   it('should display full post content', () => {
     cy.get('[data-testid="post-detail"]').should('exist')
     cy.get('[data-testid="post-full-text"]').should('exist')
     cy.get('[data-testid="post-metadata"]').should('exist')
     cy.get('[data-testid="post-repository-info"]').should('exist')
   })

   /**
    * Test: Email distribution analytics
    * Validates display of email reach statistics, snowball multiplier,
    * and engagement rates for repository-distributed posts
    */
   it('should show email distribution stats', () => {
     cy.get('[data-testid="email-stats"]').within(() => {
       cy.get('[data-testid="emails-reached"]').should('exist')
       cy.get('[data-testid="snowball-multiplier"]').should('exist')
       cy.get('[data-testid="engagement-rate"]').should('exist')
     })
   })

   /**
    * Test: Post editing functionality
    * Tests ability for users to edit their own posts
    * with edit indicators and content updates
    */
   it('should allow editing own posts', () => {
     cy.createPost('My Editable Post', 'Original content')
     cy.visit(`/posts/${Cypress.env('lastPostId')}`)
     
     cy.get('[data-testid="edit-post-button"]').click()
     cy.get('[data-testid="post-text-input"]').clear().type('Updated content')
     cy.get('[data-testid="save-edit-button"]').click()
     
     cy.get('[data-testid="post-full-text"]').should('contain', 'Updated content')
     cy.get('[data-testid="edit-indicator"]').should('exist')
   })

   /**
    * Test: Post deletion functionality
    * Validates post deletion with confirmation modal
    * and proper cleanup and navigation
    */
   it('should delete own posts', () => {
     cy.createPost('Post to Delete', 'This will be deleted')
     cy.visit(`/posts/${Cypress.env('lastPostId')}`)
     
     cy.get('[data-testid="delete-post-button"]').click()
     cy.get('[data-testid="confirm-delete-modal"]').should('exist')
     cy.get('[data-testid="confirm-delete"]').click()
     
     cy.url().should('equal', Cypress.config().baseUrl + '/')
     cy.get('[data-testid="success-toast"]').should('contain', 'Post deleted')
   })
 })

 /**
  * Real-time Updates Test Suite
  * 
  * Tests WebSocket-powered real-time features including
  * live post updates and real-time vote count changes.
  */
 describe('Real-time Updates', () => {
   /**
    * Test: Live new post notifications
    * Validates real-time display of new posts via WebSocket
    * with notification system and dynamic content updates
    */
   it('should show new posts in real-time', () => {
     cy.visit('/')
     cy.get('[data-testid="post-card"]').then(($posts) => {
       const initialCount = $posts.length
       
       cy.task('createPost', {
         title: 'Real-time Test Post',
         author: 'anotheruser'
       })
       
       cy.get('[data-testid="new-posts-notification"]', { timeout: 10000 }).should('exist')
       cy.get('[data-testid="new-posts-notification"]').click()
       cy.get('[data-testid="post-card"]').should('have.length', initialCount + 1)
     })
   })

   /**
    * Test: Real-time vote count updates
    * Validates live karma updates when other users vote
    * through background task simulation
    */
   it('should update vote counts in real-time', () => {
     cy.get('[data-testid="post-card"]').first().within(() => {
       cy.get('[data-testid="post-karma"]').then(($karma) => {
         const initialKarma = parseInt($karma.text())
         
         cy.task('voteOnPost', {
           postId: cy.get('[data-testid="post-id"]').invoke('text'),
           userId: 'otheruserid'
         })
         
         cy.get('[data-testid="post-karma"]', { timeout: 5000 }).should('contain', initialKarma + 1)
       })
     })
   })
 })

 /**
  * Repository Integration Test Suite
  * 
  * Tests email repository features including badge display,
  * filtering, and snowball effect visualization.
  */
 describe('Repository Integration', () => {
   /**
    * Setup hook for repository integration tests
    * Authenticates user before testing repository features
    */
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
   })

   /**
    * Test: Repository email count badges
    * Validates display of email count badges on posts
    * with proper formatting and visibility
    */
   it('should show repository email count badge', () => {
     cy.get('[data-testid="post-card"]').each(($post) => {
       cy.wrap($post).find('[data-testid="post-repository-badge"]').then(($badge) => {
         if ($badge.length > 0) {
           cy.wrap($badge).should('match', /\d+\s+emails?/)
         }
       })
     })
   })

   /**
    * Test: Repository-based post filtering
    * Tests filtering posts by specific repository
    * with proper filter UI and result validation
    */
   it('should filter posts by repository', () => {
     cy.get('[data-testid="repository-filter"]').click()
     cy.get('[data-testid="repository-option"]').contains('AI Research').click()
     
     cy.get('[data-testid="post-card"]').each(($post) => {
       cy.wrap($post).find('[data-testid="post-repository-badge"]').should('contain', 'AI Research')
     })
   })

   /**
    * Test: Snowball effect visualization
    * Tests viral content spread visualization with
    * modal display, growth graphs, and timeline analytics
    */
   it('should show snowball effect visualization', () => {
     cy.get('[data-testid="post-card"]').first().find('[data-testid="snowball-indicator"]').click()
     cy.get('[data-testid="snowball-modal"]').should('exist')
     cy.get('[data-testid="snowball-graph"]').should('exist')
     cy.get('[data-testid="growth-timeline"]').should('exist')
   })
 })

 /**
  * Mobile Experience Test Suite
  * 
  * Tests mobile-specific functionality including responsive design,
  * touch gestures, and mobile-optimized interfaces.
  */
 describe('Mobile Experience', () => {
   /**
    * Setup hook for mobile testing
    * Sets mobile viewport and authenticates user
    */
   beforeEach(() => {
     cy.viewport('iphone-x')
     cy.login('testuser@shadownews.com', 'password123')
   })

   /**
    * Test: Mobile-optimized post cards
    * Validates responsive design with mobile-specific UI elements
    * including mobile vote buttons and swipe actions
    */
   it('should have mobile-optimized post cards', () => {
     cy.get('[data-testid="post-card"]').first().should('be.visible')
     cy.get('[data-testid="mobile-vote-buttons"]').should('exist')
     cy.get('[data-testid="swipe-actions"]').should('exist')
   })

   /**
    * Test: Touch gesture support
    * Tests swipe gestures for upvoting and saving posts
    * with visual feedback animations
    */
   it('should support swipe gestures', () => {
     cy.get('[data-testid="post-card"]').first().swipe('right')
     cy.get('[data-testid="upvote-animation"]').should('exist')
     
     cy.get('[data-testid="post-card"]').eq(1).swipe('left')
     cy.get('[data-testid="save-animation"]').should('exist')
   })

   /**
    * Test: Mobile post creation interface
    * Validates mobile-friendly post creation form
    * with voice input capabilities and mobile-optimized layout
    */
   it('should have mobile-friendly post creation', () => {
     cy.get('[data-testid="mobile-create-button"]').click()
     cy.get('[data-testid="mobile-post-form"]').should('exist')
     cy.get('[data-testid="voice-input-button"]').should('exist')
   })
 })
})