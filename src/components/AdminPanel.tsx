import React, { useState, useEffect } from "react";
import {
  Users, Briefcase, FileText, Settings, Database, Plus, Edit, Trash, Upload,
  Calendar, Check, UserPlus, Clock, MessageSquare, Mail, Phone, MapPin, Tag,
  Download, Sparkles, BookOpen, LayoutGrid, Layers, HelpCircle, UserCheck, Play, Shield, X, Building2,
  Target, Brain, Palette, Zap, Smartphone, Search, HeartHandshake, TrendingUp, Laptop, ShieldCheck, Heart, User, Kanban, Lock, Globe, Rocket, Smile
} from "lucide-react";
import { Lead, Client, Service, AgencyPackage, PortfolioItem, BlogArticle, FAQItem, Testimonial, AgencySettings, ActivityLog, Partner, Benefit } from "../types";
import ProposalPrintable from "./ProposalPrintable";
import { motion } from "motion/react";
import Logo from "./Logo";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "leads" | "clients" | "proposals" | "cms-services" | "cms-packages" | "cms-portfolio" | "cms-partners" | "cms-blogs" | "cms-testimonials" | "cms-faqs" | "settings">("dashboard");

  // State Stores
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<AgencyPackage[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Hostinger MySQL Diagnostics & Synchronization States
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbDetails, setDbDetails] = useState<any>(null);
  const [dbSyncing, setDbSyncing] = useState<boolean>(false);
  const [dbSyncMessage, setDbSyncMessage] = useState<string>("");

  // CSV Importer States
  const [csvText, setCsvText] = useState("");
  const [showCsvBox, setShowCsvBox] = useState(false);
  const [csvImportMessage, setCsvImportMessage] = useState("");

  // Create/Edit Modals States
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCategory, setServiceCategory] = useState("Design");
  const [serviceFeatures, setServiceFeatures] = useState("");

  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [packageTitle, setPackageTitle] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageTimeline, setPackageTimeline] = useState("");
  const [packageFeatures, setPackageFeatures] = useState("");
  const [packageHighlight, setPackageHighlight] = useState(false);

  // Portfolio CMS Form States
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("Fintech");
  const [portfolioClient, setPortfolioClient] = useState("");
  const [portfolioTech, setPortfolioTech] = useState("");
  const [portfolioTimeline, setPortfolioTimeline] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioVideo, setPortfolioVideo] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioCaseStudy, setPortfolioCaseStudy] = useState("");
  const [portfolioScreenshots, setPortfolioScreenshots] = useState("");

  // Partner CMS Form States
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerStyle, setPartnerStyle] = useState("font-bold text-lg md:text-xl text-slate-600");

  // Benefits CMS Form States
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [showBenefitForm, setShowBenefitForm] = useState(false);
  const [editingBenefitId, setEditingBenefitId] = useState<number | null>(null);
  const [benefitTitle, setBenefitTitle] = useState("");
  const [benefitText, setBenefitText] = useState("");
  const [benefitIcon, setBenefitIcon] = useState("Brain");
  const [benefitBgColor, setBenefitBgColor] = useState("bg-purple-50");
  const [benefitBorderColor, setBenefitBorderColor] = useState("border-purple-100/60");
  const [benefitIconColor, setBenefitIconColor] = useState("text-purple-600");
  const [benefitGlow, setBenefitGlow] = useState("hover:shadow-purple-100/40");

  // Lead Details Drawer States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadNoteText, setLeadNoteText] = useState("");
  const [leadStatusVal, setLeadStatusVal] = useState("");
  const [leadStaffVal, setLeadStaffVal] = useState("");
  const [leadFollowUpVal, setLeadFollowUpVal] = useState("");

  // Client Form Drawer
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Settings State Form
  const [coName, setCoName] = useState("");
  const [coAddress, setCoAddress] = useState("");
  const [coPhone, setCoPhone] = useState("");
  const [coEmail, setCoEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  // Fetch all core datasets from server API
  const fetchAllData = async () => {
    try {
      const [leadsRes, clientsRes, servicesRes, packagesRes, portfolioRes, blogsRes, faqsRes, testimonialsRes, settingsRes, logsRes, partnersRes, benefitsRes] = await Promise.all([
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/clients").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/packages").then(r => r.json()),
        fetch("/api/portfolio").then(r => r.json()),
        fetch("/api/blogs").then(r => r.json()),
        fetch("/api/faqs").then(r => r.json()),
        fetch("/api/testimonials").then(r => r.json()),
        fetch("/api/settings").then(r => r.json()),
        fetch("/api/activity-logs").then(r => r.json()),
        fetch("/api/partners").then(r => r.json()).catch(() => []),
        fetch("/api/benefits").then(r => r.json()).catch(() => [])
      ]);

      setLeads(leadsRes);
      setClients(clientsRes);
      setServices(servicesRes);
      setPackages(packagesRes);
      setPortfolio(portfolioRes);
      setBlogs(blogsRes);
      setFaqs(faqsRes);
      setTestimonials(testimonialsRes);
      setSettings(settingsRes);
      setActivityLogs(logsRes);
      setPartners(partnersRes);
      setBenefits(benefitsRes);

      // Populate Settings inputs once
      if (settingsRes) {
        setCoName(settingsRes.company_name || "");
        setCoAddress(settingsRes.company_address || "");
        setCoPhone(settingsRes.company_phone || "");
        setCoEmail(settingsRes.company_email || "");
        setSmtpHost(settingsRes.smtp_host || "");
        setSmtpPort(settingsRes.smtp_port || "");
        setSeoTitle(settingsRes.seo_default_title || "");
        setSeoDesc(settingsRes.seo_default_description || "");
      }
    } catch (err) {
      console.error("Error retrieving datasets from backend API server", err);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch("/api/db-status");
      if (res.ok) {
        const data = await res.json();
        setDbConnected(data.connected);
        setDbDetails(data);
      } else {
        setDbConnected(false);
      }
    } catch (err) {
      console.error("Error retrieving database status:", err);
      setDbConnected(false);
    }
  };

  const handleDbSync = async (action: "push" | "pull") => {
    setDbSyncing(true);
    setDbSyncMessage("");
    try {
      const res = await fetch("/api/db-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbSyncMessage(`Success: ${data.message}`);
        if (action === "pull") {
          fetchAllData();
        }
      } else {
        setDbSyncMessage(`Error: ${data.message || "Failed to complete operation"}`);
      }
    } catch (err: any) {
      setDbSyncMessage(`Network Error: ${err.message || "Could not connect to sync service"}`);
    } finally {
      setDbSyncing(false);
      fetchDbStatus();
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchDbStatus();
  }, []);

  // CSV Parsing Engine
  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    // Parse Comma Separated Values manually
    const lines = csvText.split("\n");
    const parsedLeads: any[] = [];
    
    // Support standard CSV mapping: client_name,client_email,client_phone,service_interested,message
    lines.forEach((line) => {
      const parts = line.split(",");
      if (parts.length >= 2) {
        parsedLeads.push({
          client_name: parts[0]?.trim() || "",
          client_email: parts[1]?.trim() || "",
          client_phone: parts[2]?.trim() || "",
          service_interested: parts[3]?.trim() || "Website Designing",
          message: parts[4]?.trim() || "Bulk uploaded Lead via Admin CMS",
        });
      }
    });

    if (parsedLeads.length === 0) {
      setCsvImportMessage("Invalid columns format. Required: client_name, client_email");
      return;
    }

    try {
      const res = await fetch("/api/leads/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: parsedLeads }),
      });

      if (res.ok) {
        setCsvImportMessage(`Successfully bulk imported ${parsedLeads.length} leads!`);
        setCsvText("");
        fetchAllData();
        setTimeout(() => {
          setShowCsvBox(false);
          setCsvImportMessage("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setCsvImportMessage("Failed connecting server-side parser.");
    }
  };

  // Lead update helpers
  const handleUpdateLeadStatus = async (leadId: number, status: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchAllData();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: status as any } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignLeadStaff = async (leadId: number, staff: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_assigned: staff }),
      });
      if (res.ok) {
        fetchAllData();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, staff_assigned: staff } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLeadFollowUp = async (leadId: number, followUpDate: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_date: followUpDate }),
      });
      if (res.ok) {
        fetchAllData();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, follow_up_date: followUpDate } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLeadNote = async (e: React.FormEvent, leadId: number) => {
    e.preventDefault();
    if (!leadNoteText.trim()) return;

    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: leadNoteText, author: "Creattivee Admin" }),
      });
      if (res.ok) {
        setLeadNoteText("");
        const data = await res.json();
        setSelectedLead(data.lead);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client CRUD
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          company_name: clientCompany,
          address: clientAddress,
        }),
      });

      if (res.ok) {
        setClientName("");
        setClientEmail("");
        setClientPhone("");
        setClientCompany("");
        setClientAddress("");
        setShowClientForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Service CMS Form CRUD
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: serviceTitle,
      description: serviceDesc,
      category: serviceCategory,
      features: serviceFeatures.split(",").map(f => f.trim()).filter(Boolean),
    };

    try {
      const endpoint = editingServiceId ? `/api/services/${editingServiceId}` : "/api/services";
      const method = editingServiceId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setServiceTitle("");
        setServiceDesc("");
        setServiceFeatures("");
        setEditingServiceId(null);
        setShowServiceForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditServiceTrigger = (ser: Service) => {
    setEditingServiceId(ser.id);
    setServiceTitle(ser.title);
    setServiceDesc(ser.description);
    setServiceCategory(ser.category);
    setServiceFeatures(ser.features.join(", "));
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Packages CMS Form CRUD
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: packageTitle,
      price: packagePrice,
      timeline: packageTimeline,
      features: packageFeatures.split(",").map(f => f.trim()).filter(Boolean),
      highlight: packageHighlight,
      button_text: "Buy Now",
    };

    try {
      const endpoint = editingPackageId ? `/api/packages/${editingPackageId}` : "/api/packages";
      const method = editingPackageId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPackageTitle("");
        setPackagePrice("");
        setPackageTimeline("");
        setPackageFeatures("");
        setPackageHighlight(false);
        setEditingPackageId(null);
        setShowPackageForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPackageTrigger = (pkg: AgencyPackage) => {
    setEditingPackageId(pkg.id);
    setPackageTitle(pkg.title);
    setPackagePrice(pkg.price);
    setPackageTimeline(pkg.timeline || "");
    setPackageFeatures(pkg.features.join(", "));
    setPackageHighlight(pkg.highlight);
    setShowPackageForm(true);
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm("Delete this package module permanently?")) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Portfolio CMS CRUD
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: portfolioTitle,
      slug: portfolioTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      category: portfolioCategory,
      client: portfolioClient,
      technology_used: portfolioTech.split(",").map(t => t.trim()).filter(Boolean),
      project_timeline: portfolioTimeline,
      website_link: portfolioLink,
      video_url: portfolioVideo,
      description: portfolioDesc,
      case_study: portfolioCaseStudy,
      screenshots: portfolioScreenshots.split(",").map(s => s.trim()).filter(Boolean),
    };

    try {
      const endpoint = editingPortfolioId ? `/api/portfolio/${editingPortfolioId}` : "/api/portfolio";
      const method = editingPortfolioId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPortfolioTitle("");
        setPortfolioCategory("Fintech");
        setPortfolioClient("");
        setPortfolioTech("");
        setPortfolioTimeline("");
        setPortfolioLink("");
        setPortfolioVideo("");
        setPortfolioDesc("");
        setPortfolioCaseStudy("");
        setPortfolioScreenshots("");
        setEditingPortfolioId(null);
        setShowPortfolioForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPortfolioTrigger = (item: PortfolioItem) => {
    setEditingPortfolioId(item.id);
    setPortfolioTitle(item.title);
    setPortfolioCategory(item.category);
    setPortfolioClient(item.client || "");
    setPortfolioTech(item.technology_used.join(", "));
    setPortfolioTimeline(item.project_timeline || "");
    setPortfolioLink(item.website_link || "");
    setPortfolioVideo(item.video_url || "");
    setPortfolioDesc(item.description);
    setPortfolioCaseStudy(item.case_study || "");
    setPortfolioScreenshots(item.screenshots.join(", "));
    setShowPortfolioForm(true);
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!confirm("Are you sure you want to delete this showroom project?")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Partners CMS CRUD
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: partnerName,
      style: partnerStyle,
    };

    try {
      const endpoint = editingPartnerId ? `/api/partners/${editingPartnerId}` : "/api/partners";
      const method = editingPartnerId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPartnerName("");
        setPartnerStyle("font-bold text-lg md:text-xl text-slate-600");
        setEditingPartnerId(null);
        setShowPartnerForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPartnerTrigger = (p: Partner) => {
    setEditingPartnerId(p.id);
    setPartnerName(p.name);
    setPartnerStyle(p.style);
    setShowPartnerForm(true);
  };

  const handleDeletePartner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner logo?")) return;
    try {
      const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Benefits CMS CRUD Handlers ---
  const handleSaveBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: benefitTitle,
      text: benefitText,
      icon: benefitIcon,
      bgColor: benefitBgColor,
      borderColor: benefitBorderColor,
      iconColor: benefitIconColor,
      glow: benefitGlow,
    };

    try {
      const endpoint = editingBenefitId ? `/api/benefits/${editingBenefitId}` : "/api/benefits";
      const method = editingBenefitId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setBenefitTitle("");
        setBenefitText("");
        setBenefitIcon("Brain");
        setBenefitBgColor("bg-purple-50");
        setBenefitBorderColor("border-purple-100/60");
        setBenefitIconColor("text-purple-600");
        setBenefitGlow("hover:shadow-purple-100/40");
        setEditingBenefitId(null);
        setShowBenefitForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBenefitTrigger = (b: Benefit) => {
    setEditingBenefitId(b.id);
    setBenefitTitle(b.title);
    setBenefitText(b.text);
    setBenefitIcon(b.icon);
    setBenefitBgColor(b.bgColor || "bg-purple-50");
    setBenefitBorderColor(b.borderColor || "border-purple-100/60");
    setBenefitIconColor(b.iconColor || "text-purple-600");
    setBenefitGlow(b.glow || "hover:shadow-purple-100/40");
    setShowBenefitForm(true);
  };

  const handleDeleteBenefit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this benefit card?")) return;
    try {
      const res = await fetch(`/api/benefits/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // General Settings update
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: coName,
          company_address: coAddress,
          company_phone: coPhone,
          company_email: coEmail,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          seo_default_title: seoTitle,
          seo_default_description: seoDesc,
        }),
      });

      if (res.ok) {
        alert("SMTP and CMS properties synchronized server-side.");
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Computed dashboard metrics
  const pendingLeadsCount = leads.filter(l => l.status === "pending").length;
  const contactedLeadsCount = leads.filter(l => l.status === "contacted").length;
  const convertedLeadsCount = leads.filter(l => l.status === "converted").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row select-none">
      {/* SIDE NAVIGATION (Hidden on Print) */}
      <aside className="w-full md:w-64 shrink-0 glass-panel border-r border-slate-100 flex flex-col justify-between print:hidden">
        <div>
          {/* Logo Heading */}
          <div className="p-6 border-b border-slate-100/80">
            <Logo size="sm" />
            <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block mt-1">REST REST-CRM CRM ENGINE</span>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {[
              { id: "dashboard", label: "Dashboard Hub", icon: <LayoutGrid className="w-4 h-4" /> },
              { id: "leads", label: "Lead Tracker", icon: <Users className="w-4 h-4" />, count: leads.length },
              { id: "clients", label: "Client Portfolio CRM", icon: <UserCheck className="w-4 h-4" /> },
              { id: "proposals", label: "Proposal PDF Generator", icon: <FileText className="w-4 h-4" /> },
              { id: "cms-services", label: "Configure Services", icon: <Layers className="w-4 h-4" /> },
              { id: "cms-portfolio", label: "Configure Showrooms", icon: <Briefcase className="w-4 h-4" /> },
              { id: "cms-packages", label: "Configure Packages", icon: <Sparkles className="w-4 h-4" /> },
              { id: "cms-partners", label: "Configure Partners", icon: <Building2 className="w-4 h-4" /> },
              { id: "cms-benefits", label: "Configure Benefits", icon: <Target className="w-4 h-4" /> },
              { id: "settings", label: "SMTP & Sitemap", icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-l-4 border-pink-500 text-slate-800 font-bold"
                    : "hover:bg-slate-50 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-mono font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Handshake Exit */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="w-7.5 h-7.5 rounded-full bg-purple-100 text-purple-600 font-display font-bold flex items-center justify-center text-[10px]">
              AD
            </div>
            <div>
              <p className="font-bold text-slate-800">Admin Staff</p>
              <p className="text-[9px] text-slate-400 font-mono">creattivee@gmail.com</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 rounded-xl text-xs font-display font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            Logout Control
          </button>
        </div>
      </aside>

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-x-hidden select-text">
        
        {/* TAB 1: DASHBOARD HUB */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Operational Hub</h3>
                <p className="text-xs text-slate-500">Live indicators syncing directly from Express CRM backend</p>
              </div>
              <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-mono font-bold flex items-center gap-1">
                <Check className="w-4 h-4 animate-pulse" /> Active Connection
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Raw Intake Leads", val: leads.length, desc: "Total pipeline items logged", bg: "from-pink-500/10 to-purple-500/5", border: "border-pink-100/60" },
                { title: "Converted Deals", val: convertedLeadsCount, desc: "Successfully billed projects", bg: "from-purple-500/10 to-blue-500/5", border: "border-purple-100/60" },
                { title: "CRM Client list", val: clients.length, desc: "Active enterprise accounts", bg: "from-blue-500/10 to-sky-500/5", border: "border-blue-100/60" },
                { title: "Active CMS Services", val: services.length, desc: "Catalog design modules", bg: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-100/60" }
              ].map((m, idx) => (
                <div key={idx} className={`p-6 rounded-3xl bg-gradient-to-br ${m.bg} border ${m.border} glass-card`}>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{m.title}</p>
                  <p className="text-3xl font-display font-extrabold text-slate-800 mb-2">{m.val}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* Activity Logs & Pipeline Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Logs */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <h5 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-pink-500 animate-pulse" /> Live Server Audit Trails
                </h5>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-700">{log.event}</p>
                        <p className="text-[10px] text-slate-400 font-mono">By {log.user}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status breakdown */}
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <h5 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Briefcase className="w-4.5 h-4.5 text-purple-500" /> Pipeline Breakdowns
                </h5>
                <div className="space-y-3">
                  {[
                    { label: "New Leads logged", count: pendingLeadsCount, max: leads.length || 1, color: "bg-pink-500" },
                    { label: "Engaged / Handshake", count: contactedLeadsCount, max: leads.length || 1, color: "bg-purple-500" },
                    { label: "Converted Deals", count: convertedLeadsCount, max: leads.length || 1, color: "bg-emerald-500" }
                  ].map((p, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">{p.label}</span>
                        <span className="font-mono text-slate-800 font-bold">{p.count}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${p.color}`} style={{ width: `${(p.count / p.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEAD TRACKER (CRM) */}
        {activeTab === "leads" && (
          <div className="space-y-6 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Dynamic Pipeline Leads</h3>
                <p className="text-xs text-slate-500">Track raw requirements, allocate team resources, schedule follow-ups</p>
              </div>

              {/* Importer & Manual Triggers */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCsvBox(!showCsvBox)}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-display font-bold flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Bulk Import CSV
                </button>
              </div>
            </div>

            {/* CSV Import drawer container */}
            {showCsvBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-display font-bold text-slate-800 text-sm">Bulk CSV Intake Engine</h5>
                    <p className="text-xs text-slate-400">Insert database lines matching standard headers structure: client_name, client_email, client_phone, service_interested</p>
                  </div>
                  <button onClick={() => setShowCsvBox(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCsvImport} className="space-y-3">
                  <textarea
                    rows={4}
                    placeholder="Mukesh Ambani,mukesh@reliance.com,+91-9988118811,Software Development,Billing System ERP&#10;Aisha Patel,aisha@stylegrid.in,,Website Designing,Creative portfolio screen"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 font-mono focus:border-purple-400 focus:outline-none"
                  />
                  {csvImportMessage && <p className="text-xs text-purple-600 font-semibold">{csvImportMessage}</p>}
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:opacity-95 text-white font-display font-bold text-xs"
                  >
                    Commit Bulk Import
                  </button>
                </form>
              </motion.div>
            )}

            {/* Leads Table */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Client details</th>
                    <th className="pb-3">Interested Scope</th>
                    <th className="pb-3">Pipeline Status</th>
                    <th className="pb-3">Staff assigned</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 space-y-0.5">
                        <p className="font-bold text-slate-800 text-sm">{lead.client_name}</p>
                        <p className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {lead.client_email}
                        </p>
                        {lead.client_phone && (
                          <p className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {lead.client_phone}
                          </p>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-100 text-[10px] font-display font-extrabold text-pink-600 uppercase tracking-wider inline-block">
                          {lead.service_interested}
                        </span>
                        <p className="text-slate-400 text-[10px] mt-1 italic max-w-xs truncate">{lead.message}</p>
                      </td>
                      <td className="py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase ${
                            lead.status === "pending" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                            lead.status === "contacted" ? "bg-purple-50 text-purple-600 border-purple-200" :
                            lead.status === "proposal_sent" ? "bg-blue-50 text-blue-600 border-blue-200" :
                            lead.status === "converted" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            "bg-rose-50 text-rose-600 border-rose-200"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="proposal_sent">Proposal Sent</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <select
                          value={lead.staff_assigned}
                          onChange={(e) => handleAssignLeadStaff(lead.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10px] font-semibold bg-white"
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Creattivee Admin">Creattivee Admin</option>
                          <option value="Design Labs Lead">Design Labs Lead</option>
                          <option value="Software Architect">Software Architect</option>
                        </select>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-display font-semibold text-[10px] cursor-pointer"
                        >
                          Deep Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lead detail Overlay Drawer */}
            {selectedLead && (
              <div id="lead-drawer" className="fixed inset-0 z-50 flex items-center justify-end p-4">
                <div onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
                
                <div className="relative w-full max-w-md h-full rounded-3xl bg-white border-l border-slate-200 p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h4 className="font-display font-extrabold text-slate-800 text-lg">Lead Action Slate</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Reference ID: #L-{selectedLead.id}</p>
                      </div>
                      <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-slate-50 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Client contact specs */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client Contact</p>
                      <p className="text-base font-bold text-slate-800">{selectedLead.client_name}</p>
                      <p className="text-xs font-mono text-slate-500">{selectedLead.client_email}</p>
                      {selectedLead.client_phone && <p className="text-xs font-mono text-slate-500">{selectedLead.client_phone}</p>}
                    </div>

                    {/* Message */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiry Message</p>
                      <p className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
                        "{selectedLead.message || "No custom details added."}"
                      </p>
                    </div>

                    {/* Follow-up date setting */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Configure Next Follow Up</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          value={selectedLead.follow_up_date}
                          onChange={(e) => handleUpdateLeadFollowUp(selectedLead.id, e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Add note */}
                    <form onSubmit={(e) => handleAddLeadNote(e, selectedLead.id)} className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Add Staff Activity Note</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Log status details e.g. Emailed advance layout mockup copy to client."
                        value={leadNoteText}
                        onChange={(e) => setLeadNoteText(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 resize-none"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-display font-bold text-[10px] cursor-pointer">
                        Append Note
                      </button>
                    </form>

                    {/* Active timeline logs */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-4 h-4 text-pink-500" /> Internal Notes Log
                      </p>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {selectedLead.notes.map((note, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">{note.author}</span>
                              <span className="text-slate-400 font-mono">{note.date}</span>
                            </div>
                            <p className="text-slate-600 font-medium">{note.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLIENT PORTFOLIO CRM */}
        {activeTab === "clients" && (
          <div className="space-y-6 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Client Portfolio Management</h3>
                <p className="text-xs text-slate-500">Track active billing agreements, invoice ledgers, and signed documents</p>
              </div>
              <button
                onClick={() => setShowClientForm(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-purple-soft"
              >
                <Plus className="w-4 h-4" /> Add Enterprise Client
              </button>
            </div>

            {/* Client Add Form Drawer */}
            {showClientForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-display font-bold text-slate-800 text-sm">Register Enterprise Account</h5>
                  <button onClick={() => setShowClientForm(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" required placeholder="Account Name" value={clientName} onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="email" required placeholder="Billing Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="text" placeholder="Phone Line" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="text" placeholder="Company Name" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="text" placeholder="Corporate Address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 md:col-span-2"
                  />
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-display font-bold text-xs md:col-span-2 justify-self-start">
                    Save Account Specs
                  </button>
                </form>
              </motion.div>
            )}

            {/* Clients List view */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">{client.company_name || "Enterprise"}</span>
                      <h4 className="text-lg font-display font-bold text-slate-800">{client.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{client.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-100">
                      CRM Verified
                    </span>
                  </div>

                  {/* Active projects list */}
                  <div className="space-y-2 pt-2 border-t border-slate-50 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Deliverable Milestones</p>
                    {client.projects && client.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-700">{proj.name}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-pink-100 text-pink-700 font-mono text-[9px] font-bold">{proj.status}</span>
                      </div>
                    ))}
                  </div>

                  {/* Invoice ledger list */}
                  <div className="space-y-2 pt-2 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Billing Ledger</p>
                    {client.invoices && client.invoices.map((inv, iIdx) => (
                      <div key={iIdx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 text-[10px] font-semibold text-slate-600">
                        <span>Invoice #{inv.id} ({inv.date})</span>
                        <span className="font-bold text-emerald-600">{inv.amount} [PAID]</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROPOSAL PDF GENERATOR */}
        {activeTab === "proposals" && (
          <div className="space-y-6">
            <div className="print:hidden">
              <h3 className="text-2xl font-display font-extrabold text-slate-800">Proposal E-Sign Studio</h3>
              <p className="text-xs text-slate-500">Add customizable packages, set prices, draft terms, print/export native PDFs</p>
            </div>
            <ProposalPrintable
              leads={leads}
              services={services}
              packages={packages}
              onProposalCreated={fetchAllData}
            />
          </div>
        )}

        {/* TAB 5: CONFIGURE SERVICES (CMS) */}
        {activeTab === "cms-services" && (
          <div className="space-y-6 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Configure Service Catalog</h3>
                <p className="text-xs text-slate-500">Edit dynamic features, category details, and default layout elements</p>
              </div>
              <button
                onClick={() => { setEditingServiceId(null); setServiceTitle(""); setServiceDesc(""); setServiceFeatures(""); setShowServiceForm(true); }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-purple-soft"
              >
                <Plus className="w-4 h-4" /> Add Dynamic Service
              </button>
            </div>

            {/* Service Form Drawer */}
            {showServiceForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
              >
                <h5 className="font-display font-bold text-slate-800 text-sm">
                  {editingServiceId ? "Modify Dynamic Service Specs" : "Add Service Specification"}
                </h5>
                <form onSubmit={handleSaveService} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text" required placeholder="Service Title (e.g. ERP Systems Design)" value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                    <select
                      value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    >
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <textarea
                    rows={3} required placeholder="Detailed high performance description..." value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 resize-none"
                  />
                  <input
                    type="text" required placeholder="Features list (comma separated values: e.g. ERP, Invoice, SaaS, Web Application)" value={serviceFeatures} onChange={(e) => setServiceFeatures(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-display font-bold">
                      Commit Specs
                    </button>
                    <button type="button" onClick={() => setShowServiceForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Services Grid list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((ser) => (
                <div key={ser.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-lg bg-pink-50 text-[10px] font-display font-bold text-pink-600 uppercase tracking-wider">{ser.category}</span>
                      <h4 className="text-lg font-display font-bold text-slate-800 pt-1">{ser.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">{ser.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleEditServiceTrigger(ser)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteService(ser.id)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
                    {ser.features.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-500 font-semibold uppercase">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CONFIGURE PACKAGES (CMS) */}
        {activeTab === "cms-packages" && (
          <div className="space-y-6 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Configure Dynamic Packages</h3>
                <p className="text-xs text-slate-500">Deploy custom pricing packages, highlight modules, and outline milestones</p>
              </div>
              <button
                onClick={() => { setEditingPackageId(null); setPackageTitle(""); setPackagePrice(""); setPackageTimeline(""); setPackageFeatures(""); setPackageHighlight(false); setShowPackageForm(true); }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-purple-soft"
              >
                <Plus className="w-4 h-4" /> Add Dynamic Package
              </button>
            </div>

            {/* Package Form Drawer */}
            {showPackageForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
              >
                <h5 className="font-display font-bold text-slate-800 text-sm">
                  {editingPackageId ? "Modify Dynamic Package Specs" : "Add Package Specification"}
                </h5>
                <form onSubmit={handleSavePackage} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text" required placeholder="Package Title" value={packageTitle} onChange={(e) => setPackageTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                    <input
                      type="text" required placeholder="Price (e.g. $1,499)" value={packagePrice} onChange={(e) => setPackagePrice(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                    <input
                      type="text" required placeholder="Timeline (e.g. 14 Days)" value={packageTimeline} onChange={(e) => setPackageTimeline(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <input
                    type="text" required placeholder="Features included (comma separated values: e.g. PageSpeed, Admin panels, Sitemap)" value={packageFeatures} onChange={(e) => setPackageFeatures(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="package-hl" checked={packageHighlight} onChange={(e) => setPackageHighlight(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="package-hl" className="text-xs font-semibold text-slate-600 cursor-pointer">Highlight this package as Recommended</label>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-display font-bold">
                      Commit Package
                    </button>
                    <button type="button" onClick={() => setShowPackageForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Packages List cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`p-6 rounded-3xl border shadow-sm space-y-4 ${pkg.highlight ? "bg-gradient-to-br from-pink-50/50 via-purple-50/20 to-blue-50/10 border-pink-200 shadow-pink-soft" : "bg-white border-slate-100"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      {pkg.highlight && <span className="text-[8px] font-display font-bold uppercase tracking-widest text-pink-600 block mb-1">Recommended Choice</span>}
                      <h4 className="text-lg font-display font-bold text-slate-800">{pkg.title}</h4>
                      <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">{pkg.price}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">Est. {pkg.timeline || "Inquire"}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEditPackageTrigger(pkg)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100/60">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <Check className="w-4 h-4 text-pink-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CONFIGURE SHOWROOMS (PORTFOLIO CMS) */}
        {activeTab === "cms-portfolio" && (
          <div className="space-y-6 print:hidden animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Configure Category Showrooms</h3>
                <p className="text-xs text-slate-500">Deploy custom client case studies, technology stacks, live URLs, and media assets</p>
              </div>
              <button
                onClick={() => {
                  setEditingPortfolioId(null);
                  setPortfolioTitle("");
                  setPortfolioCategory("Fintech");
                  setPortfolioClient("");
                  setPortfolioTech("");
                  setPortfolioTimeline("");
                  setPortfolioLink("");
                  setPortfolioVideo("");
                  setPortfolioDesc("");
                  setPortfolioCaseStudy("");
                  setPortfolioScreenshots("");
                  setShowPortfolioForm(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-purple-soft"
              >
                <Plus className="w-4 h-4" /> Add Dynamic Showroom
              </button>
            </div>

            {/* Portfolio Form Drawer */}
            {showPortfolioForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
              >
                <h5 className="font-display font-bold text-slate-800 text-sm">
                  {editingPortfolioId ? "Modify Showroom specs" : "Add Showroom case study"}
                </h5>
                <form onSubmit={handleSavePortfolio} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title</label>
                      <input
                        type="text" required placeholder="e.g. Futura Bank FinTech UI" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                      <select
                        value={portfolioCategory} onChange={(e) => setPortfolioCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      >
                        <option value="Fintech">Fintech</option>
                        <option value="SaaS">SaaS</option>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                        <option value="Marketing">Marketing</option>
                        <option value="ERP">ERP</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Client Name</label>
                      <input
                        type="text" placeholder="e.g. Futura Inc" value={portfolioClient} onChange={(e) => setPortfolioClient(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Project Timeline</label>
                      <input
                        type="text" placeholder="e.g. 3 Weeks" value={portfolioTimeline} onChange={(e) => setPortfolioTimeline(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Live Website URL</label>
                      <input
                        type="url" placeholder="https://..." value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Video Embed/URL</label>
                      <input
                        type="url" placeholder="https://..." value={portfolioVideo} onChange={(e) => setPortfolioVideo(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Technologies Used (comma separated)</label>
                    <input
                      type="text" required placeholder="React, Express, TailwindCSS, Chart.js" value={portfolioTech} onChange={(e) => setPortfolioTech(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Screenshot Image URLs (comma separated)</label>
                    <input
                      type="text" required placeholder="https://images.unsplash.com/..." value={portfolioScreenshots} onChange={(e) => setPortfolioScreenshots(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Short Description (for grid card)</label>
                      <textarea
                        required rows={3} placeholder="A brief visual description of this case study..." value={portfolioDesc} onChange={(e) => setPortfolioDesc(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Deep Case Study (Challenge vs. Execution detail)</label>
                      <textarea
                        rows={3} placeholder="Describe the business challenges met, standard optimizations, and custom components used..." value={portfolioCaseStudy} onChange={(e) => setPortfolioCaseStudy(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-display font-bold cursor-pointer hover:opacity-95">
                      Save Showroom
                    </button>
                    <button type="button" onClick={() => setShowPortfolioForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Portfolio Grid list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div key={item.id} className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-300">
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-slate-100">
                      <img
                        src={item.screenshots[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80"}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-lg text-[9px] font-display font-extrabold uppercase tracking-widest text-slate-800">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="font-display font-bold text-slate-800 text-sm leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-3 leading-relaxed">{item.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.technology_used.slice(0, 3).map((tech, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[9px] font-mono text-slate-500 font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-50 flex justify-between items-center mt-auto">
                    <span className="text-[10px] text-slate-400 font-mono">Client: {item.client || "Secret"}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleEditPortfolioTrigger(item)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeletePortfolio(item.id)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CONFIGURE PARTNERS (LOGOS CMS) */}
        {activeTab === "cms-partners" && (
          <div className="space-y-6 print:hidden animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Configure Trusted Partners</h3>
                <p className="text-xs text-slate-500">Add, edit, or remove logo banners of high growth enterprises displayed on your homepage</p>
              </div>
              <button
                onClick={() => {
                  setEditingPartnerId(null);
                  setPartnerName("");
                  setPartnerStyle("font-bold text-lg md:text-xl text-slate-600");
                  setShowPartnerForm(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-purple-soft"
              >
                <Plus className="w-4 h-4" /> Add Partner Logo
              </button>
            </div>

            {/* Partner Form Drawer */}
            {showPartnerForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
              >
                <h5 className="font-display font-bold text-slate-800 text-sm">
                  {editingPartnerId ? "Modify Partner Logo specs" : "Add Partner Logo Specification"}
                </h5>
                <form onSubmit={handleSavePartner} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Partner Name / Logo Text</label>
                      <input
                        type="text" required placeholder="e.g. FUTURA.INC" value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tailwind Custom Style Classes</label>
                      <input
                        type="text" placeholder="e.g. font-extrabold text-lg md:text-xl text-slate-600 tracking-wide" value={partnerStyle} onChange={(e) => setPartnerStyle(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-mono block mb-2">Live Logo Preview:</span>
                    <div className="opacity-65 hover:opacity-100 transition-opacity">
                      <span className={partnerStyle || "font-display font-bold text-lg md:text-xl text-slate-600"}>
                        {partnerName || "PREVIEW LOGO"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-display font-bold cursor-pointer hover:opacity-95">
                      Commit Logo
                    </button>
                    <button type="button" onClick={() => setShowPartnerForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Partners List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((p) => (
                <div key={p.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-mono">Logo ID: #{p.id}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEditPartnerTrigger(p)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeletePartner(p.id)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-center min-h-[90px]">
                    <span className={p.style || "font-display font-bold text-lg md:text-xl text-slate-600"}>
                      {p.name}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono leading-relaxed truncate">
                    Style: {p.style}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6B: CONFIGURE BENEFITS */}
        {activeTab === "cms-benefits" && (
          <div className="space-y-6 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Configure Benefits</h3>
                <p className="text-xs text-slate-500">Manage the dynamic cards rendered under the "Why Choose Us" section of the website</p>
              </div>
              <button
                onClick={() => {
                  setEditingBenefitId(null);
                  setBenefitTitle("");
                  setBenefitText("");
                  setBenefitIcon("Brain");
                  setBenefitBgColor("bg-purple-50");
                  setBenefitBorderColor("border-purple-100/60");
                  setBenefitIconColor("text-purple-600");
                  setBenefitGlow("hover:shadow-purple-100/40");
                  setShowBenefitForm(!showBenefitForm);
                }}
                className="px-4 py-2 bg-purple-600 hover:opacity-95 text-white font-display font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {showBenefitForm ? "Close Drawer" : "Add Benefit Card"}
              </button>
            </div>

            {showBenefitForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {editingBenefitId ? `Edit Benefit Card (ID: #${editingBenefitId})` : "Create New Benefit Card"}
                </h4>

                <form onSubmit={handleSaveBenefit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Benefit Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AI-Powered Solutions"
                        value={benefitTitle}
                        onChange={(e) => setBenefitTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Icon Type</label>
                      <select
                        value={benefitIcon}
                        onChange={(e) => setBenefitIcon(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
                      >
                        {["Brain", "Palette", "Zap", "Smartphone", "Search", "Layers", "HeartHandshake", "TrendingUp", "Sparkles", "Laptop", "ShieldCheck", "Heart", "User", "Kanban", "Lock", "Globe", "Rocket", "Smile"].map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Benefit Explanation Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain this benefit to your clients in 2-3 descriptive lines."
                      value={benefitText}
                      onChange={(e) => setBenefitText(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Preset Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Theme Palette Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Purple", bg: "bg-purple-50", border: "border-purple-100/60", icon: "text-purple-600", glow: "hover:shadow-purple-100/40" },
                        { name: "Pink", bg: "bg-pink-50", border: "border-pink-100/60", icon: "text-pink-600", glow: "hover:shadow-pink-100/40" },
                        { name: "Yellow", bg: "bg-yellow-50", border: "border-yellow-100/60", icon: "text-yellow-600", glow: "hover:shadow-yellow-100/40" },
                        { name: "Blue", bg: "bg-blue-50", border: "border-blue-100/60", icon: "text-blue-600", glow: "hover:shadow-blue-100/40" },
                        { name: "Sky", bg: "bg-sky-50", border: "border-sky-100/60", icon: "text-sky-600", glow: "hover:shadow-sky-100/40" },
                        { name: "Green", bg: "bg-green-50", border: "border-green-100/60", icon: "text-green-600", glow: "hover:shadow-green-100/40" },
                        { name: "Rose", bg: "bg-rose-50", border: "border-rose-100/60", icon: "text-rose-600", glow: "hover:shadow-rose-100/40" },
                        { name: "Orange", bg: "bg-orange-50", border: "border-orange-100/60", icon: "text-orange-600", glow: "hover:shadow-orange-100/40" },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setBenefitBgColor(preset.bg);
                            setBenefitBorderColor(preset.border);
                            setBenefitIconColor(preset.icon);
                            setBenefitGlow(preset.glow);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer ${
                            benefitBgColor === preset.bg ? "border-purple-600 bg-purple-50/40 text-purple-700" : "border-slate-100 text-slate-600"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${preset.bg} border ${preset.border}`} />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Stylings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Background Class</label>
                      <input
                        type="text" required value={benefitBgColor} onChange={(e) => setBenefitBgColor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Border Class</label>
                      <input
                        type="text" required value={benefitBorderColor} onChange={(e) => setBenefitBorderColor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Icon Color Class</label>
                      <input
                        type="text" required value={benefitIconColor} onChange={(e) => setBenefitIconColor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Glow Style Class</label>
                      <input
                        type="text" required value={benefitGlow} onChange={(e) => setBenefitGlow(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-display font-bold cursor-pointer hover:opacity-95">
                      Commit Benefit Card
                    </button>
                    <button type="button" onClick={() => setShowBenefitForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Benefits List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => {
                const IconMap: Record<string, React.ComponentType<any>> = {
                  Brain, Palette, Zap, Smartphone, Search, Layers, HeartHandshake, TrendingUp, Sparkles, Laptop, ShieldCheck, Heart, User, Kanban, Lock, Globe, Rocket, Smile
                };
                const IconComp = IconMap[b.icon] || Sparkles;
                return (
                  <div key={b.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-mono">Benefit ID: #{b.id}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditBenefitTrigger(b)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteBenefit(b.id)} className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-2xl ${b.bgColor || "bg-purple-50"} border ${b.borderColor || "border-purple-100/60"} flex items-center justify-center`}>
                          <IconComp className={`w-5 h-5 ${b.iconColor || "text-purple-600"}`} />
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-slate-800 text-sm tracking-tight">{b.title}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{b.text}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-mono space-y-0.5 border-t border-slate-50 pt-2 shrink-0 truncate">
                      <div>Icon: {b.icon}</div>
                      <div className="truncate">Preset Colors: {b.bgColor} | {b.iconColor}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS & SMTP */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6 print:hidden">
            <div>
              <h3 className="text-2xl font-display font-extrabold text-slate-800">Advanced Agency Configurations</h3>
              <p className="text-xs text-slate-500">Configure SMTP transaction servers, robots rules, metadata and export backups</p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-6">
              {/* Agency Contacts */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Company Contact Specifications</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Company Name" value={coName} onChange={(e) => setCoName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="email" placeholder="SMTP Outbox Email" value={coEmail} onChange={(e) => setCoEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="text" placeholder="Phone Helpline" value={coPhone} onChange={(e) => setCoPhone(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="text" placeholder="Company Address Line" value={coAddress} onChange={(e) => setCoAddress(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* SMTP configuration */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">SMTP Transaction Server</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="SMTP Host (smtp.gmail.com)" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="text" placeholder="Port (587)" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Dynamic sitemap validator list */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Search Engine Index Rules</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Sitemap XML URL</span>
                    <a href="/sitemap.xml" target="_blank" className="text-purple-600 hover:underline font-mono">/sitemap.xml</a>
                    <p className="text-[10px] text-slate-400">Yields dynamic URL list representing portfolios, blogs, and services.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Robots TXT URL</span>
                    <a href="/robots.txt" target="_blank" className="text-purple-600 hover:underline font-mono">/robots.txt</a>
                    <p className="text-[10px] text-slate-400">Configures crawling search engines to index core directories correctly.</p>
                  </div>
                </div>
              </div>

              {/* Backups Export */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Ledger Backups & Recovery</h5>
                <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-100/60 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h6 className="font-display font-bold text-slate-800 text-xs">Download Complete JSON State Backup</h6>
                    <p className="text-[10px] text-slate-400 max-w-md">Creates a physical snapshot recovery script representing clients, leads list, invoices history, dynamic FAQs, testimonials database state.</p>
                  </div>
                  <a
                    href="/api/backups/download"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:opacity-95 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Export Backup
                  </a>
                </div>
              </div>

              {/* Hostinger MySQL Database Connectivity & Management */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hostinger MySQL Database Integration</h5>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-800 text-sm">Hostinger Database Status</span>
                        {dbConnected === null ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" /> Checking connection...
                          </span>
                        ) : dbConnected ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected & Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Local Storage Fallback
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                        Your agency utilizes a dual-engine architecture. It writes to local persistent caches and synchronizes asynchronously with your Remote Hostinger MySQL database.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={fetchDbStatus}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Settings className="w-3.5 h-3.5" /> Test Connection
                      </button>
                    </div>
                  </div>

                  {/* Status / Errors */}
                  {!dbConnected && dbDetails?.error && (
                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-[11px] text-amber-700 font-mono leading-relaxed space-y-1">
                      <div className="font-bold">⚠️ Warning Description:</div>
                      <div>{dbDetails.error}</div>
                      <div className="text-[10px] text-slate-500 font-sans mt-2">
                        💡 How to fix: Make sure you have whitelisted the IP of your hosting platform or set Remote MySQL to allow connections from all hosts (%) on Hostinger, then set up the DB_HOST, DB_USER, DB_NAME, and DB_PASSWORD environment variables in your AI Studio Settings menu.
                      </div>
                    </div>
                  )}

                  {dbConnected && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/30 border border-emerald-100/40 text-[11px] text-emerald-700 leading-relaxed">
                      🎉 <strong>Success:</strong> Connection with Hostinger MySQL is fully established. All website contents, portfolios, services, packages, activity logs, and testimonials are synchronized in real-time.
                    </div>
                  )}

                  {/* Environment Variables Checklist */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1">
                    {dbDetails?.env && Object.entries(dbDetails.env).map(([key, value]) => (
                      <div key={key} className="p-2.5 rounded-xl bg-white border border-slate-100 text-center flex flex-col justify-between min-h-[54px]">
                        <span className="text-[9px] font-bold text-slate-400 block font-mono">{key}</span>
                        <span className={`text-[10px] font-bold mt-1 inline-block ${value ? "text-emerald-600" : "text-emerald-600"}`}>
                          {value ? "✓ Configured" : "✗ Missing"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Manual Backup & Synchronize Operations */}
                  {dbConnected && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <h6 className="font-display font-bold text-slate-800 text-xs">Manual Synchronize Operations</h6>
                        <p className="text-[10px] text-slate-400">Trigger manual state overrides between local storage and live Hostinger database.</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          disabled={dbSyncing}
                          onClick={() => handleDbSync("pull")}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 animate-fade-in"
                        >
                          {dbSyncing ? "Syncing..." : "Pull Latest from Hostinger"}
                        </button>
                        <button
                          type="button"
                          disabled={dbSyncing}
                          onClick={() => {
                            if (window.confirm("WARNING: This will overwrite Hostinger's tables with your current local state. Do you want to proceed?")) {
                              handleDbSync("push");
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200/80 text-purple-700 border border-purple-200/50 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 animate-fade-in"
                        >
                          {dbSyncing ? "Syncing..." : "Push Local to Hostinger"}
                        </button>
                      </div>

                      {dbSyncMessage && (
                        <div className={`p-3 rounded-xl text-xs font-medium border animate-fade-in ${
                          dbSyncMessage.startsWith("Success") 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {dbSyncMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="px-6 py-3 bg-purple-600 hover:opacity-95 text-white font-display font-bold text-xs rounded-xl shadow-purple-soft">
                Synchronize All Settings
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
