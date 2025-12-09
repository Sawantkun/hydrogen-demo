import { ProductItem } from '~/components/ProductItem';
import { useAIRecommendations } from '~/hooks/useAIRecommendations';

/**
 * AI-powered product recommender component
 */
export function AIRecommender({
    currentProduct,
    availableProducts = [],
    userQuery,
    title = 'AI Recommendations for You',
    fallbackProducts = [],
}) {
    const { recommendedProducts, loading, error } = useAIRecommendations({
        currentProduct,
        availableProducts,
        userQuery,
        fallbackProducts,
    });

    if (loading) {
        return <LoadingState title={title} />;
    }

    if (error && recommendedProducts.length === 0) {
        return <ErrorState title={title} fallbackProducts={fallbackProducts} />;
    }

    if (recommendedProducts.length === 0) {
        return null;
    }

    return (
        <div className="ai-recommender">
            <RecommenderHeader title={title} hasError={!!error} />
            <ProductGrid products={recommendedProducts} />
        </div>
    );
}

// Extracted sub-components for better organization
function LoadingState({ title }) {
    return (
        <div className="ai-recommender">
            <h2 className="ai-recommender-title">{title}</h2>
            <div className="ai-recommender-loading">
                <p>🤖 AI is finding the perfect products for you...</p>
            </div>
        </div>
    );
}

function ErrorState({ title, fallbackProducts }) {
    return (
        <div className="ai-recommender">
            <h2 className="ai-recommender-title">{title}</h2>
            <div className="ai-recommender-error">
                <p>Unable to load AI recommendations. Showing popular products instead.</p>
            </div>
            {fallbackProducts.length > 0 && (
                <ProductGrid products={fallbackProducts.slice(0, 6)} />
            )}
        </div>
    );
}

function RecommenderHeader({ title, hasError }) {
    return (
        <div className="ai-recommender-header">
            <h2 className="ai-recommender-title">{title}</h2>
            {hasError && (
                <p className="ai-recommender-subtitle">
                    (Some recommendations may be AI-powered)
                </p>
            )}
        </div>
    );
}

function ProductGrid({ products }) {
    return (
        <div className="ai-recommender-grid">
            {products.map((product) => (
                <ProductItem key={product.id} product={product} />
            ))}
        </div>
    );
}