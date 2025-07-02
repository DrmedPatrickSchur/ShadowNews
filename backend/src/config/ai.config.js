const aiConfig = {
 openai: {
   apiKey: process.env.OPENAI_API_KEY,
   model: process.env.AI_MODEL || 'gpt-3.5-turbo',
   temperature: 0.7,
   maxTokens: 150,
   topP: 1,
   frequencyPenalty: 0,
   presencePenalty: 0,
 },

 features: {
   hashtagSuggestion: {
     enabled: process.env.AI_HASHTAG_SUGGESTION_ENABLED === 'true',
     maxSuggestions: 5,
     minConfidence: 0.7,
     model: process.env.AI_HASHTAG_MODEL || 'gpt-3.5-turbo',
     systemPrompt: 'You are a hashtag suggestion expert. Analyze the content and suggest relevant hashtags. Return only hashtags without explanations, separated by commas.',
   },

   contentSummarization: {
     enabled: process.env.AI_SUMMARIZATION_ENABLED === 'true',
     maxLength: 280,
     model: process.env.AI_SUMMARY_MODEL || 'gpt-3.5-turbo',
     systemPrompt: 'Summarize the following content in a concise, engaging way. Maximum 280 characters.',
   },

   topicExtraction: {
     enabled: process.env.AI_TOPIC_EXTRACTION_ENABLED === 'true',
     maxTopics: 3,
     model: process.env.AI_TOPIC_MODEL || 'gpt-3.5-turbo',
     systemPrompt: 'Extract the main topics from this content. Return up to 3 topics as a comma-separated list.',
   },

   spamDetection: {
     enabled: process.env.AI_SPAM_DETECTION_ENABLED === 'true',
     threshold: 0.8,
     model: process.env.AI_SPAM_MODEL || 'gpt-3.5-turbo',
     systemPrompt: 'Analyze if this content is spam. Respond with only "spam" or "legitimate" and a confidence score 0-1.',
   },

   emailCategorization: {
     enabled: process.env.AI_EMAIL_CATEGORIZATION_ENABLED === 'true',
     model: process.env.AI_EMAIL_MODEL || 'gpt-3.5-turbo',
     categories: ['announcement', 'discussion', 'question', 'resource', 'job', 'event', 'other'],
     systemPrompt: 'Categorize this email content into one of the following categories: announcement, discussion, question, resource, job, event, or other.',
   },

   contentModeration: {
     enabled: process.env.AI_MODERATION_ENABLED === 'true',
     model: process.env.AI_MODERATION_MODEL || 'text-moderation-latest',
     flagThreshold: 0.7,
     categories: ['hate', 'harassment', 'violence', 'self-harm', 'sexual', 'dangerous'],
   },
 },

 rateLimits: {
   requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '60'),
   requestsPerHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '1000'),
   requestsPerDay: parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '10000'),
 },

 cache: {
   enabled: process.env.AI_CACHE_ENABLED === 'true',
   ttl: parseInt(process.env.AI_CACHE_TTL || '3600'), // 1 hour default
   keyPrefix: 'ai:cache:',
 },

 fallback: {
   enabled: process.env.AI_FALLBACK_ENABLED === 'true',
   useLocalModels: process.env.AI_USE_LOCAL_MODELS === 'true',
   strategies: {
     hashtagSuggestion: ['regex-based', 'tf-idf'],
     contentSummarization: ['first-paragraph', 'sentence-extraction'],
     topicExtraction: ['keyword-frequency', 'tf-idf'],
     spamDetection: ['keyword-filter', 'pattern-matching'],
   },
 },

 monitoring: {
   logRequests: process.env.AI_LOG_REQUESTS === 'true',
   logResponses: process.env.AI_LOG_RESPONSES === 'true',
   metricsEnabled: process.env.AI_METRICS_ENABLED === 'true',
   alertThreshold: {
     errorRate: 0.1, // 10% error rate
     latency: 5000, // 5 seconds
   },
 },

 providers: {
   primary: process.env.AI_PRIMARY_PROVIDER || 'openai',
   secondary: process.env.AI_SECONDARY_PROVIDER || 'anthropic',
   tertiary: process.env.AI_TERTIARY_PROVIDER || 'local',
 },

 anthropic: {
   apiKey: process.env.ANTHROPIC_API_KEY,
   model: process.env.ANTHROPIC_MODEL || 'claude-2',
   maxTokens: 150,
 },

 huggingface: {
   apiKey: process.env.HUGGINGFACE_API_KEY,
   models: {
     summarization: 'facebook/bart-large-cnn',
     classification: 'distilbert-base-uncased-finetuned-sst-2-english',
     zeroShot: 'facebook/bart-large-mnli',
   },
 },

 local: {
   modelsPath: process.env.LOCAL_MODELS_PATH || './models',
   device: process.env.AI_DEVICE || 'cpu',
 },

 retryConfig: {
   maxRetries: 3,
   initialDelay: 1000,
   maxDelay: 10000,
   backoffMultiplier: 2,
 },

 validation: {
   maxInputLength: 10000,
   minInputLength: 10,
   allowedLanguages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
 },

 experimental: {
   semanticSearch: process.env.AI_SEMANTIC_SEARCH_ENABLED === 'true',
   autoTagging: process.env.AI_AUTO_TAGGING_ENABLED === 'true',
   sentimentAnalysis: process.env.AI_SENTIMENT_ANALYSIS_ENABLED === 'true',
   duplicateDetection: process.env.AI_DUPLICATE_DETECTION_ENABLED === 'true',
 },
};

module.exports = aiConfig;