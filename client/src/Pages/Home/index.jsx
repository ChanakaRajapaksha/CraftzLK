import CategoryHeroSlider from "../../Components/CategoryHeroSlider";
import HomePosterStrip from "../../Components/HomePosterStrip";
import FeaturedProductsRail from "../../Components/FeaturedProductsRail";
import TrendingNowRail from "../../Components/TrendingNowRail";
import NewArrivalsRail from "../../Components/NewArrivalsRail";
import BestSellersRail from "../../Components/BestSellersRail";
import HomeHeroBanner from "../../Components/HomeHeroBanner";
import HomeCustomerReviewSummary from "../../Components/HomeCustomerReviewSummary";
import HomeProductImagesSection from "../../Components/HomeProductImagesSection";
import PopularCategoriesGrid from "../../Components/PopularCategoriesGrid";
import React, { useContext, useEffect, useState } from "react";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

import Banners from "../../Components/banners";
import { Link } from "react-router-dom";
import ChatBox from "../Chat";
import { HOME_SECTION_INNER_DIVIDED } from "../../Components/homeRailLayout";

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

    if (Array.isArray(categoryData) && categoryData.length > 0) {
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
        <HomePosterStrip />

        <FeaturedProductsRail />

        <TrendingNowRail />

        <NewArrivalsRail />

        <PopularCategoriesGrid />

        <BestSellersRail />

        <HomeHeroBanner />

        <HomeProductImagesSection
          randomCatProducts={randomCatProducts}
          windowWidth={context?.windowWidth ?? 0}
        />

        <div className="homeContentAfterRails">
          {(homeSideBanners?.length !== 0 ||
            bannerList?.length !== 0 ||
            homeBottomBanners?.length !== 0) && (
            <section className="homeProducts pb-0 px-3 sm:px-4 md:px-6 lg:px-8">
              <div className={HOME_SECTION_INNER_DIVIDED}>
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
          )}
        </div>
      </div>

      <div className="home-tail">
        <HomeCustomerReviewSummary />
      </div>

      <ChatBox />
    </>
  );
};

export default Home;
