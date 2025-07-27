/**
 * @fileoverview AI Configuration for ShadowNews Platform
 * 
 * Centralized configuration for all AI-powered features in the ShadowNews platform.
 * This module manages OpenAI API integration, AI feature toggles, rate limiting,
 * and fallback strategies for email processing and content enhancement.
 * 
 * Key Features:
 * - OpenAI GPT integration for content analysis
 * - Hashtag suggestion system using AI
 * - Content summarization for email digests
 * - Topic extraction from email content
 * - Spam detection and content moderation
 * - Email categorization for repository organization
 * - Multi-provider AI support (OpenAI, Anthropic, HuggingFace)
 * - Rate limiting and caching for cost optimization
 * - Fallback strategies for AI service outages
 * - Comprehensive monitoring and alerting
 * 
 * Dependencies:
 * - OpenAI API for primary AI services
 * - Anthropic Claude for secondary AI provider
 * - HuggingFace models for local/specialized tasks
 * - Redis for caching AI responses
 * - Environment variables for configuration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/**
 * AI Configuration Object
 * Manages all AI-related settings and feature toggles for the ShadowNews platform
 */
const aiConfig = {
  /**
   * OpenAI Configuration
   * Primary AI provider for content analysis, summarization, and generation tasks
   */
  openai: {
    // OpenAI API key from environment variables (required for API access)
    apiKey: process.env.OPENAI_API_KEY,
    
    // Default GPT model for general AI tasks (gpt-3.5-turbo, gpt-4, etc.)
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    
    // Controls randomness in AI responses (0.0 = deterministic, 1.0 = very random)
    temperature: 0.7,
    
    // Maximum tokens in AI response to control length and costs
    maxTokens: 150,
    
    // Controls diversity via nucleus sampling (1.0 = no filtering)
    topP: 1,
    
    // Penalizes frequent words to reduce repetition (0.0 = no penalty)
    frequencyPenalty: 0,
    
    // Penalizes new topics to maintain focus (0.0 = no penalty)
    presencePenalty: 0,
  },

  /**
   * AI Features Configuration
   * Individual feature toggles and settings for different AI capabilities
   */
  features: {
    /**
     * Hashtag Suggestion Feature
     * Automatically suggests relevant hashtags for email content and posts
     */
    hashtagSuggestion: {
      // Enable/disable hashtag suggestion feature
      enabled: process.env.AI_HASHTAG_SUGGESTION_ENABLED === 'true',
      
      // Maximum number of hashtags to suggest per content piece
      maxSuggestions: 5,
      
      // Minimum confidence score required for hashtag suggestions (0.0-1.0)
      minConfidence: 0.7,
      
      // AI model specifically for hashtag generation
      model: process.env.AI_HASHTAG_MODEL || 'gpt-3.5-turbo',
      
      // System prompt that guides the AI for hashtag generation
      systemPrompt: 'You are a hashtag suggestion expert. Analyze the content and suggest relevant hashtags. Return only hashtags without explanations, separated by commas.',
    },

    /**
     * Content Summarization Feature
     * Creates concise summaries of email content for digests and previews
     */
    contentSummarization: {
      // Enable/disable content summarization
      enabled: process.env.AI_SUMMARIZATION_ENABLED === 'true',
      
      // Maximum length of generated summaries (characters)
      maxLength: 280,
      
      // AI model for content summarization tasks
      model: process.env.AI_SUMMARY_MODEL || 'gpt-3.5-turbo',
      
      // System prompt for generating concise, engaging summaries
      systemPrompt: 'Summarize the following content in a concise, engaging way. Maximum 280 characters.',
    },

    /**
     * Topic Extraction Feature
     * Identifies main topics and themes from email content for categorization
     */
    topicExtraction: {
      // Enable/disable topic extraction
      enabled: process.env.AI_TOPIC_EXTRACTION_ENABLED === 'true',
      
      // Maximum number of topics to extract per content piece
      maxTopics: 3,
      
      // AI model for topic extraction and analysis
      model: process.env.AI_TOPIC_MODEL || 'gpt-3.5-turbo',
      
      // System prompt for topic identification and extraction
      systemPrompt: 'Extract the main topics from this content. Return up to 3 topics as a comma-separated list.',
    },

    /**
     * Spam Detection Feature
     * Analyzes content to identify and filter spam emails and posts
     */
    spamDetection: {
      // Enable/disable AI-powered spam detection
      enabled: process.env.AI_SPAM_DETECTION_ENABLED === 'true',
      
      // Confidence threshold for marking content as spam (0.0-1.0)
      threshold: 0.8,
      
      // AI model specialized for spam detection
      model: process.env.AI_SPAM_MODEL || 'gpt-3.5-turbo',
      
      // System prompt for spam analysis with specific output format
      systemPrompt: 'Analyze if this content is spam. Respond with only "spam" or "legitimate" and a confidence score 0-1.',
    },

    /**
     * Email Categorization Feature
     * Automatically categorizes incoming emails by type and purpose
     */
    emailCategorization: {
      // Enable/disable email categorization
      enabled: process.env.AI_EMAIL_CATEGORIZATION_ENABLED === 'true',
      
      // AI model for email categorization tasks
      model: process.env.AI_EMAIL_MODEL || 'gpt-3.5-turbo',
      
      // Predefined categories for email classification
      categories: ['announcement', 'discussion', 'question', 'resource', 'job', 'event', 'other'],
      
      // System prompt for email categorization with specific category list
      systemPrompt: 'Categorize this email content into one of the following categories: announcement, discussion, question, resource, job, event, or other.',
    },

    /**
     * Content Moderation Feature
     * Reviews content for policy violations and inappropriate material
     */
    contentModeration: {
      // Enable/disable AI content moderation
      enabled: process.env.AI_MODERATION_ENABLED === 'true',
      
      // OpenAI's specialized moderation model
      model: process.env.AI_MODERATION_MODEL || 'text-moderation-latest',
      
      // Confidence threshold for flagging content (0.0-1.0)
      flagThreshold: 0.7,
      
      // Categories of content to moderate
      categories: ['hate', 'harassment', 'violence', 'self-harm', 'sexual', 'dangerous'],
    },
  },

  /**
   * Rate Limiting Configuration
   * Controls AI API usage to manage costs and prevent quota exhaustion
   */
  rateLimits: {
    // Maximum AI requests per minute across all features
    requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '60'),
    
    // Maximum AI requests per hour for cost control
    requestsPerHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '1000'),
    
    // Daily request limit for budget management
    requestsPerDay: parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '10000'),
  },

  /**
   * Caching Configuration
   * Reduces AI API calls by caching similar requests and responses
   */
  cache: {
    // Enable/disable AI response caching
    enabled: process.env.AI_CACHE_ENABLED === 'true',
    
    // Time-to-live for cached responses in seconds (1 hour default)
    ttl: parseInt(process.env.AI_CACHE_TTL || '3600'),
    
    // Redis key prefix for AI cache entries
    keyPrefix: 'ai:cache:',
  },

  /**
   * Fallback Strategy Configuration
   * Provides alternative methods when AI services are unavailable
   */
  fallback: {
    // Enable/disable fallback strategies
    enabled: process.env.AI_FALLBACK_ENABLED === 'true',
    
    // Use local models when cloud AI services fail
    useLocalModels: process.env.AI_USE_LOCAL_MODELS === 'true',
    
    // Fallback strategies for each AI feature
    strategies: {
      // Rule-based hashtag generation using regex and TF-IDF
      hashtagSuggestion: ['regex-based', 'tf-idf'],
      
      // Simple text summarization using first paragraph or sentence extraction
      contentSummarization: ['first-paragraph', 'sentence-extraction'],
      
      // Keyword-based topic extraction
      topicExtraction: ['keyword-frequency', 'tf-idf'],
      
      // Pattern-based spam detection
      spamDetection: ['keyword-filter', 'pattern-matching'],
    },
  },

  /**
   * Monitoring and Observability Configuration
   * Tracks AI system performance and usage patterns
   */
  monitoring: {
    // Log all AI API requests for debugging and analysis
    logRequests: process.env.AI_LOG_REQUESTS === 'true',
    
    // Log AI responses for quality monitoring
    logResponses: process.env.AI_LOG_RESPONSES === 'true',
    
    // Enable metrics collection for Prometheus/Grafana
    metricsEnabled: process.env.AI_METRICS_ENABLED === 'true',
    
    // Alert thresholds for system health monitoring
    alertThreshold: {
      // Alert when error rate exceeds 10%
      errorRate: 0.1,
      
      // Alert when response time exceeds 5 seconds
      latency: 5000,
    },
  },

  /**
   * AI Provider Priority Configuration
   * Defines fallback order for different AI providers
   */
  providers: {
    // Primary AI provider (preferred)
    primary: process.env.AI_PRIMARY_PROVIDER || 'openai',
    
    // Secondary provider for failover
    secondary: process.env.AI_SECONDARY_PROVIDER || 'anthropic',
    
    // Tertiary provider (usually local models)
    tertiary: process.env.AI_TERTIARY_PROVIDER || 'local',
  },

  /**
   * Anthropic Claude Configuration
   * Alternative AI provider for specialized tasks
   */
  anthropic: {
    // Anthropic API key for Claude models
    apiKey: process.env.ANTHROPIC_API_KEY,
    
    // Claude model version (claude-2, claude-instant, etc.)
    model: process.env.ANTHROPIC_MODEL || 'claude-2',
    
    // Maximum tokens for Claude responses
    maxTokens: 150,
  },

  /**
   * HuggingFace Configuration
   * Open-source models for specialized AI tasks
   */
  huggingface: {
    // HuggingFace API key for model access
    apiKey: process.env.HUGGINGFACE_API_KEY,
    
    // Specific models for different tasks
    models: {
      // Facebook BART model for text summarization
      summarization: 'facebook/bart-large-cnn',
      
      // DistilBERT for sentiment analysis and classification
      classification: 'distilbert-base-uncased-finetuned-sst-2-english',
      
      // Facebook BART for zero-shot classification
      zeroShot: 'facebook/bart-large-mnli',
    },
  },

  /**
   * Local AI Models Configuration
   * Self-hosted AI models for privacy and cost control
   */
  local: {
    // Path to local model files
    modelsPath: process.env.LOCAL_MODELS_PATH || './models',
    
    // Compute device for local inference (cpu, cuda, mps)
    device: process.env.AI_DEVICE || 'cpu',
  },

  /**
   * Retry Configuration
   * Handles temporary AI service failures with exponential backoff
   */
  retryConfig: {
    // Maximum number of retry attempts
    maxRetries: 3,
    
    // Initial delay before first retry (milliseconds)
    initialDelay: 1000,
    
    // Maximum delay between retries (milliseconds)
    maxDelay: 10000,
    
    // Multiplier for exponential backoff
    backoffMultiplier: 2,
  },

  /**
   * Input Validation Configuration
   * Ensures AI inputs meet quality and safety requirements
   */
  validation: {
    // Maximum input length to prevent excessive API costs
    maxInputLength: 10000,
    
    // Minimum input length for meaningful AI processing
    minInputLength: 10,
    
    // Supported languages for AI processing
    allowedLanguages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  },

  /**
   * Experimental Features Configuration
   * Beta AI features under development and testing
   */
  experimental: {
    // Semantic search using embeddings
    semanticSearch: process.env.AI_SEMANTIC_SEARCH_ENABLED === 'true',
    
    // Automatic content tagging
    autoTagging: process.env.AI_AUTO_TAGGING_ENABLED === 'true',
    
    // Sentiment analysis for community mood tracking
    sentimentAnalysis: process.env.AI_SENTIMENT_ANALYSIS_ENABLED === 'true',
    
    // Duplicate content detection
    duplicateDetection: process.env.AI_DUPLICATE_DETECTION_ENABLED === 'true',
  },
};

// Export the complete AI configuration for use throughout the application
module.exports = aiConfig;