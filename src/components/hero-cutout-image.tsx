import Image from "next/image";
import { cn } from "@/lib/utils";

type HeroCutoutImageProps = {
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Smaller asset for mobile LCP (~26KB vs 356KB PNG). */
  mobile?: boolean;
};

/** LCP hero — pre-compressed WebP + Next/Image sizing. */
export default function HeroCutoutImage({
  priority = false,
  className,
  sizes = "(max-width: 1023px) 88vw, 550px",
  mobile = false,
}: HeroCutoutImageProps) {
  const src = mobile ? "/gym-hero-mobile.webp" : "/gym-hero.webp";
  const width = mobile ? 640 : 1100;
  const height = mobile ? 800 : 1400;

  return (
    <Image
      src={src}
      alt="RahulFitzz athlete cutout"
      width={width}
      height={height}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      sizes={sizes}
      quality={78}
      className={cn("object-contain object-bottom w-full h-full", className)}
    />
  );
}
