import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { BsCartFill } from "react-icons/bs";
import { HiOutlineShieldCheck, HiOutlineTruck, HiSparkles } from "react-icons/hi2";
import { IoChevronDown, IoChevronUp, IoExpandOutline } from "react-icons/io5";
import { getSampleProductById, isSampleProductId } from "../../data/sampleProductDetails";
import { MyContext } from "../../App";
import FixedSizeLoadingButton from "../../Components/FixedSizeLoadingButton";
import HomeCustomerReviewSummary from "../../Components/HomeCustomerReviewSummary";
import WriteReviewModal from "../../Components/WriteReviewModal";
import AskQuestionModal from "../../Components/AskQuestionModal";
import YouMayAlsoLike from "../../Components/YouMayAlsoLike";
import { fetchDataFromApi } from "../../utils/api";
import { parseProductReviewsResponse } from "../../utils/productReviewUtils";
import { useAppSelector } from "../../store/hooks";
import ProductReviewsFeed from "./ProductReviewsFeed";
import {
  formatPriceDisplay,
  isValidApiProduct,
  mapApiProductToDetailsView,
} from "./mapApiProductToDetailsView";
import "./SampleProductDetails.css";

function isVariantOutOfStock(variant) {
  const status = variant?.stockStatus || "in_stock";
  if (status === "out_of_stock") return true;
  if (status === "pre_order") return false;
  if (variant?.stock !== undefined) return Number(variant.stock) <= 0;
  return false;
}

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
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewAverage, setReviewAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewStickyCard, setShowReviewStickyCard] = useState(false);
  const [reviewStickyExpanded, setReviewStickyExpanded] = useState(false);
  const reviewsSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!isAuthInitialized) return undefined;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setProduct(null);
      setActiveImage(0);
      setActiveColor(null);
      setQuantity(1);
      setProductReviews([]);
      setReviewAverage(0);
      setReviewCount(0);

      if (isSampleProductId(id)) {
        const sample = getSampleProductById(id);
        if (!cancelled) {
          if (sample) {
            setProduct({
              ...sample,
              rating: 0,
              reviewCount: 0,
              hasVariants: Array.isArray(sample.colors) && sample.colors.length > 0,
            });
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetchDataFromApi(`/api/products/${id}`);
        if (cancelled) return;

        if (isValidApiProduct(res)) {
          const mapped = mapApiProductToDetailsView(res);
          if (mapped) {
            setProduct(mapped);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthInitialized]);

  const loadProductReviews = useCallback(async (productId) => {
    if (!productId) return;

    setReviewsLoading(true);
    try {
      const res = await fetchDataFromApi(
        `/api/productReviews?productId=${encodeURIComponent(productId)}`
      );
      const { reviews, averageRating, reviewCount: totalReviews } =
        parseProductReviewsResponse(res);

      setProductReviews(reviews);
      setReviewAverage(averageRating);
      setReviewCount(totalReviews);
    } catch {
      setProductReviews([]);
      setReviewAverage(0);
      setReviewCount(0);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!product?.id) return;
    loadProductReviews(product.id);
  }, [product?.id, loadProductReviews]);

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

  useEffect(() => {
    const section = reviewsSectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowReviewStickyCard(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setReviewStickyExpanded(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [product]);

  if (loading) {
    return (
      <div className="spd-page">
        <div className="spd-page__inner">
          <p className="spd-not-found" style={{ padding: "3rem 1rem" }}>
            Loading product…
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="spd-not-found">
        <h1>Product not found</h1>
        <p>This product does not exist or is no longer available.</p>
        <Link to="/collections/all">Back to shop</Link>
      </div>
    );
  }

  const images = product.images ?? [];
  const shortBullets = product.shortDescription?.bullets || [];
  const detailedDescription = product.detailedDescription || [];
  const showVariants = Boolean(product.hasVariants) && (product.colors?.length || 0) > 0;

  const handleThumbnailSelect = (index) => {
    setActiveImage(index);
  };

  const handleColorSelect = (color) => {
    setActiveColor(color.id);
    const matchIndex = images.findIndex((img) => img === color.image);
    if (matchIndex >= 0) {
      setActiveImage(matchIndex);
    }
    const nextStock =
      color.stock !== undefined ? Number(color.stock) : product.countInStock;
    setQuantity((q) => (nextStock > 0 ? Math.min(q, nextStock) : 1));
  };

  const mainImage = images[activeImage] || images[0];

  const selectedVariant = showVariants
    ? product.colors.find((c) => c.id === activeColor) || null
    : null;
  const hasVariantPrice = Number(selectedVariant?.price) > 0;
  const activePrice = hasVariantPrice ? Number(selectedVariant.price) : product.price;
  const activePriceDisplay = hasVariantPrice
    ? formatPriceDisplay(activePrice)
    : product.priceDisplay;
  const useVariantStock = showVariants && selectedVariant && selectedVariant.stock !== undefined;
  const activeStock = useVariantStock ? Number(selectedVariant.stock) : product.countInStock;
  const activeStockStatus = showVariants && selectedVariant
    ? selectedVariant.stockStatus || "in_stock"
    : product.stockStatus || "in_stock";
  const inStock =
    activeStockStatus === "pre_order"
      ? true
      : activeStockStatus === "out_of_stock"
        ? false
        : activeStock > 0;
  const stockLabel =
    activeStockStatus === "pre_order"
      ? "Pre order"
      : inStock
        ? `In stock — ${activeStock} available`
        : "Out of stock";

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => {
    if (quantity < activeStock) {
      setQuantity((q) => q + 1);
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "The quantity is greater than product count in stock",
      });
    }
  };

  const isAddingToCart =
    context.addingInCart &&
    (context.addingCartProductId == null || context.addingCartProductId === product.id);

  const addToCart = () => {
    context.addToCart(
      {
        productTitle: selectedVariant?.label
          ? `${product.name} — ${selectedVariant.label}`
          : product.name,
        image: selectedVariant?.image || mainImage,
        rating: reviewAverage,
        price: activePrice,
        quantity,
        subTotal: activePrice * quantity,
        productId: product.id,
        variantLabel: selectedVariant?.label || "",
        variantSku: selectedVariant?.id || "",
        countInStock: activeStock,
        userId: context.user?.userId,
      },
      { openDrawer: true, localOnly: isSampleProductId(product.id) }
    );
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
              {(product.trustBadges || []).map((badge) => (
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

            <p className="spd-info__price">{activePriceDisplay}</p>

            <span className="spd-info__cash-pill">{product.cashPriceLabel}</span>

            <p className={`spd-info__stock${inStock ? "" : " spd-info__stock--out"}`}>
              {stockLabel}
            </p>

            <StarRating value={reviewAverage} count={reviewCount} />

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
                  {shortBullets.length > 0 ? (
                    <ul>
                      {shortBullets.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No short description available.</p>
                  )}
                  {product.shortDescription?.disclaimer && (
                    <p className="spd-desc__note">{product.shortDescription.disclaimer}</p>
                  )}
                </div>
              )}
            </section>

            {showVariants && (
              <div className="spd-colors">
                <p className="spd-colors__label">
                  {product.variantGroupName || "Color"}:{" "}
                  <strong>{selectedVariant?.label ?? "Default"}</strong>
                </p>
                <ul className="spd-colors__list">
                  {product.colors.map((color) => {
                    const outOfStock = isVariantOutOfStock(color);
                    return (
                    <li key={color.id}>
                      <button
                        type="button"
                        className={`spd-colors__swatch${activeColor === color.id ? " spd-colors__swatch--active" : ""}${outOfStock ? " spd-colors__swatch--out-of-stock" : ""}`}
                        onClick={() => handleColorSelect(color)}
                        aria-label={outOfStock ? `${color.label} (out of stock)` : color.label}
                      >
                        <img src={color.image} alt="" />
                      </button>
                    </li>
                    );
                  })}
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

            <FixedSizeLoadingButton
              className="spd-add-cart"
              isLoading={isAddingToCart}
              onClick={addToCart}
              disabled={!inStock}
              leading={<BsCartFill aria-hidden="true" />}
              label="Add to cart"
              aria-label={isAddingToCart ? "Adding to cart" : "Add to cart"}
            />

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
            {detailedDescription.length > 0 ? (
              <ul className="spd-details__list">
                {detailedDescription.map(({ title, text }, index) => (
                  <li key={`${title}-${index}`}>
                    {title ? (
                      <>
                        <strong>{title}:</strong> {text}
                      </>
                    ) : (
                      text
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No description available.</p>
            )}
          </div>
        </section>

        <section
          ref={reviewsSectionRef}
          className="spd-reviews"
          aria-labelledby="spd-reviews-heading"
        >
          <h2 id="spd-reviews-heading" className="spd-reviews__title">
            Customer Reviews
          </h2>

          <div className="spd-reviews__layout">
            <div className="spd-reviews__summary">
              <div className="spd-reviews__score-row">
                <ReviewSummaryStars value={reviewAverage} />
                <button type="button" className="spd-reviews__score-link">
                  {reviewAverage.toFixed(2)} out of 5
                </button>
              </div>
              <p className="spd-reviews__count">
                Based on {reviewCount} review{reviewCount === 1 ? "" : "s"}
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
                onClick={() => setAskQuestionOpen(true)}
              >
                Ask a question
              </button>
            </div>
          </div>

          <ProductReviewsFeed reviews={productReviews} loading={reviewsLoading} />

          <HomeCustomerReviewSummary variant="product" />
        </section>

        <YouMayAlsoLike currentProductId={product.id} />
      </div>

      <WriteReviewModal
        open={writeReviewOpen}
        onClose={() => setWriteReviewOpen(false)}
        product={{ id: product.id, name: product.name, image: mainImage }}
        onSubmitted={() => loadProductReviews(product.id)}
      />
      <AskQuestionModal
        open={askQuestionOpen}
        onClose={() => setAskQuestionOpen(false)}
        onSubmit={({ displayName }) => {
          setAskQuestionOpen(false);
          context.setAlertBox({
            open: true,
            error: false,
            msg: `Thanks${displayName ? `, ${displayName}` : ""}! Your question has been submitted.`,
          });
        }}
      />

      <AnimatePresence>
        {showReviewStickyCard && (
          <motion.aside
            className={`spd-review-sticky${reviewStickyExpanded ? " spd-review-sticky--expanded" : ""}`}
            initial={{ opacity: 0, y: 36, x: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, x: 22, scale: 0.96 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Quick product card"
          >
            <div className="spd-review-sticky__head">
              <img
                src={selectedVariant?.image || mainImage}
                alt={product.name}
                className="spd-review-sticky__img"
              />
              <div className="spd-review-sticky__meta">
                <p className="spd-review-sticky__name">{product.name}</p>
                <p className="spd-review-sticky__price">{activePriceDisplay}</p>
              </div>
              <button
                type="button"
                className="spd-review-sticky__toggle"
                onClick={() => setReviewStickyExpanded((prev) => !prev)}
                aria-label={reviewStickyExpanded ? "Collapse quick cart" : "Expand quick cart"}
                aria-expanded={reviewStickyExpanded}
              >
                {reviewStickyExpanded ? <IoChevronUp aria-hidden /> : <IoChevronDown aria-hidden />}
              </button>
            </div>

            <div
              className={`spd-review-sticky__body${reviewStickyExpanded ? " is-open" : ""}${showVariants ? " spd-review-sticky__body--with-variants" : ""}`}
              aria-hidden={!reviewStickyExpanded}
            >
              {showVariants && (
                <div className="spd-review-sticky__variants">
                  <p className="spd-review-sticky__variants-label">
                    {product.variantGroupName || "Color"}:{" "}
                    <strong>{selectedVariant?.label ?? "Default"}</strong>
                  </p>
                  <ul className="spd-review-sticky__variants-list" aria-label="Product variants">
                    {product.colors.map((color) => {
                      const optionPrice =
                        Number(color.price) > 0
                          ? formatPriceDisplay(color.price)
                          : product.priceDisplay;
                      const outOfStock = isVariantOutOfStock(color);
                      return (
                        <li key={color.id}>
                          <button
                            type="button"
                            className={`spd-review-sticky__swatch${activeColor === color.id ? " spd-review-sticky__swatch--active" : ""}${outOfStock ? " spd-review-sticky__swatch--out-of-stock" : ""}`}
                            onClick={() => handleColorSelect(color)}
                            tabIndex={reviewStickyExpanded ? 0 : -1}
                            aria-label={outOfStock ? `${color.label}, ${optionPrice} (out of stock)` : `${color.label}, ${optionPrice}`}
                            title={outOfStock ? `${color.label} — ${optionPrice} (out of stock)` : `${color.label} — ${optionPrice}`}
                          >
                            <img src={color.image} alt="" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <FixedSizeLoadingButton
                className="spd-review-sticky__add-cart"
                isLoading={isAddingToCart}
                onClick={addToCart}
                disabled={!inStock}
                tabIndex={reviewStickyExpanded ? 0 : -1}
                leading={<BsCartFill aria-hidden="true" />}
                label="Add to cart"
                aria-label={isAddingToCart ? "Adding to cart" : "Add to cart"}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

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
