"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

type Props = {
  videoId: string;
  title: string;
};

/**
 * Tap-to-play YouTube Short — avoids black iframe shells on iPhone
 * (autoplay embeds often fail in scroll on iOS Safari).
 */
export default function YouTubeShortCard({ videoId, title }: Props) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (active) {
    return (
      <div className="relative w-full max-w-[350px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 border border-white/10 bg-[#111]">
        <iframe
          title={title}
          src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          style={{ border: "none" }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="relative w-full max-w-[350px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 border border-white/10 bg-[#111] text-left touch-manipulation"
      aria-label={`Play ${title} on YouTube`}
    >
      <Image
        src={thumb}
        alt={title}
        fill
        sizes="(max-width: 768px) 90vw, 350px"
        className="object-cover"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eb0000] shadow-lg">
          <Play className="h-7 w-7 fill-white text-white ml-0.5" />
        </span>
        <span className="text-white text-xs font-bold uppercase tracking-widest text-center">
          Tap to play
        </span>
        <span className="text-[#96979c] text-[10px] text-center line-clamp-2">{title}</span>
      </div>
    </button>
  );
}
