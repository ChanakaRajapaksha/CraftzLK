import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "./style.css";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";

const Banners = (props) => {
  const context = useContext(MyContext);

  return (
    <>
      <div className="bannerAds pt-3 pb-3">
        {context?.windowWidth > 992 ? (
          <Swiper
            slidesPerView={props?.col}
            spaceBetween={0}
            loop={true}
            navigation={true}
            slidesPerGroup={1}
            modules={[Navigation]}
            className="bannerSection pt-3"
            breakpoints={{
              300: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              400: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              600: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              750: {
                slidesPerView: props?.col,
                spaceBetween: 10,
              },
            }}
          >
            {props?.data?.length !== 0 &&
              props?.data?.map((item, index) => {
                return (
                  <SwiperSlide key={index}>
                    <div className={`col_`}>
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
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
          </Swiper>
        ) : (
          <div
            className="bannerSection pt-3"
            style={{ gridTemplateColumns: `repeat(${props?.col},1fr)` }}
          >
            {props?.data?.length !== 0 &&
              props?.data?.map((item, index) => {
                return (
                   <div className={`col_`}>
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
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      )}
                    </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
};

export default Banners;
