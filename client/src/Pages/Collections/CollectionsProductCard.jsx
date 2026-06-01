import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { formatRsLabel, getVariantCount } from "./collectionsUtils";

const IMG_FALLBACK = "/images/product_images/wooden_wine_glass.png";

export default function CollectionsProductCard({ product }) {
  const productId = product?.id || product?._id;
  const images = product?.images?.length ? product.images : [IMG_FALLBACK];
  const primaryImage = images[0];
  const hoverImage = images[1] || primaryImage;
  const inStock = Number(product?.countInStock) > 0;
  const price = Number(product?.price);
  const oldPrice = Number(product?.oldPrice);
  const onSale = Number.isFinite(oldPrice) && oldPrice > price;
  const rating = Number(product?.rating) || 0;
  const variantCount = getVariantCount(product);

  return (
    <article className="collections-card group">
      <div className="collections-card__shell">
        <div className="collections-card__inner">
          <div className="collections-card__image-wrap">
            <Link
              to={`/product/${productId}`}
              className="collections-card__image-link"
              aria-label={`View ${product?.name}`}
            >
              <div className="collections-card__image-well">
                {onSale && (
                  <span className="collections-card__save-badge">
                    {product?.discount > 0
                      ? `Save ${product.discount}%`
                      : `Save ${Math.round(((oldPrice - price) / oldPrice) * 100)}%`}
                  </span>
                )}
                <img
                  src={primaryImage}
                  alt={product?.name || "Product"}
                  className="collections-card__img collections-card__img--primary"
                  loading="lazy"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.src = IMG_FALLBACK;
                  }}
                />
                {hoverImage !== primaryImage && (
                  <img
                    src={hoverImage}
                    alt=""
                    aria-hidden
                    className="collections-card__img collections-card__img--hover"
                    loading="lazy"
                    draggable={false}
                  />
                )}
              </div>
            </Link>
          </div>

          <div className="collections-card__panel">
            <h3 className="collections-card__title">
              <Link to={`/product/${productId}`}>{product?.name}</Link>
            </h3>

            <p className="collections-card__price-row">
              {onSale && (
                <span className="collections-card__price-old">{formatRsLabel(oldPrice)}</span>
              )}
              <span className="collections-card__price">{formatRsLabel(price)}</span>
            </p>

            {inStock && (
              <p className="collections-card__variants">
                Available in {variantCount} item{variantCount === 1 ? "" : "s"}
              </p>
            )}

            <div className="collections-card__rating">
              <Rating
                value={rating}
                readOnly
                size="small"
                precision={0.5}
                className="collections-card__rating-stars"
                sx={{
                  fontSize: "0.8rem",
                  "& .MuiRating-iconFilled": {
                    color: "var(--primary-dark, #b8860b)",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "#ddd",
                  },
                }}
              />
              <span className="collections-card__rating-value">{rating.toFixed(2)}</span>
            </div>

            <p
              className={`collections-card__stock${inStock ? " collections-card__stock--in" : " collections-card__stock--out"}`}
            >
              {inStock && <span className="collections-card__stock-dot" aria-hidden />}
              {inStock ? "In Stock" : "Out of Stock"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
