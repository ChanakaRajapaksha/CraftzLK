import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { formatRsLabel, getProductDetailPath } from "./collectionsUtils";

const IMG_FALLBACK = "/images/product_images/wooden_wine_glass.png";
/** Dummy rating for shop cards until live reviews are connected */
const DUMMY_RATING = 4;

export default function CollectionsProductCard({ product }) {
  const detailPath = getProductDetailPath(product);
  const images = product?.images?.length ? product.images : [IMG_FALLBACK];
  const primaryImage = images[0];
  const hoverImage = images[1] || primaryImage;
  const inStock = Number(product?.countInStock) > 0;
  const availableCount = Math.max(0, Number(product?.countInStock) || 0);
  const price = Number(product?.price);
  const oldPrice = Number(product?.oldPrice);
  const discount = Number(product?.discount);
  const hasDiscount = Number.isFinite(discount) && discount > 0;
  const onSale = Number.isFinite(oldPrice) && oldPrice > price;
  const rating = DUMMY_RATING;

  return (
    <article className="collections-card group">
      <div className="collections-card__shell">
        <div className="collections-card__inner">
          <div className="collections-card__image-wrap">
            <Link
              to={detailPath}
              className="collections-card__image-link"
              aria-label={`View ${product?.name}`}
            >
              <div className="collections-card__image-well">
                {hasDiscount && (
                  <span className="collections-card__save-badge">
                    Save {Math.round(discount)}%
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
              <Link to={detailPath}>{product?.name}</Link>
            </h3>

            <p className="collections-card__price-row">
              {onSale && (
                <span className="collections-card__price-old">{formatRsLabel(oldPrice)}</span>
              )}
              <span className="collections-card__price">{formatRsLabel(price)}</span>
            </p>

            {inStock && (
              <p className="collections-card__variants">
                Available in {availableCount} item{availableCount === 1 ? "" : "s"}
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
