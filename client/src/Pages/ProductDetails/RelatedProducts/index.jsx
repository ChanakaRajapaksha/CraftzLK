import React, { useContext } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import ProductItem from "../../../Components/ProductItem";

import { MyContext } from "../../../App";

const RelatedProducts = (props) => {

    const context = useContext(MyContext);

    return (
        <>
            <div className="d-flex align-items-center mt-3">
                <div className="info w-75">
                    <h3 className="mb-0 hd">{props.title}</h3>
                </div>
            </div>


            <div className="product_row relatedProducts w-100 mt-0">
            {
                context.windowWidth>992 ?
                <Swiper
                slidesPerView={5}
                spaceBetween={0}
                navigation={true}
                slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                modules={[Navigation]}
                className="mySwiper"
                breakpoints={{
                    350: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                    },
                    400: {
                        slidesPerView: 2,
                        spaceBetween: 5,
                    },
                    600: {
                        slidesPerView: 3,
                        spaceBetween: 5,
                    },
                    750: {
                        slidesPerView: 5,
                        spaceBetween: 5,
                    }
                }}
                >
                    {
                        props?.data?.length !== 0 && props?.data?.map((item, index) => {
                            return (
                                <SwiperSlide key={index} >
                                    <ProductItem item={item} itemView={props.itemView} />
                                </SwiperSlide>
                            )
                        })
                    }
                </Swiper>

                :

                <div className="productScroller">
                 {
                        props?.data?.length !== 0 && props?.data?.map((item, index) => {
                            return (
                                    <ProductItem item={item} key={index} itemView={props.itemView} />
                            )
                        })
                    }
                </div>
            }
                
            </div>
        </>
    )
}

export default RelatedProducts;