import CategoryHeroSlider from "../../Components/CategoryHeroSlider";
import HomePosterStrip from "../../Components/HomePosterStrip";
import FeaturedProductsRail from "../../Components/FeaturedProductsRail";
import TrendingNowRail from "../../Components/TrendingNowRail";
import NewArrivalsRail from "../../Components/NewArrivalsRail";
import BestSellersRail from "../../Components/BestSellersRail";
import HomeHeroBanner from "../../Components/HomeHeroBanner";
import HomeCustomerReviewSummary from "../../Components/HomeCustomerReviewSummary";
import PopularCategoriesGrid from "../../Components/PopularCategoriesGrid";
import React, { useContext, useEffect, useState } from "react";

import { MyContext } from "../../App";
import { BannerController } from "../../controllers/index.js";

import Banners from "../../Components/banners";
import { Link } from "react-router-dom";
import ChatBox from "../Chat";
import { HOME_SECTION_INNER_DIVIDED } from "../../Components/homeRailLayout";

const Home = () => {
  const [bannerList, setBannerList] = useState([]);
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const [homeBottomBanners, setHomeBottomBanners] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setisHeaderFooterShow?.(true);

    BannerController.getSlideBanners().then((res) => {
      setBannerList(res);
    });

    BannerController.getSideBanners().then((res) => {
      setHomeSideBanners(res);
    });

    BannerController.getBottomBanners().then((res) => {
      setHomeBottomBanners(res);
    });

    context?.setEnableFilterTab?.(false);
    context?.setIsBottomShow?.(true);
  }, []);

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
