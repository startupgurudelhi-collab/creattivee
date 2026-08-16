import React, { useState } from "react";
import { Search, Calendar, User, MessageCircle, Heart, Share2, Eye, Send, ArrowRight, Tag, X, ChevronRight } from "lucide-react";
import { BlogArticle } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface BlogCMSProps {
  articles: BlogArticle[];
  onCommentAdded: () => void;
}

export default function BlogCMS({ articles = [], onCommentAdded }: BlogCMSProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);

  const safeArticles = Array.isArray(articles) ? articles : [];

  // Comment Form States
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [shared, setShared] = useState(false);

  // Categories & Tags list extraction
  const categories = ["All", ...Array.from(new Set(safeArticles.map((a) => a.category)))];
  const allTags = Array.from(new Set(safeArticles.flatMap((a) => a.tags || [])));

  // Filter Logic
  const filteredArticles = safeArticles.filter((a) => {
    const matchesSearch = (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    const matchesTag = !selectedTag || (a.tags && a.tags.includes(selectedTag));
    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShared(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    }
    setTimeout(() => setShared(false), 2000);
  };

  const handlePostComment = async (e: React.FormEvent, blogId: number) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: commentName || "Anonymous User", comment: commentText }),
      });

      if (res.ok) {
        setCommentName("");
        setCommentText("");
        onCommentAdded();
        
        // Refresh active article local state to show new comment
        const updatedArticleRes = await fetch("/api/blogs");
        if (updatedArticleRes.ok) {
          const freshBlogs = await updatedArticleRes.json();
          const fresh = freshBlogs.find((b: BlogArticle) => b.id === blogId);
          if (fresh) setActiveArticle(fresh);
        }
      }
    } catch (err) {
      console.error("Error posting comment", err);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT CONTENT: Search & Article List */}
      <div className="lg:col-span-8 space-y-8">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search premium studio articles, tech frameworks, insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-purple-400 focus:outline-none bg-white shadow-sm text-sm text-slate-800 transition-colors"
          />
        </div>

        {/* Dynamic List */}
        <div className="space-y-6">
          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-100">
              <p className="text-slate-400 font-medium text-sm">No articles matched your current query criteria.</p>
            </div>
          ) : (
            filteredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveArticle(article)}
                className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer flex flex-col md:flex-row gap-6 transition-all duration-300"
              >
                {/* Featured Image Thumbnail */}
                <div className="w-full md:w-48 h-36 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={article.featured_image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Text Summary */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-[10px] font-display font-extrabold text-pink-600 uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {article.reading_time || 5} min read
                      </span>
                    </div>
                    <h4 className="text-lg md:text-xl font-display font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                      {article.title}
                    </h4>
                    <div
                      className="text-slate-500 text-xs font-medium line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) }}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 text-slate-400 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <User className="w-3.5 h-3.5 text-pink-400" /> {article.author}
                    </span>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleLike(article.id, e)}
                        className="flex items-center gap-1 hover:text-pink-500 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500/10" />
                        <span>{(likes[article.id] || 0) + article.views}</span>
                      </button>

                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-purple-400" />
                        <span>{article.comments ? article.comments.length : 0}</span>
                      </span>

                      <button
                        onClick={(e) => handleShare(article.title, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        title="Copy article link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CONTENT: Sidebar Filters */}
      <div className="lg:col-span-4 space-y-6">
        {/* Category Box */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <h5 className="font-display font-bold text-slate-800 text-sm tracking-wider uppercase">Categories</h5>
          <div className="space-y-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-purple-50 text-purple-700 font-bold"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span>{cat}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Tags cloud */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <h5 className="font-display font-bold text-slate-800 text-sm tracking-wider uppercase">Tags Cloud</h5>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? "bg-pink-500 text-white shadow-pink-soft"
                    : "bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED ARTICLE FULL-VIEW PANEL */}
      <AnimatePresence>
        {activeArticle && (
          <div id="full-blog-panel" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="absolute inset-0 bg-slate-900/15 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              className="relative w-full max-w-3xl overflow-y-auto max-h-[85vh] rounded-3xl glass-card shadow-purple-soft p-6 md:p-10 z-10"
            >
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-display font-bold uppercase tracking-widest">
                    {activeArticle.category}
                  </span>
                  <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" /> {activeArticle.reading_time || 5} min read
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 leading-tight">
                  {activeArticle.title}
                </h3>

                {/* Author Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-display font-bold text-pink-600 text-sm uppercase">
                      {activeArticle.author[0]}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">AUTHOR</span>
                      <span className="text-sm font-semibold text-slate-800">{activeArticle.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 text-xs">
                    <button
                      onClick={(e) => handleLike(activeArticle.id, e)}
                      className="flex items-center gap-1 text-pink-500 font-semibold cursor-pointer"
                    >
                      <Heart className="w-4.5 h-4.5 text-pink-500 fill-pink-500/10" />
                      <span>{(likes[activeArticle.id] || 0) + activeArticle.views}</span>
                    </button>
                    <button
                      onClick={(e) => handleShare(activeArticle.title, e)}
                      className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{shared ? "Copied!" : "Share Link"}</span>
                    </button>
                  </div>
                </div>

                {/* Header Featured Image */}
                <div className="rounded-2xl overflow-hidden h-64 md:h-80 shadow-pink-soft border border-slate-100 bg-slate-100">
                  <img
                    src={activeArticle.featured_image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"}
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* HTML content render */}
                <div
                  className="prose prose-slate max-w-none text-slate-700 text-sm md:text-base leading-relaxed space-y-4 font-medium"
                  dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                />

                {/* Tags */}
                {activeArticle.tags && activeArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {activeArticle.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-mono text-slate-500 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comments Section */}
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <h4 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                    <MessageCircle className="w-5.5 h-5.5 text-purple-500" />
                    Reader Comments ({(activeArticle.comments || []).length})
                  </h4>

                  {/* Comments list */}
                  <div className="space-y-4">
                    {(!activeArticle.comments || activeArticle.comments.length === 0) ? (
                      <p className="text-slate-400 text-xs italic">No comments posted yet. Be the first!</p>
                    ) : (
                      activeArticle.comments.map((comm, cIdx) => (
                        <div key={cIdx} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">{comm.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{comm.date}</span>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed">{comm.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comments Form */}
                  <form onSubmit={(e) => handlePostComment(e, activeArticle.id)} className="space-y-3.5 pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Public Comment</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <textarea
                        placeholder="Write comment..."
                        rows={3}
                        required
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={postingComment}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-display font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 disabled:opacity-50"
                    >
                      {postingComment ? (
                        <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Post Comment
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
