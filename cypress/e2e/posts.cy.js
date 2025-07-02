describe('Posts Feature', () => {
 beforeEach(() => {
   cy.task('db:seed')
   cy.visit('/')
 })

 describe('Viewing Posts', () => {
   it('should display posts on homepage', () => {
     cy.get('[data-testid="post-list"]').should('exist')
     cy.get('[data-testid="post-card"]').should('have.length.at.least', 1)
   })

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

   it('should navigate to post detail on click', () => {
     cy.get('[data-testid="post-card"]').first().click()
     cy.url().should('match', /\/posts\/[a-zA-Z0-9]+/)
     cy.get('[data-testid="post-detail"]').should('exist')
   })

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

   it('should switch between post sorting options', () => {
     cy.get('[data-testid="sort-dropdown"]').click()
     cy.get('[data-testid="sort-option-new"]').click()
     cy.url().should('include', 'sort=new')
     
     cy.get('[data-testid="sort-dropdown"]').click()
     cy.get('[data-testid="sort-option-top"]').click()
     cy.url().should('include', 'sort=top')
   })

   it('should load more posts on scroll', () => {
     cy.get('[data-testid="post-card"]').then(($posts) => {
       const initialCount = $posts.length
       cy.scrollTo('bottom')
       cy.wait(1000)
       cy.get('[data-testid="post-card"]').should('have.length.gt', initialCount)
     })
   })
 })

 describe('Creating Posts', () => {
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
   })

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

   it('should validate required fields', () => {
     cy.get('[data-testid="create-post-button"]').click()
     cy.get('[data-testid="submit-post-button"]').click()
     
     cy.get('[data-testid="title-error"]').should('contain', 'Title is required')
     cy.get('[data-testid="content-error"]').should('contain', 'Either URL or text is required')
   })
 })

 describe('Voting on Posts', () => {
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
   })

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

   it('should toggle vote on post', () => {
     cy.get('[data-testid="post-card"]').first().within(() => {
       cy.get('[data-testid="upvote-button"]').click()
       cy.get('[data-testid="upvote-button"]').should('have.class', 'active')
       cy.get('[data-testid="upvote-button"]').click()
       cy.get('[data-testid="upvote-button"]').should('not.have.class', 'active')
     })
   })

   it('should update user karma after voting', () => {
     cy.get('[data-testid="user-karma"]').then(($userKarma) => {
       const initialUserKarma = parseInt($userKarma.text())
       cy.get('[data-testid="post-card"]').first().find('[data-testid="upvote-button"]').click()
       cy.get('[data-testid="user-karma"]').should('contain', initialUserKarma + 1)
     })
   })
 })

 describe('Post Details', () => {
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
     cy.get('[data-testid="post-card"]').first().click()
   })

   it('should display full post content', () => {
     cy.get('[data-testid="post-detail"]').should('exist')
     cy.get('[data-testid="post-full-text"]').should('exist')
     cy.get('[data-testid="post-metadata"]').should('exist')
     cy.get('[data-testid="post-repository-info"]').should('exist')
   })

   it('should show email distribution stats', () => {
     cy.get('[data-testid="email-stats"]').within(() => {
       cy.get('[data-testid="emails-reached"]').should('exist')
       cy.get('[data-testid="snowball-multiplier"]').should('exist')
       cy.get('[data-testid="engagement-rate"]').should('exist')
     })
   })

   it('should allow editing own posts', () => {
     cy.createPost('My Editable Post', 'Original content')
     cy.visit(`/posts/${Cypress.env('lastPostId')}`)
     
     cy.get('[data-testid="edit-post-button"]').click()
     cy.get('[data-testid="post-text-input"]').clear().type('Updated content')
     cy.get('[data-testid="save-edit-button"]').click()
     
     cy.get('[data-testid="post-full-text"]').should('contain', 'Updated content')
     cy.get('[data-testid="edit-indicator"]').should('exist')
   })

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

 describe('Real-time Updates', () => {
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

 describe('Repository Integration', () => {
   beforeEach(() => {
     cy.login('testuser@shadownews.com', 'password123')
   })

   it('should show repository email count badge', () => {
     cy.get('[data-testid="post-card"]').each(($post) => {
       cy.wrap($post).find('[data-testid="post-repository-badge"]').then(($badge) => {
         if ($badge.length > 0) {
           cy.wrap($badge).should('match', /\d+\s+emails?/)
         }
       })
     })
   })

   it('should filter posts by repository', () => {
     cy.get('[data-testid="repository-filter"]').click()
     cy.get('[data-testid="repository-option"]').contains('AI Research').click()
     
     cy.get('[data-testid="post-card"]').each(($post) => {
       cy.wrap($post).find('[data-testid="post-repository-badge"]').should('contain', 'AI Research')
     })
   })

   it('should show snowball effect visualization', () => {
     cy.get('[data-testid="post-card"]').first().find('[data-testid="snowball-indicator"]').click()
     cy.get('[data-testid="snowball-modal"]').should('exist')
     cy.get('[data-testid="snowball-graph"]').should('exist')
     cy.get('[data-testid="growth-timeline"]').should('exist')
   })
 })

 describe('Mobile Experience', () => {
   beforeEach(() => {
     cy.viewport('iphone-x')
     cy.login('testuser@shadownews.com', 'password123')
   })

   it('should have mobile-optimized post cards', () => {
     cy.get('[data-testid="post-card"]').first().should('be.visible')
     cy.get('[data-testid="mobile-vote-buttons"]').should('exist')
     cy.get('[data-testid="swipe-actions"]').should('exist')
   })

   it('should support swipe gestures', () => {
     cy.get('[data-testid="post-card"]').first().swipe('right')
     cy.get('[data-testid="upvote-animation"]').should('exist')
     
     cy.get('[data-testid="post-card"]').eq(1).swipe('left')
     cy.get('[data-testid="save-animation"]').should('exist')
   })

   it('should have mobile-friendly post creation', () => {
     cy.get('[data-testid="mobile-create-button"]').click()
     cy.get('[data-testid="mobile-post-form"]').should('exist')
     cy.get('[data-testid="voice-input-button"]').should('exist')
   })
 })
})