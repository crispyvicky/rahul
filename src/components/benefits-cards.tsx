import type { StaticImageData } from "next/image";
import { FeatureCard } from "./benefit-card";
import mobileCover from "../assets/img/mobile1.png";
import { motion } from "framer-motion";

function imgSrc(img: string | StaticImageData): string {
  return typeof img === "string" ? img : img.src;
}

export function Features({ features, childVariants }: any) {
  const screenSrc = "/phone.jpg";
  const frameSrc = imgSrc(mobileCover);

  return (
    <>
      {/* left */}
      <motion.div
        variants={childVariants}
        className="w-full md:w-[45%] xl:w-[45%] grid grid-cols-1 gap-6"
      >
        <FeatureCard {...features[0]} />
        <FeatureCard {...features[2]} />
      </motion.div>

      {/* center — your photo (phone.jpg) must sit ON TOP of mobile1.png frame */}
      <motion.div
        variants={childVariants}
        className="w-full md:w-auto xl:w-auto order-first md:order-none xl:order-none"
      >
        <div className="relative w-[260px] h-[500px] mx-auto">
          <img
            src={frameSrc}
            alt=""
            aria-hidden
            className="w-full h-full object-contain"
          />
          <img
            src={screenSrc}
            alt="RahulFitzz app preview"
            className="absolute top-0 left-0 w-full h-full p-3 py-[7px] object-cover object-[center_30%] rounded-[2.2rem] z-[1]"
          />
        </div>
      </motion.div>

      {/* right */}
      <motion.div
        variants={childVariants}
        className="w-full md:w-[45%] xl:w-[45%] grid grid-cols-1 gap-6"
      >
        <FeatureCard {...features[1]} />
        <FeatureCard {...features[3]} />
      </motion.div>
    </>
  );
}
