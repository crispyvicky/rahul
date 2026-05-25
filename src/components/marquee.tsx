"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const TICKER_ITEMS = [
  "FITNESS PLANS",
  "WORKOUT ROUTINES",
  "PROGRESS TRACKING",
  "ELITE COACHING",
  "GYM MODE",
  "AI COACH",
] as const;

function TickerStrip({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="rf-ticker-strip flex shrink-0 items-center gap-8 sm:gap-12"
      aria-hidden={ariaHidden}
    >
      {TICKER_ITEMS.map((item) => (
        <span
          key={item}
          className="rf-ticker-item flex shrink-0 items-center gap-2 whitespace-nowrap text-white second"
        >
          <FontAwesomeIcon
            icon={faCircle}
            className="!text-[5px] text-white shrink-0"
            aria-hidden
          />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}

const Marquee = () => {
  return (
    <div className="rf-ticker w-full overflow-hidden bg-[#eb0000] py-3 sm:py-4 border-y border-[#eb0000]/80">
      <div className="rf-ticker-track flex w-max items-center">
        <TickerStrip />
        <TickerStrip ariaHidden />
      </div>
    </div>
  );
};

export default Marquee;
