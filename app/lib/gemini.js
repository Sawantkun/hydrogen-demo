import { PRODUCT_LIMITS, TEXT_LIMITS, AI_CONFIG, GEMINI_API_URL } from './constants';

/**
 * Get AI-powered product recommendations from Gemini API
 */
export async function getGeminiRecommendations(apiKey, context = {}) {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const { availableProducts = [] } = context;
  const prompt = buildPrompt(context);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: AI_CONFIG.TEMPERATURE,
        topK: AI_CONFIG.TOP_K,
        topP: AI_CONFIG.TOP_P,
        maxOutputTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText} - ${errorData}`,
    );
  }

  const data = await response.json();
  return parseGeminiResponse(data);
}

/**
 * Get AI recommendations with automatic fallback handling
 */
export async function getRecommendationsWithFallback(
  apiKey,
  context,
  fallbackProducts = [],
) {
  try {
    const recommendedHandles = await getGeminiRecommendations(apiKey, context);
    const products = mapHandlesToProducts(
      recommendedHandles,
      context.availableProducts,
      fallbackProducts,
    );
    return products;
  } catch (error) {
    console.error('Falling back to default recommendations:', error);
    return fallbackProducts.slice(0, PRODUCT_LIMITS.AI_RECOMMENDATIONS);
  }
}

// ===== Helper Functions =====

/**
 * Build the Gemini prompt from context
 */
function buildPrompt(context) {
  const {
    currentProductTitle,
    currentProductDescription,
    availableProducts = [],
    userQuery,
  } = context;

  const productList = formatProductList(availableProducts);

  const parts = [
    'You are an AI shopping assistant. Analyze the following products and provide personalized recommendations.\n',
  ];

  if (currentProductTitle) {
    parts.push(`Current Product: ${currentProductTitle}\n`);
    if (currentProductDescription) {
      parts.push(
        `Description: ${currentProductDescription.substring(0, TEXT_LIMITS.GEMINI_DESCRIPTION)}\n\n`,
      );
    }
  }

  if (userQuery) {
    parts.push(`User Preference: ${userQuery}\n\n`);
  }

  parts.push(
    `Available Products:\n${productList}\n\n`,
    `Based on the context above, recommend 4-6 products that would be most relevant. `,
    `Return ONLY a JSON array of product handles (the handle is the URL-friendly identifier in parentheses), `,
    `like this: ["product-handle-1", "product-handle-2", "product-handle-3", "product-handle-4"]\n`,
    `Do not include any explanation, only the JSON array.`,
  );

  return parts.join('');
}

/**
 * Format product list for context
 */
function formatProductList(products) {
  return products
    .slice(0, PRODUCT_LIMITS.AI_CONTEXT_PRODUCTS)
    .map((product) => {
      const desc = product.description
        ? `: ${product.description.substring(0, TEXT_LIMITS.PRODUCT_DESCRIPTION)}`
        : '';
      return `- ${product.title} (${product.handle})${desc}`;
    })
    .join('\n');
}

/**
 * Parse Gemini API response
 */
function parseGeminiResponse(data) {
  if (!data.candidates?.[0]?.content?.parts) {
    throw new Error('Invalid response from Gemini API');
  }

  const responseText = data.candidates[0].content.parts[0].text.trim();
  const jsonMatch = responseText.match(/\[.*\]/s);

  if (!jsonMatch) {
    throw new Error('Could not parse recommendations from Gemini response');
  }

  const recommendations = JSON.parse(jsonMatch[0]);

  if (!Array.isArray(recommendations)) {
    throw new Error('Gemini response is not an array');
  }

  return recommendations;
}

/**
 * Map recommendation handles to product objects
 */
function mapHandlesToProducts(handles, availableProducts, fallbackProducts) {
  const recommended = handles
    .map((handle) =>
      availableProducts.find(
        (p) =>
          p.handle === handle ||
          p.handle === handle.replace(/-/g, '') ||
          p.handle === handle.replace(/\s+/g, '-').toLowerCase(),
      ),
    )
    .filter(Boolean)
    .slice(0, PRODUCT_LIMITS.AI_RECOMMENDATIONS);

  // Fill with fallback if needed
  if (recommended.length < AI_CONFIG.MIN_RECOMMENDATIONS && fallbackProducts.length > 0) {
    const usedHandles = new Set(recommended.map((p) => p.handle));
    const additional = fallbackProducts
      .filter((p) => !usedHandles.has(p.handle))
      .slice(0, PRODUCT_LIMITS.AI_RECOMMENDATIONS - recommended.length);
    recommended.push(...additional);
  }

  return recommended.length > 0
    ? recommended
    : fallbackProducts.slice(0, PRODUCT_LIMITS.AI_RECOMMENDATIONS);
}