import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
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
import { deleteData, fetchDataFromApi, postData } from "../../../utils/api";

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

export default function AddSubCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryVal, setCategoryVal] = useState("");
  const [formFields, setFormFields] = useState({ name: "", slug: "", parentId: "" });
  const navigate = useNavigate();
  const { catData, setAlertBox, fetchCategory } = useOutletContext();

  useEffect(() => {
    if (!catData?.categoryList?.length) fetchCategory?.();
  }, []);

  const changeInput = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeCategory = (event) => {
    setCategoryVal(event.target.value);
    setFormFields((prev) => ({ ...prev, parentId: event.target.value }));
  };

  const addSubCategory = (e) => {
    e.preventDefault();
    const payload = { ...formFields, slug: formFields.name, parentId: categoryVal || formFields.parentId };
    if (!payload.name.trim() || !payload.parentId) {
      setAlertBox({ open: true, error: true, msg: "Please fill all the details" });
      return;
    }
    setIsLoading(true);
    postData("/api/category/create", payload).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      deleteData("/api/imageUpload/deleteAllImages");
      navigate("/dashboard/subCategory");
    });
  };

  const categoryList = catData?.categoryList || [];

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Add Sub Category</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component={Link} to="/dashboard/category" label="Category" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Add Sub Category" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>
      <form className="form" onSubmit={addSubCategory}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="form-group">
                <h6>Parent Category</h6>
                <Select
                  value={categoryVal}
                  onChange={handleChangeCategory}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  className="w-100"
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
              <div className="form-group">
                <h6>Sub Category</h6>
                <input type="text" name="name" value={formFields.name} onChange={changeInput} />
              </div>
              <br />
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
