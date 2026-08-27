import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { FaPencilAlt } from "react-icons/fa";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ProductController from "../../../controllers/product.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { parseShortDescriptionBullets, parseDescriptionPoints } from "./productFormDefaults";

function getShortDescriptionBullets(value) {
  return parseShortDescriptionBullets(value).filter(Boolean);
}

function getDescriptionPoints(value) {
  return parseDescriptionPoints(value).filter((point) => point.title || point.text);
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatList(value) {
  if (!value) return "—";
  if (Array.isArray(value)) {
    const items = value.filter(Boolean);
    return items.length ? items.join(", ") : "—";
  }
  return String(value);
}

function formatLocation(value) {
  if (!value) return "—";
  if (Array.isArray(value)) {
    const labels = value.map((item) => (typeof item === "object" ? item.label || item.value : item)).filter(Boolean);
    return labels.length ? labels.join(", ") : "—";
  }
  return String(value);
}

function stockStatusLabel(status) {
  if (status === "out_of_stock") return "Out of stock";
  if (status === "pre_order") return "Pre-order";
  return "In stock";
}

function isValidProduct(data) {
  return Boolean(
    data &&
      typeof data === "object" &&
      !data.response &&
      !data.message?.includes?.("not found") &&
      (data._id || data.id || data.name)
  );
}

function DetailItem({ label, value, children }) {
  return (
    <div className="admin-dash__detail-item">
      <dt>{label}</dt>
      <dd>{children ?? value ?? "—"}</dd>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="admin-dash__panel admin-dash__product-view-section">
      <h2 className="admin-dash__panel-title">{title}</h2>
      {children}
    </section>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setNotFound(false);
      setProduct(null);
      setActiveImage(0);

      const res = await ProductController.getById(id);
      if (cancelled) return;

      if (isValidProduct(res)) {
        setProduct(res);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = useMemo(() => (product?.images || []).filter(Boolean), [product]);
  const mainImage = images[activeImage] || images[0];

  if (loading) {
    return (
      <div className="admin-dash__product-view-loading">
        <p className="admin-dash__subtitle">Loading product details…</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <AdminPageHeader
          title="Product not found"
          breadcrumbs={[
            { label: "Products", to: `${ADMIN_BASE}/products` },
            { label: "Details" },
          ]}
        />
        <section className="admin-dash__panel admin-dash__product-view-empty">
          <p>We could not find a product with this ID.</p>
          <Link to={`${ADMIN_BASE}/products`} className="admin-dash__btn">
            Back to product list
          </Link>
        </section>
      </>
    );
  }

  const isActive = (product.status || "active") === "active";
  const stock = Number(product.countInStock ?? 0);
  const minAlert = Number(product.minStockAlert ?? 5);
  const stockClass =
    stock <= 0
      ? "admin-dash__stock-pill--out"
      : stock <= minAlert
        ? "admin-dash__stock-pill--low"
        : "";

  return (
    <>
      <AdminPageHeader
        title={product.name}
        subtitle={getShortDescriptionBullets(product.shortDescription)[0] || product.sku || undefined}
        breadcrumbs={[
          { label: "Products", to: `${ADMIN_BASE}/products` },
          { label: "Details" },
        ]}
        action={
          <div className="admin-dash__product-view-actions">
            <Link to={`${ADMIN_BASE}/products`} className="admin-dash__btn admin-dash__btn--ghost">
              Back to list
            </Link>
            <Link to={`${ADMIN_BASE}/products?edit=${encodeURIComponent(id)}`} className="admin-dash__btn">
              <FaPencilAlt />
              Edit product
            </Link>
          </div>
        }
      />

      <div className="admin-dash__product-view-hero admin-dash__panel">
        <div className="admin-dash__product-view-gallery">
          <div className="admin-dash__product-view-main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.name} />
            ) : (
              <div className="admin-dash__product-placeholder admin-dash__product-view-placeholder" />
            )}
          </div>
          {images.length > 1 && (
            <div className="admin-dash__product-view-thumbs">
              {images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  className={`admin-dash__product-view-thumb${index === activeImage ? " admin-dash__product-view-thumb--active" : ""}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="admin-dash__product-view-summary">
          <div className="admin-dash__product-view-price-row">
            <p className="admin-dash__product-view-price">{formatCurrency(product.price)}</p>
            {Number(product.oldPrice) > Number(product.price) && (
              <p className="admin-dash__product-view-old-price">{formatCurrency(product.oldPrice)}</p>
            )}
            {Number(product.discount) > 0 && (
              <span className="admin-dash__product-view-discount">-{product.discount}%</span>
            )}
          </div>

          <div className="admin-dash__product-view-badges">
            <span className={`admin-dash__status-badge admin-dash__status-badge--${isActive ? "completed" : "cancelled"}`}>
              {isActive ? "Active" : "Inactive"}
            </span>
            <span className={`admin-dash__stock-pill ${stockClass}`}>{stock} in stock</span>
            {product.isFeatured && <span className="admin-dash__product-view-featured">Featured</span>}
          </div>

          <dl className="admin-dash__detail-grid admin-dash__detail-grid--summary">
            <DetailItem label="SKU" value={product.sku} />
            <DetailItem label="Brand" value={product.brand} />
            <DetailItem label="Category" value={product.catName} />
            <DetailItem label="Sub category" value={product.subCatName || product.subCat} />
            <DetailItem label="Stock status" value={stockStatusLabel(product.stockStatus)} />
            <DetailItem label="Rating">
              <Rating value={Number(product.rating) || 0} readOnly size="small" precision={0.5} />
            </DetailItem>
            <DetailItem label="Created" value={formatDate(product.dateCreated)} />
            <DetailItem label="Slug" value={product.slug} />
          </dl>
        </div>
      </div>

      <div className="admin-dash__product-view-grid">
        <DetailSection title="Description">
          {getShortDescriptionBullets(product.shortDescription).length > 0 && (
            <div className="admin-dash__product-view-short-desc">
              <h3 className="admin-dash__product-view-short-desc-title">Short Description</h3>
              <ul className="admin-dash__product-view-short-desc-list">
                {getShortDescriptionBullets(product.shortDescription).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {typeof product.shortDescription === "object" && product.shortDescription?.disclaimer && (
                <p className="admin-dash__product-view-short-desc-note">{product.shortDescription.disclaimer}</p>
              )}
            </div>
          )}
          {getDescriptionPoints(product.description).length > 0 ? (
            <ul className="admin-dash__product-view-full-desc-list">
              {getDescriptionPoints(product.description).map((point, index) => (
                <li key={`${point.title}-${index}`}>
                  {point.title ? (
                    <>
                      <strong>{point.title}:</strong> {point.text}
                    </>
                  ) : (
                    point.text
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-dash__product-view-description">No description provided.</p>
          )}
        </DetailSection>

        <DetailSection title="Pricing">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="Selling price" value={formatCurrency(product.price)} />
            <DetailItem label="Product cost" value={formatCurrency(product.productCost)} />
            <DetailItem label="Old price" value={formatCurrency(product.oldPrice)} />
            <DetailItem label="Discount price" value={formatCurrency(product.discountPrice)} />
            <DetailItem label="Discount type" value={product.discountType === "fixed" ? "Fixed amount" : "Percentage"} />
            <DetailItem label="Discount" value={product.discount ? `${product.discount}%` : "—"} />
          </dl>
        </DetailSection>

        <DetailSection title="Inventory">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="Quantity in stock" value={stock} />
            <DetailItem label="Low stock alert" value={minAlert} />
            <DetailItem label="Stock status" value={stockStatusLabel(product.stockStatus)} />
            <DetailItem label="Status" value={isActive ? "Active" : "Inactive"} />
            <DetailItem label="Location" value={formatLocation(product.location)} />
          </dl>
        </DetailSection>

        <DetailSection title="Attributes">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="RAM" value={formatList(product.productRam)} />
            <DetailItem label="Size" value={formatList(product.size)} />
            <DetailItem label="Weight" value={formatList(product.productWeight)} />
          </dl>
        </DetailSection>

        {(product.variants || []).length > 0 && (
          <DetailSection title="Variants">
            <div className="admin-dash__variant-editor">
              {product.variants.map((group, groupIndex) => (
                <div className="admin-dash__variant-group" key={`${group.variantName}-${groupIndex}`}>
                  <h3 className="admin-dash__product-view-variant-name">{group.variantName || `Variant ${groupIndex + 1}`}</h3>
                  <div className="admin-dash__table-wrap">
                    <table className="admin-dash__table admin-dash__table--compact">
                      <thead>
                        <tr>
                          <th>Option</th>
                          <th>SKU</th>
                          <th>Price</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(group.options || []).map((option, optionIndex) => (
                          <tr key={`${option.label}-${optionIndex}`}>
                            <td>{option.label || "—"}</td>
                            <td>{option.sku || "—"}</td>
                            <td>{formatCurrency(option.price)}</td>
                            <td>{option.stock ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {(product.customizationOptions || []).length > 0 && (
          <DetailSection title="Customization options">
            <div className="admin-dash__table-wrap">
              <table className="admin-dash__table admin-dash__table--compact">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Options</th>
                    <th>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {product.customizationOptions.map((option, index) => (
                    <tr key={`${option.name}-${index}`}>
                      <td>{option.name || "—"}</td>
                      <td>{option.type || "—"}</td>
                      <td>{formatList(option.options)}</td>
                      <td>{option.required ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>
        )}

        <DetailSection title="Shipping">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="Weight (kg)" value={product.shipping?.weight ?? "—"} />
            <DetailItem label="Length (cm)" value={product.shipping?.length ?? "—"} />
            <DetailItem label="Width (cm)" value={product.shipping?.width ?? "—"} />
            <DetailItem label="Height (cm)" value={product.shipping?.height ?? "—"} />
            <DetailItem label="Free shipping" value={product.shipping?.freeShipping ? "Yes" : "No"} />
            <DetailItem label="Shipping charge" value={formatCurrency(product.shipping?.shippingCharge)} />
          </dl>
        </DetailSection>

        <DetailSection title="SEO">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="Meta title" value={product.seo?.metaTitle} />
            <DetailItem label="Meta description" value={product.seo?.metaDescription} />
            <DetailItem label="Keywords" value={product.seo?.keywords} />
          </dl>
        </DetailSection>
      </div>
    </>
  );
}
