const { format } = require('date-fns');

const emailTemplates = {
 // Welcome email when user joins
 welcome: (user) => ({
   subject: '🚀 Welcome to Shadownews - Your unique email is ready!',
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: #000; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
           .button { display: inline-block; padding: 12px 30px; background: #ff6600; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
           .feature { background: #fff; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff6600; }
           .email-box { background: #fff; padding: 20px; border: 2px dashed #ff6600; border-radius: 5px; margin: 20px 0; text-align: center; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>Welcome to Shadownews!</h1>
             <p>Where Ideas Snowball Into Communities</p>
           </div>
           <div class="content">
             <h2>Hi ${user.username}! 👋</h2>
             <p>Your account is ready and you're all set to start building your topic communities.</p>
             
             <div class="email-box">
               <h3>Your Unique Posting Email:</h3>
               <code style="font-size: 18px; color: #ff6600;">${user.username}@shadownews.community</code>
               <p style="margin-top: 10px; font-size: 14px;">Send emails here to create posts instantly!</p>
             </div>

             <h3>🎯 Quick Start Guide:</h3>
             <div class="feature">
               <strong>1. Post via Email:</strong> Send to ${user.username}@shadownews.community
             </div>
             <div class="feature">
               <strong>2. Create a Repository:</strong> Upload a CSV with emails to build your community
             </div>
             <div class="feature">
               <strong>3. Watch it Snowball:</strong> Your community grows as members share with their networks
             </div>

             <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>

             <p><strong>Pro tip:</strong> Your first post earns you 50 karma points! 🎉</p>
           </div>
           <div class="footer">
             <p>Questions? Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/help">help center</a></p>
             <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Manage email preferences</a> | <a href="${process.env.FRONTEND_URL}/privacy">Privacy Policy</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
Welcome to Shadownews, ${user.username}!

Your unique posting email: ${user.username}@shadownews.community

Quick Start:
1. Send emails to ${user.username}@shadownews.community to create posts
2. Upload a CSV to create your first repository
3. Watch your community grow through snowball distribution

Go to your dashboard: ${process.env.FRONTEND_URL}/dashboard

Questions? Reply to this email.
   `
 }),

 // Daily digest email
 dailyDigest: (user, posts, stats) => ({
   subject: `🌟 Your ${format(new Date(), 'EEEE')} Shadownews digest: ${posts.length} must-read posts`,
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .stats { display: flex; justify-content: space-around; margin: 20px 0; }
           .stat { text-align: center; }
           .stat-number { font-size: 24px; font-weight: bold; }
           .post { background: #fff; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
           .post-title { color: #000; text-decoration: none; font-size: 18px; font-weight: 600; }
           .post-meta { color: #666; font-size: 14px; margin: 10px 0; }
           .hashtag { background: #e2e8f0; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
           .repository-badge { background: #ff6600; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; }
           .action-buttons { margin: 15px 0; }
           .button { display: inline-block; padding: 8px 16px; margin-right: 10px; text-decoration: none; border-radius: 4px; font-size: 14px; }
           .button-primary { background: #ff6600; color: #fff; }
           .button-secondary { background: #e2e8f0; color: #333; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; margin-top: 40px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>Your Daily Shadownews Digest</h1>
             <p>${format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
           </div>
           
           <div class="stats">
             <div class="stat">
               <div class="stat-number">${stats.totalPosts}</div>
               <div>New Posts</div>
             </div>
             <div class="stat">
               <div class="stat-number">${stats.activeDiscussions}</div>
               <div>Active Discussions</div>
             </div>
             <div class="stat">
               <div class="stat-number">+${stats.karmaGained}</div>
               <div>Karma Today</div>
             </div>
           </div>

           <h2>📈 Trending in Your Topics</h2>
           ${posts.map(post => `
             <div class="post">
               <a href="${process.env.FRONTEND_URL}/post/${post._id}" class="post-title">${post.title}</a>
               <div class="post-meta">
                 ${post.points} points • ${post.commentCount} comments • by ${post.author.username}
                 ${post.repository ? `<span class="repository-badge">📧 ${post.repository.emailCount} emails</span>` : ''}
               </div>
               <div>
                 ${post.hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join('')}
               </div>
               <div class="action-buttons">
                 <a href="${process.env.FRONTEND_URL}/post/${post._id}" class="button button-primary">Read & Discuss</a>
                 <a href="mailto:${user.username}@shadownews.community?subject=Re: ${encodeURIComponent(post.title)}" class="button button-secondary">Reply via Email</a>
               </div>
             </div>
           `).join('')}

           <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL}" class="button button-primary">View All Posts</a>
           </div>

           <div class="footer">
             <p>💡 Tip: Reply to any digest email to comment on the top post!</p>
             <p><a href="${process.env.FRONTEND_URL}/settings/digest">Customize digest</a> | <a href="%unsubscribe_url%">Unsubscribe</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: posts.map(post => `
${post.title}
${post.points} points • ${post.commentCount} comments • by ${post.author.username}
${post.hashtags.map(tag => `#${tag}`).join(' ')}
Read more: ${process.env.FRONTEND_URL}/post/${post._id}

`).join('\n---\n')
 }),

 // Repository invitation email
 repositoryInvite: (inviter, repository, recipientEmail) => ({
   subject: `🌐 You're invited to join "${repository.name}" community on Shadownews`,
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: #1a1a1a; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
           .repo-box { background: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
           .member-count { font-size: 36px; font-weight: bold; color: #ff6600; }
           .button { display: inline-block; padding: 14px 35px; background: #ff6600; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
           .benefits { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
           .benefit-item { padding: 10px 0; border-bottom: 1px solid #eee; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>Join a Growing Community</h1>
             <p>You've been invited to an exclusive topic repository</p>
           </div>
           <div class="content">
             <p>Hi there! 👋</p>
             <p><strong>${inviter.username}</strong> thinks you'd be interested in joining the <strong>"${repository.name}"</strong> community on Shadownews.</p>
             
             <div class="repo-box">
               <h2>${repository.name}</h2>
               <p>${repository.description}</p>
               <div class="member-count">${repository.emailCount}</div>
               <div>Community Members</div>
               <p style="margin-top: 15px; color: #666;">Growing ${repository.growthRate}% weekly through snowball distribution</p>
             </div>

             <div class="benefits">
               <h3>🎯 What You'll Get:</h3>
               <div class="benefit-item">📬 Curated ${repository.digestFrequency} digest of top discussions</div>
               <div class="benefit-item">🚀 Early access to insights from ${repository.emailCount} professionals</div>
               <div class="benefit-item">🌐 Ability to share your own curated lists (CSV) to grow the community</div>
               <div class="benefit-item">💬 Direct email posting to ${repository.name}@shadownews.community</div>
             </div>

             <div style="text-align: center;">
               <a href="${process.env.FRONTEND_URL}/repository/join/${repository._id}?token=${repository.inviteToken}&email=${encodeURIComponent(recipientEmail)}" class="button">Accept Invitation</a>
               <p style="font-size: 14px; color: #666;">This invitation expires in 7 days</p>
             </div>

             <p><strong>About Shadownews:</strong> A next-generation discussion platform where communities grow organically through snowball distribution. Each member can contribute their network, creating exponential growth for quality topic-based communities.</p>
           </div>
           <div class="footer">
             <p>This invitation was sent by ${inviter.username} via Shadownews</p>
             <p><a href="${process.env.FRONTEND_URL}/privacy">Privacy Policy</a> | <a href="${process.env.FRONTEND_URL}/about">Learn More</a></p>
             <p style="font-size: 12px;">If you don't want to receive repository invitations, <a href="${process.env.FRONTEND_URL}/unsubscribe/invites?email=${encodeURIComponent(recipientEmail)}">click here</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
You're invited to join "${repository.name}" on Shadownews!

${inviter.username} thinks you'd be interested in this community.

Repository: ${repository.name}
Members: ${repository.emailCount} and growing ${repository.growthRate}% weekly
Description: ${repository.description}

What you'll get:
- Curated ${repository.digestFrequency} digest
- Access to insights from ${repository.emailCount} professionals  
- Ability to grow the community with your network
- Direct email posting privileges

Accept invitation: ${process.env.FRONTEND_URL}/repository/join/${repository._id}?token=${repository.inviteToken}

This invitation expires in 7 days.
   `
 }),

 // Post notification email
 postReply: (user, post, comment) => ({
   subject: `💬 New reply to your post: "${post.title}"`,
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: #f3f4f6; padding: 20px; border-radius: 10px 10px 0 0; }
           .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
           .comment-box { background: #f9fafb; padding: 20px; border-left: 4px solid #ff6600; margin: 20px 0; border-radius: 4px; }
           .button { display: inline-block; padding: 10px 20px; background: #ff6600; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 0; }
           .quick-reply { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h2>New reply to your post</h2>
             <p style="color: #666; margin: 0;">${post.title}</p>
           </div>
           <div class="content">
             <div class="comment-box">
               <p><strong>${comment.author.username}</strong> replied:</p>
               <p>${comment.content}</p>
               <p style="font-size: 14px; color: #666; margin-top: 10px;">${format(new Date(comment.createdAt), 'MMM d, h:mm a')}</p>
             </div>

             <div style="text-align: center;">
               <a href="${process.env.FRONTEND_URL}/post/${post._id}#comment-${comment._id}" class="button">View Full Discussion</a>
             </div>

             <div class="quick-reply">
               <p><strong>Quick Reply:</strong></p>
               <p style="font-size: 14px; color: #666;">Reply to this email to respond directly to ${comment.author.username}'s comment.</p>
             </div>

             <p style="font-size: 14px; color: #666;">Your post has ${post.commentCount} total comments and ${post.points} points.</p>
           </div>
           <div class="footer">
             <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Notification settings</a> | <a href="%unsubscribe_url%">Unsubscribe from post replies</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
New reply to your post "${post.title}"

${comment.author.username} wrote:
${comment.content}

View full discussion: ${process.env.FRONTEND_URL}/post/${post._id}#comment-${comment._id}

Quick reply: Reply to this email to respond.

Your post has ${post.commentCount} comments and ${post.points} points.
   `
 }),

 // Karma milestone email
 karmaMilestone: (user, milestone) => ({
   subject: `🏆 Congratulations! You've reached ${milestone.points} karma on Shadownews`,
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
           .trophy { font-size: 72px; margin: 20px 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
           .achievement { background: #fff; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
           .unlock { background: #10b981; color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; }
           .stats { display: flex; justify-content: space-around; margin: 30px 0; }
           .stat-box { text-align: center; }
           .stat-number { font-size: 28px; font-weight: bold; color: #ff6600; }
           .button { display: inline-block; padding: 12px 30px; background: #ff6600; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <div class="trophy">🏆</div>
             <h1>${milestone.points} Karma Milestone!</h1>
             <p>You're now in the top ${milestone.percentile}% of Shadownews contributors</p>
           </div>
           <div class="content">
             <h2>Congratulations, ${user.username}! 🎉</h2>
             
             <div class="unlock">
               <h3>🔓 New Privileges Unlocked:</h3>
               <ul style="margin: 10px 0; padding-left: 20px;">
                 ${milestone.unlocks.map(unlock => `<li>${unlock}</li>`).join('')}
               </ul>
             </div>

             <div class="stats">
               <div class="stat-box">
                 <div class="stat-number">${user.stats.posts}</div>
                 <div>Posts Created</div>
               </div>
               <div class="stat-box">
                 <div class="stat-number">${user.stats.comments}</div>
                 <div>Comments Made</div>
               </div>
               <div class="stat-box">
                 <div class="stat-number">${user.stats.repositories}</div>
                 <div>Repositories Built</div>
               </div>
             </div>

             <div class="achievement">
               <h3>🎯 Your Journey So Far:</h3>
               <p>You've contributed ${user.stats.totalContributions} times to the community, helped grow ${user.stats.emailsAdded} email connections, and your content has been upvoted ${user.stats.upvotesReceived} times!</p>
             </div>

             <div style="text-align: center;">
               <a href="${process.env.FRONTEND_URL}/profile/${user.username}" class="button">View Your Profile</a>
             </div>

             <p style="text-align: center; margin-top: 30px; color: #666;">
               Next milestone: <strong>${milestone.next} karma</strong> 🚀
             </p>
           </div>
           <div class="footer">
             <p>Keep contributing quality content to earn more karma!</p>
             <p><a href="${process.env.FRONTEND_URL}/karma">Learn about karma</a> | <a href="${process.env.FRONTEND_URL}/leaderboard">View leaderboard</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
🏆 Congratulations! You've reached ${milestone.points} karma!

You're now in the top ${milestone.percentile}% of contributors.

New privileges unlocked:
${milestone.unlocks.map(unlock => `- ${unlock}`).join('\n')}

Your stats:
- Posts: ${user.stats.posts}
- Comments: ${user.stats.comments}
- Repositories: ${user.stats.repositories}

Next milestone: ${milestone.next} karma

View your profile: ${process.env.FRONTEND_URL}/profile/${user.username}
   `
 }),

 // Repository growth notification
 repositoryGrowth: (user, repository, stats) => ({
   subject: `📈 Your repository "${repository.name}" grew ${stats.growthPercent}% this week!`,
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: #1a1a1a; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
           .growth-box { background: #10b981; color: #fff; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; }
           .growth-number { font-size: 48px; font-weight: bold; }
           .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
           .stat-card { background: #fff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
           .contributors { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
           .contributor { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
           .button { display: inline-block; padding: 12px 30px; background: #ff6600; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>Weekly Repository Report</h1>
             <p>${repository.name}</p>
           </div>
           <div class="content">
             <div class="growth-box">
               <div class="growth-number">+${stats.growthPercent}%</div>
               <div>Weekly Growth</div>
               <p style="margin-top: 10px;">Added ${stats.newEmails} new members through snowball distribution!</p>
             </div>

             <div class="stats-grid">
               <div class="stat-card">
                 <h3>${stats.totalEmails}</h3>
                 <p>Total Members</p>
               </div>
               <div class="stat-card">
                 <h3>${stats.activeUsers}</h3>
                 <p>Active This Week</p>
               </div>
               <div class="stat-card">
                 <h3>${stats.postsCreated}</h3>
                 <p>Posts Created</p>
               </div>
               <div class="stat-card">
                 <h3>${stats.engagementRate}%</h3>
                 <p>Engagement Rate</p>
               </div>
             </div>

             <div class="contributors">
               <h3>🌟 Top Contributors This Week:</h3>
               ${stats.topContributors.map(contributor => `
                 <div class="contributor">
                   <div style="flex: 1;">
                     <strong>${contributor.username}</strong>
                     <span style="color: #666; margin-left: 10px;">+${contributor.emailsAdded} emails</span>
                   </div>
                   <div style="color: #ff6600;">+${contributor.karmaEarned} karma</div>
                 </div>
               `).join('')}
             </div>

             <div style="text-align: center;">
               <a href="${process.env.FRONTEND_URL}/repository/${repository._id}/analytics" class="button">View Full Analytics</a>
             </div>

             <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 30px;">
               <strong>💡 Growth Tip:</strong> ${stats.growthTip}
             </p>
           </div>
           <div class="footer">
             <p>You're receiving this because you manage the "${repository.name}" repository</p>
             <p><a href="${process.env.FRONTEND_URL}/repository/${repository._id}/settings">Repository settings</a> | <a href="%unsubscribe_url%">Unsubscribe from reports</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
Weekly Repository Report: ${repository.name}

Growth: +${stats.growthPercent}% (${stats.newEmails} new members)

Stats:
- Total Members: ${stats.totalEmails}
- Active This Week: ${stats.activeUsers}
- Posts Created: ${stats.postsCreated}
- Engagement Rate: ${stats.engagementRate}%

Top Contributors:
${stats.topContributors.map(c => `- ${c.username}: +${c.emailsAdded} emails`).join('\n')}

View full analytics: ${process.env.FRONTEND_URL}/repository/${repository._id}/analytics
   `
 }),

 // Email verification
 verifyEmail: (user, token) => ({
   subject: '✉️ Verify your Shadownews email address',
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: #000; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
           .button { display: inline-block; padding: 14px 35px; background: #ff6600; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
           .code-box { background: #fff; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; margin: 20px 0; }
           .code { font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #ff6600; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>Verify Your Email</h1>
           </div>
           <div class="content">
             <p>Hi ${user.username}! 👋</p>
             <p>Please verify your email address to complete your Shadownews registration.</p>
             
             <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" class="button">Verify Email Address</a>
             
             <p style="color: #666; font-size: 14px;">Or enter this code on the verification page:</p>
             <div class="code-box">
               <div class="code">${token.slice(0, 6).toUpperCase()}</div>
             </div>
             
             <p style="color: #666; font-size: 14px; margin-top: 30px;">This link expires in 24 hours.</p>
           </div>
           <div class="footer">
             <p>If you didn't create an account on Shadownews, please ignore this email.</p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
Hi ${user.username}!

Please verify your email address to complete your Shadownews registration.

Verify here: ${process.env.FRONTEND_URL}/verify-email?token=${token}

Or use code: ${token.slice(0, 6).toUpperCase()}

This link expires in 24 hours.
   `
 }),

 // Password reset
 passwordReset: (user, token) => ({
   subject: '🔐 Reset your Shadownews password',
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: #dc2626; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
           .button { display: inline-block; padding: 14px 35px; background: #dc2626; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
           .security-info { background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #fecaca; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>Password Reset Request</h1>
           </div>
           <div class="content">
             <p>Hi ${user.username},</p>
             <p>We received a request to reset your password for your Shadownews account.</p>
             
             <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" class="button">Reset Password</a>
             
             <div class="security-info">
               <p><strong>🔒 Security Notice:</strong></p>
               <p style="font-size: 14px;">This link expires in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
             </div>
             
             <p style="color: #666; font-size: 14px; margin-top: 30px;">
               Request details:<br>
               Time: ${format(new Date(), 'MMM d, yyyy h:mm a')}<br>
               IP: ${user.lastIP || 'Unknown'}
             </p>
           </div>
           <div class="footer">
             <p>For security reasons, we never include passwords in emails.</p>
             <p><a href="${process.env.FRONTEND_URL}/help/security">Security help</a> | <a href="${process.env.FRONTEND_URL}/contact">Contact support</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
Hi ${user.username},

We received a request to reset your Shadownews password.

Reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${token}

This link expires in 1 hour. If you didn't request this, please ignore this email.

Request time: ${format(new Date(), 'MMM d, yyyy h:mm a')}
   `
 }),

 // Snowball notification
 snowballUpdate: (user, repository, snowballStats) => ({
   subject: `❄️ Snowball effect in action! ${snowballStats.newConnections} new connections added`,
   html: `
     <!DOCTYPE html>
     <html>
       <head>
         <style>
           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
           .snowball-visual { text-align: center; margin: 30px 0; }
           .snowball-stats { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
           .chain { display: flex; align-items: center; justify-content: center; margin: 20px 0; }
           .node { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; }
           .arrow { width: 40px; text-align: center; color: #6b7280; }
           .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
           .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>❄️ Snowball Effect Activated!</h1>
             <p>Your repository is growing organically</p>
           </div>
           <div class="content">
             <p>Great news, ${user.username}! 🎉</p>
             <p>Your <strong>"${repository.name}"</strong> repository just experienced a snowball growth event:</p>
             
             <div class="snowball-visual">
               <div class="chain">
                 <div class="node" style="background: #3b82f6;">${snowballStats.originalCount}</div>
                 <div class="arrow">→</div>
                 <div class="node" style="background: #8b5cf6;">+${snowballStats.firstGeneration}</div>
                 <div class="arrow">→</div>
                 <div class="node" style="background: #10b981;">+${snowballStats.secondGeneration}</div>
               </div>
               <p style="color: #666; font-size: 14px;">Original → First share → Second share</p>
             </div>

             <div class="snowball-stats">
               <h3>📊 Snowball Statistics:</h3>
               <ul style="list-style: none; padding: 0;">
                 <li>🔗 <strong>${snowballStats.newConnections}</strong> new verified emails added</li>
                 <li>👥 <strong>${snowballStats.contributorsCount}</strong> members contributed lists</li>
                 <li>📈 <strong>${snowballStats.growthMultiplier}x</strong> growth multiplier achieved</li>
                 <li>🎯 <strong>${snowballStats.qualityScore}%</strong> relevance score maintained</li>
               </ul>
             </div>

             <div style="text-align: center;">
               <a href="${process.env.FRONTEND_URL}/repository/${repository._id}/snowball" class="button">View Snowball Visualization</a>
             </div>

             <p style="background: #e0e7ff; padding: 15px; border-radius: 5px; margin-top: 20px;">
               <strong>What happens next?</strong> Each new member can contribute their own CSV lists, creating exponential growth while maintaining quality through topic relevance scoring.
             </p>
           </div>
           <div class="footer">
             <p>Keep the momentum going by creating quality content for your growing community!</p>
             <p><a href="${process.env.FRONTEND_URL}/repository/${repository._id}">Manage repository</a> | <a href="${process.env.FRONTEND_URL}/help/snowball">Learn about snowball distribution</a></p>
           </div>
         </div>
       </body>
     </html>
   `,
   text: `
Snowball Effect Activated!

Your "${repository.name}" repository just grew through snowball distribution:

- ${snowballStats.newConnections} new verified emails added
- ${snowballStats.contributorsCount} members contributed lists
- ${snowballStats.growthMultiplier}x growth multiplier achieved
- ${snowballStats.qualityScore}% relevance score maintained

View visualization: ${process.env.FRONTEND_URL}/repository/${repository._id}/snowball
   `
 })
};

// Helper function to send email
const sendEmail = async (to, template, data) => {
 try {
   const emailContent = template(data);
   
   // Add common footer and tracking
   emailContent.html = emailContent.html.replace('%unsubscribe_url%', 
     `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(to)}&token=${data.unsubscribeToken}`
   );
   
   // Return formatted email object
   return {
     to,
     from: {
       email: 'noreply@shadownews.community',
       name: 'Shadownews'
     },
     subject: emailContent.subject,
     html: emailContent.html,
     text: emailContent.text,
     trackingSettings: {
       clickTracking: { enable: true },
       openTracking: { enable: true }
     }
   };
 } catch (error) {
   console.error('Error preparing email:', error);
   throw error;
 }
};

// Batch email helper for digests
const prepareBatchEmails = (recipients, template, commonData) => {
 return recipients.map(recipient => {
   const personalizedData = {
     ...commonData,
     user: recipient.user,
     unsubscribeToken: recipient.unsubscribeToken
   };
   return sendEmail(recipient.email, template, personalizedData);
 });
};

module.exports = {
 emailTemplates,
 sendEmail,
 prepareBatchEmails
};