import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchDataFromApi(`/api/products/${id}`).then((res) => setProduct(res));
  }, [id]);

  if (!product) {
    return <p className="admin-dash__subtitle">Loading product…</p>;
  }

  return (
    <>
      <AdminPageHeader
        title={product.name}
        breadcrumbs={[
          { label: "Products", to: `${ADMIN_BASE}/products` },
          { label: "Details" },
        ]}
        action={
          <Link to={`${ADMIN_BASE}/product/edit/${id}`} className="admin-dash__btn">
            Edit product
          </Link>
        }
      />
      <section className="admin-dash__panel">
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <div>
            <div className="admin-dash__upload-grid">
              {(product.images || []).map((img, i) => (
                <div className="admin-dash__upload-box" key={i}>
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Category:</strong> {product.catName}</p>
            <p><strong>Sub category:</strong> {product.subCatName}</p>
            <p><strong>Price:</strong> Rs {product.price}</p>
            <p><strong>Old price:</strong> Rs {product.oldPrice}</p>
            <p><strong>Stock:</strong> {product.countInStock}</p>
            <p><strong>Discount:</strong> {product.discount}%</p>
            <p><strong>Rating:</strong> <Rating value={product.rating || 0} readOnly size="small" /></p>
            <p><strong>Featured:</strong> {product.isFeatured ? "Yes" : "No"}</p>
            <p><strong>RAM:</strong> {product.productRam || "—"}</p>
            <p><strong>Size:</strong> {product.size || "—"}</p>
            <p><strong>Weight:</strong> {product.productWeight || "—"}</p>
            <p style={{ marginTop: "1rem" }}>{product.description}</p>
          </div>
        </div>
      </section>
    </>
  );
}
