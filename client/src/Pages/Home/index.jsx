import CategoryHeroSlider from "../../Components/CategoryHeroSlider";
import FeaturedProductsRail from "../../Components/FeaturedProductsRail";
import TrendingNowRail from "../../Components/TrendingNowRail";
import NewArrivalsRail from "../../Components/NewArrivalsRail";
import HomeBanner from "../../Components/HomeBanner";
import Button from "@mui/material/Button";
import { IoIosArrowRoundForward } from "react-icons/io";
import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import ProductItem from "../../Components/ProductItem";
import HomeCat from "../../Components/HomeCat";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

import Banners from "../../Components/banners";
import { Link } from "react-router-dom";
import ChatBox from "../Chat";

const Home = () => {
  const [bannerList, setBannerList] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const [homeBottomBanners, setHomeBottomBanners] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setisHeaderFooterShow?.(true);

    fetchDataFromApi("/api/banners").then((res) => {
      setBannerList(res);
    });

    fetchDataFromApi("/api/homeSideBanners").then((res) => {
      setHomeSideBanners(res);
    });

    fetchDataFromApi("/api/homeBottomBanners").then((res) => {
      setHomeBottomBanners(res);
    });

    context?.setEnableFilterTab?.(false);
    context?.setIsBottomShow?.(true);
  }, []);

  useEffect(() => {
    const categoryData = context?.categoryData;

    if (categoryData?.length !== 0) {
      const randomIndex = Math.floor(
        Math.random() * categoryData.length
      );

      fetchDataFromApi(
        `/api/products/catId?catId=${
          categoryData[randomIndex]?.id
        }&location=${localStorage.getItem("location")}`
      ).then((res) => {
        setRandomCatProducts({
          catName: categoryData[randomIndex]?.name,
          catId: categoryData[randomIndex]?.id,
          products: res?.products,
        });
      });
    }
  }, [context?.categoryData]);

  return (
    <>
      <CategoryHeroSlider />

      <div className="homePatternBg">
        <FeaturedProductsRail />

        <TrendingNowRail />

        <NewArrivalsRail />

        <div className="homeContentAfterRails">
        {context?.categoryData?.length !== 0 && (
          <HomeCat catData={context?.categoryData} />
        )}

        <section className="homeProducts pb-0">
          <div className="container">
            <div className="row homeProductsRow">
              <div className="col-md-3">
                <div className="sticky">
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
              </div>

              <div className="col-md-9 productRow">
                {bannerList?.length !== 0 && (
                  <Banners data={bannerList} col={3} />
                )}
              </div>
            </div>

            {homeBottomBanners?.length !== 0 && (
              <Banners data={homeBottomBanners} col={3} />
            )}
          </div>
        </section>

        <div className="container">
          {randomCatProducts?.products?.length > 0 && (
            <>
              <div className="d-flex align-items-center mt-1 pr-3">
                <div className="info">
                  <h3 className="mb-0 hd">{randomCatProducts?.catName}</h3>
                  <p className="text-light text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>

                <Link
                  to={`/products/category/${randomCatProducts?.catId}`}
                  className="ml-auto"
                >
                  <Button className="viewAllBtn">
                    View All <IoIosArrowRoundForward />
                  </Button>
                </Link>
              </div>

              <div className="product_row w-100 mt-2">
                {context?.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={5}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context?.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                    breakpoints={{
                      300: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                      },
                      400: {
                        slidesPerView: 2,
                        spaceBetween: 5,
                      },
                      600: {
                        slidesPerView: 4,
                        spaceBetween: 5,
                      },
                      750: {
                        slidesPerView: 5,
                        spaceBetween: 5,
                      },
                    }}
                  >
                    {randomCatProducts.products
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
                ) : (
                  <div className="productScroller">
                    {randomCatProducts.products
                      ?.slice(0)
                      ?.reverse()
                      ?.map((item, index) => {
                        return <ProductItem item={item} key={index} />;
                      })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      <ChatBox />
    </>
  );
};

export default Home;
