import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { MdClose } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { editData, fetchDataFromApi } from "../../../utils/api";

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
  { id: "orderId", label: "Order Id", minWidth: 150 },
  { id: "paymentId", label: "Payment Id", minWidth: 100 },
  { id: "products", label: "Products", minWidth: 150 },
  { id: "name", label: "Name", minWidth: 130 },
  { id: "phoneNumber", label: "Phone Number", minWidth: 150 },
  { id: "address", label: "Address", minWidth: 200 },
  { id: "pincode", label: "Pincode", minWidth: 120 },
  { id: "totalAmount", label: "Total Amount", minWidth: 120 },
  { id: "email", label: "Email", minWidth: 120 },
  { id: "userId", label: "User Id", minWidth: 120 },
  { id: "orderStatus", label: "Order Status", minWidth: 120 },
  { id: "dateCreated", label: "Date Created", minWidth: 150 },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page1, setPage1] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/orders").then((res) => setOrders(Array.isArray(res) ? res : []));
  }, []);

  const showProducts = (id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      setIsOpenModal(true);
      setProducts(res?.products || []);
    });
  };

  const handleChangeStatus = (e, orderId) => {
    const status = e.target.value;
    setIsLoading(true);
    fetchDataFromApi(`/api/orders/${orderId}`).then((res) => {
      const order = {
        name: res.name,
        phoneNumber: res.phoneNumber,
        address: res.address,
        pincode: res.pincode,
        amount: parseInt(res.amount, 10),
        paymentId: res.paymentId,
        email: res.email,
        userid: res.userId,
        products: res.products,
        status,
      };
      editData(`/api/orders/${orderId}`, order).then(() => {
        fetchDataFromApi("/api/orders").then((data) => setOrders(Array.isArray(data) ? data : []));
        setIsLoading(false);
      });
    });
  };

  const handleChangePage = (_, newPage) => setPage1(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage1(0);
  };

  const slice = orders.slice(page1 * rowsPerPage, page1 * rowsPerPage + rowsPerPage);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
        <h5 className="mb-0">Orders List</h5>
        <div className="ml-auto d-flex align-items-center">
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
            <StyledBreadcrumb label="Orders" deleteIcon={<ExpandMoreIcon />} />
          </Breadcrumbs>
        </div>
      </div>
      <div className="card shadow border-0 p-3 mt-4">
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
                {[...slice].reverse().map((order) => (
                  <TableRow key={order._id}>
                    <TableCell><span className="text-blue font-weight-bold">{order?._id}</span></TableCell>
                    <TableCell><span className="text-blue font-weight-bold">{order?.paymentId}</span></TableCell>
                    <TableCell>
                      <span className="text-blue font-weight-bold cursor" onClick={() => showProducts(order?._id)} style={{ cursor: "pointer" }}>
                        Click here to view
                      </span>
                    </TableCell>
                    <TableCell>{order?.name}</TableCell>
                    <TableCell><FaPhoneAlt /> {order?.phoneNumber}</TableCell>
                    <TableCell>{order?.address}</TableCell>
                    <TableCell>{order?.pincode}</TableCell>
                    <TableCell>RS: {order?.amount}</TableCell>
                    <TableCell>{order?.email}</TableCell>
                    <TableCell>{order?.userid}</TableCell>
                    <TableCell>
                      <Select
                        disabled={isLoading}
                        value={order?.status ?? ""}
                        onChange={(e) => handleChangeStatus(e, order?._id)}
                        displayEmpty
                        inputProps={{ "aria-label": "Status" }}
                        size="small"
                        className="w-100"
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirm">Confirm</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell><MdOutlineDateRange /> {order?.date?.split("T")[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
      <Dialog open={isOpenModal} className="productModal" onClose={() => setIsOpenModal(false)}>
        <Button className="close_" onClick={() => setIsOpenModal(false)}><MdClose /></Button>
        <h4 className="font-weight-bold pr-5 mb-4">Products</h4>
        <div className="table-responsive orderTable">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Product Id</th>
                <th>Product Title</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>SubTotal</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <tr key={index}>
                  <td>{item?.productId}</td>
                  <td style={{ whiteSpace: "inherit" }}>
                    <span>{item?.productTitle ? `${item.productTitle.substr(0, 30)}...` : ""}</span>
                  </td>
                  <td>
                    <div className="img"><img src={item?.image} alt="" /></div>
                  </td>
                  <td>{item?.quantity}</td>
                  <td>{item?.price}</td>
                  <td>{item?.subTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Dialog>
    </div>
  );
}
