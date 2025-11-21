import {useLoaderData} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

const BUNDLE_BY_HANDLE_QUERY = `#graphql
  query BundleByHandle($handle: String!) {
    metaobject(handle: {handle: $handle, type: "bundle"}) {
      id
      handle
      fields {
        key
        value
        type
        reference {
          __typename
          ... on Product {
            id
            handle
            title
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              nodes {
                id
                availableForSale
                title
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
          ... on MediaImage {
            id
            image {
              url
              altText
            }
          }
          ... on GenericFile {
            id
            url
            alt
          }
        }
        references(first: 20) {
          nodes {
            __typename
            ... on Product {
              id
              handle
              title
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                nodes {
                  id
                  availableForSale
                  title
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

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

function formatImageReference(reference) {
  if (!reference) return null;

  if (reference.__typename === 'MediaImage') {
    const url = reference.image?.url ?? null;
    if (!url) return null;
    return {
      url,
      altText: reference.image?.altText ?? '',
    };
  }

  if (reference.__typename === 'GenericFile') {
    if (!reference.url) return null;
    return {
      url: reference.url,
      altText: reference.alt ?? '',
    };
  }

  return null;
}

function formatBundleFields(fields) {
  return fields.reduce((acc, field) => {
    if (field.key === 'products') {
      return acc;
    }

    if (field.type === 'rich_text_field') {
      acc[field.key] = extractPlainText(field.value);
      return acc;
    }

    if (field.type === 'file_reference') {
      const image = formatImageReference(field.reference);
      if (image) {
        acc[field.key] = image;
        return acc;
      }
    }

    acc[field.key] = field.value;
    return acc;
  }, {});
}

function isProductReference(reference) {
  return reference?.__typename === 'Product';
}

function normalizeProduct(reference) {
  const firstVariant = reference?.variants?.nodes?.[0] ?? null;
  return {
    ...reference,
    firstVariant,
  };
}

function isProductField(field) {
  if (!field?.type) return false;
  return field.type === 'product_reference' || field.type === 'list.product_reference';
}

function collectProducts(fields) {
  const products = [];

  for (const field of fields) {
    if (!isProductField(field)) continue;

    if (isProductReference(field.reference)) {
      products.push(field.reference);
    }

    const listNodes =
      field.references?.nodes ??
      field.references?.edges?.map((edge) => edge?.node).filter(Boolean) ??
      [];
    for (const node of listNodes) {
      if (isProductReference(node)) {
        products.push(node);
      }
    }
  }

  return products.map(normalizeProduct);
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({params, context}) {
  const {handle} = params;

  const data = await context.storefront.query(BUNDLE_BY_HANDLE_QUERY, {
    variables: {handle},
  });

  if (!data.metaobject) {
    throw new Response('Bundle not found', {status: 404});
  }

  const meta = data.metaobject;

  const fieldsObject = formatBundleFields(meta.fields);
  const products = collectProducts(meta.fields);

  const bundle = {
    id: meta.id,
    handle: meta.handle,
    ...fieldsObject,
  };

  const subtotal = products.reduce((sum, p) => {
    const price = parseFloat(p.priceRange.minVariantPrice.amount);
    return sum + (Number.isNaN(price) ? 0 : price);
  }, 0);

  let bundlePrice = subtotal;
  let savingsLabel = '';

  if (bundle.bundle_type === 'fixed_price') {
    bundlePrice = parseFloat(bundle.discount_value);
    const savings = subtotal - bundlePrice;
    if (savings > 0) {
      savingsLabel = `You save ${savings.toFixed(0)}`;
    }
  }

  if (bundle.bundle_type === 'percentage') {
    const discountPercent = parseFloat(bundle.discount_value);
    if (!Number.isNaN(discountPercent)) {
      const savings = (subtotal * discountPercent) / 100;
      bundlePrice = subtotal - savings;
      savingsLabel = `You save ${discountPercent.toFixed(0)}%`;
    }
  }

  const pricing = {
    subtotal,
    bundlePrice,
    savingsLabel,
  };

  return {
    bundle,
    products,
    pricing,
  };
}

export default function BundleDetail() {
  /** @type {LoaderReturnData} */
  const {bundle, products, pricing} = useLoaderData();
  const {open} = useAside();

  const currency = products[0]?.priceRange.minVariantPrice.currencyCode;
  const cartLines = products
    .map((product) => {
      const variant = product.firstVariant;
      if (!variant?.id || !variant.availableForSale) return null;
      return {
        merchandiseId: variant.id,
        quantity: 1,
        attributes: [
          {key: 'bundleId', value: bundle.id},
          {key: 'bundleHandle', value: bundle.handle},
        ],
      };
    })
    .filter(Boolean);
  const hasUnavailableProducts = cartLines.length !== products.length;

  return (
    <div className="px-6 py-10 mx-auto max-w-5xl space-y-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Left: image and overview */}
        <div className="space-y-4">
          {bundle.image?.url ? (
            <img
              src={bundle.image.url}
              alt={bundle.image.altText || bundle.title}
              className="object-cover w-full rounded-xl"
            />
          ) : (
            <div className="w-full h-64 rounded-xl bg-neutral-100" />
          )}

          <h1 className="mt-4 text-3xl font-semibold">{bundle.title}</h1>

          {bundle.description && (
            <p className="mt-2 text-sm text-neutral-600">
              {bundle.description}
            </p>
          )}
        </div>

        {/* Right: pricing and CTA */}
        <div className="space-y-4 p-4 border rounded-xl bg-neutral-50">
          <p className="text-sm text-neutral-500">
            Items total:{' '}
            {pricing.subtotal.toFixed(0)}
            {currency ? ` ${currency}` : ''}
          </p>

          <h2 className="text-2xl font-semibold">
            Bundle price:{' '}
            {pricing.bundlePrice.toFixed(0)}
            {currency ? ` ${currency}` : ''}
          </h2>

          {pricing.savingsLabel && (
            <p className="mt-1 text-sm text-emerald-600">
              {pricing.savingsLabel}
            </p>
          )}

          <AddToCartButton
            analytics={{
              bundleId: bundle.id,
              bundleHandle: bundle.handle,
              bundleTitle: bundle.title,
            }}
            disabled={!cartLines.length}
            lines={cartLines}
            onClick={() => open('cart')}
          >
            {cartLines.length ? 'Add Bundle to Cart' : 'Bundle unavailable'}
          </AddToCartButton>

          {hasUnavailableProducts && (
            <p className="mt-2 text-xs text-amber-600">
              Some products are currently unavailable.
            </p>
          )}
        </div>
      </div>

      {/* Products in this bundle */}
      <section className="mt-10 space-y-4">
        <h3 className="text-lg font-semibold">What&apos;s included</h3>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 pb-3 border-b"
            >
              {product.featuredImage?.url ? (
                <img
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  className="object-cover w-16 h-16 rounded-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-md bg-neutral-100" />
              )}

              <div className="flex-1">
                <p className="text-sm font-medium">{product.title}</p>
                <p className="text-xs text-neutral-500">
                  {product.priceRange.minVariantPrice.amount}{' '}
                  {product.priceRange.minVariantPrice.currencyCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/bundles.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */


