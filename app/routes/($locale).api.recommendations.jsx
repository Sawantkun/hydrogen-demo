import {getGeminiRecommendations} from '~/lib/gemini';

/**
 * API route for AI-powered product recommendations using Gemini
 * @param {Route.ActionArgs} args
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {error: 'Gemini API key not configured'},
        {status: 500},
      );
    }

    const body = await request.json();
    const {
      currentProductTitle,
      currentProductDescription,
      availableProducts,
      userQuery,
    } = body;

    const recommendations = await getGeminiRecommendations(apiKey, {
      currentProductTitle,
      currentProductDescription,
      availableProducts: availableProducts || [],
      userQuery,
    });

    return Response.json({recommendations}, {status: 200});
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return Response.json(
      {error: error.message || 'Failed to get recommendations'},
      {status: 500},
    );
  }
}

/**
 * GET handler for recommendations (optional, for testing)
 * @param {Route.LoaderArgs} args
 */
export async function loader({request, context}) {
  // For GET requests, you might want to return a simple status
  return Response.json(
    {message: 'Use POST to get recommendations'},
    {status: 200},
  );
}

/** @typedef {import('./+types/api.recommendations').Route} Route */

