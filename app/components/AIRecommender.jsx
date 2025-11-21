import {useState, useEffect} from 'react';
import {ProductItem} from '~/components/ProductItem';

/**
 * AI-powered product recommender component using Gemini API
 * @param {{
 *   currentProduct?: {
 *     title?: string;
 *     description?: string;
 *     handle?: string;
 *   };
 *   availableProducts: Array<{
 *     id: string;
 *     title: string;
 *     handle: string;
 *     description?: string;
 *     priceRange?: {
 *       minVariantPrice: {
 *         amount: string;
 *         currencyCode: string;
 *       };
 *     };
 *     featuredImage?: {
 *       id: string;
 *       url: string;
 *       altText?: string;
 *       width?: number;
 *       height?: number;
 *     };
 *     vendor?: string;
 *   }>;
 *   userQuery?: string;
 *   title?: string;
 *   fallbackProducts?: Array<any>;
 * }}
 */
export function AIRecommender({
  currentProduct,
  availableProducts = [],
  userQuery,
  title = 'AI Recommendations for You',
  fallbackProducts = [],
}) {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecommendations() {
      if (availableProducts.length === 0) {
        setRecommendedProducts(fallbackProducts.slice(0, 6));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use relative path - React Router will handle locale prefix automatically
        const apiPath = '/api/recommendations';
        const response = await fetch(apiPath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentProductTitle: currentProduct?.title,
            currentProductDescription: currentProduct?.description,
            availableProducts: availableProducts.map((product) => ({
              id: product.id,
              title: product.title,
              handle: product.handle,
              description: product.description,
              priceRange: product.priceRange,
              vendor: product.vendor,
            })),
            userQuery,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        const recommendedHandles = data.recommendations || [];

        // Map handles to actual product objects
        const recommended = recommendedHandles
          .map((handle) =>
            availableProducts.find(
              (p) =>
                p.handle === handle ||
                p.handle === handle.replace(/-/g, '') ||
                p.handle === handle.replace(/\s+/g, '-').toLowerCase(),
            ),
          )
          .filter(Boolean)
          .slice(0, 6);

        // If we got fewer recommendations, fill with fallback
        if (recommended.length < 4 && fallbackProducts.length > 0) {
          const usedHandles = new Set(recommended.map((p) => p.handle));
          const additional = fallbackProducts
            .filter((p) => !usedHandles.has(p.handle))
            .slice(0, 6 - recommended.length);
          recommended.push(...additional);
        }

        setRecommendedProducts(
          recommended.length > 0 ? recommended : fallbackProducts.slice(0, 6),
        );
      } catch (err) {
        console.error('Error fetching AI recommendations:', err);
        setError(err.message);
        // Fallback to default products
        setRecommendedProducts(fallbackProducts.slice(0, 6));
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [
    currentProduct?.title,
    currentProduct?.description,
    availableProducts,
    userQuery,
    fallbackProducts,
  ]);

  if (loading) {
    return (
      <div className="ai-recommender">
        <h2 className="ai-recommender-title">{title}</h2>
        <div className="ai-recommender-loading">
          <p>🤖 AI is finding the perfect products for you...</p>
        </div>
      </div>
    );
  }

  if (error && recommendedProducts.length === 0) {
    return (
      <div className="ai-recommender">
        <h2 className="ai-recommender-title">{title}</h2>
        <div className="ai-recommender-error">
          <p>Unable to load AI recommendations. Showing popular products instead.</p>
        </div>
        {fallbackProducts.length > 0 && (
          <div className="ai-recommender-grid">
            {fallbackProducts.slice(0, 6).map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="ai-recommender">
      <div className="ai-recommender-header">
        <h2 className="ai-recommender-title">{title}</h2>
        {error && (
          <p className="ai-recommender-subtitle">
            (Some recommendations may be AI-powered)
          </p>
        )}
      </div>
      <div className="ai-recommender-grid">
        {recommendedProducts.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

