import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { BsCartFill } from "react-icons/bs";
import { HiOutlineShieldCheck, HiOutlineTruck, HiSparkles } from "react-icons/hi2";
import { IoExpandOutline } from "react-icons/io5";
import { getSampleProductById } from "../../data/sampleProductDetails";
import { MyContext } from "../../App";
import HomeCustomerReviewSummary from "../../Components/HomeCustomerReviewSummary";
import WriteReviewModal from "../../Components/WriteReviewModal";
import YouMayAlsoLike from "../../Components/YouMayAlsoLike";
import ProductReviewsFeed from "./ProductReviewsFeed";
import "./SampleProductDetails.css";

function TrustIcon({ id }) {
  if (id === "authentic") return <HiOutlineShieldCheck aria-hidden="true" />;
  if (id === "express") return <HiSparkles aria-hidden="true" />;
  return <HiOutlineTruck aria-hidden="true" />;
}

function StarRating({ value, count }) {
  return (
    <div className="spd-rating" aria-label={`${value} out of 5 stars from ${count} reviews`}>
      <span className="spd-rating__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= Math.round(value) ? "spd-star spd-star--filled" : "spd-star"}>
            ★
          </span>
        ))}
      </span>
      <span className="spd-rating__value">{value.toFixed(2)}</span>
      <span className="spd-rating__count">({count} reviews)</span>
    </div>
  );
}

function ReviewSummaryStars({ value }) {
  return (
    <span className="spd-reviews__stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.min(1, Math.max(0, value - (n - 1)));
        return (
          <span key={n} className="spd-reviews__star-wrap">
            <span className="spd-reviews__star spd-reviews__star--empty">★</span>
            <span
              className="spd-reviews__star spd-reviews__star--filled"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function SampleProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const product = getSampleProductById(id);

  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product?.colors?.length) {
      setActiveColor(product.colors[0].id);
      setActiveImage(0);
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  const inStock = product?.countInStock > 0;
  const images = product?.images ?? [];

  if (!product) {
    return (
      <div className="spd-not-found">
        <h1>Product not found</h1>
        <p>This sample product does not exist.</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const handleThumbnailSelect = (index) => {
    setActiveImage(index);
  };

  const handleColorSelect = (color) => {
    setActiveColor(color.id);
    const matchIndex = images.findIndex((img) => img === color.image);
    if (matchIndex >= 0) {
      setActiveImage(matchIndex);
    }
  };

  const mainImage = images[activeImage] || images[0];

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => {
    if (quantity < product.countInStock) {
      setQuantity((q) => q + 1);
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "The quantity is greater than product count in stock",
      });
    }
  };

  const addToCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    context.addToCart({
      productTitle: product.name,
      image: mainImage,
      rating: product.rating,
      price: product.price,
      quantity,
      subTotal: product.price * quantity,
      productId: product.id,
      countInStock: product.countInStock,
      userId: user?.userId,
    });
  };

  const showReviewNotice = (message) => {
    context.setAlertBox({
      open: true,
      error: false,
      msg: message,
    });
  };

  return (
    <div className="spd-page">
      <div className="spd-page__inner">
        <nav className="spd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="spd-grid">
          <div className="spd-gallery">
            <div className="spd-gallery__layout">
              <ul className="spd-thumbs" aria-label="Product image thumbnails">
                {images.map((img, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className={`spd-thumbs__btn${activeImage === index ? " spd-thumbs__btn--active" : ""}`}
                      onClick={() => handleThumbnailSelect(index)}
                    >
                      <img src={img} alt="" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="spd-preview">
                <img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  className="spd-preview__img"
                />
                <button
                  type="button"
                  className="spd-preview__expand"
                  aria-label="View full size image"
                  onClick={() => setLightboxOpen(true)}
                >
                  <IoExpandOutline aria-hidden="true" />
                </button>
              </div>
            </div>

            <ul className="spd-trust" aria-label="Product guarantees">
              {product.trustBadges.map((badge) => (
                <li key={badge.id} className="spd-trust__item">
                  <span className="spd-trust__icon">
                    <TrustIcon id={badge.id} />
                  </span>
                  <span>{badge.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="spd-info">
            <h1 className="spd-info__title">{product.name}</h1>

            <p className="spd-info__price">{product.priceDisplay}</p>

            <span className="spd-info__cash-pill">{product.cashPriceLabel}</span>

            <p className={`spd-info__stock${inStock ? "" : " spd-info__stock--out"}`}>
              {inStock
                ? `In stock — ${product.countInStock} available`
                : "Out of stock"}
            </p>

            <StarRating value={product.rating} count={product.reviewCount} />

            <section className="spd-desc" aria-labelledby="spd-desc-heading">
              <button
                type="button"
                id="spd-desc-heading"
                className="spd-desc__toggle"
                onClick={() => setDescOpen((v) => !v)}
                aria-expanded={descOpen}
              >
                Short Description
                <span className={`spd-desc__chevron${descOpen ? " spd-desc__chevron--open" : ""}`} aria-hidden="true">
                  ›
                </span>
              </button>

              {descOpen && (
                <div className="spd-desc__body">
                  <ul>
                    {product.shortDescription.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="spd-desc__note">{product.shortDescription.disclaimer}</p>
                </div>
              )}
            </section>

            {product.colors?.length > 1 && (
              <div className="spd-colors">
                <p className="spd-colors__label">
                  Color:{" "}
                  <strong>
                    {product.colors.find((c) => c.id === activeColor)?.label ?? "Default"}
                  </strong>
                </p>
                <ul className="spd-colors__list">
                  {product.colors.map((color) => (
                    <li key={color.id}>
                      <button
                        type="button"
                        className={`spd-colors__swatch${activeColor === color.id ? " spd-colors__swatch--active" : ""}`}
                        onClick={() => handleColorSelect(color)}
                        aria-label={color.label}
                      >
                        <img src={color.image} alt="" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="spd-qty">
              <span className="spd-qty__label">Quantity</span>
              <div className="spd-qty__control">
                <button type="button" onClick={decreaseQty} aria-label="Decrease quantity">
                  <FaMinus aria-hidden="true" />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={inStock ? increaseQty : undefined}
                  disabled={!inStock}
                  aria-label="Increase quantity"
                >
                  <FaPlus aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="spd-add-cart"
              onClick={addToCart}
              disabled={!inStock}
            >
              <BsCartFill aria-hidden="true" />
              Add to cart
            </button>

            <button type="button" className="spd-back" onClick={() => navigate(-1)}>
              ← Continue shopping
            </button>
          </div>
        </div>

        <section className="spd-details" aria-labelledby="spd-details-heading">
          <h2 id="spd-details-heading" className="spd-details__title">
            Product details
          </h2>

          <div className="spd-details__tabs" role="tablist" aria-label="Product detail sections">
            <span id="spd-details-tab-desc" className="spd-details__tab spd-details__tab--active" role="tab" aria-selected="true">
              Description
            </span>
          </div>

          <div className="spd-details__panel" role="tabpanel" aria-labelledby="spd-details-tab-desc">
            <ul className="spd-details__list">
              {product.detailedDescription.map(({ title, text }) => (
                <li key={title}>
                  <strong>{title}:</strong> {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="spd-reviews" aria-labelledby="spd-reviews-heading">
          <h2 id="spd-reviews-heading" className="spd-reviews__title">
            Customer Reviews
          </h2>

          <div className="spd-reviews__layout">
            <div className="spd-reviews__summary">
              <div className="spd-reviews__score-row">
                <ReviewSummaryStars value={product.rating} />
                <button type="button" className="spd-reviews__score-link">
                  {product.rating.toFixed(2)} out of 5
                </button>
              </div>
              <p className="spd-reviews__count">
                Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="spd-reviews__divider" aria-hidden="true" />

            <div className="spd-reviews__actions">
              <button
                type="button"
                className="spd-reviews__btn spd-reviews__btn--primary"
                onClick={() => setWriteReviewOpen(true)}
              >
                Write a review
              </button>
              <button
                type="button"
                className="spd-reviews__btn spd-reviews__btn--outline"
                onClick={() => showReviewNotice("Questions feature will be available soon.")}
              >
                Ask a question
              </button>
            </div>
          </div>

          <ProductReviewsFeed />

          <HomeCustomerReviewSummary variant="product" />
        </section>

        <YouMayAlsoLike currentProductId={product.id} />
      </div>

      <WriteReviewModal
        open={writeReviewOpen}
        onClose={() => setWriteReviewOpen(false)}
        product={{ name: product.name, image: mainImage }}
      />

      {createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              className="spd-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={`Full size view of ${product.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <button
                type="button"
                className="spd-lightbox__backdrop"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close full size image"
              />

              <motion.div
                className="spd-lightbox__panel"
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  className="spd-lightbox__close"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>

                <img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  className="spd-lightbox__img"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
