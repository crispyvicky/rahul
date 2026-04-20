import { FeatureCard } from "./benefit-card";
import mobileCover from "../assets/img/mobile1.png";
import mimg from "../assets/img/phone.jpg";
import { motion } from "framer-motion";

export function Features({ features, childVariants }: any) {
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

      {/* center */}
      <motion.div
        variants={childVariants}
        className="w-full md:w-auto xl:w-auto order-first md:order-none xl:order-none"
      >
        <div className="relative w-[260px] h-[500px] mx-auto">
          <img src={(mobileCover as any).src || mobileCover} alt="mobileCover" className="w-full h-full object-contain" />
          <img
            className="absolute top-0 left-0 w-full h-full p-3 !py-[7px] object-cover rounded-[2.2rem]"
            alt="mobileImage"
            src={(mimg as any).src || mimg}
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
