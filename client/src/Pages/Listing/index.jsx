import Sidebar from "../../Components/Sidebar";
import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridR } from "react-icons/cg";
import { HiViewGrid } from "react-icons/hi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import ProductItem from "../../Components/ProductItem";

import { useNavigate, useParams } from "react-router-dom";
import { ProductController } from "../../controllers/index.js";
import CircularProgress from "@mui/material/CircularProgress";
import { FaFilter } from "react-icons/fa";

import { MyContext } from "../../App";

const Listing = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [productView, setProductView] = useState("four");
  const [productData, setProductData] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [filterId, setFilterId] = useState("");

  const [page,setPage] = useState(10);

  const history = useNavigate();

  const openDropdown = Boolean(anchorEl);

  const context = useContext(MyContext);

  const { id } = useParams();

  const getLocation = () => localStorage.getItem("location");

  const fetchListingProducts = (params = {}) => {
    const location = getLocation();
    const url = window.location.href;

    if (url.includes("subCat")) {
      return ProductController.getBySubCatId({ subCatId: id, location, ...params });
    }
    if (url.includes("category")) {
      return ProductController.getByCatId({ catId: id, location, ...params });
    }
    return Promise.resolve({ products: [] });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setFilterId("");

    setisLoading(true);
    fetchListingProducts().then((res) => {
      setProductData(res);
      setisLoading(false);
    });

    context.setEnableFilterTab(true);
  }, [id]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (val) => {
    if(val!=="" && val!==undefined && val!==null){
      setPage(val)
      setAnchorEl(null);
  
      setisLoading(true);
      fetchListingProducts({ page: 1, perPage: val }).then((res) => {
        setProductData(res);
        setisLoading(false);
      });
    }
  


  };

  const handleChangePage = (event, value) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setisLoading(true);
    fetchListingProducts({ page: value, perPage: 8 }).then((res) => {
      setProductData(res);
      setisLoading(false);
    });
  };

  const filterData = (subCatId) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    history(`/products/subCat/${subCatId}`);
  };

  const filterByPrice = (price, subCatId) => {
    const location = getLocation();
    const window_url = window.location.href;
    let request;

    if (window_url.includes("subCat")) {
      request = ProductController.filterByPrice({
        minPrice: price[0],
        maxPrice: price[1],
        subCatId: id,
        location,
      });
    } else if (window_url.includes("category")) {
      request = ProductController.filterByPrice({
        minPrice: price[0],
        maxPrice: price[1],
        catId: id,
        location,
      });
    } else {
      return;
    }

    setisLoading(true);

    request.then((res) => {
      setProductData(res);
      setisLoading(false);
    });
  };

  const filterByRating = (rating, subCatId) => {
    setisLoading(true);
    const location = getLocation();
    const url = window.location.href;
    let request;

    if (url.includes("subCat")) {
      request = ProductController.filterByRating({ rating, subCatId: id, location });
    } else if (url.includes("category")) {
      request = ProductController.filterByRating({ rating, catId: id, location });
    } else {
      return;
    }

    request.then((res) => {
      setProductData(res);
      setisLoading(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  const handleChange = (event, value) => {
    setisLoading(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    ProductController.list({
      subCatId: id,
      page: value,
      perPage: 6,
      location: getLocation(),
    }).then((res) => {
      setProductData(res);
      setisLoading(false);
    });
  };

  return (
    <>
      <section className="product_Listing_Page pt-5">
        <div className="container">
          <div className="productListing d-flex">
            <Sidebar
              filterData={filterData}
              filterByPrice={filterByPrice}
              filterByRating={filterByRating}
              isOpenFilter={context?.isOpenFilters}
            />

            <div className="content_right">
              <div className="showBy mt-0 mb-3 d-flex align-items-center">
                <div className="d-flex align-items-center btnWrapper">
                  <Button
                    className={productView === "one" && "act"}
                    onClick={() => setProductView("one")}
                  >
                    <IoIosMenu />
                  </Button>

                  <Button
                    className={productView === "three" && "act"}
                    onClick={() => setProductView("three")}
                  >
                    <CgMenuGridR />
                  </Button>
                  <Button
                    className={productView === "four" && "act"}
                    onClick={() => setProductView("four")}
                  >
                    <TfiLayoutGrid4Alt />
                  </Button>
                </div>

                <div className="ml-auto showByFilter">
                  <Button onClick={handleClick}>
                    Show {page} <FaAngleDown />
                  </Button>
                  <Menu
                    className="w-100 showPerPageDropdown"
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={openDropdown}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    <MenuItem onClick={()=>handleClose(10)}>10</MenuItem>
                    <MenuItem onClick={()=>handleClose(20)}>20</MenuItem>
                    <MenuItem onClick={()=>handleClose(30)}>30</MenuItem>
                    <MenuItem onClick={()=>handleClose(40)}>40</MenuItem>
                    <MenuItem onClick={()=>handleClose(50)}>50</MenuItem>
                    <MenuItem onClick={()=>handleClose(60)}>60</MenuItem>
                  </Menu>
                </div>
              </div>

              <div className="productListing">
                {isLoading === true ? (
                  <div className="loading d-flex align-items-center justify-content-center">
                    <CircularProgress color="inherit" />
                  </div>
                ) : (
                  <>
                    {productData?.products
                      ?.slice(0)
                      .reverse()
                      .map((item, index) => {
                        return (
                          <ProductItem
                            key={index}
                            itemView={productView}
                            item={item}
                          />
                        );
                      })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Listing;
