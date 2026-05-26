"use client";

import YouTubeShortCard from "@/components/youtube-short-card";

const shorts = [
  { id: "6_8cG4WSLJU", title: "Mobility & Strength" },
  { id: "uMSGFvgfE7M", title: "Transformation Blueprint" },
  { id: "wzkcF2IuPHQ", title: "Consistency is Key" },
];

export default function VideoCard() {
  return (
    <section className="py-16 sm:py-24 bg-black w-full overflow-x-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
          <span className="text-[#eb0000] text-sm tracking-[0.4em] font-bold uppercase mb-4 block">
            @rahulfitzz
          </span>
          <h2 className="text-white text-4xl md:text-5xl font-black font-heading uppercase tracking-widest">
            Latest Shorts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {shorts.map((short) => (
            <YouTubeShortCard key={short.id} videoId={short.id} title={short.title} />
          ))}
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <a
            href="https://www.youtube.com/@rahulfitzz"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold tracking-widest uppercase hover:bg-[#eb0000] hover:border-[#eb0000] transition-all duration-300 rounded-full touch-manipulation"
          >
            View Full Channel
          </a>
        </div>
      </div>
    </section>
  );
}
