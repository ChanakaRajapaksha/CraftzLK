import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import { GiStarsStack } from "react-icons/gi";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Rating from "@mui/material/Rating";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import SalesChart from "../../../Components/AdminDashboard/SalesChart";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AdminDashboardHome() {
  const { catData = {}, setAlertBox } = useOutletContext() || {};
  const [productList, setProductList] = useState({ products: [] });
  const [categoryVal, setCategoryVal] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    fetchDataFromApi("/api/user/get/count").then((res) => res && setTotalUsers(res.userCount));
    fetchDataFromApi("/api/orders/get/count").then((res) => res && setTotalOrders(res.orderCount));
    fetchDataFromApi("/api/products/get/count").then((res) => res && setTotalProducts(res.productsCount));
    fetchDataFromApi("/api/productReviews/get/count").then((res) => res && setTotalReviews(res.productsReviews || 0));
    fetchDataFromApi("/api/orders/sales").then((res) => {
      const sales = [];
      if (res?.monthlySales?.length) {
        res.monthlySales.forEach((item) =>
          sales.push({ name: item?.month, sales: parseInt(item?.sale, 10) || 0 })
        );
      }
      setSalesData(sales);
    });
  }, []);

  const products = productList?.products || [];
  const slice = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reverse();

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

  const deleteProduct = (id) => {
    deleteData(`/api/products/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Product deleted." });
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    });
  };

  const totalPages = Math.max(1, Math.ceil(products.length / rowsPerPage));

  return (
    <>
      <AdminPageHeader
        eyebrow="CraftzLK Admin"
        title="Dashboard"
        subtitle="Overview of store performance, products, and sales."
      />

      <div className="admin-dash__stats">
        <StatCard icon={<FaUserCircle />} label="Total Users" value={totalUsers} gradient={["#8b6f47", "#b8860b"]} />
        <StatCard icon={<IoMdCart />} label="Total Orders" value={totalOrders} gradient={["#a67c52", "#c9a961"]} />
        <StatCard icon={<MdShoppingBag />} label="Total Products" value={totalProducts} gradient={["#6b5344", "#d4a574"]} />
        <StatCard icon={<GiStarsStack />} label="Total Reviews" value={totalReviews} gradient={["#b8860b", "#daa520"]} />
      </div>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Best Selling Products</h2>
        <div className="admin-dash__toolbar">
          <select className="admin-dash__select" style={{ maxWidth: "14rem" }} value={categoryVal} onChange={handleChangeCategory}>
            <option value="all">All categories</option>
            {catData?.categoryList?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
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
                        <Link to={`${ADMIN_BASE}/product/details/${item.id || item._id}`}>
                          <h6>{item.name}</h6>
                        </Link>
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
                    {item.oldPrice && <del style={{ color: "#9a8b78", marginRight: "0.35rem" }}>Rs {item.oldPrice}</del>}
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
          <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Monthly Sales</h2>
        <SalesChart data={salesData} />
      </section>
    </>
  );
}
