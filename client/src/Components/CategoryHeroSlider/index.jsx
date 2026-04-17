import { useCallback, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

/** Images from public/images/slidebar_images — add files here when you add assets */
const SLIDES = [
  {
    src: "/images/slidebar_images/Artboard_3_1.webp",
    alt: "CraftzLK featured collection",
  },
  {
    src: "/images/slidebar_images/NEW_MENS_FACEBOOK_BANNER_new_web.webp",
    alt: "Featured banner",
  },
];

/** Autoplay interval (ms). Request said “three milliseconds”; 3s is practical for a hero slider */
const AUTOPLAY_MS = 3000;

/**
 * Full-width hero below the main category bar.
 * Manual: swipe/drag, segment clicks, edge tap zones, keyboard (when focused).
 */
const CategoryHeroSlider = () => {
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);
  const [fillKey, setFillKey] = useState(0);

  const bumpFill = useCallback(() => {
    setFillKey((k) => k + 1);
  }, []);

  const goTo = (index) => {
    const s = swiperRef.current;
    if (!s) return;
    if (s.params.loop && typeof s.slideToLoop === "function") {
      s.slideToLoop(index);
    } else {
      s.slideTo(index);
    }
  };

  const goPrev = () => swiperRef.current?.slidePrev();
  const goNext = () => swiperRef.current?.slideNext();

  return (
    <section
      className="category-hero-slider"
      aria-label="Featured slides"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }}
    >
      <Swiper
        className="category-hero-slider__swiper"
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={600}
        loop={SLIDES.length > 1}
        slidesPerView={1}
        grabCursor
        autoplay={
          SLIDES.length > 1
            ? {
                delay: AUTOPLAY_MS,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActive(swiper.realIndex);
          bumpFill();
        }}
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.src}>
            <div className="category-hero-slider__slide">
              <img
                src={slide.src}
                alt={slide.alt}
                className="category-hero-slider__img"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {SLIDES.length > 1 && (
        <>
          {/* Edge tap zones — wide touch targets without heavy chrome */}
          <button
            type="button"
            className="category-hero-slider__edge category-hero-slider__edge--prev"
            onClick={goPrev}
            aria-label="Previous slide"
          />
          <button
            type="button"
            className="category-hero-slider__edge category-hero-slider__edge--next"
            onClick={goNext}
            aria-label="Next slide"
          />

          {/* Segmented progress + jump: each bar fills during its slide; click any bar to jump */}
          <div className="category-hero-slider__rail" role="tablist" aria-label="Slide navigation">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={active === index}
                className={`category-hero-slider__segment ${active === index ? "is-active" : ""}`}
                onClick={() => goTo(index)}
              >
                <span className="category-hero-slider__segment-track" />
                {active === index && (
                  <span
                    key={fillKey}
                    className="category-hero-slider__segment-fill"
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>

          <p className="category-hero-slider__hint">Swipe or tap the bar · Pause on hover</p>
        </>
      )}
    </section>
  );
};

export default CategoryHeroSlider;
