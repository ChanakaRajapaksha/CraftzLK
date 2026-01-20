import React, { useEffect } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import { useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { MyContext } from "../../App";
import { IoMdCloseCircle } from "react-icons/io";

import { fetchDataFromApi } from "../../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import ProductItem from "../../Components/ProductItem";

const Sidebar = (props) => {
  const [value, setValue] = useState([100, 100000]);
  const [value2, setValue2] = useState(0);

  const [subCatId, setSubCatId] = useState("");

  const [filterSubCat, setfilterSubCat] = React.useState();
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const context = useContext(MyContext);

  const { id } = useParams();

  useEffect(() => {
    setSubCatId(id);
    fetchDataFromApi("/api/homeSideBanners").then((res) => {
      setHomeSideBanners(res);
    });

    const location = localStorage.getItem("location");

    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(
        (res) => {
          setFeaturedProducts(res);
        }
      );
    }
  }, [id]);

  useEffect(() => {
    setIsOpenFilter(props.isOpenFilter);
  }, [props.isOpenFilter]);

  const handleChange = (event) => {
    setfilterSubCat(event.target.value);
    props.filterData(event.target.value);
    setSubCatId(event.target.value);
  };

  useEffect(() => {
    props.filterByPrice(value, subCatId);
  }, [value, id]);

  const filterByRating = (rating) => {
    props.filterByRating(rating, subCatId);
  };

  return (
    <>
      <div className={`sidebar ${isOpenFilter === true && "open"}`}>
        {context.windowWidth < 992 && (
          <>
            <div className="info d-flex align-items-center">
              <h5>Filter Products</h5>
              <span className="ml-auto closeFilters">
                <IoMdCloseCircle
                  onClick={() =>
                    context?.setIsOpenFilters(!context?.isOpenFilters)
                  }
                />
              </span>
            </div>
            <hr />
          </>
        )}

        <div className="filterBox">
          <h6>PRODUCT CATEGORIES</h6>

          <div className="scroll">
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={filterSubCat}
              onChange={handleChange}
            >
              {context?.subCategoryData?.length !== 0 &&
                context?.subCategoryData?.map((item, index) => {
                  return (
                    <FormControlLabel
                      value={item?.id}
                      control={<Radio />}
                      label={item?.name}
                    />
                  );
                })}
            </RadioGroup>
          </div>
        </div>

        <div className="filterBox">
          <h6>FILTER BY PRICE</h6>

          <RangeSlider
            value={value}
            onInput={setValue}
            min={100}
            max={60000}
            step={5}
          />

          <div className="d-flex pt-2 pb-2 priceRange">
            <span>
              From: <strong className="text-dark">Rs: {value[0]}</strong>
            </span>
            <span className="ml-auto">
              From: <strong className="text-dark">Rs: {value[1]}</strong>
            </span>
          </div>
        </div>

        <div className="filterBox">
          <h6>FILTER BY RATING</h6>

          <div className="scroll pl-0">
            {
              // <ul>
              //     <li>
              //         <FormControlLabel className='w-100' control={<Checkbox />} label="Frito Lay" />
              //     </li>
              //     <li>
              //         <FormControlLabel className='w-100' control={<Checkbox />} label="Nespresso" />
              //     </li>
              //     <li>
              //         <FormControlLabel className='w-100' control={<Checkbox />} label="Frito Lay" />
              //     </li>
              //     <li>
              //         <FormControlLabel className='w-100' control={<Checkbox />} label="Nespresso" />
              //     </li>
              //     <li>
              //         <FormControlLabel className='w-100' control={<Checkbox />} label="Frito Lay" />
              //     </li>
              //     <li>
              //         <FormControlLabel className='w-100' control={<Checkbox />} label="Nespresso" />
              //     </li>
              // </ul>
            }
            <ul>
              <li onClick={() => filterByRating(5)} className="cursor">
                <Rating name="read-only" value={5} readOnly size="small" />
              </li>
              <li onClick={() => filterByRating(4)} className="cursor">
                <Rating name="read-only" value={4} readOnly size="small" />
              </li>
              <li onClick={() => filterByRating(3)} className="cursor">
                <Rating name="read-only" value={3} readOnly size="small" />
              </li>
              <li onClick={() => filterByRating(2)} className="cursor">
                <Rating name="read-only" value={2} readOnly size="small" />
              </li>
              <li onClick={() => filterByRating(1)} className="cursor">
                <Rating name="read-only" value={1} readOnly size="small" />
              </li>
            </ul>
          </div>
        </div>

        {featuredProducts?.length !== 0 && (
            
          <div className="w-100 res-hide">
            <h6 className="mb-3">FEATURED PRODUCTS</h6>
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              navigation={true}
              slidesPerGroup={1}
              modules={[Navigation]}
              className="mySwiper"
            >
              {featuredProducts?.length !== 0 &&
                featuredProducts
                  ?.slice(0)
                  ?.reverse()
                  ?.map((item, index) => {
                    return (
                      <SwiperSlide key={index}>
                        <ProductItem item={item} />
                      </SwiperSlide>
                    );
                  })}

              <SwiperSlide style={{ opacity: 0 }}>
                <div className={`productItem`}></div>
              </SwiperSlide>
            </Swiper>
            <br />
          </div>
        )}

        {homeSideBanners?.length !== 0 &&
          homeSideBanners?.map((item, index) => {
            return (
              <div className="banner mb-3" key={index}>
                {item?.subCatId !== null ? (
                  <Link
                    to={`/products/subCat/${item?.subCatId}`}
                    className="box"
                  >
                    <img
                      src={item?.images[0]}
                      className="w-100 transition"
                      alt="banner img"
                    />
                  </Link>
                ) : (
                  <Link
                    to={`/products/category/${item?.catId}`}
                    className="box"
                  >
                    <img
                      src={item?.images[0]}
                      className="cursor w-100 transition"
                      alt="banner img"
                    />
                  </Link>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Sidebar;
