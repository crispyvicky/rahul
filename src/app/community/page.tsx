"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  ImagePlus,
  Send,
  Star,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockPosts = [
  {
    id: 1,
    user: { name: "Arjun Sharma", avatar: "A", level: 15 },
    type: "transformation",
    content:
      "12 weeks of discipline with the RahulFitzz Blueprint. Lost 14kg, gained confidence. The AI coach adapted my plan every week. This community kept me accountable. 🔥",
    beforeImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop",
    likes: 342,
    comments: 28,
    isFeatured: true,
    timeAgo: "2h ago",
  },
  {
    id: 2,
    user: { name: "Priya Menon", avatar: "P", level: 8 },
    type: "progress",
    content:
      "Day 21 of the 30-Day Iron Warrior Challenge. Deadlifted 100kg today — a new PR! 💪 Never thought I'd get here. The Gym Mode rep tracking is addictive.",
    likes: 189,
    comments: 15,
    isFeatured: false,
    timeAgo: "4h ago",
  },
  {
    id: 3,
    user: { name: "Vikram Raj", avatar: "V", level: 22 },
    type: "tip",
    content:
      "Pro tip: If you're stalling on bench press, try paused reps at 70% of your max. 3 sets of 5 with a 2-second pause at the bottom. Changed my pressing game completely. Credit to the AI Coach for this programming insight.",
    likes: 256,
    comments: 41,
    isFeatured: false,
    timeAgo: "6h ago",
  },
  {
    id: 4,
    user: { name: "Neha Kapoor", avatar: "N", level: 11 },
    type: "transformation",
    content:
      "8-week transformation. From not being able to do a single pull-up to doing 8 strict reps. The progressive overload tracking in Gym Mode made all the difference. 🙌",
    beforeImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=500&fit=crop",
    likes: 421,
    comments: 52,
    isFeatured: true,
    timeAgo: "1d ago",
  },
];

const filters = ["All", "Transformations", "Progress", "Tips"];

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredPosts =
    activeFilter === "All"
      ? mockPosts
      : mockPosts.filter(
          (p) => p.type.toLowerCase() === activeFilter.toLowerCase().replace("s", "").replace("tion", "")
            || (activeFilter === "Transformations" && p.type === "transformation")
            || (activeFilter === "Progress" && p.type === "progress")
            || (activeFilter === "Tips" && p.type === "tip")
        );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
            Community
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Share progress, inspire others, get featured
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:shadow-[0_0_20px_rgba(235,0,0,0.3)] shrink-0">
          <ImagePlus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
              activeFilter === f
                ? "bg-brand text-white"
                : "bg-white/5 text-text-secondary border border-white/5 hover:bg-white/10"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4 max-w-2xl">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
          >
            {/* Post Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand text-sm font-bold shrink-0">
                  {post.user.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm">{post.user.name}</p>
                    {post.isFeatured && (
                      <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs">
                    Lv.{post.user.level} · {post.timeAgo}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full hidden sm:inline-block",
                  post.type === "transformation" && "bg-brand/10 text-brand",
                  post.type === "progress" && "bg-blue-500/10 text-blue-400",
                  post.type === "tip" && "bg-emerald-500/10 text-emerald-400"
                )}
              >
                {post.type}
              </span>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-5 pb-4">
              <p className="text-text-secondary text-sm leading-relaxed">{post.content}</p>
            </div>

            {/* Transformation images */}
            {post.beforeImage && post.afterImage && (
              <div className="flex gap-1 px-4 sm:px-5 pb-4">
                <div className="flex-1 relative rounded-xl overflow-hidden aspect-[4/5]">
                  <img src={post.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                    Before
                  </span>
                </div>
                <div className="flex-1 relative rounded-xl overflow-hidden aspect-[4/5]">
                  <img src={post.afterImage} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-brand/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                    After
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex items-center gap-6">
              <button
                onClick={() => toggleLike(post.id)}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  likedPosts.includes(post.id)
                    ? "text-brand"
                    : "text-text-secondary hover:text-white"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    likedPosts.includes(post.id) && "fill-current"
                  )}
                />
                <span className="text-xs font-bold">
                  {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                </span>
              </button>
              <button className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-bold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
