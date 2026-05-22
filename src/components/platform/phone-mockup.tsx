import type { StaticImageData } from "next/image";
import mobileCover from "@/assets/img/mobile1.png";

function imgSrc(img: string | StaticImageData): string {
  return typeof img === "string" ? img : img.src;
}

type Props = {
  className?: string;
};

export function PhoneMockup({ className = "" }: Props) {
  return (
    <div className={`relative w-[220px] sm:w-[260px] h-[420px] sm:h-[500px] mx-auto ${className}`}>
      <img
        src={imgSrc(mobileCover)}
        alt=""
        aria-hidden
        className="w-full h-full object-contain relative z-10 pointer-events-none"
      />
      <div className="absolute inset-0 p-3 py-[7px] overflow-hidden rounded-[2.2rem] z-0">
        <img
          src="/phone.jpg"
          alt="RahulFitzz app preview"
          className="w-full h-full object-cover object-[center_30%] rounded-[2.2rem]"
        />
      </div>
    </div>
  );
}
