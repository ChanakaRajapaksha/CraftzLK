import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import DashboardBox from "./components/DashboardBox";
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import { GiStarsStack } from "react-icons/gi";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Rating from "@mui/material/Rating";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchDataFromApi, deleteData } from "../../../utils/api";

const columns = [
  { id: "product", label: "PRODUCT", minWidth: 150 },
  { id: "category", label: "CATEGORY", minWidth: 100 },
  { id: "subcategory", label: "SUB CATEGORY", minWidth: 150 },
  { id: "brand", label: "BRAND", minWidth: 130 },
  { id: "price", label: "PRICE", minWidth: 100 },
  { id: "rating", label: "RATING", minWidth: 80 },
  { id: "action", label: "ACTION", minWidth: 120 },
];

export default function AdminDashboard() {
  const { catData = {}, setAlertBox } = useOutletContext() || {};
  const [productList, setProductList] = useState([]);
  const [categoryVal, setCategoryVal] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalProductsReviews, setTotalProductsReviews] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [page1, setPage1] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/products").then((res) => setProductList(res || {}));
    fetchDataFromApi("/api/user/get/count").then((res) => res && setTotalUsers(res.userCount));
    fetchDataFromApi("/api/orders/get/count").then((res) => res && setTotalOrders(res.orderCount));
    fetchDataFromApi("/api/products/get/count").then((res) => res && setTotalProducts(res.productsCount));
    fetchDataFromApi("/api/productReviews/get/count").then((res) => res && setTotalProductsReviews(res.productsReviews || 0));
    fetchDataFromApi("/api/orders/").then((res) => {
      let sales = 0;
      if (Array.isArray(res)) res.forEach((item) => { sales += parseInt(item.amount, 10) || 0; });
      setTotalSales(sales);
    });
    fetchDataFromApi("/api/orders/sales").then((res) => {
      const sales = [];
      if (res?.monthlySales?.length) {
        res.monthlySales.forEach((item) => sales.push({ name: item?.month, sales: parseInt(item?.sale, 10) || 0 }));
      }
      setSalesData(sales);
    });
  }, []);

  const deleteProduct = (id) => {
    deleteData(`/api/products/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Product Deleted!" });
      fetchDataFromApi("/api/products").then((res) => setProductList(res || {}));
    });
  };

  const handleChangeCategory = (event) => {
    const val = event.target.value;
    setCategoryVal(val);
    if (val === "all") {
      fetchDataFromApi("/api/products").then((res) => setProductList(res || {}));
    } else {
      fetchDataFromApi(`/api/products/catId?catId=${val}`).then((res) => setProductList(res || {}));
    }
  };

  const handleChangePage = (event, newPage) => setPage1(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage1(0);
  };

  const products = productList?.products || [];
  const slice = products.slice(page1 * rowsPerPage, page1 * rowsPerPage + rowsPerPage).reverse();

  return (
    <>
      <div className="right-content w-100">
        <div className="row dashboardBoxWrapperRow dashboard_Box dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox color={["#1da256", "#48d483"]} icon={<FaUserCircle />} grow title="Total Users" count={totalUsers} />
              <DashboardBox color={["#c012e2", "#eb64fe"]} icon={<IoMdCart />} title="Total Orders" count={totalOrders} />
              <DashboardBox color={["#2c78e5", "#60aff5"]} icon={<MdShoppingBag />} title="Total Products" count={totalProducts} />
              <DashboardBox color={["#e1950e", "#f3cd29"]} icon={<GiStarsStack />} title="Total Reviews" count={totalProductsReviews} />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <h3 className="hd">Best Selling Products</h3>
          <div className="row cardFilters mt-2 mb-3">
            <div className="col-md-3">
              <FormControl size="small" className="w-100">
                <Select value={categoryVal} onChange={handleChangeCategory} displayEmpty className="w-100">
                  <MenuItem value="all"><em>All</em></MenuItem>
                  {catData?.categoryList?.map((cat, index) => (
                    <MenuItem key={index} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell key={col.id} style={{ minWidth: col.minWidth }}>{col.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slice.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <div className="img card shadow m-0">
                              <LazyLoadImage alt="product" effect="blur" className="w-100" src={item.images?.[0]} />
                            </div>
                          </div>
                          <div className="info pl-3">
                            <Link to={`/dashboard/product/details/${item.id}`}><h6>{item?.name}</h6></Link>
                            <p>{item?.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item?.catName}</TableCell>
                      <TableCell>{item?.subCatName}</TableCell>
                      <TableCell><span className="badge badge-secondary">{item?.brand}</span></TableCell>
                      <TableCell>
                        <del className="old">Rs {item?.oldPrice}</del>
                        <span className="new text-danger d-block">Rs {item?.price}</span>
                      </TableCell>
                      <TableCell>
                        <Rating name="read-only" value={item?.rating} precision={0.5} size="small" readOnly />
                      </TableCell>
                      <TableCell>
                        <div className="actions d-flex align-items-center">
                          <Link to={`/dashboard/product/details/${item.id}`}>
                            <Button className="secondary" color="secondary"><FaEye /></Button>
                          </Link>
                          <Link to={`/dashboard/product/edit/${item.id}`}>
                            <Button className="success" color="success"><FaPencilAlt /></Button>
                          </Link>
                          <Button className="error" color="error" onClick={() => deleteProduct(item?.id)}><MdDelete /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={products.length}
              rowsPerPage={rowsPerPage}
              page={page1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>

        <div className="card p-3 mt-4">
          <h3 className="hd">Total Sales</h3>
          {salesData?.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#777c83" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
