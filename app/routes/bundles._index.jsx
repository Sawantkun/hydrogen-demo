import {useLoaderData} from 'react-router';

const BUNDLES_QUERY = `#graphql
  query BUNDLES_QUERY {
    metaobjects(type: "bundle", first: 20) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;

export async function loader({context}) {
  const data = await context.storefront.query(BUNDLES_QUERY);
  return data.metaobjects.nodes;
}

function extractPlainText(value) {
  if (!value) return '';

  try {
    const richText = JSON.parse(value);

    const walk = (node) => {
      if (!node) return '';

      if (node.type === 'text') {
        return node.value || '';
      }

      if (Array.isArray(node.children)) {
        return node.children.map(walk).join(' ');
      }

      return '';
    };

    return walk(richText).replace(/\s+/g, ' ').trim();
  } catch (error) {
    return value;
  }
}

function formatBundleFields(bundle) {
  const formatted = Object.fromEntries(
    bundle.fields.map((field) => [field.key, field.value]),
  );

  return {
    ...formatted,
    title: formatted.title || 'Untitled bundle',
    description: extractPlainText(formatted.description),
  };
}

export default function BundlesIndex() {
  const bundles = useLoaderData();

  if (!bundles?.length) {
    return <div className="p-8">No bundles available yet.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">Bundles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {bundles.map((bundle) => {
          const formatted = formatBundleFields(bundle);
          const isPercentage = formatted.bundle_type === 'percentage';
          const isFixedPrice = formatted.bundle_type === 'fixed_price';

          return (
            <article
              key={bundle.id}
              className="relative rounded-2xl border border-neutral-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute inset-x-4 -top-4 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-black/90 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                  {formatted.bundle_type === 'percentage'
                    ? 'Smart Saver'
                    : formatted.bundle_type === 'fixed_price'
                    ? 'Flat Price'
                    : 'Custom Bundle'}
                </span>
                {formatted.discount_value && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                    {isPercentage
                      ? `Save ${formatted.discount_value}%`
                      : isFixedPrice
                      ? `₹${formatted.discount_value}`
                      : 'Tailored offer'}
                  </span>
                )}
              </div>

              {formatted.image ? (
                <img
                  src={formatted.image}
                  alt={formatted.title}
                  className="h-48 w-full rounded-t-2xl object-cover"
                />
              ) : (
                <div className="h-48 w-full rounded-t-2xl bg-linear-to-br from-neutral-100 via-neutral-50 to-white" />
              )}

              <div className="flex flex-col gap-4 p-6">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">
                    {formatted.title}
                  </h2>
                  {formatted.subtitle && (
                    <p className="text-sm font-medium text-blue-600">
                      {formatted.subtitle}
                    </p>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-neutral-600">
                  {formatted.description || 'Handpicked products curated for you.'}
                </p>

                <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                  <p className="font-semibold">
                    {isPercentage
                      ? `Bundle & save ${formatted.discount_value}%`
                      : isFixedPrice
                      ? `Bundle price ₹${formatted.discount_value}`
                      : 'Build your own mix'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Estimated savings compared to individual prices
                  </p>
                </div>

                <a
                  href={`/bundles/${bundle.handle}`}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  View Bundle →
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}


