/**
 * Gemini API utility functions for AI-powered product recommendations
 */

/**
 * Get AI-powered product recommendations from Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {Object} context - Context object with product information
 * @param {string} context.currentProductTitle - Title of current product (optional)
 * @param {string} context.currentProductDescription - Description of current product (optional)
 * @param {Array<Object>} context.availableProducts - Array of available products
 * @param {string} context.userQuery - User's search query or preference (optional)
 * @returns {Promise<Array<string>>} Array of recommended product titles/handles
 */
export async function getGeminiRecommendations(apiKey, context = {}) {
  const {
    currentProductTitle,
    currentProductDescription,
    availableProducts = [],
    userQuery,
  } = context;

  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  // Build product list for context
  const productList = availableProducts
    .slice(0, 20) // Limit to 20 products for context
    .map((product) => ({
      title: product.title,
      handle: product.handle,
      description: product.description || '',
      price: product.priceRange?.minVariantPrice?.amount || '',
      vendor: product.vendor || '',
    }))
    .map(
      (p) =>
        `- ${p.title} (${p.handle})${p.description ? `: ${p.description.substring(0, 100)}` : ''}`,
    )
    .join('\n');

  // Build the prompt
  let prompt = `You are an AI shopping assistant. Analyze the following products and provide personalized recommendations.\n\n`;
  
  if (currentProductTitle) {
    prompt += `Current Product: ${currentProductTitle}\n`;
    if (currentProductDescription) {
      prompt += `Description: ${currentProductDescription.substring(0, 300)}\n\n`;
    }
  }

  if (userQuery) {
    prompt += `User Preference: ${userQuery}\n\n`;
  }

  prompt += `Available Products:\n${productList}\n\n`;
  prompt += `Based on the context above, recommend 4-6 products that would be most relevant. `;
  prompt += `Return ONLY a JSON array of product handles (the handle is the URL-friendly identifier in parentheses), like this: ["product-handle-1", "product-handle-2", "product-handle-3", "product-handle-4"]\n`;
  prompt += `Do not include any explanation, only the JSON array.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} - ${errorData}`,
      );
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText =
      data.candidates[0].content.parts[0].text.trim();

    // Parse JSON array from response
    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Could not parse recommendations from Gemini response');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(recommendations)) {
      throw new Error('Gemini response is not an array');
    }

    return recommendations;
  } catch (error) {
    console.error('Error getting Gemini recommendations:', error);
    throw error;
  }
}

/**
 * Get AI-powered product recommendations with fallback
 * @param {string} apiKey - Gemini API key
 * @param {Object} context - Context object
 * @param {Array<Object>} fallbackProducts - Fallback products if API fails
 * @returns {Promise<Array<Object>>} Recommended products
 */
export async function getRecommendationsWithFallback(
  apiKey,
  context,
  fallbackProducts = [],
) {
  try {
    const recommendedHandles = await getGeminiRecommendations(apiKey, context);
    
    // Map handles to actual product objects
    const recommendedProducts = recommendedHandles
      .map((handle) =>
        context.availableProducts.find(
          (p) => p.handle === handle || p.handle === handle.replace(/-/g, ''),
        ),
      )
      .filter(Boolean)
      .slice(0, 6); // Limit to 6 products

    // If we got fewer recommendations than expected, fill with fallback
    if (recommendedProducts.length < 4 && fallbackProducts.length > 0) {
      const usedHandles = new Set(recommendedProducts.map((p) => p.handle));
      const additional = fallbackProducts
        .filter((p) => !usedHandles.has(p.handle))
        .slice(0, 4 - recommendedProducts.length);
      recommendedProducts.push(...additional);
    }

    return recommendedProducts.length > 0
      ? recommendedProducts
      : fallbackProducts.slice(0, 6);
  } catch (error) {
    console.error('Falling back to default recommendations:', error);
    return fallbackProducts.slice(0, 6);
  }
}

