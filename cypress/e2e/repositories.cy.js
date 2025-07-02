describe('Email Repositories', () => {
  beforeEach(() => {
    cy.task('db:seed')
    cy.visit('/')
  })

  describe('Repository Creation', () => {
    beforeEach(() => {
      cy.login('testuser@shadownews.community', 'password123')
    })

    it('should create a new repository with CSV upload', () => {
      cy.visit('/repositories/new')
      
      cy.get('[data-cy=repository-name]').type('AI Healthcare Professionals')
      cy.get('[data-cy=repository-description]').type('A curated list of AI healthcare experts and researchers')
      cy.get('[data-cy=repository-hashtags]').type('#AIHealth #DigitalHealth #MedTech{enter}')
      
      cy.fixture('healthcare-emails.csv').then(fileContent => {
        cy.get('[data-cy=csv-upload]').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'healthcare-emails.csv',
          mimeType: 'text/csv'
        })
      })
      
      cy.get('[data-cy=csv-preview]').should('be.visible')
      cy.get('[data-cy=email-count]').should('contain', '247 emails detected')
      cy.get('[data-cy=valid-emails]').should('contain', '245 valid')
      cy.get('[data-cy=duplicate-emails]').should('contain', '2 duplicates')
      
      cy.get('[data-cy=privacy-settings]').click()
      cy.get('[data-cy=require-opt-in]').check()
      cy.get('[data-cy=auto-snowball]').check()
      cy.get('[data-cy=snowball-threshold]').clear().type('5')
      
      cy.get('[data-cy=create-repository]').click()
      
      cy.url().should('match', /\/repositories\/[a-z0-9-]+$/)
      cy.get('[data-cy=repository-title]').should('contain', 'AI Healthcare Professionals')
      cy.get('[data-cy=member-count]').should('contain', '245 members')
      cy.get('[data-cy=success-toast]').should('contain', 'Repository created successfully')
    })

    it('should validate CSV format and show errors', () => {
      cy.visit('/repositories/new')
      
      cy.get('[data-cy=repository-name]').type('Test Repository')
      
      cy.fixture('invalid-emails.csv').then(fileContent => {
        cy.get('[data-cy=csv-upload]').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'invalid-emails.csv',
          mimeType: 'text/csv'
        })
      })
      
      cy.get('[data-cy=csv-errors]').should('be.visible')
      cy.get('[data-cy=error-summary]').should('contain', '15 invalid email addresses')
      cy.get('[data-cy=error-details]').click()
      cy.get('[data-cy=invalid-email-list]').children().should('have.length', 15)
      cy.get('[data-cy=invalid-email-list]').first().should('contain', 'Row 3: invalid-email@')
      
      cy.get('[data-cy=fix-and-continue]').click()
      cy.get('[data-cy=email-editor]').should('be.visible')
      cy.get('[data-cy=create-repository]').should('be.disabled')
    })

    it('should merge existing repositories', () => {
      cy.createRepository('AI Research', 'ai-research-emails.csv')
      cy.createRepository('Machine Learning', 'ml-emails.csv')
      
      cy.visit('/repositories')
      cy.get('[data-cy=my-repositories]').click()
      
      cy.get('[data-cy=repository-card]').first().click()
      cy.get('[data-cy=repository-actions]').click()
      cy.get('[data-cy=merge-repository]').click()
      
      cy.get('[data-cy=merge-modal]').should('be.visible')
      cy.get('[data-cy=select-repository]').select('Machine Learning')
      cy.get('[data-cy=merge-preview]').should('contain', '1,247 unique emails after merge')
      cy.get('[data-cy=duplicate-count]').should('contain', '89 duplicates will be removed')
      
      cy.get('[data-cy=confirm-merge]').click()
      
      cy.get('[data-cy=member-count]').should('contain', '1,247 members')
      cy.get('[data-cy=merge-success]').should('contain', 'Repositories merged successfully')
    })
  })

  describe('Snowball Distribution', () => {
    beforeEach(() => {
      cy.login('poweruser@shadownews.community', 'password123')
      cy.createRepository('Blockchain Developers', 'blockchain-emails.csv')
    })

    it('should track snowball growth in real-time', () => {
      cy.visit('/repositories/blockchain-developers')
      
      cy.get('[data-cy=snowball-metrics]').should('be.visible')
      cy.get('[data-cy=original-size]').should('contain', '500')
      cy.get('[data-cy=current-size]').should('contain', '500')
      cy.get('[data-cy=growth-rate]').should('contain', '0%')
      
      // Simulate email forward triggering snowball
      cy.task('email:simulateForward', {
        repository: 'blockchain-developers',
        forwardedBy: 'member@example.com',
        newEmails: ['new1@example.com', 'new2@example.com', 'new3@example.com']
      })
      
      cy.get('[data-cy=snowball-notification]', { timeout: 10000 }).should('be.visible')
      cy.get('[data-cy=snowball-notification]').should('contain', '3 new members via snowball')
      
      cy.get('[data-cy=current-size]').should('contain', '503')
      cy.get('[data-cy=growth-rate]').should('contain', '0.6%')
      
      cy.get('[data-cy=snowball-visualization]').click()
      cy.get('[data-cy=snowball-graph]').should('be.visible')
      cy.get('[data-cy=node-count]').should('contain', '503 nodes')
    })

    it('should respect opt-out preferences', () => {
      cy.visit('/repositories/blockchain-developers')
      cy.get('[data-cy=repository-settings]').click()
      
      cy.get('[data-cy=manage-members]').click()
      cy.get('[data-cy=member-search]').type('optout@example.com')
      cy.get('[data-cy=member-row]').first().within(() => {
        cy.get('[data-cy=member-status]').should('contain', 'Active')
        cy.get('[data-cy=member-actions]').click()
        cy.get('[data-cy=set-opt-out]').click()
      })
      
      cy.get('[data-cy=confirm-opt-out]').click()
      
      cy.get('[data-cy=member-row]').first().within(() => {
        cy.get('[data-cy=member-status]').should('contain', 'Opted Out')
        cy.get('[data-cy=member-badge]').should('have.class', 'badge-inactive')
      })
      
      // Verify opted-out member doesn't receive emails
      cy.task('email:checkDigestList', 'blockchain-developers').then((recipients) => {
        expect(recipients).to.not.include('optout@example.com')
      })
    })

    it('should apply quality thresholds for auto-addition', () => {
      cy.visit('/repositories/blockchain-developers/settings')
      
      cy.get('[data-cy=snowball-settings]').click()
      cy.get('[data-cy=quality-threshold]').clear().type('10')
      cy.get('[data-cy=threshold-help]').should('contain', 'Email must be forwarded by at least 10 members')
      cy.get('[data-cy=save-settings]').click()
      
      // Simulate multiple forwards
      for (let i = 1; i <= 8; i++) {
        cy.task('email:simulateForward', {
          repository: 'blockchain-developers',
          forwardedBy: `member${i}@example.com`,
          newEmails: ['pending@example.com']
        })
      }
      
      cy.visit('/repositories/blockchain-developers')
      cy.get('[data-cy=pending-members]').click()
      cy.get('[data-cy=pending-list]').should('contain', 'pending@example.com')
      cy.get('[data-cy=forward-count]').should('contain', '8 forwards')
      cy.get('[data-cy=threshold-status]').should('contain', '2 more forwards needed')
      
      // Add two more forwards to meet threshold
      cy.task('email:simulateForward', {
        repository: 'blockchain-developers',
        forwardedBy: 'member9@example.com',
        newEmails: ['pending@example.com']
      })
      
      cy.task('email:simulateForward', {
        repository: 'blockchain-developers',
        forwardedBy: 'member10@example.com',
        newEmails: ['pending@example.com']
      })
      
      cy.get('[data-cy=auto-added-notification]').should('contain', 'pending@example.com automatically added')
      cy.get('[data-cy=current-size]').should('contain', '501')
    })
  })

  describe('Repository Management', () => {
    beforeEach(() => {
      cy.login('curator@shadownews.community', 'password123')
      cy.task('db:createRepositoryWithMembers', {
        name: 'Curated Tech News',
        owner: 'curator@shadownews.community',
        memberCount: 1500
      })
    })

    it('should export repository as CSV', () => {
      cy.visit('/repositories/curated-tech-news')
      
      cy.get('[data-cy=export-button]').click()
      cy.get('[data-cy=export-modal]').should('be.visible')
      
      cy.get('[data-cy=export-format]').select('CSV')
      cy.get('[data-cy=include-metadata]').check()
      cy.get('[data-cy=include-engagement]').check()
      cy.get('[data-cy=export-confirm]').click()
      
      cy.get('[data-cy=export-progress]').should('be.visible')
      cy.get('[data-cy=export-status]').should('contain', 'Preparing 1,500 emails')
      
      const downloadsFolder = Cypress.config('downloadsFolder')
      cy.readFile(`${downloadsFolder}/curated-tech-news-export.csv`, { timeout: 10000 })
        .should('exist')
        .then((content) => {
          const lines = content.split('\n')
          expect(lines[0]).to.include('email,name,added_date,engagement_score,opt_in_status')
          expect(lines.length).to.be.at.least(1501) // Header + 1500 members
        })
    })

    it('should send digest emails to repository members', () => {
      cy.visit('/repositories/curated-tech-news')
      cy.get('[data-cy=send-digest]').click()
      
      cy.get('[data-cy=digest-modal]').should('be.visible')
      cy.get('[data-cy=digest-subject]').type('Weekly Tech Digest - Top Stories')
      cy.get('[data-cy=digest-preview]').click()
      
      cy.get('[data-cy=preview-pane]').should('be.visible')
      cy.get('[data-cy=preview-content]').should('contain', 'Top posts from Curated Tech News')
      cy.get('[data-cy=post-count]').should('contain', '10 featured posts')
      
      cy.get('[data-cy=schedule-digest]').click()
      cy.get('[data-cy=send-time]').type('18:00')
      cy.get('[data-cy=timezone]').select('America/New_York')
      cy.get('[data-cy=recurring]').check()
      cy.get('[data-cy=frequency]').select('Weekly')
      cy.get('[data-cy=day-of-week]').select('Friday')
      
      cy.get('[data-cy=confirm-schedule]').click()
      
      cy.get('[data-cy=schedule-success]').should('contain', 'Digest scheduled successfully')
      cy.get('[data-cy=next-send]').should('contain', 'Next digest: Friday at 6:00 PM EST')
    })

    it('should manage repository collaborators', () => {
      cy.visit('/repositories/curated-tech-news/settings')
      
      cy.get('[data-cy=collaborators-tab]').click()
      cy.get('[data-cy=add-collaborator]').click()
      
      cy.get('[data-cy=collaborator-email]').type('newcollab@shadownews.community')
      cy.get('[data-cy=collaborator-role]').select('Moderator')
      cy.get('[data-cy=permissions-summary]').should('contain', 'Can manage members, send digests')
      
      cy.get('[data-cy=send-invitation]').click()
      
      cy.get('[data-cy=invitation-sent]').should('contain', 'Invitation sent to newcollab@shadownews.community')
      cy.get('[data-cy=pending-invitations]').should('contain', '1 pending')
      
      // Simulate accepting invitation
      cy.task('auth:acceptInvitation', {
        email: 'newcollab@shadownews.community',
        repository: 'curated-tech-news'
      })
      
      cy.reload()
      cy.get('[data-cy=collaborator-list]').within(() => {
        cy.get('[data-cy=collaborator-row]').should('have.length', 2)
        cy.get('[data-cy=collaborator-row]').last().should('contain', 'newcollab@shadownews.community')
        cy.get('[data-cy=collaborator-role]').last().should('contain', 'Moderator')
      })
    })
  })

  describe('Repository Analytics', () => {
    beforeEach(() => {
      cy.login('analyst@shadownews.community', 'password123')
      cy.task('db:createRepositoryWithActivity', {
        name: 'Data Science Hub',
        owner: 'analyst@shadownews.community',
        memberCount: 2500,
        activityDays: 30
      })
    })

    it('should display comprehensive analytics dashboard', () => {
      cy.visit('/repositories/data-science-hub/analytics')
      
      cy.get('[data-cy=analytics-overview]').should('be.visible')
      cy.get('[data-cy=total-members]').should('contain', '2,500')
      cy.get('[data-cy=growth-rate]').should('contain', '+12.5%')
      cy.get('[data-cy=engagement-rate]').should('contain', '34%')
      cy.get('[data-cy=snowball-multiplier]').should('contain', '3.2x')
      
      cy.get('[data-cy=growth-chart]').should('be.visible')
      cy.get('[data-cy=chart-period]').select('Last 30 days')
      cy.get('[data-cy=chart-metric]').select('Daily Growth')
      
      cy.get('[data-cy=top-contributors]').within(() => {
        cy.get('[data-cy=contributor-row]').should('have.length.at.least', 5)
        cy.get('[data-cy=contributor-row]').first().should('contain', 'Most forwards')
      })
      
      cy.get('[data-cy=engagement-heatmap]').should('be.visible')
      cy.get('[data-cy=heatmap-cell]').first().trigger('hover')
      cy.get('[data-cy=tooltip]').should('contain', 'emails sent')
    })

    it('should track email campaign performance', () => {
      cy.visit('/repositories/data-science-hub/analytics')
      cy.get('[data-cy=campaigns-tab]').click()
      
      cy.get('[data-cy=campaign-list]').within(() => {
        cy.get('[data-cy=campaign-row]').should('have.length.at.least', 3)
      })
      
      cy.get('[data-cy=campaign-row]').first().click()
      
      cy.get('[data-cy=campaign-details]').should('be.visible')
      cy.get('[data-cy=open-rate]').should('contain', '42%')
      cy.get('[data-cy=click-rate]').should('contain', '18%')
      cy.get('[data-cy=forward-rate]').should('contain', '8%')
      cy.get('[data-cy=new-members-from-campaign]').should('contain', '+47 members')
      
      cy.get('[data-cy=link-performance]').within(() => {
        cy.get('[data-cy=link-row]').should('have.length.at.least', 5)
        cy.get('[data-cy=link-row]').first().should('contain', 'clicks')
      })
    })
  })

  describe('Repository Discovery', () => {
    beforeEach(() => {
      cy.visit('/repositories')
    })

    it('should search and filter repositories', () => {
      cy.get('[data-cy=repository-search]').type('blockchain')
      cy.get('[data-cy=search-results]').should('be.visible')
      cy.get('[data-cy=result-count]').should('contain', 'repositories found')
      
      cy.get('[data-cy=filter-size]').click()
      cy.get('[data-cy=size-range]').select('1000+ members')
      
      cy.get('[data-cy=filter-growth]').click()
      cy.get('[data-cy=growth-rate]').select('Fast growing (10%+ monthly)')
      
      cy.get('[data-cy=filter-topic]').click()
      cy.get('[data-cy=topic-blockchain]').check()
      cy.get('[data-cy=topic-cryptocurrency]').check()
      
      cy.get('[data-cy=apply-filters]').click()
      
      cy.get('[data-cy=filtered-results]').within(() => {
        cy.get('[data-cy=repository-card]').each(($card) => {
          cy.wrap($card).should('contain.text', 'blockchain')
          cy.wrap($card).find('[data-cy=member-count]').invoke('text').then((text) => {
            const count = parseInt(text.replace(/[^0-9]/g, ''))
            expect(count).to.be.at.least(1000)
          })
        })
      })
    })

    it('should request access to private repositories', () => {
      cy.login('newuser@shadownews.community', 'password123')
      
      cy.get('[data-cy=repository-card]').contains('Private: AI Research Group').click()
      
      cy.get('[data-cy=private-repository-notice]').should('be.visible')
      cy.get('[data-cy=request-access]').click()
      
      cy.get('[data-cy=access-request-modal]').should('be.visible')
      cy.get('[data-cy=request-reason]').type('I am researching AI applications in healthcare and would love to connect with other researchers')
      cy.get('[data-cy=linkedin-profile]').type('https://linkedin.com/in/newuser')
      
      cy.get('[data-cy=submit-request]').click()
      
      cy.get('[data-cy=request-submitted]').should('contain', 'Access request sent')
      cy.get('[data-cy=request-status]').should('contain', 'Pending approval')
    })
  })

  describe('Email Integration', () => {
    beforeEach(() => {
      cy.login('emailuser@shadownews.community', 'password123')
      cy.createRepository('Email Testing', 'test-emails.csv')
    })

    it('should handle email bounces and update repository', () => {
      cy.task('email:simulateBounce', {
        repository: 'email-testing',
        bouncedEmails: [
          'invalid1@example.com',
          'invalid2@example.com',
          'noreply@company.com'
        ]
      })
      
      cy.visit('/repositories/email-testing')
      cy.get('[data-cy=health-indicator]').should('have.class', 'warning')
      cy.get('[data-cy=health-indicator]').click()
      
      cy.get('[data-cy=health-modal]').should('be.visible')
      cy.get('[data-cy=bounce-rate]').should('contain', '0.6%')
      cy.get('[data-cy=bounced-emails]').should('contain', '3 emails')
      
      cy.get('[data-cy=review-bounces]').click()
      cy.get('[data-cy=bounce-list]').within(() => {
        cy.get('[data-cy=bounce-row]').should('have.length', 3)
        cy.get('[data-cy=remove-all-bounced]').click()
      })
      
      cy.get('[data-cy=confirm-removal]').click()
      cy.get('[data-cy=removal-success]').should('contain', '3 invalid emails removed')
      cy.get('[data-cy=health-indicator]').should('have.class', 'healthy')
    })

    it('should process email commands', () => {
      // Simulate email command
      cy.task('email:sendCommand', {
        from: 'emailuser@shadownews.community',
        to: 'repository@shadownews.community',
        subject: 'ADD member@newcompany.com to Email Testing',
        body: 'Please add this new member to our repository'
      })
      
      cy.wait(2000) // Wait for email processing
      
      cy.visit('/repositories/email-testing')
      cy.get('[data-cy=recent-activity]').should('contain', 'member@newcompany.com added via email command')
      
      // Test REMOVE command
      cy.task('email:sendCommand', {
        from: 'emailuser@shadownews.community',
        to: 'repository@shadownews.community',
        subject: 'REMOVE spam@example.com from Email Testing',
        body: 'This email has been sending spam'
      })
      
      cy.wait(2000)
      cy.reload()
      
      cy.get('[data-cy=recent-activity]').should('contain', 'spam@example.com removed via email command')
      
      // Test STATS command
      cy.task('email:getLastEmail', 'emailuser@shadownews.community').then((email) => {
        expect(email.subject).to.contain('Email Testing Repository Stats')
        expect(email.body).to.contain('Total members:')
        expect(email.body).to.contain('Growth rate:')
        expect(email.body).to.contain('Engagement rate:')
      })
    })
  })
})