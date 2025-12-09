import { Link, useNavigate } from 'react-router';
import { AddToCartButton } from './AddToCartButton';
import { useAside } from './Aside';

export function ProductForm({ productOptions, selectedVariant }) {
  const navigate = useNavigate();
  const { open } = useAside();

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <ProductOption key={option.name} option={option} navigate={navigate} />
        );
      })}
      <AddToCartButton
        disabled={!selectedVariant?.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [{ merchandiseId: selectedVariant.id, quantity: 1, selectedVariant }]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

// Extracted sub-component
function ProductOption({ option, navigate }) {
  return (
    <div className="product-options" key={option.name}>
      <h5>{option.name}</h5>
      <div className="product-options-grid">
        {option.optionValues.map((value) =>
          value.isDifferentProduct ? (
            <ProductOptionLink key={option.name + value.name} value={value} />
          ) : (
            <ProductOptionButton
              key={option.name + value.name}
              optionName={option.name}
              value={value}
              navigate={navigate}
            />
          ),
        )}
      </div>
      <br />
    </div>
  );
}

// Product option as link (for different products)
function ProductOptionLink({ value }) {
  const { name, handle, variantUriQuery, selected, available, swatch } = value;

  const className = [
    'product-options-item',
    selected ? 'product-options-item--selected' : 'product-options-item--unselected',
    available ? 'product-options-item--available' : 'product-options-item--unavailable',
  ].join(' ');

  return (
    <Link
      className={className}
      prefetch="intent"
      preventScrollReset
      replace
      to={`/products/${handle}?${variantUriQuery}`}
    >
      <ProductOptionSwatch swatch={swatch} name={name} />
    </Link>
  );
}

// Product option as button (for same product)
function ProductOptionButton({ optionName, value, navigate }) {
  const { name, variantUriQuery, selected, available, exists, swatch } = value;

  const className = [
    'product-options-item',
    exists && !selected ? 'link' : '',
    selected ? 'product-options-item--selected' : 'product-options-item--unselected',
    available ? 'product-options-item--available' : 'product-options-item--unavailable',
  ].join(' ');

  return (
    <button
      type="button"
      className={className}
      disabled={!exists}
      onClick={() => {
        if (!selected) {
          navigate(`?${variantUriQuery}`, {
            replace: true,
            preventScrollReset: true,
          });
        }
      }}
    >
      <ProductOptionSwatch swatch={swatch} name={name} />
    </button>
  );
}

function ProductOptionSwatch({ swatch, name }) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{ backgroundColor: color || 'transparent' }}
    >
      {image && <img src={image} alt={name} />}
    </div>
  );
}