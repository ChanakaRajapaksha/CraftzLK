import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Rating from "@mui/material/Rating";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { MdShoppingBag, MdCategory } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function ProductList() {
  const { catData, setAlertBox } = useOutletContext();
  const [categoryVal, setCategoryVal] = useState("all");
  const [productList, setProductList] = useState({ products: [] });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategory, setTotalCategory] = useState(0);
  const [totalSubCategory, setTotalSubCategory] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    fetchDataFromApi("/api/products/get/count").then((res) => setTotalProducts(res?.productsCount ?? 0));
    fetchDataFromApi("/api/category/get/count").then((res) => setTotalCategory(res?.categoryCount ?? 0));
    fetchDataFromApi("/api/category/subCat/get/count").then((res) => setTotalSubCategory(res?.categoryCount ?? 0));
  }, []);

  const products = productList?.products || [];
  const slice = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reverse();
  const totalPages = Math.max(1, Math.ceil(products.length / rowsPerPage));

  const handleChangeCategory = (e) => {
    const val = e.target.value;
    setCategoryVal(val);
    setPage(0);
    if (val === "all") {
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    } else {
      fetchDataFromApi(`/api/products/catId?catId=${val}`).then((res) => setProductList(res || { products: [] }));
    }
  };

  const searchProducts = (keyword) => {
    setSearchKeyword(keyword);
    setPage(0);
    if (keyword.trim()) {
      fetchDataFromApi(`/api/search?q=${encodeURIComponent(keyword)}&page=1&perPage=10000`).then((res) =>
        setProductList(res || { products: [] })
      );
    } else {
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    }
  };

  const deleteProduct = (id) => {
    deleteData(`/api/products/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Product deleted." });
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Product List"
        breadcrumbs={[{ label: "Products" }]}
        action={
          <Link to={`${ADMIN_BASE}/product/upload`} className="admin-dash__btn">
            Upload product
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdShoppingBag />} label="Products" value={totalProducts} />
        <StatCard icon={<MdCategory />} label="Categories" value={totalCategory} gradient={["#a67c52", "#c9a961"]} />
        <StatCard icon={<IoShieldCheckmarkSharp />} label="Sub categories" value={totalSubCategory} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar">
          <select className="admin-dash__select" style={{ maxWidth: "14rem" }} value={categoryVal} onChange={handleChangeCategory}>
            <option value="all">All categories</option>
            {catData?.categoryList?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            className="admin-dash__input"
            style={{ maxWidth: "16rem" }}
            placeholder="Search products…"
            value={searchKeyword}
            onChange={(e) => searchProducts(e.target.value)}
          />
        </div>
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Sub category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((item) => (
                <tr key={item.id || item._id}>
                  <td>
                    <div className="admin-dash__product-cell">
                      <img src={item.images?.[0]} alt="" />
                      <div>
                        <h6>{item.name}</h6>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{item.catName}</td>
                  <td>{item.subCatName}</td>
                  <td>
                    <span className="admin-dash__badge">{item.brand}</span>
                  </td>
                  <td>
                    <strong>Rs {item.price}</strong>
                  </td>
                  <td>
                    <Rating value={item.rating || 0} precision={0.5} size="small" readOnly />
                  </td>
                  <td>
                    <div className="admin-dash__actions">
                      <Link to={`${ADMIN_BASE}/product/details/${item.id || item._id}`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm">
                        <FaEye />
                      </Link>
                      <Link to={`${ADMIN_BASE}/product/edit/${item.id || item._id}`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm">
                        <FaPencilAlt />
                      </Link>
                      <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => deleteProduct(item.id || item._id)}>
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-dash__pagination">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </section>
    </>
  );
}
