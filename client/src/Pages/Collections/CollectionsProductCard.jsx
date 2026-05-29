import { useState } from "react";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { formatRs } from "./collectionsUtils";

const IMG_FALLBACK = "/images/product_images/wooden_wine_glass.png";

export default function CollectionsProductCard({ product, onQuickReview }) {
  const [hovered, setHovered] = useState(false);
  const productId = product?.id || product?._id;
  const images = product?.images?.length ? product.images : [IMG_FALLBACK];
  const primaryImage = images[0];
  const hoverImage = images[1] || primaryImage;
  const inStock = Number(product?.countInStock) > 0;
  const price = Number(product?.price);
  const oldPrice = Number(product?.oldPrice);
  const onSale = Number.isFinite(oldPrice) && oldPrice > price;
  const saveAmount = onSale ? oldPrice - price : 0;

  const openQuickReview = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onQuickReview?.(productId);
  };

  return (
    <article
      className={`collections-card${hovered ? " collections-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="collections-card__shell">
        <div className="collections-card__inner">
          <div className="collections-card__image-wrap">
            <Link
              to={`/product/${productId}`}
              className="collections-card__image-link"
              aria-label={`View ${product?.name}`}
            >
              <div className="collections-card__image-well">
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

            {onSale && product?.discount > 0 && (
              <span className="collections-card__badge">Save {product.discount}%</span>
            )}
          </div>

          <button
            type="button"
            className="collections-card__quick-review"
            onClick={openQuickReview}
            aria-label={`Quick review ${product?.name}`}
          >
            Quick Review
          </button>

          <div className="collections-card__panel">
            {onSale && saveAmount > 0 && (
              <span className="collections-card__save-pill">
                Save Rs {formatRs(saveAmount)}
              </span>
            )}

            <h3 className="collections-card__title">
              <Link to={`/product/${productId}`}>{product?.name}</Link>
            </h3>

            <p className="collections-card__price-row">
              {onSale && (
                <span className="collections-card__price-old">Rs {formatRs(oldPrice)}</span>
              )}
              <span className="collections-card__price">Rs {formatRs(price)}</span>
            </p>

            <div className="collections-card__meta">
              <Rating
                value={Number(product?.rating) || 0}
                readOnly
                size="small"
                precision={0.5}
              />
              <span
                className={`collections-card__stock${inStock ? " collections-card__stock--in" : ""}`}
              >
                <span className="collections-card__stock-dot" aria-hidden />
                {inStock ? "In stock" : "Out of stock"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
