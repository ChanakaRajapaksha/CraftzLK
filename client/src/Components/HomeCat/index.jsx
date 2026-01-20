import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from "react-router-dom";

import { MyContext } from "../../App";

const HomeCat = (props) => {

    const context = useContext(MyContext);

    return (
        <section className="homeCat pb-2">
            <div className="container">
                <h3 className="mb-3 hd">Featured Categories</h3>
                <Swiper
                    slidesPerView={8}
                    spaceBetween={0}
                    navigation={context.windowWidth>992 ? true : false}
                    slidesPerGroup={context.windowWidth>992 ? 3 : 1}
                    modules={[Navigation]}
                    loop={false}
                    className="mySwiper"
                    breakpoints={{
                        320: {
                            slidesPerView: 3,
                            spaceBetween: 10,
                          },
                        500: {
                          slidesPerView: 5,
                          spaceBetween: 10,
                        },
                        768: {
                          slidesPerView: 8,
                          spaceBetween: 10,
                        }
                      }}
                >



                    {
                        props.catData?.length !== 0 && props.catData?.map((cat, index) => {
                            return (
                                <SwiperSlide key={index}>
                                    <Link to={`/products/category/${cat._id}`}>
                                        <div className="item text-center cursor" style={{ background: cat.color }}>
                                            <img src={cat.images[0]} />
                                        </div>
                                        <h6>{cat.name}</h6>
                                    </Link>
                                </SwiperSlide>
                            )
                        })
                    }



                </Swiper>
            </div>
        </section>
    )
}

export default HomeCat;