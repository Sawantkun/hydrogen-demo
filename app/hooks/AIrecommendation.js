import { useState, useEffect } from 'react';
import { PRODUCT_LIMITS } from '~/lib/constants';

/**
 * Custom hook for fetching AI-powered product recommendations
 * @param {Object} options - Configuration options
 * @returns {Object} Recommendations state
 */
export function useAIRecommendations({
    currentProduct,
    availableProducts = [],
    userQuery,
    fallbackProducts = [],
}) {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchRecommendations() {
            if (availableProducts.length === 0) {
                setRecommendedProducts(
                    fallbackProducts.slice(0, PRODUCT_LIMITS.AI_RECOMMENDATIONS),
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        currentProductTitle: currentProduct?.title,
                        currentProductDescription: currentProduct?.description,
                        availableProducts: availableProducts.map(normalizeProduct),
                        userQuery,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                const recommended = mapRecommendations(
                    data.recommendations || [],
                    availableProducts,
                    fallbackProducts,
                );

                setRecommendedProducts(recommended);
            } catch (err) {
                if (err.name === 'AbortError') return;

                console.error('Error fetching AI recommendations:', err);
                setError(err.message);
                setRecommendedProducts(
                    fallbackProducts.slice(0, PRODUCT_LIMITS.AI_RECOMMENDATIONS),
                );
            } finally {
                setLoading(false);
            }
        }

        fetchRecommendations();

        return () => controller.abort();
    }, [
        currentProduct?.title,
        currentProduct?.description,
        availableProducts,
        userQuery,
        fallbackProducts,
    ]);

    return { recommendedProducts, loading, error };
}

/**
 * Normalize product data for API
 */
function normalizeProduct(product) {
    return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        priceRange: product.priceRange,
        vendor: product.vendor,
    };
}

/**
 * Map recommendation handles to product objects
 */
function mapRecommendations(handles, availableProducts, fallbackProducts) {
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
    if (recommended.length < PRODUCT_LIMITS.MIN_RECOMMENDATIONS && fallbackProducts.length > 0) {
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