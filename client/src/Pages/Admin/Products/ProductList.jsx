import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Rating from "@mui/material/Rating";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdShoppingBag, MdCategory } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import DashboardBox from "../Dashboard/components/DashboardBox";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": { backgroundColor: emphasize(backgroundColor, 0.06) },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const columns = [
  { id: "product", label: "PRODUCT", minWidth: 150 },
  { id: "category", label: "CATEGORY", minWidth: 100 },
  { id: "subcategory", label: "SUB CATEGORY", minWidth: 150 },
  { id: "brand", label: "BRAND", minWidth: 130 },
  { id: "price", label: "PRICE", minWidth: 100 },
  { id: "rating", label: "RATING", minWidth: 80 },
  { id: "action", label: "ACTION", minWidth: 120 },
];

export default function ProductList() {
  const { catData, fetchCategory } = useOutletContext();
  const [categoryVal, setCategoryVal] = useState("all");
  const [productList, setProductList] = useState({ products: [] });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategory, setTotalCategory] = useState(0);
  const [totalSubCategory, setTotalSubCategory] = useState(0);
  const [isLoadingBar, setIsLoadingBar] = useState(false);
  const [page1, setPage1] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    fetchDataFromApi("/api/products/get/count").then((res) => setTotalProducts(res?.productsCount ?? 0));
    fetchDataFromApi("/api/category/get/count").then((res) => setTotalCategory(res?.categoryCount ?? 0));
    fetchDataFromApi("/api/category/subCat/get/count").then((res) => setTotalSubCategory(res?.categoryCount ?? 0));
  }, []);

  const handleChangeCategory = (event) => {
    const val = event.target.value;
    setCategoryVal(val);
    if (val === "all") {
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    } else {
      fetchDataFromApi(`/api/products/catId?catId=${val}`).then((res) => setProductList(res || { products: [] }));
    }
  };

  const searchProducts = (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      fetchDataFromApi(`/api/search?q=${encodeURIComponent(keyword)}&page=1&perPage=10000`).then((res) =>
        setProductList(res || { products: [] })
      );
    } else {
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
    }
  };

  const deleteProduct = (id) => {
    setIsLoadingBar(true);
    deleteData(`/api/products/${id}`).then(() => {
      fetchDataFromApi("/api/products").then((res) => setProductList(res || { products: [] }));
      fetchCategory?.();
      setIsLoadingBar(false);
    });
  };

  const handleChangePage = (_, newPage) => setPage1(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage1(0);
  };

  const list = productList?.products || [];
  const slice = list.slice(page1 * rowsPerPage, page1 * rowsPerPage + rowsPerPage);
  const categoryList = catData?.categoryList || [];

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
        <h5 className="mb-0">Product List</h5>
        <div className="ml-auto d-flex align-items-center">
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
            <StyledBreadcrumb label="Products" deleteIcon={<ExpandMoreIcon />} />
          </Breadcrumbs>
          <Link to="/dashboard/product/upload">
            <Button className="btn-blue ml-3 pl-3 pr-3">Add Product</Button>
          </Link>
        </div>
      </div>
      <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2 pt-0">
        <div className="col-md-12">
          <div className="dashboardBoxWrapper d-flex">
            <DashboardBox color={["#1da256", "#48d483"]} icon={<MdShoppingBag />} title="Total Products" count={totalProducts} grow />
            <DashboardBox color={["#c012e2", "#eb64fe"]} icon={<MdCategory />} title="Total Categories" count={totalCategory} />
            <DashboardBox color={["#2c78e5", "#60aff5"]} icon={<IoShieldCheckmarkSharp />} title="Total Sub Category" count={totalSubCategory} />
          </div>
        </div>
      </div>
      <div className="card shadow border-0 p-3 mt-4">
        <h3 className="hd">Best Selling Products</h3>
        <div className="row cardFilters mt-2 mb-3">
          <div className="col-md-3">
            <h4>CATEGORY BY</h4>
            <FormControl size="small" className="w-100">
              <Select
                value={categoryVal}
                onChange={handleChangeCategory}
                displayEmpty
                inputProps={{ "aria-label": "Category" }}
                className="w-100"
              >
                <MenuItem value="all"><em>All</em></MenuItem>
                {categoryList.map((cat) => (
                  <MenuItem className="text-capitalize" value={cat._id} key={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col-md-9 d-flex justify-content-end">
            <div className="searchWrap d-flex">
              <div className="searchBox position-relative d-flex align-items-center">
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchKeyword}
                  onChange={(e) => searchProducts(e.target.value)}
                />
              </div>
            </div>
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
                {[...slice].reverse().map((item) => (
                  <TableRow key={item.id || item._id}>
                    <TableCell>
                      <div className="d-flex align-items-center productBox">
                        <div className="imgWrapper">
                          <div className="img card shadow m-0">
                            <LazyLoadImage alt="product" effect="blur" className="w-100" src={item.images?.[0]} />
                          </div>
                        </div>
                        <div className="info pl-3">
                          <Link to={`/dashboard/product/details/${item.id || item._id}`}><h6>{item?.name}</h6></Link>
                          <p>{item?.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item?.catName}</TableCell>
                    <TableCell>{item?.subCatName}</TableCell>
                    <TableCell><span className="badge badge-secondary">{item?.brand}</span></TableCell>
                    <TableCell>
                      <del className="old">Rs {item?.oldPrice}</del>
                      <span className="new text-danger d-block w-100">Rs {item?.price}</span>
                    </TableCell>
                    <TableCell>
                      <Rating name="read-only" value={item?.rating ?? 0} precision={0.5} size="small" readOnly />
                    </TableCell>
                    <TableCell>
                      <div className="actions d-flex align-items-center">
                        <Link to={`/dashboard/product/details/${item.id || item._id}`}>
                          <Button className="secondary" color="secondary"><FaEye /></Button>
                        </Link>
                        <Link to={`/dashboard/product/edit/${item.id || item._id}`}>
                          <Button className="success" color="success"><FaPencilAlt /></Button>
                        </Link>
                        <Button className="error" color="error" onClick={() => deleteProduct(item?.id || item?._id)} disabled={isLoadingBar}>
                          <MdDelete />
                        </Button>
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
            count={list.length}
            rowsPerPage={rowsPerPage}
            page={page1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
    </div>
  );
}
