-- =========================================================
-- Creattivee Digital Agency - PostgreSQL Database Schema
-- Production Ready for Coolify, Neon, Supabase, Cloud SQL, Docker & Self-Hosted PostgreSQL
-- =========================================================

-- Enable UUID extension (optional for future scaling)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  permissions TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: services
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  features TEXT NOT NULL,
  packages TEXT DEFAULT NULL,
  faq TEXT DEFAULT NULL,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_keywords VARCHAR(555) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: packages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price VARCHAR(100) NOT NULL,
  timeline VARCHAR(100) DEFAULT NULL,
  features TEXT NOT NULL,
  highlight BOOLEAN NOT NULL DEFAULT FALSE,
  button_text VARCHAR(100) DEFAULT 'Buy Now',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: portfolio
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  client VARCHAR(255) DEFAULT NULL,
  technology_used TEXT NOT NULL,
  project_timeline VARCHAR(100) DEFAULT NULL,
  website_link VARCHAR(255) DEFAULT NULL,
  video_url VARCHAR(255) DEFAULT NULL,
  description TEXT NOT NULL,
  case_study TEXT DEFAULT NULL,
  screenshots TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: blogs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  tags VARCHAR(255) DEFAULT NULL,
  content TEXT NOT NULL,
  featured_image VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  reading_time INT DEFAULT 5,
  views INT DEFAULT 0,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  comments TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: leads
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'website',
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) DEFAULT NULL,
  service_interested VARCHAR(255) DEFAULT NULL,
  message TEXT DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  staff_assigned VARCHAR(255) DEFAULT NULL,
  follow_up_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  attachments TEXT DEFAULT NULL,
  timeline TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: clients
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT NULL,
  company_name VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  projects TEXT DEFAULT NULL,
  invoices TEXT DEFAULT NULL,
  documents TEXT DEFAULT NULL,
  payments TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: proposals
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  services_selected TEXT NOT NULL,
  packages_selected TEXT DEFAULT NULL,
  price NUMERIC(10,2) NOT NULL,
  terms TEXT DEFAULT NULL,
  timeline VARCHAR(255) DEFAULT NULL,
  signature_data TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  scope_html TEXT DEFAULT NULL,
  client_name VARCHAR(255) DEFAULT NULL,
  client_email VARCHAR(255) DEFAULT NULL,
  client_phone VARCHAR(50) DEFAULT NULL,
  download_count INT DEFAULT 0,
  last_downloaded_at VARCHAR(100) DEFAULT NULL,
  pdf_generated_at VARCHAR(100) DEFAULT NULL,
  pdf_version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: testimonials
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(100) NOT NULL,
  author_company VARCHAR(255) DEFAULT NULL,
  testimonial_text TEXT NOT NULL,
  rating INT DEFAULT 5,
  author_avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: faqs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General'
);

-- --------------------------------------------------------
-- Table: settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  meta_key VARCHAR(255) NOT NULL UNIQUE,
  meta_value TEXT DEFAULT NULL
);

-- --------------------------------------------------------
-- Table: partners
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  style VARCHAR(255) DEFAULT NULL
);

-- --------------------------------------------------------
-- Table: activity_logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  date VARCHAR(100) NOT NULL,
  "user" VARCHAR(255) DEFAULT NULL
);

-- --------------------------------------------------------
-- Table: benefits
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS benefits (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  icon VARCHAR(100) DEFAULT NULL,
  "bgColor" VARCHAR(100) DEFAULT NULL,
  "borderColor" VARCHAR(100) DEFAULT NULL,
  "iconColor" VARCHAR(100) DEFAULT NULL,
  glow VARCHAR(100) DEFAULT NULL
);

-- --------------------------------------------------------
-- Initial Seed Data (Only inserted if table is empty)
-- --------------------------------------------------------

-- Default Admin Seeder (Username: foujia@creattivee.com / foujia, Password: Login@2025)
INSERT INTO users (id, name, email, password, role, permissions)
VALUES (1, 'Foujia (Admin)', 'foujia@creattivee.com', '$2y$12$R.3C7hSj07Xg696BfDIn3e1gYy3h52gU8oP1.h98aO6N9nZt/K7B.', 'admin', '["all"]')
ON CONFLICT (email) DO NOTHING;

-- Services Seeders
INSERT INTO services (id, title, slug, category, description, features, packages, faq, seo_title, seo_description)
VALUES
(1, 'Website Designing', 'website-designing', 'Design', 'Our bespoke static and dynamic corporate website design services stand out for standard web-presence, combining seamless Framer-like micro-interactions with high PageSpeed optimization.', 
'["Static Website", "Dynamic Website", "Corporate Website", "Landing Page", "Portfolio Website", "School Website", "Hospital Website"]',
'[{"title":"Starter Brand","price":"₹14,999","features":["Custom Layout","Responsive Screen","3 Inner Pages","Contact Lead Form","Sitemap Generation"],"timeline":"1 Week"},{"title":"Premium Business","price":"₹39,999","highlight":true,"features":["Custom Landing Page","Unlimited Pages","Full Dynamic CMS Panel","Framer-like Animations","SMTP Notification Mailer"],"timeline":"2 Weeks"}]',
'[{"q":"Can I update static elements?","a":"Yes, with our Admin Panel custom sections, all page layouts, texts, and colors are fully manageable without coding."}]',
'Premium Website Designing | Creattivee', 'Bespoke high-end web styling services including corporate, landing, and dynamic app design.'),
(2, 'Software Development', 'software-development', 'Development', 'Custom enterprise software packages engineered to empower workflow efficiency across your teams.', 
'["ERP Development", "CRM Development", "Inventory Software", "Billing Software", "HRMS", "Web Application", "SaaS Development", "AI Software", "Custom Software"]',
'[{"title":"MVP Blueprint","price":"₹79,999","features":["Core ERP Module","User Authentication","Client Dashboard","CSV Exporting"],"timeline":"3 Weeks"},{"title":"Enterprise Core","price":"₹1,49,999","highlight":true,"features":["Full CRM + ERP Integration","Payment Gateways","Automated SMTP Alerts","AI-powered Assistant Integration"],"timeline":"5 Weeks"}]',
'[{"q":"Do you provide maintenance?","a":"Yes, we have standard Annual Maintenance Contracts (AMC) with weekly cloud backups."}]',
'Enterprise Software Development Services | Creattivee', 'Top tier custom web apps, HRMS, billing systems, inventory portals and SaaS architectures.')
ON CONFLICT (slug) DO NOTHING;

-- Packages Seeders
INSERT INTO packages (id, title, price, timeline, features, highlight, button_text)
VALUES
(1, 'Premium Growth Designing', '₹29,999', '14 Days', '["Responsive Design", "Vite/Next Speed Optimization", "Custom Proposal PDF Creator", "Admin CMS Panels", "Google PageSpeed 95+"]', TRUE, 'Buy Now'),
(2, 'SaaS Core App Starter', '₹89,999', '21 Days', '["Custom PostgreSQL Structure", "Node/Express APIs", "Robust Lead Tracker", "Admin Controls", "Postman Documentation Included"]', FALSE, 'Buy Now')
ON CONFLICT (id) DO NOTHING;

-- Portfolio Seeders
INSERT INTO portfolio (id, title, slug, category, client, technology_used, project_timeline, website_link, video_url, description, case_study, screenshots)
VALUES
(1, 'Futura Bank FinTech UI', 'futura-bank-fintech-ui', 'Fintech', 'Futura Inc', 'React, Express, TailwindCSS, PostgreSQL, Chart.js', '3 Weeks', 'https://futurabank-example.com', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
'A high-end glassmorphism-based fintech interface tailored for multi-currency dynamic client statements.',
'Our challenge was implementing dense fintech graphs while keeping speeds high on mobile. We utilized canvas-based charting and modular components.',
'["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"]')
ON CONFLICT (slug) DO NOTHING;

-- Settings Seeders
INSERT INTO settings (meta_key, meta_value)
VALUES
('company_name', 'Creattivee'),
('company_address', 'D-561, Pocket 11, DDA Janta Flats, Jasola, New Delhi, 110025'),
('company_phone', '+91-8796380455'),
('company_email', 'creattivee@gmail.com'),
('smtp_host', 'smtp.gmail.com'),
('smtp_port', '587'),
('seo_default_title', 'Creattivee | Custom Software & Creative Web Design Agency'),
('seo_default_description', 'High performance digital agency specializing in custom software, ERPs, SEO, and bespoke React development.')
ON CONFLICT (meta_key) DO NOTHING;

-- Sync sequences for BIGSERIAL primary keys
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('services_id_seq', (SELECT COALESCE(MAX(id), 1) FROM services));
SELECT setval('packages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM packages));
SELECT setval('portfolio_id_seq', (SELECT COALESCE(MAX(id), 1) FROM portfolio));
