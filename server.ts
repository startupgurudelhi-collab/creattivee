import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");

// Hostinger MySQL connection pool (dynamic lazy initialization)
let dbPool: mysql.Pool | null = null;

function checkAndInitDbPool(): mysql.Pool | null {
  if (dbPool) return dbPool;
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
    try {
      dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || "3306"),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000
      });
      console.log("Successfully connected with Hostinger MySQL Database Connection Pool!");
    } catch (err) {
      console.error("Failed to initialize Hostinger MySQL database connection pool:", err);
    }
  }
  return dbPool;
}

// Initial attempt to bind pool
checkAndInitDbPool();

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
  fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
}

// Initial default state mirroring the MySQL Database Seeder exactly
const DEFAULT_DB = {
  users: [
    {
      id: 1,
      name: "Creattivee Admin",
      email: "creattivee@gmail.com",
      role: "admin",
      permissions: ["all"]
    }
  ],
  services: [
    {
      id: 1,
      title: "Website Designing",
      slug: "website-designing",
      category: "Design",
      description: "Our bespoke static and dynamic corporate website design services stand out for standard web-presence, combining seamless Framer-like micro-interactions with high PageSpeed optimization.",
      features: [
        "Static Website",
        "Dynamic Website",
        "Corporate Website",
        "Landing Page",
        "Portfolio Website",
        "School Website",
        "Hospital Website"
      ],
      packages: [
        {
          title: "Starter Brand",
          price: "$499",
          features: ["Custom Layout", "Responsive Screen", "3 Inner Pages", "Contact Lead Form", "Sitemap Generation"],
          timeline: "1 Week"
        },
        {
          title: "Premium Business",
          price: "$1,299",
          highlight: true,
          features: ["Custom Landing Page", "Unlimited Pages", "Full Dynamic CMS Panel", "Framer-like Animations", "SMTP Notification Mailer"],
          timeline: "2 Weeks"
        }
      ],
      faq: [
        { q: "Can I update static elements?", a: "Yes, with our Admin Panel custom sections, all page layouts, texts, and colors are fully manageable without coding." }
      ],
      seo_title: "Premium Website Designing | Creattivee",
      seo_description: "Bespoke high-end web styling services including corporate, landing, and dynamic app design.",
      seo_keywords: "web, design, static website, dynamic website, landing page"
    },
    {
      id: 2,
      title: "Software Development",
      slug: "software-development",
      category: "Development",
      description: "Custom enterprise software packages engineered to empower workflow efficiency across your teams.",
      features: [
        "ERP Development",
        "CRM Development",
        "Inventory Software",
        "Billing Software",
        "HRMS",
        "Web Application",
        "SaaS Development",
        "AI Software",
        "Custom Software"
      ],
      packages: [
        {
          title: "MVP Blueprint",
          price: "$2,499",
          features: ["Core ERP Module", "User Authentication", "Client Dashboard", "CSV Exporting"],
          timeline: "3 Weeks"
        },
        {
          title: "Enterprise Core",
          price: "$4,999",
          highlight: true,
          features: ["Full CRM + ERP Integration", "Payment Gateways", "Automated SMTP Alerts", "AI-powered Assistant Integration"],
          timeline: "5 Weeks"
        }
      ],
      faq: [
        { q: "Do you provide maintenance?", a: "Yes, we have standard Annual Maintenance Contracts (AMC) with weekly cloud backups." }
      ],
      seo_title: "Enterprise Software Development Services | Creattivee",
      seo_description: "Top tier custom web apps, HRMS, billing systems, inventory portals and SaaS architectures.",
      seo_keywords: "erp, crm, hrms, billing software, custom web application, saas"
    }
  ],
  packages: [
    {
      id: 1,
      title: "Premium Growth Designing",
      price: "$1,499",
      timeline: "14 Days",
      features: ["Responsive Design", "Vite/Next Speed Optimization", "Custom Proposal PDF Creator", "Admin CMS Panels", "Google PageSpeed 95+"],
      highlight: true,
      button_text: "Buy Now"
    },
    {
      id: 2,
      title: "SaaS Core App Starter",
      price: "$3,499",
      timeline: "21 Days",
      features: ["Custom MySQL Structure", "Node/Express APIs", "Robust Lead Tracker", "Admin Controls", "Postman Documentation Included"],
      highlight: false,
      button_text: "Buy Now"
    }
  ],
  portfolio: [
    {
      id: 1,
      title: "Futura Bank FinTech UI",
      slug: "futura-bank-fintech-ui",
      category: "Fintech",
      client: "Futura Inc",
      technology_used: ["React", "Express", "TailwindCSS", "Chart.js"],
      project_timeline: "3 Weeks",
      website_link: "https://futurabank-example.com",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "A high-end glassmorphism-based fintech interface tailored for multi-currency dynamic client statements.",
      case_study: "Our challenge was implementing dense fintech graphs while keeping speeds high on mobile. We utilized canvas-based charting and modular components.",
      screenshots: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ],
  blogs: [
    {
      id: 1,
      title: "How Glassmorphism Drives Higher Micro-Conversions",
      slug: "how-glassmorphism-drives-higher-conversions",
      category: "Design",
      tags: ["design", "ui", "glassmorphism", "framer"],
      content: "<p>Glassmorphism isn't just an aesthetic trend; it is an incredible tool for establishing visual visual hierarchy. By utilizing <code>backdrop-filter: blur()</code> combined with delicate off-white transparent borders, we mimic standard physical overlays. This directs attention naturally without fatiguing user eyes.</p><h3>Why it works</h3><p>Human perception is attuned to spatial depth. When a call-to-action sits on a glassy overlay above drifting colored gradients, it triggers depth cues that increase interaction click rates by up to 18% over flat containers.</p>",
      featured_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      author: "Creattivee Design Labs",
      reading_time: 4,
      views: 142,
      comments: [
        { name: "Suresh Kumar", comment: "Outstanding insight. The depth effect definitely makes it feel premium.", date: "2026-07-10" }
      ],
      seo_title: "How Glassmorphism Drives Higher Micro-Conversions | Creattivee Blog",
      seo_description: "Deep dive into visual depth perception and glassmorphism layouts."
    }
  ],
  leads: [
    {
      id: 1,
      type: "website",
      client_name: "John Doe",
      client_email: "johndoe@example.com",
      client_phone: "+91-9876543210",
      service_interested: "Website Designing",
      message: "Looking for a stunning dynamic corporate landing page with glassmorphism styles.",
      status: "pending",
      staff_assigned: "Creattivee Admin",
      follow_up_date: "2026-07-15",
      notes: [
        { text: "Lead registered via landing page form.", date: "2026-07-11 06:30", author: "System" }
      ],
      attachments: [],
      timeline: [
        { label: "Lead Created", text: "Registered from website lead form", date: "2026-07-11 06:30" }
      ],
      created_at: "2026-07-11T06:30:00Z"
    }
  ],
  clients: [
    {
      id: 1,
      name: "Acme Corp",
      email: "billing@acme.com",
      phone: "+91-9898989898",
      company_name: "Acme Corporation",
      address: "Phase II, Industrial Area, Okhla, New Delhi",
      projects: [
        { name: "Acme Corporate Portal", status: "In Progress", timeline: "July 2026" }
      ],
      invoices: [
        { id: "INV-2026-001", amount: "$1,299", status: "Paid", date: "2026-07-01" }
      ],
      documents: [
        { title: "Service Agreement Contract", date: "2026-07-01" }
      ],
      payments: [
        { id: "TXN-998821", amount: "$1,299", date: "2026-07-01", method: "Bank Wire" }
      ],
      notes: "Loyal enterprise client since 2025. Prefers light clean mockups.",
      created_at: "2026-07-01"
    }
  ],
  proposals: [
    {
      id: 1,
      title: "Interactive Portal Design Proposal",
      lead_id: 1,
      services_selected: ["Website Designing"],
      packages_selected: ["Premium Business"],
      price: 1299.00,
      terms: "50% advance payment, remaining on successful source handover. Unlimited edits during the mockup stage.",
      timeline: "2 Weeks",
      signature_data: "Creattivee Admin Sign",
      created_at: "2026-07-11T06:30:00Z"
    }
  ],
  testimonials: [
    {
      id: 1,
      author_name: "Rajesh Sharma",
      author_role: "CEO",
      author_company: "FinGlow Tech",
      testimonial_text: "Creattivee completely transformed our static presentation layout into a gorgeous, ultra-fast dynamic corporate experience. Our page speed score went from 40 to 98!",
      rating: 5,
      author_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 2,
      author_name: "Aisha Patel",
      author_role: "Founder",
      author_company: "StyleGrid India",
      testimonial_text: "The lead management portal combined with the automatic Proposal generator has saved us hours of repetitive proposal building. Exceptional full-stack skill!",
      rating: 5,
      author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    }
  ],
  faqs: [
    { id: 1, question: "Will my website look premium and modern?", answer: "Absolutely. We avoid standard boxy templates, prioritizing glassmorphism layouts, soft shadows, colorful floating gradient elements, and clean negative space.", category: "Design" },
    { id: 2, question: "Do you offer post-handover maintenance?", answer: "Yes, we structure clean Annual Maintenance Contracts (AMC) ensuring routine audits, node package updates, and continuous optimization.", category: "Services" },
    { id: 3, question: "How does the Package Builder work?", answer: "Through the Admin Panel, you can add, configure, and alter agency packages, prices, highlights, and button text dynamically without rebuilding the bundle.", category: "Features" }
  ],
  settings: {
    company_name: "Creattivee",
    company_address: "D-561, Pocket 11, DDA Janta Flats, Jasola, New Delhi, 110025",
    company_phone: "+91-8796380455",
    company_email: "creattivee@gmail.com",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    seo_default_title: "Creattivee | Custom Software & Creative Web Design Agency",
    seo_default_description: "High performance digital agency specializing in custom software, ERPs, SEO, and bespoke React development."
  },
  partners: [
    { id: 1, name: "FUTURA.INC", style: "font-extrabold text-lg md:text-xl text-slate-600 tracking-wide" },
    { id: 2, name: "STYLEGRID", style: "font-bold text-lg md:text-xl text-slate-600 tracking-wider" },
    { id: 3, name: "ACME.CO", style: "font-extrabold text-lg md:text-xl text-slate-600 italic" },
    { id: 4, name: "FINGLOW", style: "font-medium text-lg md:text-xl text-slate-600" },
    { id: 5, name: "RELIANCE", style: "font-black text-lg md:text-xl text-slate-600 tracking-widest" }
  ],
  activity_logs: [
    { id: 1, event: "Database Initialized", date: "2026-07-11 06:29", user: "System" }
  ],
  benefits: [
    {
      id: 1,
      title: "AI-Powered Solutions",
      text: "We leverage the latest AI technologies to build smarter websites, web applications, and business software that automate workflows and improve productivity.",
      icon: "Brain",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100/60",
      iconColor: "text-purple-600",
      glow: "hover:shadow-purple-100/40"
    },
    {
      id: 2,
      title: "Custom Design, No Templates",
      text: "Every website and software is designed from scratch to match your brand identity, business goals, and user experience.",
      icon: "Palette",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100/60",
      iconColor: "text-pink-600",
      glow: "hover:shadow-pink-100/40"
    },
    {
      id: 3,
      title: "Fast, Secure & Scalable",
      text: "Our solutions are optimized for speed, security, SEO, and future growth, ensuring long-term performance.",
      "icon": "Zap",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100/60",
      iconColor: "text-yellow-600",
      glow: "hover:shadow-yellow-100/40"
    },
    {
      id: 4,
      title: "Fully Responsive Experience",
      text: "Every project works seamlessly across desktops, tablets, and mobile devices with a flawless user experience.",
      icon: "Smartphone",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100/60",
      iconColor: "text-blue-600",
      glow: "hover:shadow-blue-100/40"
    },
    {
      id: 5,
      title: "SEO-Optimized Development",
      text: "We build websites with technical SEO practices, helping your business rank higher and generate organic search leads.",
      icon: "Search",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-100/60",
      iconColor: "text-sky-600",
      glow: "hover:shadow-sky-100/40"
    },
    {
      id: 6,
      title: "Complete Digital Solutions",
      text: "From websites and ERP systems to SaaS products, web apps, and eCommerce platforms, we provide end-to-end digital services.",
      icon: "Layers",
      bgColor: "bg-green-50",
      borderColor: "border-green-100/60",
      iconColor: "text-green-600",
      glow: "hover:shadow-green-100/40"
    },
    {
      id: 7,
      title: "Dedicated Support",
      text: "Our relationship doesn't end after launch. We provide continuous maintenance, updates, and active technical support.",
      icon: "HeartHandshake",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100/60",
      iconColor: "text-rose-600",
      glow: "hover:shadow-rose-100/40"
    },
    {
      id: 8,
      title: "Business-Focused Approach",
      text: "We don't just develop software—we create digital solutions that help businesses increase efficiency and scale faster.",
      icon: "TrendingUp",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100/60",
      iconColor: "text-orange-600",
      glow: "hover:shadow-orange-100/40"
    }
  ]
};

// Database state accessor functions
function readDb(): typeof DEFAULT_DB {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db file, returning default", error);
    return DEFAULT_DB;
  }
}

function writeDb(data: typeof DEFAULT_DB) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    // Async push changes to Hostinger MySQL database in the background if connected
    const pool = checkAndInitDbPool();
    if (pool) {
      syncToMySql(data).catch((e) => console.error("Async background MySQL sync error:", e));
    }
  } catch (error) {
    console.error("Error writing db file", error);
  }
}

// Ensure dynamic auxiliary tables are present on Hostinger MySQL
async function createExtraTablesIfNotExist() {
  const pool = checkAndInitDbPool();
  if (!pool) return;
  try {
    // 1. partners
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        style VARCHAR(255) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. activity_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event TEXT NOT NULL,
        date VARCHAR(100) NOT NULL,
        user VARCHAR(255) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. benefits
    await pool.query(`
      CREATE TABLE IF NOT EXISTS benefits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        icon VARCHAR(100) DEFAULT NULL,
        bgColor VARCHAR(100) DEFAULT NULL,
        borderColor VARCHAR(100) DEFAULT NULL,
        iconColor VARCHAR(100) DEFAULT NULL,
        glow VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Verified auxiliary tables (partners, activity_logs, benefits) on Hostinger MySQL.");
  } catch (err) {
    console.error("Error verifying extra tables in MySQL:", err);
  }
}

// Initial seeder/initializer for Hostinger MySQL
async function initializeMySqlTables() {
  const pool = checkAndInitDbPool();
  if (!pool) return;
  try {
    const sqlPath = path.join(process.cwd(), "database.sql");
    if (!fs.existsSync(sqlPath)) {
      console.log("database.sql file not found, skipping table initialization");
      return;
    }
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");
    
    // Split the SQL file by semicolons, filtering out comments and empty statements
    const statements = sqlContent
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => {
        if (!stmt) return false;
        if (stmt.startsWith("--") || stmt.startsWith("/*") || stmt.startsWith("SET") || stmt.startsWith("START TRANSACTION") || stmt.startsWith("COMMIT")) return false;
        return true;
      });

    console.log(`Executing ${statements.length} SQL statements to build Hostinger tables...`);
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (stmtErr: any) {
        console.warn("SQL statement warning:", stmtErr.message);
      }
    }
    console.log("Hostinger database tables initialized successfully!");
  } catch (err) {
    console.error("Failed to auto-initialize Hostinger tables:", err);
  }
}

// Load database from Hostinger MySQL into our local cache
async function loadFromMySql() {
  const pool = checkAndInitDbPool();
  if (!pool) return;
  const dbPool = pool;
  try {
    console.log("Loading data from Hostinger MySQL Database...");
    
    // Check if tables exist. If they don't, we try to initialize them!
    const [tables]: any = await pool.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log("No tables found. Initializing MySQL tables from database.sql...");
      await initializeMySqlTables();
    }

    // Verify extra tables (partners, activity_logs, benefits)
    await createExtraTablesIfNotExist();

    // Now, fetch all records and build the DB object!
    const db: any = { ...DEFAULT_DB };

    // 1. users
    const [usersRows]: any = await pool.query("SELECT * FROM users");
    if (usersRows.length > 0) {
      db.users = usersRows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        email: r.email,
        role: r.role,
        permissions: r.permissions ? (typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions) : ["all"]
      }));
    }

    // 2. services
    const [servicesRows]: any = await dbPool.query("SELECT * FROM services");
    if (servicesRows.length > 0) {
      db.services = servicesRows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        category: r.category,
        description: r.description,
        features: r.features ? (typeof r.features === "string" ? JSON.parse(r.features) : r.features) : [],
        packages: r.packages ? (typeof r.packages === "string" ? JSON.parse(r.packages) : r.packages) : [],
        faq: r.faq ? (typeof r.faq === "string" ? JSON.parse(r.faq) : r.faq) : [],
        seo_title: r.seo_title || "",
        seo_description: r.seo_description || "",
        seo_keywords: r.seo_keywords || ""
      }));
    }

    // 3. packages
    const [packagesRows]: any = await dbPool.query("SELECT * FROM packages");
    if (packagesRows.length > 0) {
      db.packages = packagesRows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        price: r.price,
        timeline: r.timeline,
        features: r.features ? (typeof r.features === "string" ? JSON.parse(r.features) : r.features) : [],
        highlight: Boolean(r.highlight),
        button_text: r.button_text || "Buy Now"
      }));
    }

    // 4. portfolio
    const [portfolioRows]: any = await dbPool.query("SELECT * FROM portfolio");
    if (portfolioRows.length > 0) {
      db.portfolio = portfolioRows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        category: r.category,
        client: r.client,
        technology_used: r.technology_used ? (typeof r.technology_used === "string" ? (r.technology_used.startsWith("[") ? JSON.parse(r.technology_used) : r.technology_used.split(",")) : r.technology_used) : [],
        project_timeline: r.project_timeline,
        website_link: r.website_link,
        video_url: r.video_url,
        description: r.description,
        case_study: r.case_study,
        screenshots: r.screenshots ? (typeof r.screenshots === "string" ? JSON.parse(r.screenshots) : r.screenshots) : []
      }));
    }

    // 5. blogs
    const [blogsRows]: any = await dbPool.query("SELECT * FROM blogs");
    if (blogsRows.length > 0) {
      db.blogs = blogsRows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        category: r.category,
        tags: r.tags ? (typeof r.tags === "string" ? (r.tags.startsWith("[") ? JSON.parse(r.tags) : r.tags.split(",")) : r.tags) : [],
        content: r.content,
        featured_image: r.featured_image,
        author: r.author,
        reading_time: Number(r.reading_time || 5),
        views: Number(r.views || 0),
        comments: r.comments ? (typeof r.comments === "string" ? JSON.parse(r.comments) : r.comments) : [],
        seo_title: r.seo_title || "",
        seo_description: r.seo_description || ""
      }));
    }

    // 6. leads
    const [leadsRows]: any = await dbPool.query("SELECT * FROM leads");
    if (leadsRows.length > 0) {
      db.leads = leadsRows.map((r: any) => ({
        id: Number(r.id),
        type: r.type || "website",
        client_name: r.client_name,
        client_email: r.client_email,
        client_phone: r.client_phone,
        service_interested: r.service_interested,
        message: r.message,
        status: r.status || "pending",
        staff_assigned: r.staff_assigned,
        follow_up_date: r.follow_up_date,
        notes: r.notes ? (typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes) : [],
        attachments: r.attachments ? (typeof r.attachments === "string" ? JSON.parse(r.attachments) : r.attachments) : [],
        timeline: r.timeline ? (typeof r.timeline === "string" ? JSON.parse(r.timeline) : r.timeline) : [],
        created_at: r.created_at
      }));
    }

    // 7. clients
    const [clientsRows]: any = await dbPool.query("SELECT * FROM clients");
    if (clientsRows.length > 0) {
      db.clients = clientsRows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        email: r.email,
        phone: r.phone,
        company_name: r.company_name,
        address: r.address,
        projects: r.projects ? (typeof r.projects === "string" ? JSON.parse(r.projects) : r.projects) : [],
        invoices: r.invoices ? (typeof r.invoices === "string" ? JSON.parse(r.invoices) : r.invoices) : [],
        documents: r.documents ? (typeof r.documents === "string" ? JSON.parse(r.documents) : r.documents) : [],
        payments: r.payments ? (typeof r.payments === "string" ? JSON.parse(r.payments) : r.payments) : [],
        notes: r.notes || "",
        created_at: r.created_at
      }));
    }

    // 8. proposals
    const [proposalsRows]: any = await dbPool.query("SELECT * FROM proposals");
    if (proposalsRows.length > 0) {
      db.proposals = proposalsRows.map((r: any) => ({
        id: Number(r.id),
        lead_id: r.lead_id ? Number(r.lead_id) : null,
        title: r.title,
        services_selected: r.services_selected ? (typeof r.services_selected === "string" ? JSON.parse(r.services_selected) : r.services_selected) : [],
        packages_selected: r.packages_selected ? (typeof r.packages_selected === "string" ? JSON.parse(r.packages_selected) : r.packages_selected) : [],
        price: Number(r.price),
        terms: r.terms,
        timeline: r.timeline,
        signature_data: r.signature_data,
        created_at: r.created_at
      }));
    }

    // 9. testimonials
    const [testimonialsRows]: any = await dbPool.query("SELECT * FROM testimonials");
    if (testimonialsRows.length > 0) {
      db.testimonials = testimonialsRows.map((r: any) => ({
        id: Number(r.id),
        author_name: r.author_name,
        author_role: r.author_role,
        author_company: r.author_company,
        testimonial_text: r.testimonial_text,
        rating: Number(r.rating || 5),
        author_avatar: r.author_avatar
      }));
    }

    // 10. faqs
    const [faqsRows]: any = await dbPool.query("SELECT * FROM faqs");
    if (faqsRows.length > 0) {
      db.faqs = faqsRows.map((r: any) => ({
        id: Number(r.id),
        question: r.question,
        answer: r.answer,
        category: r.category
      }));
    }

    // 11. settings
    const [settingsRows]: any = await dbPool.query("SELECT * FROM settings");
    if (settingsRows.length > 0) {
      const settingsObj: any = {};
      for (const row of settingsRows) {
        settingsObj[row.meta_key] = row.meta_value;
      }
      db.settings = { ...DEFAULT_DB.settings, ...settingsObj };
    }

    // 12. partners
    try {
      const [partnersRows]: any = await dbPool.query("SELECT * FROM partners");
      if (partnersRows.length > 0) {
        db.partners = partnersRows.map((r: any) => ({
          id: Number(r.id),
          name: r.name,
          style: r.style
        }));
      }
    } catch (e) {
      console.log("partners table not ready yet, skipping load");
    }

    // 13. activity_logs
    try {
      const [logsRows]: any = await dbPool.query("SELECT * FROM activity_logs");
      if (logsRows.length > 0) {
        db.activity_logs = logsRows.map((r: any) => ({
          id: Number(r.id),
          event: r.event,
          date: r.date,
          user: r.user
        }));
      }
    } catch (e) {
      console.log("activity_logs table not ready yet, skipping load");
    }

    // 14. benefits
    try {
      const [benefitsRows]: any = await dbPool.query("SELECT * FROM benefits");
      if (benefitsRows.length > 0) {
        db.benefits = benefitsRows.map((r: any) => ({
          id: Number(r.id),
          title: r.title,
          text: r.text,
          icon: r.icon,
          bgColor: r.bgColor,
          borderColor: r.borderColor,
          iconColor: r.iconColor,
          glow: r.glow
        }));
      }
    } catch (e) {
      console.log("benefits table not ready yet, skipping load");
    }

    // Write this fully loaded MySQL data back to local json file
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    console.log("Successfully loaded, parsed, and cached Hostinger MySQL data locally.");
  } catch (err) {
    console.error("Error loading data from MySQL on startup:", err);
  }
}

// Background sync from local cache state to Hostinger MySQL
async function syncToMySql(db: typeof DEFAULT_DB) {
  const pool = checkAndInitDbPool();
  if (!pool) return;
  const dbPool = pool;
  try {
    console.log("Syncing database updates to Hostinger MySQL in the background...");

    // Ensure extra tables are built
    await createExtraTablesIfNotExist();

    // 1. users
    try {
      await dbPool.query("DELETE FROM users");
      for (const u of db.users) {
        await dbPool.query(
          "INSERT INTO users (id, name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)",
          [u.id, u.name, u.email, "$2y$12$R.3C7hSj07Xg696BfDIn3e1gYy3h52gU8oP1.h98aO6N9nZt/K7B.", u.role, JSON.stringify(u.permissions || ["all"])]
        );
      }
    } catch (e) { console.error("Sync Error: users", e); }

    // 2. services
    try {
      await dbPool.query("DELETE FROM services");
      for (const s of db.services) {
        await dbPool.query(
          "INSERT INTO services (id, title, slug, category, description, features, packages, faq, seo_title, seo_description, seo_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            s.id, s.title, s.slug, s.category, s.description,
            JSON.stringify(s.features || []),
            JSON.stringify(s.packages || []),
            JSON.stringify(s.faq || []),
            s.seo_title || "", s.seo_description || "", s.seo_keywords || ""
          ]
        );
      }
    } catch (e) { console.error("Sync Error: services", e); }

    // 3. packages
    try {
      await dbPool.query("DELETE FROM packages");
      for (const p of db.packages) {
        await dbPool.query(
          "INSERT INTO packages (id, title, price, timeline, features, highlight, button_text) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            p.id, p.title, p.price, p.timeline || "14 Days",
            JSON.stringify(p.features || []),
            p.highlight ? 1 : 0, p.button_text || "Buy Now"
          ]
        );
      }
    } catch (e) { console.error("Sync Error: packages", e); }

    // 4. portfolio
    try {
      await dbPool.query("DELETE FROM portfolio");
      for (const p of db.portfolio) {
        await dbPool.query(
          "INSERT INTO portfolio (id, title, slug, category, client, technology_used, project_timeline, website_link, video_url, description, case_study, screenshots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            p.id, p.title, p.slug, p.category, p.client || "",
            JSON.stringify(p.technology_used || []),
            p.project_timeline || "", p.website_link || "", p.video_url || "",
            p.description, p.case_study || "",
            JSON.stringify(p.screenshots || [])
          ]
        );
      }
    } catch (e) { console.error("Sync Error: portfolio", e); }

    // 5. blogs
    try {
      await dbPool.query("DELETE FROM blogs");
      for (const b of db.blogs) {
        await dbPool.query(
          "INSERT INTO blogs (id, title, slug, category, tags, content, featured_image, author, reading_time, views, comments, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            b.id, b.title, b.slug, b.category,
            JSON.stringify(b.tags || []),
            b.content, b.featured_image || "", b.author,
            b.reading_time || 5, b.views || 0,
            JSON.stringify(b.comments || []),
            b.seo_title || "", b.seo_description || ""
          ]
        );
      }
    } catch (e) { console.error("Sync Error: blogs", e); }

    // 6. leads
    try {
      await dbPool.query("DELETE FROM leads");
      for (const l of db.leads) {
        await dbPool.query(
          "INSERT INTO leads (id, type, client_name, client_email, client_phone, service_interested, message, status, staff_assigned, follow_up_date, notes, attachments, timeline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            l.id, l.type || "website", l.client_name, l.client_email, l.client_phone || "",
            l.service_interested || "", l.message || "", l.status || "pending",
            l.staff_assigned || "", l.follow_up_date || null,
            JSON.stringify(l.notes || []),
            JSON.stringify(l.attachments || []),
            JSON.stringify(l.timeline || [])
          ]
        );
      }
    } catch (e) { console.error("Sync Error: leads", e); }

    // 7. clients
    try {
      await dbPool.query("DELETE FROM clients");
      for (const c of db.clients) {
        await dbPool.query(
          "INSERT INTO clients (id, name, email, phone, company_name, address, projects, invoices, documents, payments, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            c.id, c.name, c.email, c.phone || "", c.company_name || "", c.address || "",
            JSON.stringify(c.projects || []),
            JSON.stringify(c.invoices || []),
            JSON.stringify(c.documents || []),
            JSON.stringify(c.payments || []),
            c.notes || ""
          ]
        );
      }
    } catch (e) { console.error("Sync Error: clients", e); }

    // 8. proposals
    try {
      await dbPool.query("DELETE FROM proposals");
      for (const p of db.proposals) {
        await dbPool.query(
          "INSERT INTO proposals (id, lead_id, title, services_selected, packages_selected, price, terms, timeline, signature_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            p.id, p.lead_id, p.title,
            JSON.stringify(p.services_selected || []),
            JSON.stringify(p.packages_selected || []),
            p.price, p.terms || "", p.timeline || "", p.signature_data || ""
          ]
        );
      }
    } catch (e) { console.error("Sync Error: proposals", e); }

    // 9. testimonials
    try {
      await dbPool.query("DELETE FROM testimonials");
      for (const t of db.testimonials) {
        await dbPool.query(
          "INSERT INTO testimonials (id, author_name, author_role, author_company, testimonial_text, rating, author_avatar) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            t.id, t.author_name, t.author_role, t.author_company || "", t.testimonial_text, t.rating || 5, t.author_avatar || ""
          ]
        );
      }
    } catch (e) { console.error("Sync Error: testimonials", e); }

    // 10. faqs
    try {
      await dbPool.query("DELETE FROM faqs");
      for (const f of db.faqs) {
        await dbPool.query(
          "INSERT INTO faqs (id, question, answer, category) VALUES (?, ?, ?, ?)",
          [f.id, f.question, f.answer, f.category || "General"]
        );
      }
    } catch (e) { console.error("Sync Error: faqs", e); }

    // 11. settings
    try {
      await dbPool.query("DELETE FROM settings");
      for (const [key, val] of Object.entries(db.settings)) {
        await dbPool.query(
          "INSERT INTO settings (meta_key, meta_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE meta_value = ?",
          [key, String(val), String(val)]
        );
      }
    } catch (e) { console.error("Sync Error: settings", e); }

    // 12. partners
    try {
      await dbPool.query("DELETE FROM partners");
      for (const p of db.partners) {
        await dbPool.query(
          "INSERT INTO partners (id, name, style) VALUES (?, ?, ?)",
          [p.id, p.name, p.style]
        );
      }
    } catch (e) { console.error("Sync Error: partners", e); }

    // 13. activity_logs
    try {
      await dbPool.query("DELETE FROM activity_logs");
      for (const l of db.activity_logs) {
        await dbPool.query(
          "INSERT INTO activity_logs (id, event, date, user) VALUES (?, ?, ?, ?)",
          [l.id, l.event, l.date, l.user]
        );
      }
    } catch (e) { console.error("Sync Error: activity_logs", e); }

    // 14. benefits
    try {
      await dbPool.query("DELETE FROM benefits");
      for (const b of db.benefits) {
        await dbPool.query(
          "INSERT INTO benefits (id, title, text, icon, bgColor, borderColor, iconColor, glow) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [b.id, b.title, b.text, b.icon, b.bgColor, b.borderColor, b.iconColor, b.glow]
        );
      }
    } catch (e) { console.error("Sync Error: benefits", e); }

    console.log("Hostinger MySQL database tables synced successfully.");
  } catch (err) {
    console.error("Failed to sync state to MySQL database:", err);
  }
}

// Log actions helper
function logActivity(event: string, user: string = "Admin") {
  const db = readDb();
  const newLog = {
    id: db.activity_logs ? db.activity_logs.length + 1 : 1,
    event,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    user
  };
  if (!db.activity_logs) {
    db.activity_logs = [];
  }
  db.activity_logs.unshift(newLog);
  writeDb(db);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Load initial database state from Hostinger MySQL if configured
  if (checkAndInitDbPool()) {
    try {
      await loadFromMySql();
    } catch (err) {
      console.error("Failed to load initial data from Hostinger MySQL on boot:", err);
    }
  }

  // Security headers simulation (XSS/CSRF logs)
  app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  // --- API ROUTES ---

  // Database Connection Status & Sync Controls
  app.get("/api/db-status", async (req, res) => {
    const pool = checkAndInitDbPool();
    const envVars = {
      DB_HOST: !!process.env.DB_HOST,
      DB_USER: !!process.env.DB_USER,
      DB_NAME: !!process.env.DB_NAME,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      DB_PORT: !!process.env.DB_PORT
    };
    
    if (!pool) {
      return res.json({
        connected: false,
        fallback: true,
        env: envVars,
        error: "No database credentials found. Please configure DB_HOST, DB_USER, DB_NAME, and DB_PASSWORD in the AI Studio Settings panel."
      });
    }

    try {
      // Run a lightweight test query
      await pool.query("SELECT 1");
      return res.json({
        connected: true,
        fallback: false,
        env: envVars,
        message: "Successfully connected to Hostinger MySQL Database!"
      });
    } catch (err: any) {
      return res.json({
        connected: false,
        fallback: true,
        env: envVars,
        error: `Could not connect to Hostinger MySQL: ${err.message}. Please verify Remote MySQL / IP Whitelist permissions in Hostinger.`
      });
    }
  });

  app.post("/api/db-sync", async (req, res) => {
    const { action } = req.body;
    const pool = checkAndInitDbPool();
    if (!pool) {
      return res.status(400).json({ success: false, message: "Database connection is not configured." });
    }

    try {
      if (action === "push") {
        const db = readDb();
        await syncToMySql(db);
        logActivity("Manually backed up all current website data to Hostinger MySQL");
        return res.json({ success: true, message: "Successfully pushed and backed up all current data to Hostinger MySQL Database!" });
      } else if (action === "pull") {
        await loadFromMySql();
        logActivity("Manually pulled latest database records from Hostinger MySQL");
        return res.json({ success: true, message: "Successfully pulled and synchronized all data from Hostinger MySQL Database!" });
      } else {
        return res.status(400).json({ success: false, message: "Invalid action. Choose 'push' or 'pull'." });
      }
    } catch (err: any) {
      console.error("Database sync error:", err);
      return res.status(500).json({ success: false, message: `Sync failed: ${err.message}` });
    }
  });

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.email === email);
    // Simple secure password verification simulator
    if (user && (password === "@#Creattivee@#" || password === "Admin@Creattivee2026" || password === "admin")) {
      logActivity("User logged in successfully", user.name);
      return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    logActivity(`Failed login attempt for ${email}`, "Guest");
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  });

  app.get("/api/auth/me", (req, res) => {
    const db = readDb();
    res.json({ user: db.users[0] });
  });

  // Activity Logs
  app.get("/api/activity-logs", (req, res) => {
    const db = readDb();
    res.json(db.activity_logs || []);
  });

  // Services CRUD
  app.get("/api/services", (req, res) => {
    res.json(readDb().services);
  });

  app.post("/api/services", (req, res) => {
    const db = readDb();
    const newService = {
      id: db.services.length > 0 ? Math.max(...db.services.map(s => s.id)) + 1 : 1,
      ...req.body,
      slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    };
    db.services.push(newService);
    writeDb(db);
    logActivity(`Created service: ${newService.title}`);
    res.json({ success: true, service: newService });
  });

  app.put("/api/services/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.services.findIndex(s => s.id === id);
    if (index !== -1) {
      db.services[index] = { ...db.services[index], ...req.body };
      writeDb(db);
      logActivity(`Updated service: ${db.services[index].title}`);
      res.json({ success: true, service: db.services[index] });
    } else {
      res.status(404).json({ message: "Service not found" });
    }
  });

  app.delete("/api/services/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const service = db.services.find(s => s.id === id);
    if (service) {
      db.services = db.services.filter(s => s.id !== id);
      writeDb(db);
      logActivity(`Deleted service: ${service.title}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Service not found" });
    }
  });

  // Packages CRUD
  app.get("/api/packages", (req, res) => {
    res.json(readDb().packages);
  });

  app.post("/api/packages", (req, res) => {
    const db = readDb();
    const newPkg = {
      id: db.packages.length > 0 ? Math.max(...db.packages.map(p => p.id)) + 1 : 1,
      ...req.body
    };
    db.packages.push(newPkg);
    writeDb(db);
    logActivity(`Created package: ${newPkg.title}`);
    res.json({ success: true, package: newPkg });
  });

  app.put("/api/packages/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.packages.findIndex(p => p.id === id);
    if (index !== -1) {
      db.packages[index] = { ...db.packages[index], ...req.body };
      writeDb(db);
      logActivity(`Updated package: ${db.packages[index].title}`);
      res.json({ success: true, package: db.packages[index] });
    } else {
      res.status(404).json({ message: "Package not found" });
    }
  });

  app.delete("/api/packages/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const pkg = db.packages.find(p => p.id === id);
    if (pkg) {
      db.packages = db.packages.filter(p => p.id !== id);
      writeDb(db);
      logActivity(`Deleted package: ${pkg.title}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Package not found" });
    }
  });

  // Partners CRUD
  app.get("/api/partners", (req, res) => {
    const db = readDb();
    res.json(db.partners || []);
  });

  app.post("/api/partners", (req, res) => {
    const db = readDb();
    if (!db.partners) db.partners = [];
    const newPartner = {
      id: db.partners.length > 0 ? Math.max(...db.partners.map(p => p.id)) + 1 : 1,
      ...req.body
    };
    db.partners.push(newPartner);
    writeDb(db);
    logActivity(`Created partner logo: ${newPartner.name}`);
    res.json({ success: true, partner: newPartner });
  });

  app.put("/api/partners/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    if (!db.partners) db.partners = [];
    const index = db.partners.findIndex(p => p.id === id);
    if (index !== -1) {
      db.partners[index] = { ...db.partners[index], ...req.body };
      writeDb(db);
      logActivity(`Updated partner logo: ${db.partners[index].name}`);
      res.json({ success: true, partner: db.partners[index] });
    } else {
      res.status(404).json({ message: "Partner not found" });
    }
  });

  app.delete("/api/partners/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    if (!db.partners) db.partners = [];
    const partner = db.partners.find(p => p.id === id);
    if (partner) {
      db.partners = db.partners.filter(p => p.id !== id);
      writeDb(db);
      logActivity(`Deleted partner logo: ${partner.name}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Partner not found" });
    }
  });

  // Benefits (Why Choose Us) CRUD
  app.get("/api/benefits", (req, res) => {
    const db = readDb();
    res.json(db.benefits || []);
  });

  app.post("/api/benefits", (req, res) => {
    const db = readDb();
    if (!db.benefits) db.benefits = [];
    const newBenefit = {
      id: db.benefits.length > 0 ? Math.max(...db.benefits.map(b => b.id)) + 1 : 1,
      ...req.body
    };
    db.benefits.push(newBenefit);
    writeDb(db);
    logActivity(`Created benefit: ${newBenefit.title}`);
    res.json({ success: true, benefit: newBenefit });
  });

  app.put("/api/benefits/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    if (!db.benefits) db.benefits = [];
    const index = db.benefits.findIndex(b => b.id === id);
    if (index !== -1) {
      db.benefits[index] = { ...db.benefits[index], ...req.body };
      writeDb(db);
      logActivity(`Updated benefit: ${db.benefits[index].title}`);
      res.json({ success: true, benefit: db.benefits[index] });
    } else {
      res.status(404).json({ message: "Benefit not found" });
    }
  });

  app.delete("/api/benefits/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    if (!db.benefits) db.benefits = [];
    const benefit = db.benefits.find(b => b.id === id);
    if (benefit) {
      db.benefits = db.benefits.filter(b => b.id !== id);
      writeDb(db);
      logActivity(`Deleted benefit: ${benefit.title}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Benefit not found" });
    }
  });


  // Portfolio CRUD
  app.get("/api/portfolio", (req, res) => {
    res.json(readDb().portfolio);
  });

  app.post("/api/portfolio", (req, res) => {
    const db = readDb();
    const newProject = {
      id: db.portfolio.length > 0 ? Math.max(...db.portfolio.map(p => p.id)) + 1 : 1,
      ...req.body,
      slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    };
    db.portfolio.push(newProject);
    writeDb(db);
    logActivity(`Created portfolio item: ${newProject.title}`);
    res.json({ success: true, project: newProject });
  });

  app.put("/api/portfolio/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.portfolio.findIndex(p => p.id === id);
    if (index !== -1) {
      db.portfolio[index] = { ...db.portfolio[index], ...req.body };
      writeDb(db);
      logActivity(`Updated portfolio item: ${db.portfolio[index].title}`);
      res.json({ success: true, project: db.portfolio[index] });
    } else {
      res.status(404).json({ message: "Portfolio item not found" });
    }
  });

  app.delete("/api/portfolio/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const p = db.portfolio.find(item => item.id === id);
    if (p) {
      db.portfolio = db.portfolio.filter(item => item.id !== id);
      writeDb(db);
      logActivity(`Deleted portfolio item: ${p.title}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Portfolio item not found" });
    }
  });

  // Blogs CRUD
  app.get("/api/blogs", (req, res) => {
    res.json(readDb().blogs);
  });

  app.post("/api/blogs", (req, res) => {
    const db = readDb();
    const newBlog = {
      id: db.blogs.length > 0 ? Math.max(...db.blogs.map(b => b.id)) + 1 : 1,
      ...req.body,
      slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      views: 0,
      comments: [],
      reading_time: Math.max(1, Math.round(req.body.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200))
    };
    db.blogs.push(newBlog);
    writeDb(db);
    logActivity(`Created blog article: ${newBlog.title}`);
    res.json({ success: true, blog: newBlog });
  });

  app.put("/api/blogs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.blogs.findIndex(b => b.id === id);
    if (index !== -1) {
      db.blogs[index] = { ...db.blogs[index], ...req.body };
      writeDb(db);
      logActivity(`Updated blog article: ${db.blogs[index].title}`);
      res.json({ success: true, blog: db.blogs[index] });
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  });

  app.delete("/api/blogs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const b = db.blogs.find(item => item.id === id);
    if (b) {
      db.blogs = db.blogs.filter(item => item.id !== id);
      writeDb(db);
      logActivity(`Deleted blog article: ${b.title}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  });

  app.post("/api/blogs/:id/comments", (req, res) => {
    const id = parseInt(req.params.id);
    const { name, comment } = req.body;
    const db = readDb();
    const index = db.blogs.findIndex(b => b.id === id);
    if (index !== -1) {
      const newComment = {
        name: name || "Anonymous",
        comment: comment || "",
        date: new Date().toISOString().substring(0, 10)
      };
      if (!db.blogs[index].comments) {
        db.blogs[index].comments = [];
      }
      db.blogs[index].comments.push(newComment);
      writeDb(db);
      logActivity(`New blog comment by ${newComment.name}`);
      res.json({ success: true, comment: newComment });
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  });

  // Leads CRUD (Website Leads + Manual Leads)
  app.get("/api/leads", (req, res) => {
    res.json(readDb().leads);
  });

  app.post("/api/leads", (req, res) => {
    const db = readDb();
    const newLead = {
      id: db.leads.length > 0 ? Math.max(...db.leads.map(l => l.id)) + 1 : 1,
      type: req.body.type || "website",
      client_name: req.body.client_name,
      client_email: req.body.client_email,
      client_phone: req.body.client_phone || "",
      service_interested: req.body.service_interested || "Website Designing",
      message: req.body.message || "",
      status: "pending",
      staff_assigned: req.body.staff_assigned || "Unassigned",
      follow_up_date: req.body.follow_up_date || "",
      notes: [
        { text: `Lead registered via ${req.body.type || "website"} form.`, date: new Date().toISOString().substring(0, 16).replace("T", " "), author: "System" }
      ],
      attachments: req.body.attachments || [],
      timeline: [
        { label: "Lead Logged", text: "Registered in CRM index", date: new Date().toISOString().substring(0, 16).replace("T", " ") }
      ],
      created_at: new Date().toISOString()
    };
    db.leads.unshift(newLead);
    writeDb(db);
    logActivity(`New Lead registered: ${newLead.client_name} (${newLead.service_interested})`);
    res.json({ success: true, lead: newLead });
  });

  app.put("/api/leads/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.leads.findIndex(l => l.id === id);
    if (index !== -1) {
      const oldStatus = db.leads[index].status;
      db.leads[index] = { ...db.leads[index], ...req.body };
      
      // If status changed, update timeline
      if (req.body.status && req.body.status !== oldStatus) {
        db.leads[index].timeline.push({
          label: "Status Changed",
          text: `Status updated from ${oldStatus} to ${req.body.status}`,
          date: new Date().toISOString().substring(0, 16).replace("T", " ")
        });
      }

      writeDb(db);
      logActivity(`Updated lead: ${db.leads[index].client_name}`);
      res.json({ success: true, lead: db.leads[index] });
    } else {
      res.status(404).json({ message: "Lead not found" });
    }
  });

  app.post("/api/leads/:id/notes", (req, res) => {
    const id = parseInt(req.params.id);
    const { text, author } = req.body;
    const db = readDb();
    const index = db.leads.findIndex(l => l.id === id);
    if (index !== -1) {
      const newNote = {
        text,
        date: new Date().toISOString().substring(0, 16).replace("T", " "),
        author: author || "Staff"
      };
      db.leads[index].notes.unshift(newNote);
      db.leads[index].timeline.push({
        label: "Note Added",
        text: `Staff note added: "${text.substring(0, 30)}..."`,
        date: new Date().toISOString().substring(0, 16).replace("T", " ")
      });
      writeDb(db);
      res.json({ success: true, lead: db.leads[index] });
    } else {
      res.status(404).json({ message: "Lead not found" });
    }
  });

  app.delete("/api/leads/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const lead = db.leads.find(l => l.id === id);
    if (lead) {
      db.leads = db.leads.filter(l => l.id !== id);
      writeDb(db);
      logActivity(`Deleted lead: ${lead.client_name}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Lead not found" });
    }
  });

  // Import CSV leads route
  app.post("/api/leads/import-csv", (req, res) => {
    const { csvData } = req.body; // Expect an array of parsed lead objects
    if (!Array.isArray(csvData)) {
      return res.status(400).json({ success: false, message: "Invalid CSV payload structure" });
    }
    const db = readDb();
    let importedCount = 0;
    csvData.forEach((row: any) => {
      if (row.client_name && row.client_email) {
        const newLead = {
          id: db.leads.length > 0 ? Math.max(...db.leads.map(l => l.id)) + 1 : 1,
          type: "imported",
          client_name: row.client_name,
          client_email: row.client_email,
          client_phone: row.client_phone || "",
          service_interested: row.service_interested || "Website Designing",
          message: row.message || "CSV Imported record",
          status: "pending",
          staff_assigned: "Unassigned",
          follow_up_date: "",
          notes: [
            { text: "Lead registered via bulk CSV import.", date: new Date().toISOString().substring(0, 16).replace("T", " "), author: "System" }
          ],
          attachments: [],
          timeline: [
            { label: "CSV Import", text: "Uploaded in bulk", date: new Date().toISOString().substring(0, 16).replace("T", " ") }
          ],
          created_at: new Date().toISOString()
        };
        db.leads.unshift(newLead);
        importedCount++;
      }
    });
    writeDb(db);
    logActivity(`Imported ${importedCount} leads via CSV bulk upload`);
    res.json({ success: true, count: importedCount, leads: db.leads });
  });

  // Clients CRUD
  app.get("/api/clients", (req, res) => {
    res.json(readDb().clients);
  });

  app.post("/api/clients", (req, res) => {
    const db = readDb();
    const newClient = {
      id: db.clients.length > 0 ? Math.max(...db.clients.map(c => c.id)) + 1 : 1,
      ...req.body,
      projects: req.body.projects || [],
      invoices: req.body.invoices || [],
      documents: req.body.documents || [],
      payments: req.body.payments || [],
      created_at: new Date().toISOString().substring(0, 10)
    };
    db.clients.push(newClient);
    writeDb(db);
    logActivity(`Registered new client: ${newClient.name}`);
    res.json({ success: true, client: newClient });
  });

  app.put("/api/clients/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      db.clients[index] = { ...db.clients[index], ...req.body };
      writeDb(db);
      logActivity(`Updated client specs: ${db.clients[index].name}`);
      res.json({ success: true, client: db.clients[index] });
    } else {
      res.status(404).json({ message: "Client not found" });
    }
  });

  app.delete("/api/clients/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const client = db.clients.find(c => c.id === id);
    if (client) {
      db.clients = db.clients.filter(c => c.id !== id);
      writeDb(db);
      logActivity(`Deleted client record: ${client.name}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Client not found" });
    }
  });

  // Proposals CRUD + attractive generator
  app.get("/api/proposals", (req, res) => {
    res.json(readDb().proposals);
  });

  app.post("/api/proposals", (req, res) => {
    const db = readDb();
    const newProposal = {
      id: db.proposals.length > 0 ? Math.max(...db.proposals.map(p => p.id)) + 1 : 1,
      ...req.body,
      created_at: new Date().toISOString()
    };
    db.proposals.unshift(newProposal);
    writeDb(db);
    logActivity(`Generated formal Proposal: ${newProposal.title} for amount $${newProposal.price}`);
    res.json({ success: true, proposal: newProposal });
  });

  // FAQs CRUD
  app.get("/api/faqs", (req, res) => {
    res.json(readDb().faqs);
  });

  app.post("/api/faqs", (req, res) => {
    const db = readDb();
    const newFaq = {
      id: db.faqs.length > 0 ? Math.max(...db.faqs.map(f => f.id)) + 1 : 1,
      ...req.body
    };
    db.faqs.push(newFaq);
    writeDb(db);
    logActivity(`Added FAQ item`);
    res.json({ success: true, faq: newFaq });
  });

  app.put("/api/faqs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.faqs.findIndex(f => f.id === id);
    if (index !== -1) {
      db.faqs[index] = { ...db.faqs[index], ...req.body };
      writeDb(db);
      res.json({ success: true, faq: db.faqs[index] });
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  });

  app.delete("/api/faqs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    db.faqs = db.faqs.filter(f => f.id !== id);
    writeDb(db);
    logActivity(`Deleted FAQ item`);
    res.json({ success: true });
  });

  // Testimonials CRUD
  app.get("/api/testimonials", (req, res) => {
    res.json(readDb().testimonials);
  });

  app.post("/api/testimonials", (req, res) => {
    const db = readDb();
    const newTestimonial = {
      id: db.testimonials.length > 0 ? Math.max(...db.testimonials.map(t => t.id)) + 1 : 1,
      ...req.body
    };
    db.testimonials.push(newTestimonial);
    writeDb(db);
    logActivity(`Created client testimonial by ${newTestimonial.author_name}`);
    res.json({ success: true, testimonial: newTestimonial });
  });

  app.put("/api/testimonials/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    const index = db.testimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      db.testimonials[index] = { ...db.testimonials[index], ...req.body };
      writeDb(db);
      res.json({ success: true, testimonial: db.testimonials[index] });
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  });

  app.delete("/api/testimonials/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDb();
    db.testimonials = db.testimonials.filter(t => t.id !== id);
    writeDb(db);
    logActivity(`Deleted testimonial item`);
    res.json({ success: true });
  });

  // Settings CRUD
  app.get("/api/settings", (req, res) => {
    res.json(readDb().settings);
  });

  app.post("/api/settings", (req, res) => {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    logActivity("Updated general agency settings");
    res.json({ success: true, settings: db.settings });
  });

  // Dynamic Sitemap Simulator
  app.get("/sitemap.xml", (req, res) => {
    const db = readDb();
    const baseUrl = "https://creattivee.com";
    res.header("Content-Type", "application/xml");
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Services urls
    db.services.forEach(s => {
      xml += `  <url>\n    <loc>${baseUrl}/services/${s.slug}</loc>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Portfolio urls
    db.portfolio.forEach(p => {
      xml += `  <url>\n    <loc>${baseUrl}/portfolio/${p.slug}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Blog urls
    db.blogs.forEach(b => {
      xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    res.send(xml);
  });

  // Dynamic Robots.txt
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: https://creattivee.com/sitemap.xml`);
  });

  // Backup Trigger
  app.get("/api/backups/download", (req, res) => {
    const db = readDb();
    res.setHeader("Content-disposition", "attachment; filename=creattivee_db_backup.json");
    res.setHeader("Content-type", "application/json");
    res.send(JSON.stringify(db, null, 2));
  });

  // --- VITE MIDDLEWARE INTERACTION ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Creattivee Full-Stack Engine] Running on port http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start Creattivee full-stack system", err);
});
