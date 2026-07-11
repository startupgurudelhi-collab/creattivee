import React from "react";
import { Sparkles, ArrowRight, ArrowDown, Activity, Globe, Zap, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onGetStarted: () => void;
  onExplorePortfolio: () => void;
}

export default function Hero({ onGetStarted, onExplorePortfolio }: HeroProps) {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background Floating Blurred Blobs - Matching logo colors beautifully */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Pink Blob */}
        <div className="absolute top-[10%] left-[5%] w-[35vw] h-[35vw] bg-pink-300/20 rounded-full blur-[100px] animate-float-slow" />
        {/* Purple Blob */}
        <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] bg-purple-300/15 rounded-full blur-[120px] animate-float-medium" />
        {/* Sky Blue Blob */}
        <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] bg-sky-300/20 rounded-full blur-[140px] animate-pulse-slow" />
        {/* Soft Green/Yellow Blob */}
        <div className="absolute bottom-[20%] right-[5%] w-[25vw] h-[25vw] bg-green-200/15 rounded-full blur-[100px] animate-spin-slow" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">


          {/* Premium display headings */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-800 leading-[1.08] mb-6"
          >
            Creating <span className="gradient-text-logo">Digital Experiences</span> <br />
            That Generate Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto mb-10"
          >
            From High-Performance Websites to AI Software and Growth Marketing, We Build Everything Your Business Needs.
          </motion.p>

          {/* Call-to-actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4.5 mb-16"
          >
            <button
              onClick={onGetStarted}
              className="px-8 py-4.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-95 text-white font-display font-bold text-sm tracking-wide shadow-purple-soft flex items-center gap-2 cursor-pointer group transition-all"
            >
              Check Our Package
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onExplorePortfolio}
              className="px-8 py-4.5 rounded-full glass-panel hover:bg-slate-50 border-slate-200 text-slate-700 font-display font-semibold text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              Explore our Projects
              <ArrowDown className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Brand trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-10 border-t border-slate-100/80"
          >
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-6">Trusted by High Growth Enterprises</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-65 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-display font-extrabold text-lg md:text-xl text-slate-600 tracking-wide">FUTURA.INC</span>
              <span className="font-display font-bold text-lg md:text-xl text-slate-600 tracking-wider">STYLEGRID</span>
              <span className="font-display font-extrabold text-lg md:text-xl text-slate-600 italic">ACME.CO</span>
              <span className="font-display font-medium text-lg md:text-xl text-slate-600">FINGLOW</span>
              <span className="font-display font-black text-lg md:text-xl text-slate-600 tracking-widest">RELIANCE</span>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Bento Box Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            { label: "Google PageSpeed Core", val: "99/100", icon: <Zap className="w-5 h-5 text-yellow-500" />, bg: "from-yellow-500/10 to-orange-500/5", border: "border-yellow-100/60" },
            { label: "Active CRM Handover", val: "100% Dynamic", icon: <Activity className="w-5 h-5 text-pink-500" />, bg: "from-pink-500/10 to-purple-500/5", border: "border-pink-100/60" },
            { label: "Awwwards UI Audits", val: "Premium Glass", icon: <Globe className="w-5 h-5 text-blue-500" />, bg: "from-blue-500/10 to-sky-500/5", border: "border-blue-100/60" },
            { label: "Custom API Services", val: "Node Express", icon: <HeartHandshake className="w-5 h-5 text-emerald-500" />, bg: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-100/60" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-3xl bg-gradient-to-br ${item.bg} border ${item.border} glass-card hover:translate-y-[-4px] transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-white/90 shadow-sm border border-slate-100">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              </div>
              <div className="text-2xl font-display font-extrabold text-slate-800">{item.val}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
