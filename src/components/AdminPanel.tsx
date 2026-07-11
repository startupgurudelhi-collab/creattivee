import React, { useState, useEffect } from "react";
import {
  Users, Briefcase, FileText, Settings, Database, Plus, Edit, Trash, Upload,
  Calendar, Check, UserPlus, Clock, MessageSquare, Mail, Phone, MapPin, Tag,
  Download, Sparkles, BookOpen, LayoutGrid, Layers, HelpCircle, UserCheck, Play, Shield, X
} from "lucide-react";
import { Lead, Client, Service, AgencyPackage, PortfolioItem, BlogArticle, FAQItem, Testimonial, AgencySettings, ActivityLog } from "../types";
import ProposalPrintable from "./ProposalPrintable";
import { motion } from "motion/react";
import Logo from "./Logo";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "leads" | "clients" | "proposals" | "cms-services" | "cms-packages" | "cms-portfolio" | "cms-blogs" | "cms-testimonials" | "cms-faqs" | "settings">("dashboard");

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
      const [leadsRes, clientsRes, servicesRes, packagesRes, portfolioRes, blogsRes, faqsRes, testimonialsRes, settingsRes, logsRes] = await Promise.all([
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/clients").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/packages").then(r => r.json()),
        fetch("/api/portfolio").then(r => r.json()),
        fetch("/api/blogs").then(r => r.json()),
        fetch("/api/faqs").then(r => r.json()),
        fetch("/api/testimonials").then(r => r.json()),
        fetch("/api/settings").then(r => r.json()),
        fetch("/api/activity-logs").then(r => r.json())
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

  useEffect(() => {
    fetchAllData();
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
              { id: "cms-packages", label: "Configure Packages", icon: <Sparkles className="w-4 h-4" /> },
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
