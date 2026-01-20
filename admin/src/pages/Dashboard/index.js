import DashboardBox from "./components/dashboardBox";
import { HiDotsVertical } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import { GiStarsStack } from "react-icons/gi";
import Menu from "@mui/material/Menu";
import SearchBox from "../../components/SearchBox";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import { IoIosTimer } from "react-icons/io";
import Button from "@mui/material/Button";
import { Chart } from "react-google-charts";

import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import Rating from "@mui/material/Rating";
import { deleteData, fetchDataFromApi } from "../../utils/api";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import { PieChart, Pie, Sector, Cell } from "recharts";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const options = {
  backgroundColor: "transparent",
  chartArea: { width: "100%", height: "100%" },
};

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

const Dashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [productList, setProductList] = useState([]);
  const [categoryVal, setcategoryVal] = useState("all");

  const [totalUsers, setTotalUsers] = useState();
  const [totalOrders, setTotalOrders] = useState();
  const [totalProducts, setTotalProducts] = useState();
  const [totalProductsReviews, setTotalProductsReviews] = useState();
  const [totalSales, setTotalSales] = useState();
  const [perPage, setPerPage] = useState(10);

  const [salesData, setSalesData] = useState([]);

  const [page1, setPage1] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const open = Boolean(anchorEl);

  const ITEM_HEIGHT = 48;

  const context = useContext(MyContext);

  var data = [
    {
      name: "JAN",
      sales: 2400,
    },
    {
      name: "FEB",
      sales: 2210,
    },
    {
      name: "MAR",
      sales: 2290,
    },
    {
      name: "APRIL",
      sales: 2000,
    },
    {
      name: "MAY",
      sales: 2181,
    },
    {
      name: "JUNE",
      sales: 2500,
    },
    {
      name: "JULY",
      sales: 2100,
    },
    {
      name: "AUG",
      sales: 2100,
    },
    {
      name: "SEP",
      sales: 2100,
    },
    {
      name: "OCT",
      sales: 2100,
    },
    {
      name: "NOV",
      sales: 2100,
    },
    {
      name: "DEC",
      sales: 2100,
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage1(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage1(0);
  };

  useEffect(() => {
    context.setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
    context.setProgress(40);
    fetchDataFromApi(`/api/products`).then((res) => {
      setProductList(res);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/user/get/count").then((res) => {
      setTotalUsers(res.userCount);
    });

    fetchDataFromApi("/api/orders/get/count").then((res) => {
      setTotalOrders(res.orderCount);
    });

    let sales = 0;
    fetchDataFromApi("/api/orders/").then((res) => {
      res?.length !== 0 &&
        res?.map((item) => {
          sales += parseInt(item.amount);
        });

      setTotalSales(sales);
    });

    fetchDataFromApi("/api/products/get/count").then((res) => {
      setTotalProducts(res.productsCount);
    });

    fetchDataFromApi("/api/productReviews/get/count").then((res) => {
      setTotalProductsReviews(res.productsReviews);
    });

    fetchDataFromApi(`/api/orders/sales`).then((res) => {
      const sales = [];
      res?.monthlySales?.length !== 0 &&
        res?.monthlySales?.map((item) => {
          sales.push({
            name: item?.month,
            sales: parseInt(item?.sale),
          });
        });

      const uniqueArr = sales.filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.name === obj.name)
      );
      setSalesData(uniqueArr);
      console.log(uniqueArr);
    });
  }, []);

  const deleteProduct = (id) => {
    context.setProgress(40);
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
    });
  };

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

  const showPerPage = (e) => {
    setshowBy(e.target.value);
    fetchDataFromApi(`/api/products?page=${1}&perPage=${e.target.value}`).then(
      (res) => {
        setProductList(res);
        context.setProgress(100);
      }
    );
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="row dashboardBoxWrapperRow dashboard_Box dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                icon={<FaUserCircle />}
                grow={true}
                title="Total Users"
                count={totalUsers}
              />
              <DashboardBox
                color={["#c012e2", "#eb64fe"]}
                icon={<IoMdCart />}
                title="Total Orders"
                count={totalOrders}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                icon={<MdShoppingBag />}
                title="Total Products"
                count={totalProducts}
              />
              <DashboardBox
                color={["#e1950e", "#f3cd29"]}
                icon={<GiStarsStack />}
                title="Total Reviews"
                count={totalProductsReviews}
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
                                <span className="new text-danger d-block w-100">
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
            //  <div className="table-responsive mt-3">
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
            //     {productList?.products?.length !== 0 &&
            //       productList?.products?.slice(0)
            //       ?.reverse()?.map((item, index) => {
            //           return (
            //             <tr key={index}>
            //               <td>
            //                 <div className="d-flex align-items-center productBox">
            //                   <div className="imgWrapper">
            //                     <div className="img card shadow m-0">
            //                       <LazyLoadImage
            //                         alt={"image"}
            //                         effect="blur"
            //                         className="w-100"
            //                         src={item.images[0]}
            //                       />
            //                     </div>
            //                   </div>
            //                   <div className="info pl-3">
            //                     <h6>{item?.name}</h6>
            //                     <p>{item?.description}</p>
            //                   </div>
            //                 </div>
            //               </td>
            //               <td>{item?.category?.name}</td>
            //               <td>{item?.subCatName}</td>
            //               <td>{item?.brand}</td>
            //               <td>
            //                 <div style={{ width: "70px" }}>
            //                   <del className="old">Rs {item?.oldPrice}</del>
            //                   <span className="new text-danger">
            //                     Rs {item?.price}
            //                   </span>
            //                 </div>
            //               </td>
            //               <td>
            //                 <Rating
            //                   name="read-only"
            //                   defaultValue={item?.rating}
            //                   precision={0.5}
            //                   size="small"
            //                   readOnly
            //                 />
            //               </td>
            //               <td>
            //                 <div className="actions d-flex align-items-center">
            //                   <Link to={`/product/details/${item.id}`}>
            //                     <Button className="secondary" color="secondary">
            //                       <FaEye />
            //                     </Button>
            //                   </Link>
            //                   <Link to={`/product/edit/${item.id}`}>
            //                     <Button className="success" color="success">
            //                       <FaPencilAlt />
            //                     </Button>
            //                   </Link>
            //                   <Button
            //                     className="error"
            //                     color="error"
            //                     onClick={() => deleteProduct(item?.id)}
            //                   >
            //                     <MdDelete />
            //                   </Button>
            //                 </div>
            //               </td>
            //             </tr>
            //           );
            //         })}
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

        <div className="card p-3">
          <h3 class="hd">Total Sales</h3>
          <br />

          <div className="chartWrapper">
            {salesData?.length !== 0 && (
              <BarChart
                width={900}
                height={400}
                data={salesData}
                stroke="none"
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
                barSize={20}
              >
                <XAxis
                  dataKey="name"
                  scale="point"
                  padding={{ left: 10, right: 10 }}
                  tick={{ fontSize: 12 }}
                  label={{ position: "insideBottom", fontSize: 14 }}
                  style={{ fill: context?.theme === "dark" ? "white" : "#000" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ position: "insideBottom", fontSize: 14 }}
                  style={{ fill: context?.theme === "dark" ? "white" : "#000" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#071739  ",
                    color: "white",
                  }} // Set tooltip background and text color
                  labelStyle={{ color: "yellow" }} // Label text color
                  itemStyle={{ color: "cyan" }} // Set color for individual items in the tooltip
                  cursor={{ fill: "white" }} // Customize the tooltip cursor background on hover
                />
                <Legend />
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  vertical={false}
                />
                <Bar dataKey="sales" stackId="a" fill="#777c83" />
              </BarChart>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
