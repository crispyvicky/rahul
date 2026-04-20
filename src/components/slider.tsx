import React, { useEffect, useRef } from "react";
import Splide from "@splidejs/splide";
import "@splidejs/splide/dist/css/splide.min.css";
import app4 from "../assets/img/app4.jpg";
import app6 from "../assets/img/app6.png";
import app3 from "../assets/img/app3.jpg";

const Vertical_Slider = () => {
  const splideRef = useRef(null);

  useEffect(() => {
    if (!splideRef.current) return;

    const splide = new Splide(splideRef.current, {
      type: "loop",
      drag: false,
      focus: "center",
      direction: "ttb",
      height: "500px",
      width: "100%",
      perPage: 1,
      gap: "0rem",
      arrows: false,
      pagination: false,
      autoplay: true,
      speed: 2000,
      interval: 3000,
      pauseOnHover: false,
      breakpoints: {
        400: { height: "400px" },
      },
    });

    splide.mount();

    return () => {
      splide.destroy();
    };
  }, []);

  const img = [app4, app6, app3];
  return (
    <div className="vertical_slider">
      <div className="splide" ref={splideRef}>
        <div className="splide__track">
          <div className="splide__list">
            {img.map((item, i) => (
              <div
                className="splide__slide"
                key={i}
                style={{
                  width: "100%",
                }}
              >
                <img
                  src={(item as any)?.src || item}
                  alt={`Slide ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vertical_Slider;
