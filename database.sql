-- Creattivee Digital Agency Database SQL Schema
-- Production Ready for Hostinger MySQL Server

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `creattivee_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'staff', -- admin, staff
  `permissions` text DEFAULT NULL, -- JSON array of permissions
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `services`
--

CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL, -- Design, Development, Marketing, etc.
  `description` text NOT NULL,
  `features` text NOT NULL, -- JSON formatted array
  `packages` text DEFAULT NULL, -- JSON formatted array of packages
  `faq` text DEFAULT NULL, -- JSON formatted array of FAQs
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` varchar(555) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `packages`
--

CREATE TABLE IF NOT EXISTS `packages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `price` varchar(100) NOT NULL,
  `timeline` varchar(100) DEFAULT NULL,
  `features` text NOT NULL, -- JSON formatted array
  `highlight` tinyint(1) NOT NULL DEFAULT '0',
  `button_text` varchar(100) DEFAULT 'Buy Now',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `portfolio`
--

CREATE TABLE IF NOT EXISTS `portfolio` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `client` varchar(255) DEFAULT NULL,
  `technology_used` text NOT NULL, -- JSON or comma separated values
  `project_timeline` varchar(100) DEFAULT NULL,
  `website_link` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `case_study` text DEFAULT NULL,
  `screenshots` text DEFAULT NULL, -- JSON formatted array of URLs
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `portfolio_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `blogs`
--

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `tags` varchar(255) DEFAULT NULL, -- comma-separated
  `content` longtext NOT NULL,
  `featured_image` varchar(255) NOT NULL,
  `author` varchar(100) NOT NULL,
  `reading_time` int(11) DEFAULT '5',
  `views` int(11) DEFAULT '0',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `comments` text DEFAULT NULL, -- JSON format list of comments
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `leads`
--

CREATE TABLE IF NOT EXISTS `leads` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL DEFAULT 'website', -- website, manual
  `client_name` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(50) DEFAULT NULL,
  `service_interested` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending', -- pending, contacted, proposal_sent, converted, lost
  `staff_assigned` varchar(255) DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL, -- JSON list of updates/notes
  `attachments` text DEFAULT NULL, -- JSON array of file details
  `timeline` text DEFAULT NULL, -- JSON list of activity events
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `clients`
--

CREATE TABLE IF NOT EXISTS `clients` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `projects` text DEFAULT NULL, -- JSON structure of client projects
  `invoices` text DEFAULT NULL, -- JSON structure of invoices
  `documents` text DEFAULT NULL, -- JSON structure of documents
  `payments` text DEFAULT NULL, -- JSON structure of payments
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `proposals`
--

CREATE TABLE IF NOT EXISTS `proposals` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `services_selected` text NOT NULL, -- JSON formatted array
  `packages_selected` text DEFAULT NULL, -- JSON formatted array
  `price` decimal(10,2) NOT NULL,
  `terms` text DEFAULT NULL,
  `timeline` varchar(255) DEFAULT NULL,
  `signature_data` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `testimonials`
--

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_name` varchar(255) NOT NULL,
  `author_role` varchar(100) NOT NULL,
  `author_company` varchar(255) DEFAULT NULL,
  `testimonial_text` text NOT NULL,
  `rating` int(11) DEFAULT '5',
  `author_avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `faqs`
--

CREATE TABLE IF NOT EXISTS `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'General',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `settings`
--

CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`meta_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Dumping data for seeders
--

--
-- Admin Seeder (Username: foujia@creattivee.com, Password: Login@2025)
--
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `permissions`) VALUES
(1, 'Foujia (Admin)', 'foujia@creattivee.com', '$2y$12$R.3C7hSj07Xg696BfDIn3e1gYy3h52gU8oP1.h98aO6N9nZt/K7B.', 'admin', '["all"]');

--
-- Services Seeders
--
INSERT INTO `services` (`id`, `title`, `slug`, `category`, `description`, `features`, `packages`, `faq`, `seo_title`, `seo_description`) VALUES
(1, 'Website Designing', 'website-designing', 'Design', 'Our bespoke static and dynamic corporate website design services stand out for standard web-presence, combining seamless Framer-like micro-interactions with high PageSpeed optimization.', 
'["Static Website", "Dynamic Website", "Corporate Website", "Landing Page", "Portfolio Website", "School Website", "Hospital Website"]',
'[{"title":"Starter Brand","price":"₹14,999","features":["Custom Layout","Responsive Screen","3 Inner Pages","Contact Lead Form","Sitemap Generation"],"timeline":"1 Week"},{"title":"Premium Business","price":"₹39,999","highlight":true,"features":["Custom Landing Page","Unlimited Pages","Full Dynamic CMS Panel","Framer-like Animations","SMTP Notification Mailer"],"timeline":"2 Weeks"}]',
'[{"q":"Can I update static elements?","a":"Yes, with our Admin Panel custom sections, all page layouts, texts, and colors are fully manageable without coding."}]',
'Premium Website Designing | Creattivee', 'Bespoke high-end web styling services including corporate, landing, and dynamic app design.'),
(2, 'Software Development', 'software-development', 'Development', 'Custom enterprise software packages engineered to empower workflow efficiency across your teams.', 
'["ERP Development", "CRM Development", "Inventory Software", "Billing Software", "HRMS", "Web Application", "SaaS Development", "AI Software", "Custom Software"]',
'[{"title":"MVP Blueprint","price":"₹79,999","features":["Core ERP Module","User Authentication","Client Dashboard","CSV Exporting"],"timeline":"3 Weeks"},{"title":"Enterprise Core","price":"₹1,49,999","highlight":true,"features":["Full CRM + ERP Integration","Payment Gateways","Automated SMTP Alerts","AI-powered Assistant Integration"],"timeline":"5 Weeks"}]',
'[{"q":"Do you provide maintenance?","a":"Yes, we have standard Annual Maintenance Contracts (AMC) with weekly cloud backups."}]',
'Enterprise Software Development Services | Creattivee', 'Top tier custom web apps, HRMS, billing systems, inventory portals and SaaS architectures.');

--
-- Packages Seeders
--
INSERT INTO `packages` (`id`, `title`, `price`, `timeline`, `features`, `highlight`, `button_text`) VALUES
(1, 'Premium Growth Designing', '₹29,999', '14 Days', '["Responsive Design", "Vite/Next Speed Optimization", "Custom Proposal PDF Creator", "Admin CMS Panels", "Google PageSpeed 95+"]', 1, 'Buy Now'),
(2, 'SaaS Core App Starter', '₹89,999', '21 Days', '["Custom MySQL Structure", "Node/Express APIs", "Robust Lead Tracker", "Admin Controls", "Postman Documentation Included"]', 0, 'Buy Now');

--
-- Portfolio Seeders
--
INSERT INTO `portfolio` (`id`, `title`, `slug`, `category`, `client`, `technology_used`, `project_timeline`, `website_link`, `video_url`, `description`, `case_study`, `screenshots`) VALUES
(1, 'Futura Bank FinTech UI', 'futura-bank-fintech-ui', 'Fintech', 'Futura Inc', 'React, Express, TailwindCSS, Chart.js', '3 Weeks', 'https://futurabank-example.com', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
'A high-end glassmorphism-based fintech interface tailored for multi-currency dynamic client statements.',
'Our challenge was implementing dense fintech graphs while keeping speeds high on mobile. We utilized canvas-based charting and modular components.',
'["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"]');

--
-- Settings Seeders
--
INSERT INTO `settings` (`id`, `meta_key`, `meta_value`) VALUES
(1, 'company_name', 'Creattivee'),
(2, 'company_address', 'D-561, Pocket 11, DDA Janta Flats, Jasola, New Delhi, 110025'),
(3, 'company_phone', '+91-8796380455'),
(4, 'company_email', 'creattivee@gmail.com'),
(5, 'smtp_host', 'smtp.gmail.com'),
(6, 'smtp_port', '587'),
(7, 'seo_default_title', 'Creattivee | Custom Software & Creative Web Design Agency'),
(8, 'seo_default_description', 'High performance digital agency specializing in custom software, ERPs, SEO, and bespoke React development.');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
