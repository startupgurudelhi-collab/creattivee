import { Service, AgencyPackage, PortfolioItem, BlogArticle, FAQItem, Testimonial, AgencySettings, Partner, Benefit } from "../types";

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 1,
    title: "Website Designing",
    slug: "website-designing",
    category: "Design",
    description: "Our bespoke static and dynamic corporate website design services stand out for standard web-presence, combining seamless Framer-like micro-interactions with high PageSpeed optimization.",
    features: [
      "Custom responsive interface architecture",
      "High conversion funnel optimization",
      "SEO semantic schema markup & Core Web Vitals 95+",
      "Interactive modern animations & micro-interactions",
      "Lightning-fast load speed on all screen resolutions"
    ],
    packages: [
      {
        title: "Standard Launchpad",
        price: "₹18,000",
        timeline: "7-10 Days",
        features: ["5 High-impact pages", "Mobile responsive", "Contact CRM integration", "1 Month Support"],
        highlight: false
      },
      {
        title: "Bespoke Corporate Pro",
        price: "₹38,000",
        timeline: "14-21 Days",
        features: ["Custom UI/UX Prototypes", "Interactive Animations", "CMS Database Setup", "Priority 24/7 SLA"],
        highlight: true
      }
    ],
    faq: [
      {
        question: "How long does a full custom website design take?",
        answer: "Typically between 7 to 21 days depending on complexity and revision cycles."
      },
      {
        question: "Do you deliver mobile-friendly designs?",
        answer: "Yes, 100% of our code is responsive across mobile, tablet, desktop, and ultra-wide screens."
      }
    ],
    seo_title: "Premium Website Designing | Creattivee",
    seo_description: "Bespoke high-end web styling services including corporate, landing, and dynamic app design.",
    seo_keywords: "website design, corporate websites, ui/ux design, bespoke agency"
  },
  {
    id: 2,
    title: "Software Development",
    slug: "software-development",
    category: "Engineering",
    description: "Enterprise web application development with resilient backend architectures, robust database synchronizations, and scalable microservices.",
    features: [
      "Full-stack React, Next.js, Node & TypeScript engineering",
      "Robust relational database design & low-latency query tuning",
      "Secure role-based access control (RBAC) & OAuth flows",
      "Automated CI/CD workflows and zero-downtime deployment",
      "High performance REST & GraphQL API integrations"
    ],
    packages: [
      {
        title: "MVP Sprint",
        price: "₹45,000",
        timeline: "2-3 Weeks",
        features: ["Core business logic", "User authentication", "Database CRUD pipelines", "Deployment setup"],
        highlight: false
      },
      {
        title: "Enterprise Custom Architecture",
        price: "₹95,000",
        timeline: "4-6 Weeks",
        features: ["Full ERP/CRM capability", "Multi-tenant architecture", "Payment gateways", "Dedicated DevOps SLA"],
        highlight: true
      }
    ],
    faq: [
      {
        question: "Which technology stack do you utilize?",
        answer: "We specialize in modern TypeScript, React, Node.js, Express, MySQL, PostgreSQL, and Cloud Run."
      }
    ],
    seo_title: "Enterprise Software Engineering | Creattivee",
    seo_description: "High-performance software systems built with modern stacks for enterprise scalability.",
    seo_keywords: "software development, enterprise web apps, react, nodejs, mysql"
  }
];

export const DEFAULT_PACKAGES: AgencyPackage[] = [
  {
    id: 1,
    title: "Starter Web Presence",
    price: "₹18,000",
    timeline: "7-10 Days",
    features: [
      "5 Custom Designed Responsive Pages",
      "Lightning Fast PageSpeed Optimization",
      "Standard Contact Form & Lead CRM Sync",
      "On-page SEO Meta tags & Sitemap",
      "30 Days Post-launch Support"
    ],
    highlight: false,
    button_text: "Get Started"
  },
  {
    id: 2,
    title: "Enterprise Growth Suite",
    price: "₹48,000",
    timeline: "14-21 Days",
    features: [
      "Unlimited Bespoke UI/UX Figma Prototypes",
      "Custom Full-Stack Web Application / CMS",
      "Automated WhatsApp & Email Lead Alerts",
      "Advanced Conversion Rate Optimization (CRO)",
      "Dedicated Account Manager & Priority SLA"
    ],
    highlight: true,
    button_text: "Claim Growth Suite"
  }
];

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: 1,
    title: "FinTech Quantum Dashboard",
    slug: "fintech-quantum-dashboard",
    category: "Software Development",
    client: "Quantum Capital Group",
    technology_used: ["React", "TypeScript", "Tailwind CSS", "MySQL", "ChartJS"],
    project_timeline: "4 Weeks",
    website_link: "https://creattivee.com",
    description: "Real-time institutional liquidity management and automated multi-currency asset settlement engine.",
    case_study: "Reduced invoice transaction processing latency by 64% using real-time query aggregation and streaming WebSockets.",
    screenshots: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
    ]
  }
];

export const DEFAULT_BLOGS: BlogArticle[] = [
  {
    id: 1,
    title: "10 High-Impact UI/UX Principles That 10x Enterprise Conversion Rates",
    slug: "10-high-impact-ui-ux-principles",
    category: "Design Architecture",
    tags: ["UI/UX", "Conversion Optimization", "Web Development"],
    content: "Crafting digital experiences requires more than aesthetic flair—it demands rigorous optical rhythm, mathematical padding proportions, and zero-latency interaction models...",
    featured_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
    author: "Foujia (Creative Lead)",
    reading_time: 5,
    views: 420,
    comments: [],
    seo_title: "10 UI/UX Principles to 10x Conversion Rates | Creattivee Blog",
    seo_description: "Learn actionable design and engineering methodologies to skyrocket digital product performance."
  }
];

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 1,
    question: "What is your typical project kickoff turnaround time?",
    answer: "We typically initiate project discovery sprints within 24–48 hours of contract signoff and deposit settlement.",
    category: "General"
  },
  {
    id: 2,
    question: "Do we get full intellectual property (IP) and source code ownership?",
    answer: "Yes! 100% of all custom source code, design assets, and database schemas become your property upon final settlement.",
    category: "Contracts"
  },
  {
    id: 3,
    question: "Do you offer post-launch maintenance and continuous SLA monitoring?",
    answer: "Yes, every package includes complimentary post-launch support with optional dedicated monthly maintenance retainers.",
    category: "Support"
  }
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    author_name: "Vikram Singhania",
    author_role: "Chief Executive Officer",
    author_company: "Singhania Logistics Ltd",
    testimonial_text: "Creattivee completely overhauled our enterprise logistics portal. Their design precision and backend speed exceeded every KPI we set.",
    rating: 5,
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: 2,
    author_name: "Dr. Ananya Roy",
    author_role: "Founder & Director",
    author_company: "AuraMed Diagnostics",
    testimonial_text: "The lead management CRM and bespoke website they created generated a 210% increase in patient appointment requests within 30 days.",
    rating: 5,
    author_avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop"
  }
];

export const DEFAULT_PARTNERS: Partner[] = [
  { id: 1, name: "ALPHA VENTURES", style: "font-black tracking-widest text-slate-800" },
  { id: 2, name: "NEXUS GLOBAL", style: "font-extrabold tracking-wider text-slate-700" },
  { id: 3, name: "QUANTUM TECH", style: "font-bold tracking-tight text-slate-800" },
  { id: 4, name: "VELOCITY LABS", style: "font-black tracking-wide text-slate-700" },
  { id: 5, name: "SYNERGY CORP", style: "font-extrabold tracking-widest text-slate-800" }
];

export const DEFAULT_BENEFITS: Benefit[] = [
  {
    id: 1,
    title: "100% Bespoke Codebase",
    text: "Zero bloated theme templates. Every line of code and UI component is handcrafted for peak performance.",
    icon: "Layers",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-500",
    glow: "rgba(168, 85, 247, 0.15)"
  },
  {
    id: 2,
    title: "Sub-Second Page Loads",
    text: "Engineered for 95+ Google PageSpeed Insights, instant hydration, and razor-sharp Core Web Vitals.",
    icon: "Zap",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-500",
    glow: "rgba(245, 158, 11, 0.15)"
  },
  {
    id: 3,
    title: "Conversion Architecture",
    text: "Deep neuromarketing UX layouts crafted specifically to maximize qualified inquiry flow.",
    icon: "Target",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-500",
    glow: "rgba(16, 185, 129, 0.15)"
  },
  {
    id: 4,
    title: "Mobile-First Precision",
    text: "Seamless adaptation across every screen dimension, touch breakpoint, and device retina ratio.",
    icon: "Smartphone",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    glow: "rgba(59, 130, 246, 0.15)"
  }
];

export const DEFAULT_SETTINGS: AgencySettings = {
  company_name: "Creattivee Digital Agency",
  company_address: "D-561, Pocket 11, Jasola, New Delhi, India 110025",
  company_phone: "+91-8796380455",
  company_email: "creattivee@gmail.com",
  smtp_host: "smtp.hostinger.com",
  smtp_port: "465",
  seo_default_title: "Creattivee | Full Stack Digital Agency & Software Engineering",
  seo_default_description: "Bespoke digital product engineering, high-conversion UI/UX design, and scalable enterprise software solutions."
};
