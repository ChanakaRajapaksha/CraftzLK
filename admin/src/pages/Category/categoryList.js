import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";

import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";

import { Link } from "react-router-dom";

import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { deleteData, editData, fetchDataFromApi } from "../../utils/api";

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

const Category = () => {
  const [catData, setCatData] = useState([]);
  const [isLoadingBar, setIsLoadingBar] = useState(false);
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(20);
    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res);
      context.setProgress(100);
    });
  }, []);

  const deleteCat = (id) => {
    setIsLoadingBar(true);
    context.setProgress(30);
    deleteData(`/api/category/${id}`).then((res) => {
      context.setProgress(100);
      fetchDataFromApi("/api/category").then((res) => {
        setCatData(res);
        context.setProgress(100);
        context.setProgress({
          open: true,
          error: false,
          msg: "Category Deleted!",
        });
        setIsLoadingBar(false);
      });
    });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Category List</h5>

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
                label="Category"
                deleteIcon={<ExpandMoreIcon />}
              />
            </Breadcrumbs>

            <Link to="/category/add">
              <Button className="btn-blue  ml-3 pl-3 pr-3">Add Category</Button>
            </Link>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th style={{ width: "100px" }}>IMAGE</th>
                  <th>CATEGORY</th>
                  <th>COLOR</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {catData?.categoryList?.length !== 0 &&
                  catData?.categoryList
                    ?.slice(0)
                    .reverse()
                    .map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <div
                              className="d-flex align-items-center "
                              style={{ width: "150px" }}
                            >
                              <div
                                className="imgWrapper"
                                style={{ width: "50px", flex: "0 0 50px" }}
                              >
                                <div className="img card shadow m-0">
                                  <LazyLoadImage
                                    alt={"image"}
                                    effect="blur"
                                    className="w-100"
                                    src={item.images[0]}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{item.name} </td>
                          <td>{item.color}</td>
                          <td>
                            <div className="actions d-flex align-items-center">
                              <Link to={`/category/edit/${item._id}`}>
                                {" "}
                                <Button className="success" color="success">
                                  <FaPencilAlt />
                                </Button>
                              </Link>

                              <Button
                                className="error"
                                color="error"
                                onClick={() => deleteCat(item._id)}
                                disabled={isLoadingBar === true ? true : false}
                              >
                                <MdDelete />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;
