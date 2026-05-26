import { Link } from "react-router-dom";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@mui/material/Button";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductItem from "../ProductItem";
import { HOME_RAIL_SECTION, HOME_SECTION_INNER_DIVIDED } from "../homeRailLayout";

const IMAGES_UNDERLINE_PATH =
  "M 2 9.4 C 18 5.2 34 11 50 7.4 C 64 4.6 78 3.4 88 6.8 C 94 8.8 100 4.8 103 3";
const IMAGES_UNDERLINE_VIEWBOX = "0 0 108 14";

const TITLE_SCROLL_VIEWPORT = {
  once: true,
  amount: 0.45,
  margin: "40px 0px",
};

function ProductImagesTitleUnderline({ reduceMotion }) {
  const rawId = useId().replace(/:/g, "");
  const lineGradId = `hpi-line-${rawId}`;
  const dotGradId = `hpi-dot-${rawId}`;

  const drawTransition = reduceMotion
    ? { duration: 0 }
    : {
        pathLength: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.4 },
      };

  const pathDone = { pathLength: 1, opacity: 1 };

  return (
    <span className="relative inline-block min-w-0 pb-2 sm:pb-2.5">
      <span className="relative z-10">Images</span>
      <motion.svg
        className="pointer-events-none absolute -bottom-0.5 left-0 h-[15px] w-[calc(100%+0.35rem)] min-w-full overflow-visible sm:h-[17px]"
        viewBox={IMAGES_UNDERLINE_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
        initial={false}
      >
        <defs>
          <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#c9a961" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#8b6f47" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={dotGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#8b6f47" />
          </radialGradient>
        </defs>
        <motion.path
          d={IMAGES_UNDERLINE_PATH}
          fill="none"
          stroke="rgba(61,40,23,0.14)"
          strokeWidth={2.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? pathDone : { pathLength: 0, opacity: 0 }}
          whileInView={pathDone}
          viewport={TITLE_SCROLL_VIEWPORT}
          transition={drawTransition}
        />
        <motion.path
          d={IMAGES_UNDERLINE_PATH}
          fill="none"
          stroke={`url(#${lineGradId})`}
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? pathDone : { pathLength: 0, opacity: 0.75 }}
          whileInView={pathDone}
          viewport={TITLE_SCROLL_VIEWPORT}
          transition={drawTransition}
        />
        <motion.circle
          cx={103}
          cy={3.1}
          r={2.45}
          fill={`url(#${dotGradId})`}
          initial={
            reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
          }
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={TITLE_SCROLL_VIEWPORT}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay: 0.92, type: "spring", stiffness: 380, damping: 18 }
          }
        />
      </motion.svg>
    </span>
  );
}

/**
 * Category-based product carousel (real API products) — labeled “Product Images” on Home.
 */
const HomeProductImagesSection = ({ randomCatProducts, windowWidth }) => {
  const reduceMotion = useReducedMotion();

  if (!randomCatProducts?.products?.length) {
    return null;
  }

  const wide = windowWidth > 992;

  return (
    <section
      className={HOME_RAIL_SECTION}
      aria-labelledby="product-images-heading"
    >
      <div className={HOME_SECTION_INNER_DIVIDED}>
        <h2
          id="product-images-heading"
          className="mb-5 flex flex-wrap items-baseline gap-x-2 font-heading text-lg font-bold uppercase tracking-[0.12em] text-vintage-brown sm:mb-6 sm:gap-x-3 sm:text-xl md:text-2xl"
        >
          <span>Product</span>
          <ProductImagesTitleUnderline reduceMotion={!!reduceMotion} />
        </h2>

        <div className="d-flex align-items-center mt-1 pr-3">
          <div className="info">
            <h3 className="mb-0 hd">{randomCatProducts.catName}</h3>
            <p className="text-light text-sml mb-0">
              Do not miss the current offers until the end of March.
            </p>
          </div>

          <Link
            to={`/products/category/${randomCatProducts.catId}`}
            className="ml-auto"
          >
            <Button className="viewAllBtn">
              View All <IoIosArrowRoundForward />
            </Button>
          </Link>
        </div>

        <div className="product_row w-100 mt-2">
          {wide ? (
            <Swiper
              slidesPerView={5}
              spaceBetween={0}
              navigation={true}
              slidesPerGroup={wide ? 3 : 1}
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
                ?.map((item, index) => (
                  <SwiperSlide key={index}>
                    <ProductItem item={item} />
                  </SwiperSlide>
                ))}

              <SwiperSlide style={{ opacity: 0 }}>
                <div className="productItem" />
              </SwiperSlide>
            </Swiper>
          ) : (
            <div className="productScroller">
              {randomCatProducts.products
                ?.slice(0)
                ?.reverse()
                ?.map((item, index) => (
                  <ProductItem item={item} key={index} />
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeProductImagesSection;
