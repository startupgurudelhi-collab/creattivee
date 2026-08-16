import React, { useState } from "react";
import { ExternalLink, Video, Clock, Monitor, Layers, Eye, Tag, X, Code2 } from "lucide-react";
import { PortfolioItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PortfolioGridProps {
  items: PortfolioItem[];
  onOpenLead: (serviceName: string) => void;
}

export default function PortfolioGrid({ items = [], onOpenLead }: PortfolioGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeCaseStudy, setActiveCaseStudy] = useState<PortfolioItem | null>(null);

  const safeItems = Array.isArray(items) ? items : [];

  // Extract unique categories dynamically
  const categories = ["All", ...Array.from(new Set(safeItems.map((item) => item.category)))];

  const filteredItems = selectedCategory === "All"
    ? safeItems
    : safeItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-12">
      {/* Category Selection Rail */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-display font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-purple-soft"
                : "bg-white/70 hover:bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-3xl overflow-hidden glass-card glass-card-hover flex flex-col h-full"
          >
            {/* Display Feature Image */}
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src={item.screenshots[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 text-[10px] font-display font-extrabold text-slate-800 uppercase tracking-widest">
                {item.category}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex flex-col flex-grow">
              <h4 className="text-xl font-display font-bold text-slate-800 group-hover:text-pink-600 transition-colors mb-2">
                {item.title}
              </h4>
              <p className="text-slate-600 text-xs font-medium line-clamp-3 mb-6">
                {item.description}
              </p>

              {/* Technologies Tag Group */}
              <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                {item.technology_used.slice(0, 4).map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-500 font-semibold"
                  >
                    <Tag className="w-3 h-3 text-pink-400" /> {tech}
                  </span>
                ))}
              </div>

              {/* Action Handlers */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveCaseStudy(item)}
                  className="text-xs font-display font-extrabold text-purple-600 flex items-center gap-1 hover:text-pink-600 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Deep Case Study
                </button>

                <div className="flex items-center gap-3">
                  {item.video_url && (
                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                      title="Watch Project Video"
                    >
                      <Video className="w-4 h-4" />
                    </a>
                  )}
                  {item.website_link && (
                    <a
                      href={item.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Visit Live App"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Case Study Modals Overlay */}
      <AnimatePresence>
        {activeCaseStudy && (
          <div id="case-study-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCaseStudy(null)}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
            />

            {/* Case study sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-3xl overflow-y-auto max-h-[85vh] rounded-3xl glass-card shadow-purple-soft p-6 md:p-10 z-10"
            >
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                <span className="px-3.5 py-1.5 rounded-full bg-pink-100/60 border border-pink-200 text-xs font-display font-bold text-pink-600 uppercase tracking-widest inline-block">
                  {activeCaseStudy.category} Case Study
                </span>

                <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 leading-tight">
                  {activeCaseStudy.title}
                </h3>

                {/* Grid project specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">CLIENT</span>
                    <span className="text-sm font-semibold text-slate-700">{activeCaseStudy.client || "Secret Enterprise"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">TIMELINE</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-400" /> {activeCaseStudy.project_timeline || "Fast Handover"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">PLATFORM</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-purple-400" /> Web Standard
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">LIVE CODE</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-400" /> Dynamic DB
                    </span>
                  </div>
                </div>

                {/* Screenshots */}
                {activeCaseStudy.screenshots && activeCaseStudy.screenshots.length > 0 && (
                  <div className="rounded-2xl overflow-hidden shadow-pink-soft border border-slate-100 h-64 md:h-80 bg-slate-100">
                    <img
                      src={activeCaseStudy.screenshots[0]}
                      alt="Project Showcase screenshot"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Challenges and solutions */}
                <div className="space-y-4">
                  <h5 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-pink-500" /> The Business Architecture Challenge
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {activeCaseStudy.description}
                  </p>
                  {activeCaseStudy.case_study && (
                    <>
                      <h5 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2 pt-2">
                        <Layers className="w-5 h-5 text-purple-500" /> Our Optimization & Implementation
                      </h5>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {activeCaseStudy.case_study}
                      </p>
                    </>
                  )}
                </div>

                {/* Tech Specs */}
                <div>
                  <h6 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Core Technology Stack</h6>
                  <div className="flex flex-wrap gap-2">
                    {activeCaseStudy.technology_used.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100/60 text-xs font-mono text-purple-700 font-semibold">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footlinks */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveCaseStudy(null);
                      onOpenLead(activeCaseStudy.title);
                    }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-display font-bold text-xs tracking-wider uppercase shadow-purple-soft cursor-pointer hover:opacity-95"
                  >
                    Discuss Similar Project
                  </button>

                  <div className="flex items-center gap-4">
                    {activeCaseStudy.website_link && (
                      <a
                        href={activeCaseStudy.website_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-display font-extrabold text-slate-700 hover:text-pink-600 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Website URL
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
