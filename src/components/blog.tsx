import React, { useState } from "react";
import { Calendar, User, ArrowRight, X } from "lucide-react";
import { blogData } from "../rawData";
import { motion, AnimatePresence } from "framer-motion";

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  return (
    <section id="blogs" className="relative bg-[#050505] py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-[#eb0000] text-sm tracking-[0.5em] font-bold uppercase mb-4 block">Knowledge Is Power</span>
          <h2
            className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            THE <span className="text-[#eb0000]">EDITORIAL</span>
          </h2>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {blogData.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group cursor-pointer ${post.isLarge ? "md:col-span-8 h-[500px] md:h-[650px]" : "md:col-span-4 h-[500px] md:h-[650px]"
                } relative rounded-[2.5rem] overflow-hidden border border-white/10 flex flex-col justify-end p-8 md:p-12 transition-all duration-700 hover:border-[#eb0000]/50`}
              onClick={() => setSelectedPost(post)}
            >
              <img
                src={(post.imageUrl as any).src || post.imageUrl}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />

              <div className="relative z-10 space-y-6">
                <span className="inline-block bg-[#eb0000] text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full">
                  {post.category}
                </span>
                <h3 className={`text-white font-black uppercase tracking-tight leading-[1.1] ${post.isLarge ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
                  {post.title}
                </h3>
                <div className="flex items-center gap-6 text-[#96979c] text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#eb0000]" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                    <User size={14} className="text-[#eb0000]" />
                    {post.author}
                  </div>
                </div>

                <div className="pt-4 overflow-hidden h-0 group-hover:h-auto transition-all duration-500 opacity-0 group-hover:opacity-100">
                  <p className="text-[#dcdcdc] font-light leading-relaxed line-clamp-3 mb-6">
                    {post.content}
                  </p>
                  <button className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest group/btn">
                    Read Full Article <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-8 right-8 z-50 w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-[#eb0000] transition-colors"
                onClick={() => setSelectedPost(null)}
              >
                <X size={24} />
              </button>

              <div className="h-2/5 relative">
                <img src={(selectedPost.imageUrl as any).src || selectedPost.imageUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
              </div>

              <div className="p-10 md:p-16 overflow-y-auto custom-scrollbar">
                <span className="text-[#eb0000] font-black uppercase tracking-[0.4em] text-xs mb-4 block">{selectedPost.category}</span>
                <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center gap-8 text-[#96979c] text-xs mb-12 border-y border-white/5 py-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#eb0000]" />
                    {selectedPost.date}
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={(selectedPost.b_user as any).src || selectedPost.b_user}
                      className="w-8 h-8 rounded-full border border-[#eb0000]"
                    />
                    <span className="font-bold text-white uppercase tracking-widest">{selectedPost.author}</span>
                  </div>
                </div>
                <div className="text-[#96979c] text-lg leading-relaxed font-light space-y-6">
                  {selectedPost.content.split('. ').map((p: string, i: number) => (
                    <p key={i}>{p}.</p>
                  ))}
                  <p className="pt-8 text-[#eb0000] font-black uppercase tracking-widest text-sm">Join the RahulFitzz elite today for more exclusive content.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eb0000;
          border-radius: 10px;
        }
      `}</style>
    </section>
  );
};

export default Blog;
