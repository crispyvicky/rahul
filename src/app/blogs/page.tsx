"use client";

import Blog from "@/components/blog";
import Contact from "@/components/contact";

export default function BlogsPage() {
  return (
    <div className="bg-[#050505] min-h-screen pt-24 md:pt-28">
      <Blog />
      <Contact />
    </div>
  );
}
