import React, { useState, useEffect } from "react";
import {
  MessageSquare, Phone, ArrowUp, Sparkles, Check, ChevronRight, HelpCircle,
  Mail, MapPin, Send, Laptop, ShieldCheck, Heart, User, Calendar, BookOpen, Clock, X,
  ExternalLink, Layers, ArrowRight, Zap, Target, Star, Kanban, Lock, Globe,
  Brain, Palette, Cpu, Smartphone, Search, HeartHandshake, TrendingUp, Briefcase, Rocket, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, AgencyPackage, PortfolioItem, BlogArticle, FAQItem, Testimonial, AgencySettings, Partner, Benefit } from "./types";
import Hero from "./components/Hero";
import PortfolioGrid from "./components/PortfolioGrid";
import BlogCMS from "./components/BlogCMS";
import LeadModal from "./components/LeadModal";
import AdminPanel from "./components/AdminPanel";
import LoginScreen from "./components/LoginScreen";
import Logo from "./components/Logo";

interface CounterProps {
  value: string;
}

function StatCounter({ value }: CounterProps) {
  const [display, setDisplay] = useState("0");
  const [ref, setRef] = useState<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!hasStarted) return;

    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const numPart = parseFloat(match[1]);
    const textPart = match[2] || "";
    const isDecimal = match[1].includes(".");

    let start = 0;
    const duration = 1.2;
    const steps = 40;
    const stepTime = Math.floor((duration * 1000) / steps);
    const stepValue = numPart / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplay(numPart.toFixed(isDecimal ? 1 : 0) + textPart);
      } else {
        const curNum = currentStep * stepValue;
        setDisplay(curNum.toFixed(isDecimal ? 1 : 0) + textPart);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, hasStarted]);

  return <span ref={setRef}>{display}</span>;
}

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Core CMS state (synced with db.json)
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<AgencyPackage[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);

  // Active view states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [activeFormService, setActiveFormService] = useState<string>("");
  const [activeFormPackage, setActiveFormPackage] = useState<string>("");

  // Sticky controls state
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubbed, setNewsletterSubbed] = useState(false);

  // Contact section states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // Load backend database models
  const loadCmsData = async () => {
    try {
      const [serRes, pkgRes, portRes, blogRes, faqRes, testRes, settingsRes, partnersRes, benefitsRes] = await Promise.all([
        fetch("/api/services").then(r => r.json()),
        fetch("/api/packages").then(r => r.json()),
        fetch("/api/portfolio").then(r => r.json()),
        fetch("/api/blogs").then(r => r.json()),
        fetch("/api/faqs").then(r => r.json()),
        fetch("/api/testimonials").then(r => r.json()),
        fetch("/api/settings").then(r => r.json()),
        fetch("/api/partners").then(r => r.json()).catch(() => []),
        fetch("/api/benefits").then(r => r.json()).catch(() => [])
      ]);

      setServices(serRes);
      setPackages(pkgRes);
      setPortfolio(portRes);
      setBlogs(blogRes);
      setFaqs(faqRes);
      setTestimonials(testRes);
      setSettings(settingsRes);
      setPartners(partnersRes);
      setBenefits(benefitsRes);
    } catch (e) {
      console.error("Error connecting with backend API server", e);
    }
  };

  useEffect(() => {
    loadCmsData();

    // Check login state
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d && d.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});

    // Scroll listener for back-to-top
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      if (
        path === "/admin" ||
        path === "/login" ||
        path.endsWith("/admin") ||
        path.endsWith("/login") ||
        search.includes("admin=true") ||
        search.includes("login=true")
      ) {
        setIsAdminMode(true);
        window.history.replaceState({}, "", "/admin");
      }
    };
    handleUrlCheck();
    window.addEventListener("popstate", handleUrlCheck);
    return () => window.removeEventListener("popstate", handleUrlCheck);
  }, []);

  const handleOpenLeadDrawer = (service: string, pkg: string = "") => {
    setActiveFormService(service);
    setActiveFormPackage(pkg);
    setIsLeadModalOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;

    try {
      const payload = {
        type: "website",
        client_name: contactName,
        client_email: contactEmail,
        client_phone: contactPhone,
        service_interested: "Contact Us Form Inquiry",
        message: contactMsg
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setContactSuccess(true);
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setContactMsg("");
        loadCmsData(); // Refresh admin CRM
        setTimeout(() => setContactSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubbed(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubbed(false), 3000);
  };

  const handleScrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative font-sans antialiased text-slate-800">
      
      {/* GLOBAL BACKGROUND CANVAS */}
      <div className="fixed inset-0 bg-white -z-20 pointer-events-none" />
      
      {/* PREMIUM HEADER - Fixed Glassmorphism Panel */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 print:hidden">
        <div className="max-w-7xl mx-auto rounded-full glass-panel px-6 py-3.5 flex items-center justify-between shadow-pink-soft">
          
          {/* Logo Brand */}
          <div className="cursor-pointer" onClick={() => { setIsAdminMode(false); window.history.pushState({}, "", "/"); window.scrollTo(0, 0); }}>
            <Logo size="sm" />
          </div>

          {/* Navigation Links (Hidden if Admin Panel is focused) */}
          {!isAdminMode && (
            <nav className="hidden md:flex items-center gap-7.5 text-xs font-semibold text-slate-600">
              <button onClick={() => handleScrollToId("hero")} className="hover:text-pink-500 transition-colors cursor-pointer">Home</button>
              <button onClick={() => handleScrollToId("services")} className="hover:text-pink-500 transition-colors cursor-pointer">Services</button>
              <button onClick={() => handleScrollToId("why-us")} className="hover:text-pink-500 transition-colors cursor-pointer">Why Choose Us</button>
              <button onClick={() => handleScrollToId("portfolio")} className="hover:text-pink-500 transition-colors cursor-pointer">Creative Portfolio</button>
              <button onClick={() => handleScrollToId("packages")} className="hover:text-pink-500 transition-colors cursor-pointer">Packages Builder</button>
              <button onClick={() => handleScrollToId("blogs")} className="hover:text-pink-500 transition-colors cursor-pointer">CMS Articles</button>
              <button onClick={() => handleScrollToId("faqs")} className="hover:text-pink-500 transition-colors cursor-pointer">FAQs</button>
            </nav>
          )}

          {/* Portal switcher controls */}
          <div className="flex items-center gap-3">
            {isAdminMode && (
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  window.history.pushState({}, "", "/");
                }}
                className="px-4.5 py-2 rounded-full font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              >
                <Globe className="w-3.5 h-3.5" /> Client Live Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE CONTENT CONTROLLER */}
      <AnimatePresence mode="wait">
        {isAdminMode ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pt-24"
          >
            {isLoggedIn ? (
              <AdminPanel onLogout={() => { setIsLoggedIn(false); }} />
            ) : (
              <LoginScreen onLoginSuccess={() => { setIsLoggedIn(true); loadCmsData(); }} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="client"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-24"
          >
            {/* HERO BANNER SECTION */}
            <div id="hero">
              <Hero
                partners={partners}
                onGetStarted={() => handleScrollToId("packages")}
                onExplorePortfolio={() => handleScrollToId("portfolio")}
              />
            </div>

            {/* HIGH-END INTERACTIVE GRAPHIC / LOTTIE ALTERNATIVE */}
            <section className="max-w-7xl mx-auto px-6 print:hidden">
              <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-tr from-pink-50/20 via-purple-50/10 to-sky-50/20 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="space-y-4 max-w-xl text-left">
                  <span className="p-2.5 rounded-xl bg-pink-100/60 text-pink-600 text-xs font-display font-extrabold uppercase tracking-widest inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> High Performance Execution
                  </span>
                  <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 tracking-tight leading-tight">
                    Micro-animated visual layouts engineered for speeds
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    We combine high-performance static rendering, clean asset compression, and modular glass layers to ensure page loads remain <span className="font-semibold text-slate-800">under 0.8 seconds</span>. 
                  </p>
                </div>

                {/* Simulated Floating device mockup with telemetry */}
                <div className="relative w-72 h-72 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-sky-300 rounded-full blur-2xl opacity-20 animate-pulse-slow" />
                  <div className="w-56 h-56 rounded-3xl glass-panel p-5 border-slate-200/80 shadow-md relative z-10 flex flex-col justify-between hover:rotate-3 transition-transform duration-300">
                    <div className="flex justify-between items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Creattivee Core</span>
                    </div>
                    <div className="py-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                        <span>PageSpeed Score</span>
                        <span className="font-bold text-emerald-600">99/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99%]" />
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-purple-50/50 text-[10px] text-purple-600 font-bold border border-purple-100 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> SEO Audited 100% Dynamic
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICES SPECIFICATION GRID */}
            <section id="services" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24 text-center space-y-12">
              <div className="space-y-4 max-w-3xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">CREATTIVEE SERVICES</span>
                <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 tracking-tight">
                  From Ideas to Digital Success
                </h2>
                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                  We combine creativity, AI, and cutting-edge technology to deliver websites, web applications, ERP systems, SaaS products, branding, SEO, and performance marketing—all under one roof.
                </p>
              </div>

              {/* Dynamic services grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((ser, index) => (
                  <motion.div
                    key={ser.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedService(ser)}
                    className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm glass-card glass-card-hover cursor-pointer text-left flex flex-col justify-between min-h-64"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100/60 text-purple-600 flex items-center justify-center font-display font-bold">
                        {ser.title[0]}
                      </div>
                      <h4 className="text-xl font-display font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                        {ser.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-3">
                        {ser.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 text-xs font-semibold text-purple-600 hover:text-pink-600 transition-colors">
                      <span>Explore service modules</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* WHY CHOOSE US & CORE BENEFITS */}
            <section id="why-us" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-24 relative overflow-visible">
              {/* Decorative premium floating blurred blobs */}
              <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl -z-10 animate-pulse duration-5000" />
              <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 animate-pulse duration-7000" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50/30 rounded-full blur-3xl -z-10" />

              <div className="space-y-16 text-center">
                {/* Section Header */}
                <div className="max-w-3xl mx-auto space-y-4">
                  <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase block bg-pink-50 px-3 py-1.5 rounded-full w-max mx-auto border border-pink-100/50">
                    Why Businesses Choose Creattivee
                  </span>
                  <h3 className="text-2xl md:text-4xl font-display font-extrabold text-slate-800 leading-tight tracking-tight">
                    We combine creativity, cutting-edge AI, and modern technology to build digital experiences that help businesses{" "}
                    <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                      grow faster, smarter, and stronger.
                    </span>
                  </h3>
                </div>

                {/* Core Benefits Grid (8 Items) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {benefits && benefits.length > 0 ? (
                    benefits.map((benefit, idx) => {
                      const IconMap: Record<string, React.ComponentType<any>> = {
                        Brain, Palette, Zap, Smartphone, Search, Layers, HeartHandshake, TrendingUp, Sparkles, Laptop, ShieldCheck, Heart, User, Kanban, Lock, Globe, Rocket, Smile
                      };
                      const IconComponent = IconMap[benefit.icon] || Sparkles;
                      return (
                        <motion.div
                          key={benefit.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          whileHover={{ y: -6, scale: 1.01 }}
                          className={`p-6 rounded-3xl bg-white/70 border border-slate-100 shadow-sm backdrop-blur-md text-left flex flex-col justify-between hover:border-slate-200 hover:shadow-lg transition-all duration-300 ${benefit.glow || "hover:shadow-purple-100/40"}`}
                        >
                          <div className="space-y-4">
                            <div className={`w-10 h-10 rounded-2xl ${benefit.bgColor || "bg-purple-50"} border ${benefit.borderColor || "border-purple-100/60"} flex items-center justify-center shrink-0`}>
                              <IconComponent className={`w-5 h-5 ${benefit.iconColor || "text-purple-600"}`} />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-display font-extrabold text-slate-800 text-sm tracking-tight">
                                {benefit.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {benefit.text}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center text-xs text-slate-400 font-mono">
                      No active dynamic benefit panels configured.
                    </div>
                  )}
                </div>

                {/* Animated Stats Section (6 Cards) */}
                <div className="pt-8">
                  <div className="p-1 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 shadow-xl max-w-6xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[22px] px-8 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 divide-y-2 md:divide-y-0 lg:divide-x divide-slate-100/80">
                      {[
                        { value: "250+", label: "Projects Delivered", desc: "Premium custom apps", icon: Rocket, color: "text-purple-600", bg: "bg-purple-50" },
                        { value: "150+", label: "Happy Clients", desc: "Global partnerships", icon: Smile, color: "text-pink-600", bg: "bg-pink-50" },
                        { value: "5.0", label: "Satisfaction", desc: "Clutch & Google rating", icon: Star, color: "text-orange-500", bg: "bg-orange-50" },
                        { value: "Pan India & Global", label: "Presence", desc: "Borderless solutions", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                        { value: "24×7", label: "Support", desc: "Always online response", icon: Clock, color: "text-sky-500", bg: "bg-sky-50" },
                        { value: "10+", label: "Business Solutions", desc: "End-to-end products", icon: Briefcase, color: "text-green-600", bg: "bg-green-50" }
                      ].map((stat, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col items-center justify-center text-center space-y-2 p-4 md:p-2 ${idx > 1 ? 'pt-6 md:pt-2' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-1`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          </div>
                          <span className="text-2xl md:text-3xl font-display font-black text-slate-800 block tracking-tight">
                            <StatCounter value={stat.value} />
                          </span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-display font-extrabold text-slate-700 block">
                              {stat.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {stat.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CREATIVE PROCESS TIMELINE */}
            <section className="max-w-7xl mx-auto px-6 py-12 text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">The Creattivee Method</span>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 tracking-tight">Our Structured Handover Roadmap</h2>
                <p className="text-slate-500 text-sm font-medium">Four meticulously designed phases ensuring elite quality code handovers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {/* Horizontal flow line for large screens */}
                <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 bg-slate-100 -z-10" />

                {[
                  { step: "01", title: "Lead Intake & Discovery", desc: "Formulate quote variables via the dynamic proposal composer, mapping CRM requirements." },
                  { step: "02", title: "Interactive Prototypes", desc: "Crafting beautiful glass panels, typography scales, floating blobs, and navigation rails." },
                  { step: "03", title: "Full Stack Development", desc: "Database structures optimized with Node Express Rest APIs and sitemap files." },
                  { step: "04", title: "Hostinger Handover", desc: "Handover is 100% complete, including the database.sql seeder script." }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm glass-card text-left space-y-4 relative">
                    <span className="w-12 h-12 rounded-2xl bg-pink-100/60 text-pink-600 font-display font-black flex items-center justify-center text-sm shadow-pink-soft">
                      {item.step}
                    </span>
                    <h5 className="font-display font-bold text-slate-800 text-sm">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* DYNAMIC PORTFOLIO GALLERY */}
            <section id="portfolio" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24 text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">Creative Assets Showcase</span>
                <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 tracking-tight">
                  Dynamic Category Showrooms
                </h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Filter through Fintech, SaaS, Designing, and software web applications. Click "Deep Case Study" to inspect challenge-response diagrams.
                </p>
              </div>

              <PortfolioGrid
                items={portfolio}
                onOpenLead={(name) => handleOpenLeadDrawer("Portfolio Case Study Inquiry", name)}
              />
            </section>

            {/* PACKAGES BUILDER MATRIX */}
            <section id="packages" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24 text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">The Package Builder</span>
                <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 tracking-tight">
                  Unlimited Dynamic Pricing Packages
                </h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Administrator edits custom parameters dynamically from the CRM. Select a plan to generate formal lead quote structures.
                </p>
              </div>

              {/* Dynamic packages list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg, idx) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-8 rounded-3xl border text-left flex flex-col justify-between h-full relative overflow-hidden ${
                      pkg.highlight
                        ? "bg-gradient-to-br from-pink-50/40 via-purple-50/20 to-sky-50/20 border-pink-200 shadow-pink-soft"
                        : "bg-white border-slate-100 shadow-sm"
                    }`}
                  >
                    {pkg.highlight && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-pink-500 text-[9px] font-display font-extrabold text-white uppercase tracking-wider rounded-full">
                        Recommended choice
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-display font-bold text-slate-800">{pkg.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">ESTIMATED DELIVERABLES TIMELINE: {pkg.timeline || "Fast Delivery"}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-extrabold text-slate-900">{pkg.price}</span>
                        <span className="text-xs text-slate-400 font-medium">/ flat contract</span>
                      </div>

                      <ul className="space-y-2.5 pt-4 border-t border-slate-100">
                        {pkg.features.map((feat, fIdx) => (
                          <li key={fIdx} className="text-xs text-slate-600 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleOpenLeadDrawer("Dynamic Pricing Plan", pkg.title)}
                      className={`w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-center cursor-pointer transition-all mt-8 block ${
                        pkg.highlight
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-purple-soft hover:opacity-95"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                      }`}
                    >
                      {pkg.button_text || "Buy Now"}
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* TESTIMONIALS SLIDER / LIST */}
            <section className="max-w-7xl mx-auto px-6 py-12 text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">Client Handshake Reviews</span>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 tracking-tight">Highly Appraised Core Handovers</h2>
                <p className="text-slate-500 text-sm font-medium">Read verified stories from tech lead partners and enterprise founders.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((test) => (
                  <div key={test.id} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm glass-card text-left space-y-4 flex flex-col justify-between">
                    <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed italic">
                      "{test.testimonial_text}"
                    </p>

                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={test.author_avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"}
                          alt={test.author_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="font-display font-bold text-slate-800 text-sm">{test.author_name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                          {test.author_role} @ {test.author_company || "Secret Labs"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* BLOG ARTICLE CMS SPACE */}
            <section id="blogs" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24 text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">Creattivee Design Labs</span>
                <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 tracking-tight">
                  The Tech Journal CMS Space
                </h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Search premium design articles, view read time indicators, and post dynamic replies directly via our active Express REST server.
                </p>
              </div>

              <BlogCMS
                articles={blogs}
                onCommentAdded={loadCmsData}
              />
            </section>

            {/* FAQ ACCORDIONS */}
            <section id="faqs" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24 text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase">High Frequency questions</span>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 tracking-tight">FAQs & Operational Agreements</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Everything you need to know about code ownership, MySQL backups, and server handovers.</p>
              </div>

              <div className="max-w-3xl mx-auto text-left space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
                    <h5 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-purple-500 shrink-0" />
                      {faq.question}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* DYNAMIC CONTACT FORM SECTION */}
            <section id="contact" className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 rounded-3xl p-8 md:p-12 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 border border-pink-100/60 relative overflow-hidden">
                
                {/* Contact Info column */}
                <div className="space-y-6 text-left relative z-10">
                  <span className="text-xs font-display font-extrabold text-pink-600 tracking-widest uppercase block">Connect with our core team</span>
                  <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800 leading-tight">
                    Discuss dynamic scopes or custom software modules
                  </h3>
                  <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
                    Have specific custom requirements? Submit your name and email, and our CRM will route immediate notifications to our admin.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-white border border-slate-100 text-pink-500 h-10 w-10 flex items-center justify-center shadow-sm">
                        <MapPin className="w-4.5 h-4.5" />
                      </span>
                      <div className="text-xs font-medium text-slate-600">
                        <p className="font-bold text-slate-800">Physical HQ Address</p>
                        <p>D-561, Pocket 11, DDA Flats, Jasola, New Delhi, 110025</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-white border border-slate-100 text-purple-500 h-10 w-10 flex items-center justify-center shadow-sm">
                        <Phone className="w-4.5 h-4.5" />
                      </span>
                      <div className="text-xs font-medium text-slate-600">
                        <p className="font-bold text-slate-800">Operational Hotline</p>
                        <p>+91-8796380455</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-white border border-slate-100 text-blue-500 h-10 w-10 flex items-center justify-center shadow-sm">
                        <Mail className="w-4.5 h-4.5" />
                      </span>
                      <div className="text-xs font-medium text-slate-600">
                        <p className="font-bold text-slate-800">Enterprise Email</p>
                        <p>creattivee@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form column */}
                <div className="p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-slate-100 shadow-md relative z-10">
                  {contactSuccess ? (
                    <div className="flex flex-col items-center text-center py-12">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-xl font-display font-bold text-slate-800">Lead Intaked successfully</h4>
                      <p className="text-slate-500 text-xs font-medium max-w-sm mt-2">
                        CRM logged. Admin staff has been notified of your requirements parameters.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="relative">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Suresh Kumar"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="suresh@gmail.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Phone Line</label>
                          <input
                            type="tel"
                            placeholder="+91-99999 99999"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Dynamic Requirements Scope</label>
                        <textarea
                          rows={3}
                          placeholder="Detail features required: ERP integrations, static portfolio views, payment link, custom MySQL schemas..."
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          className="w-full p-4 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white resize-none"
                        />
                      </div>

                      <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> Security verified by REST CRM Engine
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-95 text-white font-display font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Scope & Create CRM Lead
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC INDIVIDUAL SERVICE MODAL / PORTRAIT DETAILED VIEW */}
      <AnimatePresence>
        {selectedService && (
          <div id="service-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              className="relative w-full max-w-2xl overflow-y-auto max-h-[85vh] rounded-3xl glass-card shadow-purple-soft p-6 md:p-10 z-10 text-left"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-xl text-xs font-display font-bold uppercase tracking-wider">
                  {selectedService.category} Deliverables
                </span>

                <h3 className="text-3xl font-display font-extrabold text-slate-800">{selectedService.title}</h3>
                
                <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
                  {selectedService.description}
                </p>

                {/* Scope features */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included catalog features</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    {selectedService.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Specific Packages */}
                {selectedService.packages && selectedService.packages.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing Modules</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedService.packages.map((spkg, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${spkg.highlight ? "bg-purple-50/50 border-purple-200" : "bg-white border-slate-100"} space-y-2`}>
                          <p className="text-xs font-bold text-slate-800">{spkg.title}</p>
                          <p className="text-xl font-display font-black text-slate-900">{spkg.price}</p>
                          <p className="text-[10px] text-slate-400 font-mono">EST. TIMELINE: {spkg.timeline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Associated FAQ */}
                {selectedService.faq && selectedService.faq.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Faq / Agreements</h5>
                    <div className="space-y-2">
                      {selectedService.faq.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 text-xs">
                          <p className="font-bold text-slate-700">{item.q}</p>
                          <p className="text-slate-500 mt-1">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-mono">SEO verified: {selectedService.slug}</p>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      handleOpenLeadDrawer(selectedService.title);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-display font-bold text-xs uppercase tracking-widest cursor-pointer hover:opacity-95 shadow-purple-soft"
                  >
                    Generate proposal Quote
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAD ACQUISITION DRAWER/FORM */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        serviceName={activeFormService}
        packageName={activeFormPackage}
      />

      {/* FOOTER BRANDS & METADATA (Hidden on Print) */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 text-left relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Logo & address block */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" />
            <p className="text-slate-500 text-xs max-w-sm font-medium leading-relaxed">
              Bespoke high performance dynamic digital architectures tailored for elite agencies, fintech modules and SaaS back-office setups.
            </p>
            <div className="space-y-1 text-slate-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-pink-500" /> D-561, Pocket 11, Jasola, New Delhi, 110025</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-purple-500" /> +91-8796380455</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> creattivee@gmail.com</p>
            </div>
          </div>

          {/* Links columns */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h6 className="font-display font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Deliverables Index</h6>
            <ul className="space-y-1.5 text-slate-500 font-semibold">
              <li>Website Designs</li>
              <li>Software ERP/CRM Modules</li>
              <li>Dynamic API Backends</li>
              <li>Annual Maintenance Handovers</li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-4 space-y-4 text-xs">
            <h6 className="font-display font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Newsletter Dispatches</h6>
            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Receive automated SMTP notifications regarding our latest open source designs.</p>
            
            {newsletterSubbed ? (
              <p className="text-emerald-600 font-bold font-display">Subscribed Successfully!</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-purple-400 flex-grow"
                />
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-display font-bold text-xs cursor-pointer">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Legal copyright strip */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[10px] font-mono">
          <p>© {new Date().getFullYear()} Creattivee Labs. All rights reserved. Registered under DDA Janta Jasola Delhi rules.</p>
          <div className="flex gap-4">
            <span>Sitemap.xml Auto-Sync</span>
            <span>Robots.txt Crawl Friendly</span>
            <span>Google Speed score 99+</span>
          </div>
        </div>
      </footer>

      {/* STICKY WHATSAPP & PHONE CONTROLS (Hidden on Print) */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3 print:hidden">
        {/* Floating WhatsApp dialer */}
        <a
          href="https://wa.me/918796380455"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-full bg-emerald-500 text-white hover:opacity-95 shadow-lg flex items-center justify-center transition-all hover:scale-105"
          title="Direct WhatsApp"
        >
          <MessageSquare className="w-5.5 h-5.5" />
        </a>

        {/* Floating Call dialer */}
        <a
          href="tel:+918796380455"
          className="p-3.5 rounded-full bg-blue-500 text-white hover:opacity-95 shadow-lg flex items-center justify-center transition-all hover:scale-105"
          title="Dial Hotline Directly"
        >
          <Phone className="w-5.5 h-5.5" />
        </a>
      </div>

      {/* STICKY BACK-TO-TOP CONTROL (Hidden on Print) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-slate-900 text-white hover:opacity-90 shadow-lg flex items-center justify-center cursor-pointer print:hidden transition-all"
            title="Scroll back to top of page"
          >
            <ArrowUp className="w-5.5 h-5.5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
