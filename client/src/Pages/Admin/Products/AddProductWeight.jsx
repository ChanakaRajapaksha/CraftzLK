import React, { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { FaCloudUploadAlt, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { deleteData, editData, fetchDataFromApi, postData } from "../../../utils/api";

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

export default function AddProductWeight() {
  const { setAlertBox } = useOutletContext();
  const [editId, setEditId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productWeightData, setProductWeightData] = useState([]);
  const [formFields, setFormFields] = useState({ productWeight: "" });
  const inputRef = useRef();

  useEffect(() => {
    fetchDataFromApi("/api/productWeight").then((res) => setProductWeightData(Array.isArray(res) ? res : []));
  }, []);

  const inputChange = (e) => setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addproductweight = (e) => {
    e.preventDefault();
    if (!formFields.productWeight?.trim()) {
      setAlertBox({ open: true, error: true, msg: "Please add Product Weight" });
      return;
    }
    setIsLoading(true);
    if (!editId) {
      postData("/api/productWeight/create", formFields).then(() => {
        setIsLoading(false);
        setFormFields({ productWeight: "" });
        fetchDataFromApi("/api/productWeight").then((res) => setProductWeightData(Array.isArray(res) ? res : []));
      });
    } else {
      editData(`/api/productWeight/${editId}`, formFields).then(() => {
        fetchDataFromApi("/api/productWeight").then((res) => setProductWeightData(Array.isArray(res) ? res : []));
        setEditId("");
        setIsLoading(false);
        setFormFields({ productWeight: "" });
      });
    }
  };

  const deleteItem = (id) => {
    deleteData(`/api/productWeight/${id}`).then(() => {
      fetchDataFromApi("/api/productWeight").then((res) => setProductWeightData(Array.isArray(res) ? res : []));
    });
  };

  const updateData = (id) => {
    inputRef.current?.focus();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    fetchDataFromApi(`/api/productWeight/${id}`).then((res) => {
      setEditId(id);
      setFormFields({ productWeight: res?.productWeight ?? "" });
    });
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Add Product Weight</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component={Link} to="/dashboard/products" label="Products" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Add Product Weight" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>
      <form className="form" onSubmit={addproductweight}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="form-group">
                <h6>PRODUCT WEIGHT</h6>
                <input
                  type="text"
                  name="productWeight"
                  value={formFields.productWeight}
                  onChange={inputChange}
                  ref={inputRef}
                />
              </div>
              <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                <FaCloudUploadAlt /> &nbsp;
                {isLoading ? <CircularProgress color="inherit" className="loader" /> : "PUBLISH AND VIEW"}
              </Button>
            </div>
          </div>
        </div>
      </form>
      {productWeightData.length > 0 && (
        <div className="row">
          <div className="col-md-9">
            <div className="card p-4 mt-4">
              <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped v-align">
                  <thead className="thead-dark">
                    <tr>
                      <th>PRODUCT WEIGHT</th>
                      <th width="25%">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productWeightData.map((item) => (
                      <tr key={item.id || item._id}>
                        <td>{item.productWeight}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Button className="success" color="success" onClick={() => updateData(item.id || item._id)}>
                              <FaPencilAlt />
                            </Button>
                            <Button className="error" color="error" onClick={() => deleteItem(item.id || item._id)}>
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
