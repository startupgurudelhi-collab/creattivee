// Creattivee Digital Agency Types Definition

export interface Service {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  packages?: ServicePackage[];
  faq?: FAQItem[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface ServicePackage {
  title: string;
  price: string;
  features: string[];
  timeline: string;
  highlight?: boolean;
}

export interface FAQItem {
  id?: number;
  question: string;
  answer: string;
  category?: string;
}

export interface AgencyPackage {
  id: number;
  title: string;
  price: string;
  timeline?: string;
  features: string[];
  highlight: boolean;
  button_text: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  client?: string;
  technology_used: string[];
  project_timeline?: string;
  website_link?: string;
  video_url?: string;
  description: string;
  case_study?: string;
  screenshots: string[];
}

export interface BlogComment {
  name: string;
  comment: string;
  date: string;
}

export interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  content: string;
  featured_image: string;
  author: string;
  reading_time: number;
  views: number;
  comments: BlogComment[];
  seo_title?: string;
  seo_description?: string;
}

export interface LeadNote {
  text: string;
  date: string;
  author: string;
}

export interface LeadTimelineEvent {
  label: string;
  text: string;
  date: string;
}

export interface Lead {
  id: number;
  type: "website" | "manual" | "imported";
  client_name: string;
  client_email: string;
  client_phone: string;
  service_interested: string;
  message: string;
  status: "pending" | "contacted" | "proposal_sent" | "converted" | "lost";
  staff_assigned: string;
  follow_up_date: string;
  notes: LeadNote[];
  attachments: { name: string; url: string; size: string }[];
  timeline: LeadTimelineEvent[];
  created_at: string;
}

export interface ClientProject {
  name: string;
  status: string;
  timeline: string;
}

export interface ClientInvoice {
  id: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
}

export interface ClientDocument {
  title: string;
  date: string;
}

export interface ClientPayment {
  id: string;
  amount: string;
  date: string;
  method: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  address: string;
  projects: ClientProject[];
  invoices: ClientInvoice[];
  documents: ClientDocument[];
  payments: ClientPayment[];
  notes: string;
  created_at: string;
}

export interface Proposal {
  id: number;
  lead_id?: number;
  title: string;
  services_selected: string[];
  packages_selected: string[];
  price: number;
  terms: string;
  timeline: string;
  signature_data: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_role: string;
  author_company?: string;
  testimonial_text: string;
  rating: number;
  author_avatar?: string;
}

export interface AgencySettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  smtp_host: string;
  smtp_port: string;
  seo_default_title: string;
  seo_default_description: string;
}

export interface ActivityLog {
  id: number;
  event: string;
  date: string;
  user: string;
}

export interface Partner {
  id: number;
  name: string;
  style: string;
}

export interface Benefit {
  id: number;
  title: string;
  text: string;
  icon: string;
  bgColor?: string;
  borderColor?: string;
  iconColor?: string;
  glow?: string;
}

