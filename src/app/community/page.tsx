"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  ImagePlus,
  Send,
  Star,
  Filter,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";
import { getCommunityPosts, createCommunityPost, togglePostLike } from "@/lib/supabase-service";

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
  const { user: currentUser } = useUserStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"progress" | "tip" | "transformation">("progress");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    const data = await getCommunityPosts(30);
    setPosts(data);
    setIsLoading(false);
  };

  const handleToggleLike = async (id: string) => {
    if (!currentUser) return alert("Please login to like posts!");
    
    // Optimistic UI update
    const isLiked = likedPosts.includes(id);
    setLikedPosts((prev) =>
      isLiked ? prev.filter((p) => p !== id) : [...prev, id]
    );

    const result = await togglePostLike(currentUser.id, id);
    // Real load to update numbers
    if (result !== null) loadPosts();
  };

  const handleCreatePost = async () => {
    if (!currentUser) return alert("Please login to post!");
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    const post = await createCommunityPost(
      currentUser.id,
      newPostContent,
      newPostType
    );
    setIsSubmitting(false);

    if (post) {
      setIsModalOpen(false);
      setNewPostContent("");
      loadPosts();
    } else {
      alert("Failed to create post. Please try again.");
    }
  };

  const filteredPosts =
    activeFilter === "All"
      ? posts
      : posts.filter(
          (p) => p.post_type.toLowerCase() === activeFilter.toLowerCase().replace("s", "").replace("tion", "")
            || (activeFilter === "Transformations" && p.post_type === "transformation")
            || (activeFilter === "Progress" && p.post_type === "progress")
            || (activeFilter === "Tips" && p.post_type === "tip")
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:shadow-[0_0_20px_rgba(235,0,0,0.3)] shrink-0"
        >
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
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center border border-white/5 rounded-2xl bg-surface-card">
            <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2">No posts yet</h3>
            <p className="text-text-secondary text-sm">Be the first to share your progress!</p>
          </div>
        ) : filteredPosts.map((post, i) => (
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
                <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand text-sm font-bold shrink-0 overflow-hidden border border-brand/30">
                  {post.user_profiles?.avatar_url ? (
                    <img src={post.user_profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    post.user_profiles?.name?.[0] || "U"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm">{post.user_profiles?.name || "Unknown User"}</p>
                    {post.is_featured && (
                      <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs">
                    Lv.{Math.floor((post.user_profiles?.xp_points || 0) / 100) + 1} · {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full hidden sm:inline-block",
                  post.post_type === "transformation" && "bg-brand/10 text-brand",
                  post.post_type === "progress" && "bg-blue-500/10 text-blue-400",
                  post.post_type === "tip" && "bg-emerald-500/10 text-emerald-400"
                )}
              >
                {post.post_type}
              </span>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-5 pb-4">
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Transformation images */}
            {post.before_image && post.after_image && (
              <div className="flex gap-1 px-4 sm:px-5 pb-4">
                <div className="flex-1 relative rounded-xl overflow-hidden aspect-[4/5]">
                  <img src={post.before_image} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                    Before
                  </span>
                </div>
                <div className="flex-1 relative rounded-xl overflow-hidden aspect-[4/5]">
                  <img src={post.after_image} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-brand/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                    After
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex items-center gap-6">
              <button
                onClick={() => handleToggleLike(post.id)}
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
                  {post.likes_count + (likedPosts.includes(post.id) ? 1 : 0)}
                </span>
              </button>
              <button className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-bold">{post.comments_count}</span>
              </button>
              <button className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-black uppercase tracking-widest">Share Progress</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block">
                    Post Type
                  </label>
                  <div className="flex gap-2">
                    {(["progress", "tip", "transformation"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewPostType(type)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex-1 transition-all",
                          newPostType === type
                            ? "bg-brand text-white shadow-[0_0_15px_rgba(235,0,0,0.2)]"
                            : "bg-white/5 text-text-secondary border border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block">
                    What's on your mind?
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your latest workout, a tip, or an amazing transformation..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 resize-none transition-all placeholder:text-text-muted"
                  />
                </div>

                {newPostType === "transformation" && (
                  <p className="text-xs text-yellow-500 font-bold">
                    Note: Image uploading will be available in Phase 2.
                  </p>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                <button
                  onClick={handleCreatePost}
                  disabled={isSubmitting || !newPostContent.trim()}
                  className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Post to Community
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
