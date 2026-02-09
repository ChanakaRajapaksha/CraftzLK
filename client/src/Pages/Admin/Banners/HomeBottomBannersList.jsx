import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Button from "@mui/material/Button";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": { backgroundColor: emphasize(backgroundColor, 0.06) },
    "&:active": { boxShadow: theme.shadows[1], backgroundColor: emphasize(backgroundColor, 0.12) },
  };
});

export default function HomeBottomBannersList() {
  const [list, setList] = useState([]);
  const { setAlertBox } = useOutletContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/homeBottomBanners").then((res) => setList(Array.isArray(res) ? res : []));
  }, []);

  const deleteBanner = (id) => {
    deleteData(`/api/homeBottomBanners/${id}`).then(() => {
      fetchDataFromApi("/api/homeBottomBanners").then((res) => setList(Array.isArray(res) ? res : []));
      setAlertBox({ open: true, error: false, msg: "Banner Deleted!" });
    });
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
        <h5 className="mb-0">Home Bottom Banners List</h5>
        <div className="ml-auto d-flex align-items-center">
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb component={Link} to="/dashboard" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
            <StyledBreadcrumb label="Home Bottom Banners" deleteIcon={<ExpandMoreIcon />} />
          </Breadcrumbs>
          <Link to="/dashboard/homeBottomBanners/add">
            <Button className="btn-blue ml-3 pl-3 pr-3">Banner Upload</Button>
          </Link>
        </div>
      </div>
      <div className="card shadow border-0 p-3 mt-4">
        <div className="table-responsive mt-3">
          <table className="table table-bordered table-striped v-align">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "200px" }}>IMAGE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item._id || item.id}>
                  <td>
                    <div className="imgWrapper" style={{ width: "150px" }}>
                      <LazyLoadImage alt="banner" effect="blur" className="w-100" src={item.images?.[0]} />
                    </div>
                  </td>
                  <td>
                    <div className="actions d-flex align-items-center">
                      <Link to={`/dashboard/homeBottomBanners/edit/${item._id || item.id}`}>
                        <Button className="success" color="success"><FaPencilAlt /></Button>
                      </Link>
                      <Button className="error" color="error" onClick={() => deleteBanner(item._id || item.id)}>
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
  );
}
