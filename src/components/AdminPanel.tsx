import React, { useState, useEffect } from "react";
import {
  Users, Briefcase, FileText, Settings, Database, Plus, Edit, Trash, Upload,
  Calendar, Check, UserPlus, Clock, MessageSquare, Mail, Phone, MapPin, Tag,
  Download, Sparkles, BookOpen, LayoutGrid, Layers, HelpCircle, UserCheck, Play, Shield, X, Building2,
  Target, Brain, Palette, Zap, Smartphone, Search, HeartHandshake, TrendingUp, Laptop, ShieldCheck, Heart, User, Kanban, Lock, Globe, Rocket, Smile, Eye, ArrowRight, RefreshCw, FileCheck, CheckCircle2,
  Image as ImageIcon, Link2, ExternalLink, UploadCloud
} from "lucide-react";
import { Lead, Client, Service, AgencyPackage, PortfolioItem, BlogArticle, FAQItem, Testimonial, AgencySettings, ActivityLog, Partner, Benefit, Proposal } from "../types";
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
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Proposal Management States
  const [proposalViewMode, setProposalViewMode] = useState<"history" | "create">("history");
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [previewingProposal, setPreviewingProposal] = useState<Proposal | null>(null);
  const [downloadingProposalId, setDownloadingProposalId] = useState<number | null>(null);

  // Manual Add Lead Modal States
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadService, setNewLeadService] = useState("Website Designing");
  const [newLeadMessage, setNewLeadMessage] = useState("");
  const [newLeadStatus, setNewLeadStatus] = useState("pending");
  const [newLeadStaff, setNewLeadStaff] = useState("Unassigned");
  const [newLeadFollowUp, setNewLeadFollowUp] = useState("");

  // Edit Lead Modal States
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLeadName, setEditLeadName] = useState("");
  const [editLeadEmail, setEditLeadEmail] = useState("");
  const [editLeadPhone, setEditLeadPhone] = useState("");
  const [editLeadService, setEditLeadService] = useState("");
  const [editLeadMessage, setEditLeadMessage] = useState("");
  const [editLeadStatus, setEditLeadStatus] = useState("");
  const [editLeadStaff, setEditLeadStaff] = useState("");
  const [editLeadFollowUp, setEditLeadFollowUp] = useState("");

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
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState("");
  const [partnerStyle, setPartnerStyle] = useState("font-bold text-lg md:text-xl text-slate-600");
  const [logoUploadMode, setLogoUploadMode] = useState<"file" | "url" | "text">("file");

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

  // Hostinger MySQL Direct Configuration States
  const [dbHostInput, setDbHostInput] = useState("srv1826.hstgr.io");
  const [dbPortInput, setDbPortInput] = useState("3306");
  const [dbUserInput, setDbUserInput] = useState("u586646043_creattivee");
  const [dbNameInput, setDbNameInput] = useState("u586646043_creattivee");
  const [dbPasswordInput, setDbPasswordInput] = useState("");
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [dbConfigSaving, setDbConfigSaving] = useState(false);
  const [dbConfigTesting, setDbConfigTesting] = useState(false);
  const [dbConfigFeedback, setDbConfigFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Fetch all core datasets from server API
  const fetchAllData = async () => {
    try {
      const [leadsRes, clientsRes, servicesRes, packagesRes, portfolioRes, blogsRes, faqsRes, testimonialsRes, settingsRes, logsRes, partnersRes, benefitsRes, proposalsRes] = await Promise.all([
        fetch("/api/leads").then(r => r.json()).catch(() => []),
        fetch("/api/clients").then(r => r.json()).catch(() => []),
        fetch("/api/services").then(r => r.json()).catch(() => []),
        fetch("/api/packages").then(r => r.json()).catch(() => []),
        fetch("/api/portfolio").then(r => r.json()).catch(() => []),
        fetch("/api/blogs").then(r => r.json()).catch(() => []),
        fetch("/api/faqs").then(r => r.json()).catch(() => []),
        fetch("/api/testimonials").then(r => r.json()).catch(() => []),
        fetch("/api/settings").then(r => r.json()).catch(() => null),
        fetch("/api/activity-logs").then(r => r.json()).catch(() => []),
        fetch("/api/partners").then(r => r.json()).catch(() => []),
        fetch("/api/benefits").then(r => r.json()).catch(() => []),
        fetch("/api/proposals").then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(leadsRes)) setLeads(leadsRes);
      if (Array.isArray(clientsRes)) setClients(clientsRes);
      if (Array.isArray(servicesRes)) setServices(servicesRes);
      if (Array.isArray(packagesRes)) setPackages(packagesRes);
      if (Array.isArray(portfolioRes)) setPortfolio(portfolioRes);
      if (Array.isArray(blogsRes)) setBlogs(blogsRes);
      if (Array.isArray(faqsRes)) setFaqs(faqsRes);
      if (Array.isArray(testimonialsRes)) setTestimonials(testimonialsRes);
      if (settingsRes && typeof settingsRes === "object" && !settingsRes.error) setSettings(settingsRes);
      if (Array.isArray(logsRes)) setActivityLogs(logsRes);
      if (Array.isArray(partnersRes)) setPartners(partnersRes);
      if (Array.isArray(benefitsRes)) setBenefits(benefitsRes);
      if (Array.isArray(proposalsRes)) setProposals(proposalsRes);

      // Populate Settings inputs once
      if (settingsRes && typeof settingsRes === "object" && !settingsRes.error) {
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

  const fetchDbConfig = async () => {
    try {
      const res = await fetch("/api/admin/db-config");
      if (res.ok) {
        const data = await res.json();
        if (data.host) setDbHostInput(data.host);
        if (data.port) setDbPortInput(String(data.port));
        if (data.user) setDbUserInput(data.user);
        if (data.database) setDbNameInput(data.database);
      }
    } catch (err) {
      console.error("Error fetching db config:", err);
    }
  };

  const handleSaveDbConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbConfigSaving(true);
    setDbConfigFeedback(null);
    try {
      const res = await fetch("/api/admin/db-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: dbHostInput,
          port: dbPortInput,
          user: dbUserInput,
          database: dbNameInput,
          password: dbPasswordInput
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbConfigFeedback({
          success: data.connected,
          message: data.connected
            ? "Database credentials saved and connection verified successfully! Hostinger is now live."
            : `Credentials saved, but connection error: ${data.error || "Please verify credentials and Hostinger Remote MySQL whitelist"}`
        });
        setDbConnected(data.connected);
      } else {
        setDbConfigFeedback({
          success: false,
          message: data.error || "Failed to save database configuration."
        });
      }
    } catch (err: any) {
      setDbConfigFeedback({
        success: false,
        message: err.message || "Network error while saving database configuration."
      });
    } finally {
      setDbConfigSaving(false);
      fetchDbStatus();
    }
  };

  const handleTestDbConfig = async () => {
    setDbConfigTesting(true);
    setDbConfigFeedback(null);
    try {
      const res = await fetch("/api/admin/test-db-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: dbHostInput,
          port: dbPortInput,
          user: dbUserInput,
          database: dbNameInput,
          password: dbPasswordInput
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbConfigFeedback({
          success: true,
          message: "Connection Test Succeeded! Credentials are valid and Hostinger MySQL is accepting connections."
        });
      } else {
        setDbConfigFeedback({
          success: false,
          message: `Connection Test Failed: ${data.error || "Access denied or host unreachable"}`
        });
      }
    } catch (err: any) {
      setDbConfigFeedback({
        success: false,
        message: `Connection Error: ${err.message || "Could not reach testing service"}`
      });
    } finally {
      setDbConfigTesting(false);
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
    fetchDbConfig();
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

  // Lead CRUD & Management Helpers
  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadEmail.trim()) {
      alert("Please fill in client name and email.");
      return;
    }
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "manual",
          client_name: newLeadName.trim(),
          client_email: newLeadEmail.trim(),
          client_phone: newLeadPhone.trim(),
          service_interested: newLeadService,
          message: newLeadMessage.trim(),
          status: newLeadStatus,
          staff_assigned: newLeadStaff,
          follow_up_date: newLeadFollowUp,
        }),
      });
      if (res.ok) {
        setShowAddLeadModal(false);
        setNewLeadName("");
        setNewLeadEmail("");
        setNewLeadPhone("");
        setNewLeadService("Website Designing");
        setNewLeadMessage("");
        setNewLeadStatus("pending");
        setNewLeadStaff("Unassigned");
        setNewLeadFollowUp("");
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed creating manual lead:", err);
    }
  };

  const handleTriggerEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditLeadName(lead.client_name || "");
    setEditLeadEmail(lead.client_email || "");
    setEditLeadPhone(lead.client_phone || "");
    setEditLeadService(lead.service_interested || "Website Designing");
    setEditLeadMessage(lead.message || "");
    setEditLeadStatus(lead.status || "pending");
    setEditLeadStaff(lead.staff_assigned || "Unassigned");
    setEditLeadFollowUp(lead.follow_up_date || "");
  };

  const handleUpdateLeadDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const res = await fetch(`/api/leads/${editingLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: editLeadName.trim(),
          client_email: editLeadEmail.trim(),
          client_phone: editLeadPhone.trim(),
          service_interested: editLeadService,
          message: editLeadMessage.trim(),
          status: editLeadStatus,
          staff_assigned: editLeadStaff,
          follow_up_date: editLeadFollowUp,
        }),
      });
      if (res.ok) {
        setEditingLead(null);
        fetchAllData();
        if (selectedLead && selectedLead.id === editingLead.id) {
          setSelectedLead(prev => prev ? {
            ...prev,
            client_name: editLeadName.trim(),
            client_email: editLeadEmail.trim(),
            client_phone: editLeadPhone.trim(),
            service_interested: editLeadService,
            message: editLeadMessage.trim(),
            status: editLeadStatus as any,
            staff_assigned: editLeadStaff,
            follow_up_date: editLeadFollowUp,
          } : null);
        }
      }
    } catch (err) {
      console.error("Failed updating lead:", err);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!confirm("Are you sure you want to permanently delete this lead? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedLead && selectedLead.id === leadId) setSelectedLead(null);
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed deleting lead:", err);
    }
  };

  const handleExportLeadsCsv = () => {
    if (!leads || leads.length === 0) {
      alert("No leads data available to export.");
      return;
    }

    const headers = [
      "ID",
      "Lead Source",
      "Client Name",
      "Client Email",
      "Client Phone",
      "Service Required",
      "Requirement / Message",
      "Pipeline Status",
      "Staff Assigned",
      "Next Follow Up Date",
      "Created Timestamp"
    ];

    const rows = leads.map(l => [
      l.id,
      l.type || "website",
      `"${(l.client_name || "").replace(/"/g, '""')}"`,
      `"${(l.client_email || "").replace(/"/g, '""')}"`,
      `"${(l.client_phone || "").replace(/"/g, '""')}"`,
      `"${(l.service_interested || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
      `"${(l.status || "").replace(/"/g, '""')}"`,
      `"${(l.staff_assigned || "").replace(/"/g, '""')}"`,
      `"${(l.follow_up_date || "").replace(/"/g, '""')}"`,
      `"${(l.created_at || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Creattivee_Leads_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Proposal Management Helpers
  const handleEditProposalTrigger = (prop: Proposal) => {
    setEditingProposal(prop);
    setActiveTab("proposals");
    setProposalViewMode("create");
  };

  const handleDirectDownloadProposal = async (prop: Proposal) => {
    setDownloadingProposalId(prop.id);
    try {
      const res = await fetch(`/api/proposals/export-pdf/${prop.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: Failed to generate PDF`);
      }

      const blob = await res.blob();
      const clientNameSafe = (prop.client_name || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `Creattivee_Proposal_${prop.id}_${clientNameSafe}.pdf`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      fetchAllData();
    } catch (err: any) {
      console.error("Direct PDF download failed:", err);
      alert(`PDF Export Error: ${err?.message || "Failed to download PDF via server engine"}`);
    } finally {
      setDownloadingProposalId(null);
    }
  };

  const handleDeleteProposal = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this proposal record?")) return;
    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed deleting proposal:", err);
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
  const handlePartnerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPartnerLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: partnerName.trim(),
      logo_url: partnerLogoUrl.trim() || undefined,
      website_url: partnerWebsiteUrl.trim() || undefined,
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
        setPartnerLogoUrl("");
        setPartnerWebsiteUrl("");
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
    setPartnerLogoUrl(p.logo_url || "");
    setPartnerWebsiteUrl(p.website_url || "");
    setPartnerStyle(p.style || "font-bold text-lg md:text-xl text-slate-600");
    setLogoUploadMode(p.logo_url ? (p.logo_url.startsWith("data:") ? "file" : "url") : "file");
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
              { id: "cms-partners", label: "Trusted Partners", icon: <Building2 className="w-4 h-4" />, count: partners.length },
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
            <div className="w-7.5 h-7.5 rounded-full bg-purple-100 text-purple-700 font-display font-bold flex items-center justify-center text-[10px]">
              FA
            </div>
            <div>
              <p className="font-bold text-slate-800">Foujia (Admin)</p>
              <p className="text-[9px] text-slate-400 font-mono">foujia@creattivee.com</p>
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
                <p className="text-xs text-slate-500">Track raw requirements, manual entries, allocate team resources, and export data</p>
              </div>

              {/* Action Buttons: Add Lead, Export, Bulk Import */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-purple-soft cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> ADD LEAD
                </button>
                <button
                  onClick={handleExportLeadsCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-display font-bold flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition-colors"
                  title="Export Leads to CSV / Excel File"
                >
                  <Download className="w-4 h-4" /> Export CSV / Excel
                </button>
                <button
                  onClick={() => setShowCsvBox(!showCsvBox)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-display font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" /> Bulk Import
                </button>
              </div>
            </div>

            {/* ADD MANUAL LEAD MODAL */}
            {showAddLeadModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-white border-2 border-purple-200 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 text-base">Add New Lead Manually</h4>
                      <p className="text-[11px] text-slate-400">Register new walk-in, phone, or referral client into CRM pipeline</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddLeadModal(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateManualLead} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Client Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Client Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="ramesh@example.com"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Phone / WhatsApp Line</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Service Interested</label>
                    <select
                      value={newLeadService}
                      onChange={(e) => setNewLeadService(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium bg-white"
                    >
                      <option value="Website Designing">Website Designing</option>
                      <option value="Custom Software/ERP">Custom Software/ERP</option>
                      <option value="UI/UX & Graphic Design">UI/UX & Graphic Design</option>
                      <option value="Digital Marketing & Ads">Digital Marketing & Ads</option>
                      <option value="SEO & Speed Optimization">SEO & Speed Optimization</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Branding & Identity">Branding & Identity</option>
                      <option value="Enterprise AI Solution">Enterprise AI Solution</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Initial Status</label>
                    <select
                      value={newLeadStatus}
                      onChange={(e) => setNewLeadStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Staff Assigned</label>
                    <select
                      value={newLeadStaff}
                      onChange={(e) => setNewLeadStaff(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium bg-white"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Creattivee Admin">Creattivee Admin</option>
                      <option value="Design Labs Lead">Design Labs Lead</option>
                      <option value="Software Architect">Software Architect</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Follow-up Date</label>
                    <input
                      type="date"
                      value={newLeadFollowUp}
                      onChange={(e) => setNewLeadFollowUp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-600 block">Requirement Details / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Brief note about the client's project goals, budget, or timeline..."
                      value={newLeadMessage}
                      onChange={(e) => setNewLeadMessage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:border-purple-500 focus:outline-none font-medium resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLeadModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold shadow-purple-soft cursor-pointer"
                    >
                      Save Lead to CRM
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* EDIT LEAD MODAL */}
            {editingLead && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-white border-2 border-blue-200 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Edit className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 text-base">Edit Lead #{editingLead.id}</h4>
                      <p className="text-[11px] text-slate-400">Update client particulars, pipeline status, or assigned staff</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingLead(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateLeadDetails} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Client Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editLeadName}
                      onChange={(e) => setEditLeadName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Client Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editLeadEmail}
                      onChange={(e) => setEditLeadEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Phone / WhatsApp Line</label>
                    <input
                      type="text"
                      value={editLeadPhone}
                      onChange={(e) => setEditLeadPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Service Interested</label>
                    <select
                      value={editLeadService}
                      onChange={(e) => setEditLeadService(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium bg-white"
                    >
                      <option value="Website Designing">Website Designing</option>
                      <option value="Custom Software/ERP">Custom Software/ERP</option>
                      <option value="UI/UX & Graphic Design">UI/UX & Graphic Design</option>
                      <option value="Digital Marketing & Ads">Digital Marketing & Ads</option>
                      <option value="SEO & Speed Optimization">SEO & Speed Optimization</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Branding & Identity">Branding & Identity</option>
                      <option value="Enterprise AI Solution">Enterprise AI Solution</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Pipeline Status</label>
                    <select
                      value={editLeadStatus}
                      onChange={(e) => setEditLeadStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Staff Assigned</label>
                    <select
                      value={editLeadStaff}
                      onChange={(e) => setEditLeadStaff(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium bg-white"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Creattivee Admin">Creattivee Admin</option>
                      <option value="Design Labs Lead">Design Labs Lead</option>
                      <option value="Software Architect">Software Architect</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Follow-up Date</label>
                    <input
                      type="date"
                      value={editLeadFollowUp}
                      onChange={(e) => setEditLeadFollowUp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-600 block">Requirement Details / Notes</label>
                    <textarea
                      rows={2}
                      value={editLeadMessage}
                      onChange={(e) => setEditLeadMessage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none font-medium resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingLead(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold shadow-sm cursor-pointer"
                    >
                      Update Lead Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

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
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:opacity-95 text-white font-display font-bold text-xs cursor-pointer"
                  >
                    Commit Bulk Import
                  </button>
                </form>
              </motion.div>
            )}

            {/* Leads Table */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-bold text-slate-800">All Pipeline Records</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-bold text-xs">
                    {leads.length} total
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Showing {leads.length} inquiries & CRM leads
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500">No leads recorded yet.</p>
                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-display font-bold text-xs cursor-pointer"
                  >
                    + ADD FIRST LEAD
                  </button>
                </div>
              ) : (
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
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm">{lead.client_name}</p>
                            {lead.type === "manual" && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold">Manual</span>
                            )}
                          </div>
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
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase cursor-pointer ${
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
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10px] font-semibold bg-white cursor-pointer"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Creattivee Admin">Creattivee Admin</option>
                            <option value="Design Labs Lead">Design Labs Lead</option>
                            <option value="Software Architect">Software Architect</option>
                          </select>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTriggerEditLead(lead)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-500 cursor-pointer transition-colors"
                              title="Edit Lead Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 cursor-pointer transition-colors"
                              title="Delete Lead Record"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-display font-semibold text-[10px] cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                      <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-slate-50 rounded-full text-slate-400 cursor-pointer">
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

                    {/* Quick action buttons in drawer */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const l = selectedLead;
                          setSelectedLead(null);
                          handleTriggerEditLead(l);
                        }}
                        className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Lead
                      </button>
                      <button
                        onClick={() => handleDeleteLead(selectedLead.id)}
                        className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" /> Delete Lead
                      </button>
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

        {/* TAB 4: PROPOSAL PDF GENERATOR & PROPOSAL HISTORY */}
        {activeTab === "proposals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Proposal Management & Studio</h3>
                <p className="text-xs text-slate-500">Track all generated client proposals, view dates and values, and craft bespoke high-res PDF agreements</p>
              </div>

              {/* Toggle between Archive and Studio */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => {
                    setProposalViewMode("history");
                    setEditingProposal(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    proposalViewMode === "history"
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Generated Proposals ({proposals.length})
                </button>
                <button
                  onClick={() => setProposalViewMode("create")}
                  className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    proposalViewMode === "create"
                      ? "bg-purple-600 text-white shadow-purple-soft"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Plus className="w-4 h-4" /> {editingProposal ? `Edit Proposal #${editingProposal.id}` : "+ Create New Proposal"}
                </button>
              </div>
            </div>

            {/* Sub-view 1: HISTORY OF GENERATED PROPOSALS */}
            {proposalViewMode === "history" && (
              <div className="space-y-6 print:hidden">
                {/* Proposal Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Total Proposals Generated</p>
                      <p className="text-2xl font-display font-extrabold text-slate-800">{proposals.length}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Quoted Pipeline Value</p>
                      <p className="text-2xl font-display font-extrabold text-slate-800">
                        ₹{proposals.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Active Pipeline Status</p>
                      <p className="text-2xl font-display font-extrabold text-slate-800">
                        {proposals.filter(p => p.status === "accepted").length} Signed / {proposals.length} Total
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proposals Records Table */}
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-bold text-slate-800">All Generated Client Proposals</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-bold text-xs">
                        {proposals.length} records
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProposal(null);
                        setProposalViewMode("create");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-xs flex items-center gap-1 shadow-purple-soft cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Proposal
                    </button>
                  </div>

                  {proposals.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-500">No proposals generated yet.</p>
                      <button
                        onClick={() => {
                          setEditingProposal(null);
                          setProposalViewMode("create");
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white font-display font-bold text-xs cursor-pointer"
                      >
                        + Create Your First Proposal
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="pb-3">Ref ID & Title</th>
                          <th className="pb-3">Client Particulars</th>
                          <th className="pb-3">Date Generated</th>
                          <th className="pb-3">Agreed Amount (INR)</th>
                          <th className="pb-3">Timeline</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                        {proposals.map((prop) => {
                          const lead = leads.find(l => l.id === prop.lead_id);
                          const clientName = prop.client_name || lead?.client_name || "Custom Client";
                          const clientEmail = prop.client_email || lead?.client_email || "N/A";
                          const clientPhone = prop.client_phone || lead?.client_phone || "";
                          const formattedDate = prop.created_at
                            ? new Date(prop.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "N/A";

                          return (
                            <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 space-y-0.5">
                                <span className="font-mono text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                                  #PROP-{prop.id}
                                </span>
                                <p className="font-bold text-slate-800 text-sm mt-1">{prop.title}</p>
                              </td>
                              <td className="py-4 space-y-0.5">
                                <p className="font-bold text-slate-800">{clientName}</p>
                                <p className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" /> {clientEmail}
                                </p>
                                {clientPhone && (
                                  <p className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" /> {clientPhone}
                                  </p>
                                )}
                              </td>
                              <td className="py-4 font-mono text-slate-500 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{formattedDate}</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className="font-display font-extrabold text-slate-900 text-sm">
                                  ₹{Number(prop.price || 0).toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="py-4 font-medium text-slate-600">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                                  {prop.timeline || "2 Weeks"}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                  prop.status === "accepted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  prop.status === "sent" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                  prop.status === "declined" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                  "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                }`}>
                                  {prop.status || "draft"}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setPreviewingProposal(prop)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs flex items-center gap-1 border border-slate-200 cursor-pointer transition-colors"
                                    title="Quick Preview Proposal Canvas"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-600" /> Preview
                                  </button>

                                  <button
                                    onClick={() => handleDirectDownloadProposal(prop)}
                                    disabled={downloadingProposalId === prop.id}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-display font-bold text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors disabled:opacity-50"
                                    title="Download PDF via Puppeteer Server Engine"
                                  >
                                    {downloadingProposalId === prop.id ? (
                                      <span className="w-3.5 h-3.5 border border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    )}
                                    Download PDF
                                  </button>

                                  <button
                                    onClick={() => handleEditProposalTrigger(prop)}
                                    className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-display font-bold text-xs flex items-center gap-1 border border-purple-200 cursor-pointer transition-colors"
                                    title="Edit Proposal Scope and Settings"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Edit
                                  </button>

                                  <button
                                    onClick={() => handleDeleteProposal(prop.id)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 cursor-pointer transition-colors"
                                    title="Delete Proposal"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Sub-view 2: PROPOSAL E-SIGN STUDIO & GENERATOR */}
            {proposalViewMode === "create" && (
              <div className="space-y-4">
                {editingProposal && (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs print:hidden">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Edit className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-900">
                          Currently Editing Proposal #{editingProposal.id}: "{editingProposal.title}"
                        </p>
                        <p className="text-purple-700 text-[11px]">
                          Client: {editingProposal.client_name || "Custom Client"} | Generated on {editingProposal.created_at ? new Date(editingProposal.created_at).toLocaleDateString("en-IN") : "Recent"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProposal(null);
                          setProposalViewMode("history");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 font-bold hover:bg-purple-100 cursor-pointer"
                      >
                        Back to All Proposals
                      </button>
                      <button
                        onClick={() => setEditingProposal(null)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 cursor-pointer"
                      >
                        Switch to New Proposal
                      </button>
                    </div>
                  </div>
                )}

                <ProposalPrintable
                  leads={leads}
                  services={services}
                  packages={packages}
                  editingProposal={editingProposal}
                  onClearEditing={() => setEditingProposal(null)}
                  onProposalCreated={fetchAllData}
                />
              </div>
            )}
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
                      type="text" required placeholder="Price (e.g. ₹29,999)" value={packagePrice} onChange={(e) => setPackagePrice(e.target.value)}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-800">Trusted Partners Management</h3>
                <p className="text-xs text-slate-500">Upload logo graphics or customize brand typography rendered under the homepage &quot;TRUSTED PARTNER&quot; banner</p>
              </div>
              <button
                onClick={() => {
                  setEditingPartnerId(null);
                  setPartnerName("");
                  setPartnerLogoUrl("");
                  setPartnerWebsiteUrl("");
                  setPartnerStyle("font-bold text-lg md:text-xl text-slate-600");
                  setLogoUploadMode("file");
                  setShowPartnerForm(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-purple-soft transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Trusted Partner
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Partners</p>
                  <p className="text-2xl font-display font-extrabold text-slate-800">{partners.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image Logos</p>
                  <p className="text-2xl font-display font-extrabold text-emerald-600">{partners.filter(p => !!p.logo_url).length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Text Brands</p>
                  <p className="text-2xl font-display font-extrabold text-slate-600">{partners.filter(p => !p.logo_url).length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Partner Form Drawer */}
            {showPartnerForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h5 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    {editingPartnerId ? `Modify Partner (ID #${editingPartnerId})` : "Add New Trusted Partner"}
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowPartnerForm(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePartner} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Partner / Brand Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google, Reliance, Microsoft, Futura Inc."
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-purple-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Partner Website Link (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={partnerWebsiteUrl}
                          onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-purple-500"
                        />
                        <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>

                  {/* Logo Source Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Logo Asset Format
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { mode: "file", label: "Upload Image File", icon: <UploadCloud className="w-3.5 h-3.5" /> },
                        { mode: "url", label: "Image URL Link", icon: <Globe className="w-3.5 h-3.5" /> },
                        { mode: "text", label: "Typography Brand (No Image)", icon: <Palette className="w-3.5 h-3.5" /> }
                      ].map((m) => (
                        <button
                          key={m.mode}
                          type="button"
                          onClick={() => setLogoUploadMode(m.mode as any)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                            logoUploadMode === m.mode
                              ? "border-purple-600 bg-purple-50/60 text-purple-700 font-bold shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {m.icon}
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Mode */}
                  {logoUploadMode === "file" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Logo Graphic (PNG, SVG, JPG, WebP)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                        {partnerLogoUrl && partnerLogoUrl.startsWith("data:") ? (
                          <div className="space-y-3">
                            <div className="inline-block p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                              <img
                                src={partnerLogoUrl}
                                alt="Logo Preview"
                                className="h-12 max-w-[200px] object-contain mx-auto"
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">
                                Change File
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePartnerLogoUpload}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setPartnerLogoUrl("")}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer block space-y-2">
                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700">
                              Click to browse or drop partner logo file here
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Supports transparent PNG, SVG, JPG, WebP (Max ~2MB)
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePartnerLogoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* URL Input Mode */}
                  {logoUploadMode === "url" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Direct Image URL
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          placeholder="https://example.com/assets/logo.png"
                          value={partnerLogoUrl}
                          onChange={(e) => setPartnerLogoUrl(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                        <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                      {partnerLogoUrl && !partnerLogoUrl.startsWith("data:") && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center min-h-[60px]">
                          <img
                            src={partnerLogoUrl}
                            alt="URL Preview"
                            className="h-10 max-w-[180px] object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Typography Style Configuration (for text or fallback) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Typography Style {partnerLogoUrl ? "(Fallback when image fails)" : "(Text Brand Styling)"}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Tailwind CSS Classes</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        { label: "Bold Tracking", class: "font-bold text-lg md:text-xl text-slate-600 tracking-wider" },
                        { label: "Extrabold Modern", class: "font-extrabold text-lg md:text-xl text-slate-600 tracking-wide" },
                        { label: "Italic Heavy", class: "font-extrabold text-lg md:text-xl text-slate-600 italic" },
                        { label: "Minimalist Sans", class: "font-medium text-lg md:text-xl text-slate-600 tracking-normal" },
                        { label: "Black Ultra", class: "font-black text-lg md:text-xl text-slate-600 tracking-widest uppercase" }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setPartnerStyle(preset.class)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                            partnerStyle === preset.class
                              ? "bg-purple-100 text-purple-700 border-purple-300 font-bold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="e.g. font-extrabold text-lg md:text-xl text-slate-600 tracking-wide"
                      value={partnerStyle}
                      onChange={(e) => setPartnerStyle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono"
                    />
                  </div>

                  {/* Real-time Website Appearance Preview */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Homepage &quot;TRUSTED PARTNER&quot; Appearance:</span>
                      <span>Hover state enabled</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center min-h-[75px] shadow-2xs">
                      {partnerLogoUrl ? (
                        <div className="opacity-75 hover:opacity-100 transition-opacity flex items-center">
                          <img
                            src={partnerLogoUrl}
                            alt={partnerName || "Logo"}
                            className="h-8 md:h-9 max-w-[160px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      ) : (
                        <div className="opacity-75 hover:opacity-100 transition-opacity">
                          <span className={partnerStyle || "font-display font-bold text-lg md:text-xl text-slate-600"}>
                            {partnerName || "BRAND PREVIEW"}
                          </span>
                        </div>
                      )}
                    </div>
                    {partnerWebsiteUrl && (
                      <p className="text-[10px] text-purple-600 font-mono flex items-center justify-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Will open: {partnerWebsiteUrl}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-display font-bold cursor-pointer transition-all shadow-purple-soft"
                    >
                      {editingPartnerId ? "Update Partner" : "Save Trusted Partner"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPartnerForm(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Partners List Grid Cards */}
            {partners.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-base">No Trusted Partners Configured</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload your client or enterprise partner logos so they display in the high-visibility header banner.
                </p>
                <button
                  onClick={() => {
                    setEditingPartnerId(null);
                    setPartnerName("");
                    setPartnerLogoUrl("");
                    setPartnerWebsiteUrl("");
                    setPartnerStyle("font-bold text-lg md:text-xl text-slate-600");
                    setLogoUploadMode("file");
                    setShowPartnerForm(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold font-display cursor-pointer hover:bg-purple-700"
                >
                  Add Your First Partner Logo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          #{p.id}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          p.logo_url ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}>
                          {p.logo_url ? "Image Logo" : "Typography"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditPartnerTrigger(p)}
                          className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Edit Partner"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(p.id)}
                          className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Partner"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Logo / Brand Display Box */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-center min-h-[95px] text-center overflow-hidden">
                      {p.logo_url ? (
                        <img
                          src={p.logo_url}
                          alt={p.name}
                          className="h-9 max-w-[160px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
                          title={p.name}
                        />
                      ) : (
                        <span className={p.style || "font-display font-bold text-lg md:text-xl text-slate-600"}>
                          {p.name}
                        </span>
                      )}
                    </div>

                    {/* Partner Metadata */}
                    <div className="space-y-1 pt-1 border-t border-slate-50">
                      <div className="flex justify-between items-center">
                        <p className="font-display font-bold text-xs text-slate-800 truncate">{p.name}</p>
                        {p.website_url && (
                          <a
                            href={p.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-[11px] flex items-center gap-1 font-medium"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3 h-3" /> Visit
                          </a>
                        )}
                      </div>
                      {p.logo_url && (
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {p.logo_url.startsWith("data:") ? "Uploaded Base64 Graphic" : p.logo_url}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hostinger MySQL Database Integration</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure and permanently store your Hostinger MySQL connection without losing credentials across redeployments.</p>
                  </div>
                </div>

                {/* Direct Database Configuration Form */}
                <form onSubmit={handleSaveDbConfig} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      <span className="font-display font-bold text-slate-800 text-sm">Hostinger Database Credentials</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Auto-saved to persistent storage</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Database Host</label>
                      <input
                        type="text"
                        value={dbHostInput}
                        onChange={(e) => setDbHostInput(e.target.value)}
                        placeholder="srv1826.hstgr.io"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Port</label>
                      <input
                        type="text"
                        value={dbPortInput}
                        onChange={(e) => setDbPortInput(e.target.value)}
                        placeholder="3306"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Database User</label>
                      <input
                        type="text"
                        value={dbUserInput}
                        onChange={(e) => setDbUserInput(e.target.value)}
                        placeholder="u586646043_creattivee"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Database Name</label>
                      <input
                        type="text"
                        value={dbNameInput}
                        onChange={(e) => setDbNameInput(e.target.value)}
                        placeholder="u586646043_creattivee"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Database Password</label>
                        <button
                          type="button"
                          onClick={() => setShowDbPassword(!showDbPassword)}
                          className="text-[10px] text-purple-600 hover:underline font-medium cursor-pointer"
                        >
                          {showDbPassword ? "Hide" : "Show"} Password
                        </button>
                      </div>
                      <input
                        type={showDbPassword ? "text" : "password"}
                        value={dbPasswordInput}
                        onChange={(e) => setDbPasswordInput(e.target.value)}
                        placeholder="Enter Hostinger MySQL Password"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  {dbConfigFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-medium ${dbConfigFeedback.success ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-amber-50 border border-amber-100 text-amber-700"}`}>
                      {dbConfigFeedback.message}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={dbConfigTesting}
                      onClick={handleTestDbConfig}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${dbConfigTesting ? "animate-spin" : ""}`} />
                      {dbConfigTesting ? "Testing Connection..." : "Test Hostinger Connection"}
                    </button>

                    <button
                      type="submit"
                      disabled={dbConfigSaving}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      {dbConfigSaving ? "Saving Credentials..." : "Save & Activate Database"}
                    </button>
                  </div>
                </form>

                {/* Status & Sync Card */}
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
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
                      </button>
                    </div>
                  </div>

                  {/* Status / Errors */}
                  {!dbConnected && dbDetails?.error && (
                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-[11px] text-amber-700 font-mono leading-relaxed space-y-1">
                      <div className="font-bold">⚠️ Warning Description:</div>
                      <div>{dbDetails.error}</div>
                      <div className="text-[10px] text-slate-500 font-sans mt-2">
                        💡 How to fix: Make sure you have whitelisted the IP of your hosting platform or set Remote MySQL to allow connections from all hosts (%) on Hostinger, then set up the credentials in the form above and click "Save & Activate Database".
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

      {/* PROPOSAL PREVIEW MODAL */}
      {previewingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:hidden">
          <div
            onClick={() => setPreviewingProposal(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-base">
                    Proposal #{previewingProposal.id} Preview: "{previewingProposal.title}"
                  </h4>
                  <p className="text-slate-500 text-xs font-mono">
                    Client: {previewingProposal.client_name || "Custom Client"} | Status: <span className="font-bold uppercase text-purple-600">{previewingProposal.status || "draft"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectDownloadProposal(previewingProposal)}
                  disabled={downloadingProposalId === previewingProposal.id}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-purple-soft cursor-pointer disabled:opacity-50 transition-all"
                >
                  {downloadingProposalId === previewingProposal.id ? (
                    <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Export PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prop = previewingProposal;
                    setPreviewingProposal(null);
                    handleEditProposalTrigger(prop);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs flex items-center gap-1 border border-slate-200 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewingProposal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Rendered Live Canvas Preview */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/50">
              <div
                id="proposal-modal-preview-canvas"
                className="max-w-3xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm font-sans text-slate-800 space-y-7"
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5">
                  <div className="space-y-1">
                    <Logo size="sm" />
                    <span className="text-[10px] text-purple-700 font-mono font-bold tracking-widest block uppercase mt-1">
                      Bespoke Full Stack Studio
                    </span>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-800">Creattivee Digital Labs</p>
                    <p>D-561, Pocket 11, Jasola, New Delhi, India</p>
                    <p className="font-mono text-purple-700 font-semibold">creattivee@gmail.com | +91-8796380455</p>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-100 uppercase">
                      Ref: PROPOSAL #{previewingProposal.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Date: {previewingProposal.created_at ? new Date(previewingProposal.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">
                    {previewingProposal.title}
                  </h3>
                </div>

                {/* Client & Contract Info */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">PROPOSAL PREPARED FOR</span>
                    <div className="text-xs space-y-0.5 text-slate-700 font-medium">
                      <p className="font-bold text-slate-900 text-sm">{previewingProposal.client_name || "Valued Client"}</p>
                      <p className="text-slate-600 font-mono">Email: {previewingProposal.client_email || "N/A"}</p>
                      {previewingProposal.client_phone && (
                        <p className="text-slate-600 font-mono">Phone: {previewingProposal.client_phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">CONTRACT METRICS</span>
                    <div className="text-xs space-y-0.5 text-slate-700 font-medium">
                      <p>Handover Timeline: <span className="font-bold text-slate-900">{previewingProposal.timeline || "2 Weeks"}</span></p>
                      <p>Contract Currency: <span className="font-bold text-slate-900">INR (₹ / Rs.)</span></p>
                      <p>Document Status: <span className="font-bold text-purple-700 uppercase">{previewingProposal.status || "draft"}</span></p>
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Detailed Scope of Deliverables
                  </h4>
                  <div
                    className="proposal-rendered-scope text-xs text-slate-700 leading-relaxed font-sans space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: previewingProposal.scope_html || (
                        previewingProposal.services_selected && previewingProposal.services_selected.length > 0
                          ? `<ul>${previewingProposal.services_selected.map(s => `<li><strong>${s}</strong></li>`).join("")}</ul>`
                          : "<p>Complete digital architecture, frontend UI, backend endpoints and database setup.</p>"
                      )
                    }}
                  />
                </div>

                {/* Terms */}
                {previewingProposal.terms && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1">
                      Terms & Mobilization Agreements
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {previewingProposal.terms}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center">
                  <div className="space-y-0.5 text-xs text-slate-500 font-semibold">
                    <p className="font-bold text-slate-700">Creattivee Verified Contract</p>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> High-precision deliverables ledger
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">TOTAL CONTRACT QUOTE</span>
                    <span className="text-3xl font-display font-black text-slate-900">
                      ₹{previewingProposal.price ? Number(previewingProposal.price).toLocaleString("en-IN") : "0"}
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                      CLIENT ACCEPTANCE
                    </span>
                    <div className="h-10 border-b border-dashed border-slate-300 flex items-end">
                      <span className="text-xs text-slate-400 font-mono italic">Awaiting Client E-Signature</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{previewingProposal.client_name || "Client"}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                      CREATTIVEE AUTHORIZATION
                    </span>
                    <div className="h-10 border-b border-dashed border-slate-300 flex items-end">
                      <span className="text-xs text-purple-700 font-mono font-bold tracking-wide italic">
                        {previewingProposal.signature_data || "Creattivee Director Sign"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Creattivee Director & Labs Lead</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
