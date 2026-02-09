import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import {
  deleteData,
  deleteImages,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../../utils/api";

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

export default function AddCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    images: [],
    color: "",
    slug: "",
    parentId: "",
  });
  const [previews, setPreviews] = useState([]);
  const navigate = useNavigate();
  const { setAlertBox, fetchCategory } = useOutletContext();
  const formdata = new FormData();

  useEffect(() => {
    fetchDataFromApi("/api/imageUpload").then((res) => {
      if (res?.length) {
        res.forEach((item) => {
          item?.images?.forEach((img) => {
            deleteImages(`/api/category/deleteImage?img=${img}`).then(() => {
              deleteData("/api/imageUpload/deleteAllImages");
            });
          });
        });
      }
    });
  }, []);

  const changeInput = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onChangeFile = async (e, apiEndPoint) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const selectedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (
        file &&
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
      ) {
        selectedImages.push(file);
        formdata.append("images", file);
      } else {
        setAlertBox({ open: true, error: true, msg: "Please select a valid JPG or PNG image file." });
        setUploading(false);
        return;
      }
    }
    uploadImage(apiEndPoint, formdata).then(() => {
      fetchDataFromApi("/api/imageUpload").then((response) => {
        if (response?.length) {
          const img_arr = [];
          response.forEach((item) => {
            item?.images?.forEach((img) => img_arr.push(img));
          });
          const uniqueArray = img_arr.filter((item, index) => img_arr.indexOf(item) === index);
          setPreviews(uniqueArray);
        }
        setUploading(false);
        setAlertBox({ open: true, error: false, msg: "Images Uploaded!" });
      });
    });
  };

  const removeImg = (index, imgUrl) => {
    deleteImages(`/api/category/deleteImage?img=${imgUrl}`).then(() => {
      setAlertBox({ open: true, error: false, msg: "Image Deleted!" });
    });
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addCat = (e) => {
    e.preventDefault();
    const payload = {
      ...formFields,
      slug: formFields.name,
      images: [...previews],
    };
    if (!formFields.name.trim() || !formFields.color.trim() || previews.length === 0) {
      setAlertBox({ open: true, error: true, msg: "Please fill all the details" });
      return;
    }
    setIsLoading(true);
    postData("/api/category/create", payload).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      deleteData("/api/imageUpload/deleteAllImages");
      navigate("/dashboard/category");
    });
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Add Category</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component={Link} to="/dashboard/category" label="Category" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Add Category" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>
      <form className="form" onSubmit={addCat}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="form-group">
                <h6>Category Name</h6>
                <input type="text" name="name" value={formFields.name} onChange={changeInput} />
              </div>
              <div className="form-group">
                <h6>Color</h6>
                <input type="text" name="color" value={formFields.color} onChange={changeInput} />
              </div>
              <div className="imagesUploadSec">
                <h5 className="mb-4">Media And Published</h5>
                <div className="imgUploadBox d-flex align-items-center">
                  {previews.map((img, index) => (
                    <div className="uploadBox" key={index}>
                      <span className="remove" onClick={() => removeImg(index, img)}>
                        <IoCloseSharp />
                      </span>
                      <div className="box">
                        <LazyLoadImage alt="upload" effect="blur" className="w-100" src={img} />
                      </div>
                    </div>
                  ))}
                  <div className="uploadBox">
                    {uploading ? (
                      <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                        <CircularProgress />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => onChangeFile(e, "/api/category/upload")}
                          name="images"
                        />
                        <div className="info">
                          <FaRegImages />
                          <h5>image upload</h5>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <br />
                <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                  <FaCloudUploadAlt /> &nbsp;
                  {isLoading ? <CircularProgress color="inherit" className="loader" /> : "PUBLISH AND VIEW"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
