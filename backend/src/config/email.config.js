const config = {
 // Email service configuration
 service: {
   provider: process.env.EMAIL_PROVIDER || 'sendgrid',
   apiKey: process.env.EMAIL_API_KEY,
   fromEmail: process.env.EMAIL_FROM || 'noreply@shadownews.community',
   fromName: process.env.EMAIL_FROM_NAME || 'Shadownews',
   replyTo: process.env.EMAIL_REPLY_TO || 'support@shadownews.community'
 },

 // Inbound email processing
 inbound: {
   domain: process.env.EMAIL_DOMAIN || 'shadownews.community',
   webhookUrl: process.env.EMAIL_WEBHOOK_URL || '/api/email/inbound',
   webhookToken: process.env.EMAIL_WEBHOOK_TOKEN,
   allowedDomains: process.env.EMAIL_ALLOWED_DOMAINS?.split(',') || ['*'],
   maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE) || 10485760, // 10MB
   supportedAttachments: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
 },

 // Email templates
 templates: {
   welcome: process.env.EMAIL_TEMPLATE_WELCOME || 'd-welcome123',
   digest: process.env.EMAIL_TEMPLATE_DIGEST || 'd-digest123',
   notification: process.env.EMAIL_TEMPLATE_NOTIFICATION || 'd-notification123',
   passwordReset: process.env.EMAIL_TEMPLATE_PASSWORD_RESET || 'd-reset123',
   emailVerification: process.env.EMAIL_TEMPLATE_VERIFICATION || 'd-verify123',
   repositoryInvite: process.env.EMAIL_TEMPLATE_REPO_INVITE || 'd-invite123'
 },

 // Digest settings
 digest: {
   enabled: process.env.EMAIL_DIGEST_ENABLED !== 'false',
   defaultFrequency: process.env.EMAIL_DIGEST_FREQUENCY || 'daily',
   sendTime: process.env.EMAIL_DIGEST_SEND_TIME || '09:00',
   timezone: process.env.EMAIL_DIGEST_TIMEZONE || 'UTC',
   batchSize: parseInt(process.env.EMAIL_DIGEST_BATCH_SIZE) || 100,
   maxRetries: parseInt(process.env.EMAIL_DIGEST_MAX_RETRIES) || 3
 },

 // Rate limiting
 rateLimit: {
   maxEmailsPerUser: parseInt(process.env.EMAIL_RATE_LIMIT_USER) || 50,
   maxEmailsPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_HOUR) || 1000,
   maxRecipientsPerEmail: parseInt(process.env.EMAIL_MAX_RECIPIENTS) || 100,
   cooldownPeriod: parseInt(process.env.EMAIL_COOLDOWN_MINUTES) || 60
 },

 // Snowball distribution settings
 snowball: {
   enabled: process.env.EMAIL_SNOWBALL_ENABLED !== 'false',
   minKarmaRequired: parseInt(process.env.EMAIL_SNOWBALL_MIN_KARMA) || 100,
   maxHops: parseInt(process.env.EMAIL_SNOWBALL_MAX_HOPS) || 3,
   verificationRequired: process.env.EMAIL_SNOWBALL_VERIFY !== 'false',
   optOutHonored: process.env.EMAIL_SNOWBALL_RESPECT_OPTOUT !== 'false',
   deduplicationWindow: parseInt(process.env.EMAIL_SNOWBALL_DEDUP_HOURS) || 24
 },

 // Email validation
 validation: {
   requireVerification: process.env.EMAIL_REQUIRE_VERIFICATION !== 'false',
   verificationExpiry: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY) || 86400, // 24 hours
   blockDisposable: process.env.EMAIL_BLOCK_DISPOSABLE !== 'false',
   blockList: process.env.EMAIL_BLOCKLIST?.split(',') || [],
   allowList: process.env.EMAIL_ALLOWLIST?.split(',') || []
 },

 // Queue settings
 queue: {
   name: process.env.EMAIL_QUEUE_NAME || 'email-queue',
   concurrency: parseInt(process.env.EMAIL_QUEUE_CONCURRENCY) || 5,
   retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY) || 60000, // 1 minute
   maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES) || 3,
   removeOnComplete: process.env.EMAIL_QUEUE_REMOVE_COMPLETE !== 'false',
   removeOnFail: process.env.EMAIL_QUEUE_REMOVE_FAIL === 'true'
 },

 // Spam prevention
 spam: {
   checkEnabled: process.env.EMAIL_SPAM_CHECK !== 'false',
   spamAssassinUrl: process.env.SPAMASSASSIN_URL,
   maxSpamScore: parseFloat(process.env.EMAIL_MAX_SPAM_SCORE) || 5.0,
   greylistMinutes: parseInt(process.env.EMAIL_GREYLIST_MINUTES) || 5,
   blacklistProviders: process.env.EMAIL_BLACKLIST_PROVIDERS?.split(',') || ['spamhaus', 'spamcop']
 },

 // Analytics
 analytics: {
   trackOpens: process.env.EMAIL_TRACK_OPENS !== 'false',
   trackClicks: process.env.EMAIL_TRACK_CLICKS !== 'false',
   webhookUrl: process.env.EMAIL_ANALYTICS_WEBHOOK,
   retentionDays: parseInt(process.env.EMAIL_ANALYTICS_RETENTION) || 90
 }
};

module.exports = config;