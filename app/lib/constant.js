// app/lib/constants.js

/**
 * Product and Collection Configuration
 */
export const PRODUCT_LIMITS = {
    AI_RECOMMENDATIONS: 6,
    AI_CONTEXT_PRODUCTS: 20,
    RECOMMENDED_PRODUCTS: 4,
    HOMEPAGE_FEATURED: 50,
    BUNDLE_REFERENCES: 20,
    COLLECTION_PRODUCTS: 10,
};

export const TEXT_LIMITS = {
    PRODUCT_DESCRIPTION: 100,
    GEMINI_DESCRIPTION: 300,
};

export const AI_CONFIG = {
    TEMPERATURE: 0.7,
    TOP_K: 40,
    TOP_P: 0.95,
    MAX_OUTPUT_TOKENS: 1024,
    MIN_RECOMMENDATIONS: 4,
};

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';