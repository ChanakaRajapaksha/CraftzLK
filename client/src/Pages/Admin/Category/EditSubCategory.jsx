import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useOutletContext } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FaCloudUploadAlt } from "react-icons/fa";
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

export default function EditSubCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { catData, setAlertBox, fetchCategory } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryVal, setCategoryVal] = useState("");
  const [formFields, setFormFields] = useState({ category: "", subCat: "" });

  useEffect(() => {
    fetchDataFromApi(`/api/subCat/${id}`).then((res) => {
      if (res?.category?.id) {
        setCategoryVal(res.category.id);
        setFormFields({ category: res.category.id, subCat: res.subCat || "" });
      }
    });
  }, [id]);

  const inputChange = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeCategory = (event) => {
    setCategoryVal(event.target.value);
    setFormFields((prev) => ({ ...prev, category: event.target.value }));
  };

  const editSubCat = (e) => {
    e.preventDefault();
    if (!formFields.category) {
      setAlertBox({ open: true, error: true, msg: "Please select a category" });
      return;
    }
    if (!formFields.subCat?.trim()) {
      setAlertBox({ open: true, error: true, msg: "Please enter sub category" });
      return;
    }
    setIsLoading(true);
    editData(`/api/subCat/${id}`, formFields).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      navigate("/dashboard/subCategory");
    });
  };

  const categoryList = catData?.categoryList || [];

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Edit Sub Category</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component={Link} to="/dashboard/subCategory" label="Sub Category" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Edit Sub Category" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>
      <form className="form" onSubmit={editSubCat}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <h6>CATEGORY</h6>
                    <Select
                      value={categoryVal}
                      onChange={handleChangeCategory}
                      displayEmpty
                      inputProps={{ "aria-label": "Category" }}
                      className="w-100"
                      name="category"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categoryList.map((cat) => (
                        <MenuItem className="text-capitalize" value={cat._id} key={cat._id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <h6>SUB CATEGORY</h6>
                    <input type="text" name="subCat" value={formFields.subCat} onChange={inputChange} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                <FaCloudUploadAlt /> &nbsp;
                {isLoading ? <CircularProgress color="inherit" className="loader" /> : "PUBLISH AND VIEW"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
