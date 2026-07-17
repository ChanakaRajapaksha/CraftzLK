import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { MyContext } from "../../App";
import { SAMPLE_PRODUCT_CATALOG } from "../../data/sampleProductDetails";
import {
  formatRs,
  getCartSubtotal,
  parsePriceValue,
} from "../../utils/cartHelpers";
import FixedSizeLoadingButton from "../FixedSizeLoadingButton";
import { COLLECTIONS_ALL_PATH } from "../../Pages/Collections/collectionsConstants";
import EmptyCartIcon from "./EmptyCartIcon";
import "./CartDrawer.css";

function getRecommendations(cartItems, limit = 6) {
  const inCart = new Set((cartItems ?? []).map((i) => i.productId));
  return Object.values(SAMPLE_PRODUCT_CATALOG)
    .filter((p) => !inCart.has(p.id))
    .slice(0, limit);
}

export default function CartDrawer() {
  const context = useContext(MyContext);
  const open = Boolean(context.cartDrawerOpen);
  const items = Array.isArray(context.cartData) ? context.cartData : [];
  const itemCount = items.length;
  const subtotal = getCartSubtotal(items);
  const recommendations = useMemo(() => getRecommendations(items), [items]);
  const recTrackRef = useRef(null);
  const [recCanPrev, setRecCanPrev] = useState(false);
  const [recCanNext, setRecCanNext] = useState(false);

  const syncRecArrows = () => {
    const track = recTrackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setRecCanPrev(track.scrollLeft > 4);
    setRecCanNext(track.scrollLeft < maxScroll - 4);
  };

  useEffect(() => {
    if (!open || recommendations.length === 0) return undefined;
    const track = recTrackRef.current;
    if (!track) return undefined;
    const runSync = () => syncRecArrows();
    requestAnimationFrame(runSync);
    track.addEventListener("scroll", runSync, { passive: true });
    window.addEventListener("resize", runSync);
    return () => {
      track.removeEventListener("scroll", runSync);
      window.removeEventListener("resize", runSync);
    };
  }, [open, recommendations.length]);

  const scrollRecs = (direction) => {
    const track = recTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") context.setCartDrawerOpen?.(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, context]);

  const handleBackdrop = () => context.setCartDrawerOpen?.(false);

  return (
    <div
      className={`cart-drawer${open ? " cart-drawer--open" : ""}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="cart-drawer__backdrop"
        aria-label="Close cart"
        onClick={handleBackdrop}
        tabIndex={open ? 0 : -1}
      />
      <aside
        className="cart-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden={!open}
      >
        <div className="cart-drawer__header">
          <h2 id="cart-drawer-title" className="cart-drawer__title">
            Cart • {itemCount}
          </h2>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={handleBackdrop}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <EmptyCartIcon className="cart-drawer__empty-icon" />
              <p className="cart-drawer__empty-text">Your cart is currently empty.</p>
              <Link
                to={COLLECTIONS_ALL_PATH}
                className="cart-drawer__empty-cta"
                onClick={() => context.setCartDrawerOpen?.(false)}
              >
                Start shopping
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const itemKey = item._id || item.id;
              const maxQty = item.countInStock ?? 99;
              return (
                <article key={itemKey} className="cart-drawer__item">
                  <img
                    src={item.image}
                    alt=""
                    className="cart-drawer__item-img"
                    loading="lazy"
                  />
                  <div>
                    <div className="cart-drawer__item-top">
                      <h3 className="cart-drawer__item-title">{item.productTitle}</h3>
                      <button
                        type="button"
                        className="cart-drawer__item-remove"
                        onClick={() => context.removeCartItem?.(itemKey)}
                        aria-label={`Remove ${item.productTitle}`}
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    </div>
                    <div className="cart-drawer__item-bottom">
                      <div className="cart-drawer__qty">
                        <button
                          type="button"
                          className="cart-drawer__qty-btn"
                          onClick={() =>
                            context.updateCartItemQty?.(itemKey, (item.quantity || 1) - 1)
                          }
                          disabled={(item.quantity || 1) <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-drawer__qty-value">{item.quantity || 1}</span>
                        <button
                          type="button"
                          className="cart-drawer__qty-btn"
                          onClick={() =>
                            context.updateCartItemQty?.(itemKey, (item.quantity || 1) + 1)
                          }
                          disabled={(item.quantity || 1) >= maxQty}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-drawer__item-price">
                        {formatRs(
                          item.subTotal ??
                            parsePriceValue(item.price) * (item.quantity || 1)
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {items.length > 0 && recommendations.length > 0 && (
          <section className="cart-drawer__recs" aria-label="Recommended products">
            <h3 className="cart-drawer__recs-title">We think you will love these!</h3>
            <div className="cart-drawer__recs-carousel">
              <button
                type="button"
                className="cart-drawer__recs-arrow"
                onClick={() => scrollRecs(-1)}
                disabled={!recCanPrev}
                aria-label="Previous recommendation"
              >
                ‹
              </button>
              <div className="cart-drawer__recs-viewport">
                <div ref={recTrackRef} className="cart-drawer__recs-track">
                  {recommendations.map((product) => (
                    <article key={product.id} className="cart-drawer__rec-card">
                      <div className="cart-drawer__rec-img-wrap">
                        <img
                          src={product.images?.[0]}
                          alt=""
                          className="cart-drawer__rec-img"
                          loading="lazy"
                        />
                      </div>
                      <div className="cart-drawer__rec-info">
                        <p className="cart-drawer__rec-name">{product.name}</p>
                        <p className="cart-drawer__rec-price">{product.priceDisplay}</p>
                        <FixedSizeLoadingButton
                          className="cart-drawer__rec-add"
                          isLoading={context.addingCartProductId === product.id}
                          onClick={() => context.addHomeProductToCart?.(product.id)}
                          label="Add"
                          aria-label={
                            context.addingCartProductId === product.id
                              ? "Adding to cart"
                              : `Add ${product.name} to cart`
                          }
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="cart-drawer__recs-arrow"
                onClick={() => scrollRecs(1)}
                disabled={!recCanNext}
                aria-label="Next recommendation"
              >
                ›
              </button>
            </div>
          </section>
        )}

        <footer className="cart-drawer__footer">
          <Link
            to="/checkout"
            state={{ fromCart: true }}
            className="cart-drawer__checkout"
            onClick={() => context.setCartDrawerOpen?.(false)}
            aria-disabled={items.length === 0}
            tabIndex={items.length === 0 ? -1 : 0}
            style={items.length === 0 ? { pointerEvents: "none", opacity: 0.45 } : undefined}
          >
            Checkout • {formatRs(subtotal)}
          </Link>
        </footer>
      </aside>
    </div>
  );
}
