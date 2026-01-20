import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";

import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { MdCategory } from "react-icons/md";

import { IoShieldCheckmarkSharp } from "react-icons/io5";

import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";

import Rating from "@mui/material/Rating";
import { Link } from "react-router-dom";

import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardBox from "../Dashboard/components/dashboardBox";
import SearchBox from "../../components/SearchBox";
import Checkbox from "@mui/material/Checkbox";
import { deleteData, fetchDataFromApi } from "../../utils/api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const columns = [
  { id: "product", label: "PRODUCT", minWidth: 150 },
  { id: "category", label: "CATEGORY", minWidth: 100 },
  {
    id: "subcategory",
    label: "SUB CATEGORY",
    minWidth: 150,
  },
  {
    id: "brand",
    label: "BRAND",
    minWidth: 130,
  },
  {
    id: "price",
    label: "PRICE",
    minWidth: 100,
  },
  {
    id: "rating",
    label: "RATING",
    minWidth: 80,
  },
  {
    id: "action",
    label: "ACTION",
    minWidth: 120,
  },
];

const Products = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showBy, setshowBy] = useState(10);
  const [categoryVal, setcategoryVal] = useState("all");
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState();
  const [totalCategory, setTotalCategory] = useState();
  const [totalSubCategory, setTotalSubCategory] = useState();
  const [isLoadingBar, setIsLoadingBar] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const open = Boolean(anchorEl);

  const context = useContext(MyContext);

  const [productList, setProductList] = useState([]);

  const [page1, setPage1] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage1(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage1(0);
  };

  const ITEM_HEIGHT = 48;

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(40);
    fetchDataFromApi(`/api/products`).then((res) => {
      setProductList(res);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/products/get/count").then((res) => {
      setTotalProducts(res.productsCount);
    });

    fetchDataFromApi("/api/category/get/count").then((res) => {
      setTotalCategory(res.categoryCount);
    });

    fetchDataFromApi("/api/category/subCat/get/count").then((res) => {
      setTotalSubCategory(res.categoryCount);
    });
  }, []);

  const deleteProduct = (id) => {
    context.setProgress(40);
    setIsLoadingBar(true);
    deleteData(`/api/products/${id}`).then((res) => {
      context.setProgress(100);
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Product Deleted!",
      });

      fetchDataFromApi(`/api/products`).then((res) => {
        setProductList(res);
      });
      context.fetchCategory();
      setIsLoadingBar(false);
    });
  };

  // const handleChange = (event, value) => {
  //   context.setProgress(40);
  //   if (categoryVal !== "all") {
  //     fetchDataFromApi(
  //       `/api/products/catId?catId=${categoryVal}&page=${value}&perPage=${perPage}`
  //     ).then((res) => {
  //       setProductList(res);
  //       context.setProgress(100);
  //     });
  //   } else {
  //     fetchDataFromApi(`/api/products?page=${value}&perPage=${perPage}`).then(
  //       (res) => {
  //         setProductList(res);
  //         context.setProgress(100);
  //       }
  //     );
  //   }
  // };

  const handleChangeCategory = (event) => {
    if (event.target.value !== "all") {
      setcategoryVal(event.target.value);
      fetchDataFromApi(`/api/products/catId?catId=${event.target.value}`).then(
        (res) => {
          setProductList(res);
          context.setProgress(100);
        }
      );
    }
    if (event.target.value === "all") {
      setcategoryVal("all");
      setcategoryVal(event.target.value);
      fetchDataFromApi(`/api/products`).then((res) => {
        setProductList(res);
        context.setProgress(100);
      });
    }
  };

  const searchProducts = (keyword) => {
    if (keyword !== "") {
      fetchDataFromApi(`/api/search?q=${keyword}&page=1&perPage=${10000}`).then(
        (res) => {
          setProductList(res);
        }
      );
    } else {
      fetchDataFromApi(`/api/products`).then((res) => {
        setProductList(res);
      });
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Product List</h5>

          <div className="ml-auto d-flex align-items-center">
            <Breadcrumbs
              aria-label="breadcrumb"
              className="ml-auto breadcrumbs_"
            >
              <StyledBreadcrumb
                component="a"
                href="#"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />

              <StyledBreadcrumb
                label="Products"
                deleteIcon={<ExpandMoreIcon />}
              />
            </Breadcrumbs>

            <Link to="/product/upload">
              <Button className="btn-blue  ml-3 pl-3 pr-3">Add Product</Button>
            </Link>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2 pt-0">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                icon={<MdShoppingBag />}
                title="Total Products"
                count={totalProducts}
                grow={true}
              />
              <DashboardBox
                color={["#c012e2", "#eb64fe"]}
                icon={<MdCategory />}
                title="Total Categories"
                count={totalCategory}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                icon={<IoShieldCheckmarkSharp />}
                title="Total Sub Category"
                count={totalSubCategory}
              />
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
                  inputProps={{ "aria-label": "Without label" }}
                  className="w-100"
                >
                  <MenuItem value="all">
                    <em>All</em>
                  </MenuItem>
                  {context.catData?.categoryList?.length !== 0 &&
                    context.catData?.categoryList?.map((cat, index) => {
                      return (
                        <MenuItem
                          className="text-capitalize"
                          value={cat._id}
                          key={index}
                        >
                          {cat.name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </div>

            <div className="col-md-9 d-flex justify-content-end">
              <div className="searchWrap d-flex">
                <SearchBox searchProducts={searchProducts} />
              </div>
            </div>
          </div>

          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {productList?.products?.length !== 0 &&
                    productList?.products
                      ?.slice(
                        page1 * rowsPerPage,
                        page1 * rowsPerPage + rowsPerPage
                      )
                      ?.reverse()
                      ?.map((item, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell style={{ minWidth: columns.minWidth }}>
                              <div className="d-flex align-items-center productBox">
                                <div className="imgWrapper">
                                  <div className="img card shadow m-0">
                                    <LazyLoadImage
                                      alt={"image"}
                                      effect="blur"
                                      className="w-100"
                                      src={item.images[0]}
                                    />
                                  </div>
                                </div>
                                <div className="info pl-3">
                                  <Link to={`/product/details/${item.id}`}>
                                    <h6>{item?.name}</h6>
                                  </Link>
                                  <p>{item?.description}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell style={{ minWidth: columns.minWidth }}>
                              {item?.catName}
                            </TableCell>
                            <TableCell style={{ minWidth: columns.minWidth }}>
                              {item?.subCatName}
                            </TableCell>
                            <TableCell style={{ minWidth: columns.minWidth }}>
                              <span className="badge badge-secondary">
                                {item?.brand}
                              </span>
                            </TableCell>
                            <TableCell style={{ minWidth: columns.minWidth }}>
                              <div style={{ width: "70px" }}>
                                <del className="old">Rs {item?.oldPrice}</del>
                                <span className="new text-danger  d-block w-100">
                                  Rs {item?.price}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell style={{ minWidth: columns.minWidth }}>
                              <Rating
                                name="read-only"
                                defaultValue={item?.rating}
                                precision={0.5}
                                size="small"
                                readOnly
                              />
                            </TableCell>

                            <TableCell style={{ minWidth: columns.minWidth }}>
                              <div className="actions d-flex align-items-center">
                                <Link to={`/product/details/${item.id}`}>
                                  <Button
                                    className="secondary"
                                    color="secondary"
                                  >
                                    <FaEye />
                                  </Button>
                                </Link>

                                <Link to={`/product/edit/${item.id}`}>
                                  <Button className="success" color="success">
                                    <FaPencilAlt />
                                  </Button>
                                </Link>

                                <Button
                                  className="error"
                                  color="error"
                                  onClick={() => deleteProduct(item?.id)}
                                >
                                  <MdDelete />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={productList?.products?.length}
              rowsPerPage={rowsPerPage}
              page={page1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>

          {
            //   <div className="table-responsive mt-3">
            //   <table className="table table-bordered table-striped v-align">
            //     <thead className="thead-dark">
            //       <tr>
            //         <th style={{ width: "300px" }}>PRODUCT</th>
            //         <th>CATEGORY</th>
            //         <th>SUB CATEGORY</th>
            //         <th>BRAND</th>
            //         <th>PRICE</th>
            //         <th>RATING</th>
            //         <th>ACTION</th>
            //       </tr>
            //     </thead>
            //     <tbody>
            //       {productList?.products?.length !== 0 &&
            //         productList?.products
            //           ?.slice(0)
            //           ?.reverse()
            //           ?.map((item, index) => {
            //             return (
            //               <tr key={index}>
            //                 <td>
            //                   <div className="d-flex align-items-center productBox">
            //                     <div className="imgWrapper">
            //                       <div className="img card shadow m-0">
            //                         <LazyLoadImage
            //                           alt={"image"}
            //                           effect="blur"
            //                           className="w-100"
            //                           src={item.images[0]}
            //                         />
            //                       </div>
            //                     </div>
            //                     <div className="info pl-3">
            //                       <h6>{item?.name}</h6>
            //                       <p>{item?.description}</p>
            //                     </div>
            //                   </div>
            //                 </td>
            //                 <td>{item?.category?.name}</td>
            //                 <td>{item?.subCatName}</td>
            //                 <td>{item?.brand}</td>
            //                 <td>
            //                   <div style={{ width: "70px" }}>
            //                     <del className="old">Rs {item?.oldPrice}</del>
            //                     <span className="new text-danger">
            //                       Rs {item?.price}
            //                     </span>
            //                   </div>
            //                 </td>
            //                 <td>
            //                   <Rating
            //                     name="read-only"
            //                     defaultValue={item?.rating}
            //                     precision={0.5}
            //                     size="small"
            //                     readOnly
            //                   />
            //                 </td>
            //                 <td>
            //                   <div className="actions d-flex align-items-center">
            //                     <Link to={`/product/details/${item.id}`}>
            //                       <Button className="secondary" color="secondary">
            //                         <FaEye />
            //                       </Button>
            //                     </Link>
            //                     <Link to={`/product/edit/${item.id}`}>
            //                       <Button className="success" color="success">
            //                         <FaPencilAlt />
            //                       </Button>
            //                     </Link>
            //                     <Button
            //                       className="error"
            //                       color="error"
            //                       onClick={() => deleteProduct(item?.id)}
            //                     >
            //                       <MdDelete />
            //                     </Button>
            //                   </div>
            //                 </td>
            //               </tr>
            //             );
            //           })}
            //     </tbody>
            //   </table>
            //   {productList?.totalPages > 1 && (
            //     <div className="d-flex tableFooter">
            //       <Pagination
            //         count={productList?.totalPages}
            //         color="primary"
            //         className="pagination"
            //         showFirstButton
            //         showLastButton
            //         onChange={handleChange}
            //       />
            //     </div>
            //   )}
            // </div>
          }
        </div>
      </div>
    </>
  );
};

export default Products;
