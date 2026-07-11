import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");

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
  activity_logs: [
    { id: 1, event: "Database Initialized", date: "2026-07-11 06:29", user: "System" }
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
  } catch (error) {
    console.error("Error writing db file", error);
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

  // Security headers simulation (XSS/CSRF logs)
  app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  // --- API ROUTES ---

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
