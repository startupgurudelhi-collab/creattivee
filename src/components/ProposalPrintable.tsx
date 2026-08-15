import React, { useState, useEffect, useRef } from "react";
import {
  FileText, Download, Check, Sparkles, Printer, Calendar, ShieldCheck, Signature,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Image as ImageIcon,
  Palette, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  Maximize2, Minimize2, Plus, Trash2, Edit3, X, Eye, RefreshCw, Upload, Link as LinkIcon
} from "lucide-react";
import { Lead, Service, AgencyPackage, Proposal } from "../types";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface ProposalPrintableProps {
  leads: Lead[];
  services: Service[];
  packages: AgencyPackage[];
  editingProposal?: Proposal | null;
  onClearEditing?: () => void;
  onProposalCreated: () => void;
}

const DEFAULT_INITIAL_SCOPE = `<h3><strong>1. Project Overview & Deliverables</strong></h3>
<p>Creattivee Digital Labs will design and develop a high-performance, modern digital solution tailored specifically for your business goals.</p>
<ul>
  <li><strong>UI/UX Design:</strong> Custom high-fidelity mockups with modern aesthetics, clean typography, and intuitive user journeys.</li>
  <li><strong>Full Stack Development:</strong> Responsive, fast-loading implementation with secure back-office admin capabilities.</li>
  <li><strong>Database & API Architecture:</strong> Robust schema design, lightning-fast queries, and real-time logging.</li>
  <li><strong>SEO & Speed Optimization:</strong> 90+ Google PageSpeed benchmarks, meta tag setups, and mobile-first responsiveness.</li>
</ul>
<h3><strong>2. Milestone Execution Plan</strong></h3>
<p>All source code, design assets, and administrative access credentials will be delivered upon final milestone sign-off.</p>`;

export default function ProposalPrintable({
  leads,
  services,
  packages,
  editingProposal,
  onClearEditing,
  onProposalCreated
}: ProposalPrintableProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<number | "">("");
  const [manualClientName, setManualClientName] = useState("");
  const [manualClientEmail, setManualClientEmail] = useState("");
  const [manualClientPhone, setManualClientPhone] = useState("");
  
  const [title, setTitle] = useState("Interactive Digital Growth Proposal");
  const [customPrice, setCustomPrice] = useState("39999");
  const [timeline, setTimeline] = useState("2 Weeks");
  const [terms, setTerms] = useState("50% advance mobilization, remaining 50% on successful source handover. Unlimited revisions on design prototype phase.");
  const [signature, setSignature] = useState("Creattivee Director Sign");
  const [proposalStatus, setProposalStatus] = useState<"draft" | "sent" | "accepted" | "declined">("draft");

  // Rich Scope Editor HTML State
  const [scopeHtml, setScopeHtml] = useState<string>(DEFAULT_INITIAL_SCOPE);
  const editorRef = useRef<HTMLDivElement>(null);

  // Image Inserter Modal States
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState<"small" | "medium" | "large" | "fit-text">("medium");
  const [imageCaption, setImageCaption] = useState("");

  // Font / Color Dropdowns
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#9333ea");

  // Saving & Exporting States
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [savedProposal, setSavedProposal] = useState<Proposal | null>(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState("");

  // Sync with editingProposal if passed
  useEffect(() => {
    if (editingProposal) {
      setSelectedLeadId(editingProposal.lead_id || "");
      setManualClientName(editingProposal.client_name || "");
      setManualClientEmail(editingProposal.client_email || "");
      setManualClientPhone(editingProposal.client_phone || "");
      setTitle(editingProposal.title || "Interactive Digital Growth Proposal");
      setCustomPrice(String(editingProposal.price || "39999"));
      setTimeline(editingProposal.timeline || "2 Weeks");
      setTerms(editingProposal.terms || "");
      setSignature(editingProposal.signature_data || "Creattivee Director Sign");
      setProposalStatus(editingProposal.status || "draft");
      
      const incomingScope = editingProposal.scope_html || (
        editingProposal.services_selected && editingProposal.services_selected.length > 0
          ? `<h3><strong>Scope of Services</strong></h3><ul>${editingProposal.services_selected.map(s => `<li><strong>${s}</strong></li>`).join("")}</ul>`
          : DEFAULT_INITIAL_SCOPE
      );
      setScopeHtml(incomingScope);
      if (editorRef.current) {
        editorRef.current.innerHTML = incomingScope;
      }
    }
  }, [editingProposal]);

  // Sync initial editorRef on mount
  useEffect(() => {
    if (editorRef.current && !editingProposal) {
      editorRef.current.innerHTML = scopeHtml;
    }
  }, []);

  // Update selected lead details
  const selectedLead = leads.find((l) => l.id === Number(selectedLeadId));
  
  useEffect(() => {
    if (selectedLead) {
      setManualClientName(selectedLead.client_name);
      setManualClientEmail(selectedLead.client_email);
      setManualClientPhone(selectedLead.client_phone || "");
    }
  }, [selectedLeadId]);

  // Handle rich text command execution
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setScopeHtml(editorRef.current.innerHTML);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setScopeHtml(editorRef.current.innerHTML);
    }
  };

  // Insert Image into Editor HTML
  const handleInsertImage = () => {
    if (!imageUrl) {
      alert("Please provide an Image URL or upload an image file.");
      return;
    }

    let imgClass = "rounded-2xl border border-slate-200 shadow-sm my-3 ";
    let containerStyle = "";

    if (imageSize === "small") {
      imgClass += "w-44 max-w-full object-cover ";
      containerStyle = "display: block; margin: 10px 0;";
    } else if (imageSize === "medium") {
      imgClass += "w-80 max-w-full object-cover ";
      containerStyle = "display: block; margin: 12px 0;";
    } else if (imageSize === "large") {
      imgClass += "w-full object-cover ";
      containerStyle = "display: block; margin: 16px 0;";
    } else if (imageSize === "fit-text") {
      imgClass += "w-56 max-w-full float-left mr-4 mb-2 object-cover ";
      containerStyle = "clear: both; margin-bottom: 8px;";
    }

    const imageHtml = `
      <div class="proposal-image-wrapper" style="${containerStyle}">
        <img src="${imageUrl}" alt="${imageCaption || 'Proposal Scope Visual'}" class="${imgClass}" style="border-radius: 12px;" />
        ${imageCaption ? `<p class="text-[11px] text-slate-500 italic mt-1 font-medium">${imageCaption}</p>` : ""}
      </div>
      <p><br/></p>
    `;

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, imageHtml);
      setScopeHtml(editorRef.current.innerHTML);
    }

    setShowImageModal(false);
    setImageUrl("");
    setImageCaption("");
  };

  // Handle local image file upload -> convert to base64 data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImageUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Preset Templates
  const handleLoadTemplate = (type: "web" | "software" | "branding" | "blank") => {
    let tpl = "";
    if (type === "web") {
      tpl = `<h3><strong style="color: #9333ea;">1. Bespoke Web Design & Modern UI</strong></h3>
<p>Creation of a high-conversion, responsive web portal engineered for brand authority.</p>
<ul>
  <li><strong>Design Phase:</strong> 100% customized Figma wireframes, glassmorphic card overlays, and dynamic brand palette.</li>
  <li><strong>Frontend Architecture:</strong> Ultra-fast React 19 + Tailwind CSS with smooth interactive transitions.</li>
  <li><strong>Content & Media:</strong> Clean asset optimization, responsive hero section, and dynamic CMS blog engine.</li>
</ul>
<h3><strong style="color: #2563eb;">2. Search & Speed Standards</strong></h3>
<p>Full Google Core Web Vitals optimization guaranteeing 95+ desktop scores and complete SEO schemas.</p>`;
    } else if (type === "software") {
      tpl = `<h3><strong style="color: #ec4899;">1. Enterprise Software & API Engine</strong></h3>
<p>Full-stack backend infrastructure designed for high concurrency, automated billing, and role-based permissions.</p>
<ul>
  <li><strong>Database Layer:</strong> Relational MySQL / PostgreSQL setup with automated indexing and backup snapshots.</li>
  <li><strong>Admin Controls:</strong> Real-time Lead tracking, automated proposal builder, and revenue analytics.</li>
  <li><strong>Security:</strong> Session crypto encryption, XSS filters, and parameterized query firewalls.</li>
</ul>
<h3><strong style="color: #059669;">2. QA & Delivery Handover</strong></h3>
<p>Includes Postman API documentation, containerized deployment scripts, and 30 days priority warranty.</p>`;
    } else if (type === "branding") {
      tpl = `<h3><strong style="color: #d97706;">1. Brand Identity & Creative Assets</strong></h3>
<p>Complete visual identity refresh crafted to elevate industry presence.</p>
<ul>
  <li><strong>Vector Logo Suite:</strong> Primary, monochrome, and compact app-icon variants in SVG, PNG, and PDF formats.</li>
  <li><strong>Design System:</strong> Typographic pairings, official color codes (HEX, RGB, CMYK), and UI components.</li>
  <li><strong>Social Media Kit:</strong> High-res templates for LinkedIn, Instagram, and corporate presentations.</li>
</ul>`;
    } else {
      tpl = `<p>Start typing your custom scope of work here...</p>`;
    }

    setScopeHtml(tpl);
    if (editorRef.current) {
      editorRef.current.innerHTML = tpl;
    }
  };

  // Submit Proposal (Create or Update)
  const handleSaveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const clientName = selectedLead ? selectedLead.client_name : (manualClientName || "Direct Client");
      const clientEmail = selectedLead ? selectedLead.client_email : (manualClientEmail || "client@example.com");
      const clientPhone = selectedLead ? selectedLead.client_phone : manualClientPhone;

      const payload = {
        lead_id: selectedLeadId ? Number(selectedLeadId) : null,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        title,
        scope_html: scopeHtml,
        price: Number(customPrice) || 39999,
        terms,
        timeline,
        signature_data: signature,
        status: proposalStatus,
      };

      let res;
      if (editingProposal && editingProposal.id) {
        res = await fetch(`/api/proposals/${editingProposal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setSavedProposal(data.proposal);
        onProposalCreated();
        
        // If associated with a lead, update lead status to proposal_sent
        if (selectedLeadId) {
          await fetch(`/api/leads/${selectedLeadId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "proposal_sent" }),
          });
        }

        setExportSuccessMsg(editingProposal ? "Proposal updated successfully!" : "Proposal generated & saved successfully!");
        setTimeout(() => setExportSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed saving proposal", err);
      alert("Error saving proposal. Please check connection.");
    } finally {
      setSaving(false);
    }
  };

  // Pixel-Perfect High-Resolution PDF Export
  const handleDownloadPdf = async () => {
    const element = document.getElementById("proposal-printable-canvas");
    if (!element) return;

    setExportingPdf(true);
    try {
      // Dynamically load html2canvas and jsPDF to ensure fail-safe builds on any hosting provider
      let html2canvasModule: any = null;
      let jsPdfModule: any = null;
      try {
        html2canvasModule = await import("html2canvas");
        jsPdfModule = await import("jspdf");
      } catch (importErr) {
        console.warn("Could not import html2canvas/jspdf dynamically, falling back to window.print()", importErr);
      }

      const html2canvas = html2canvasModule?.default || html2canvasModule;
      const jsPDF = jsPdfModule?.default || jsPdfModule?.jsPDF || jsPdfModule;

      if (!html2canvas || !jsPDF) {
        window.print();
        return;
      }

      // High-resolution canvas render at 3x Retina resolution for zero blur text
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }

      const clientNameSafe = (selectedLead?.client_name || manualClientName || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`Creattivee_Proposal_${clientNameSafe}_${new Date().toISOString().substring(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  const activeClientName = selectedLead?.client_name || manualClientName || "Valued Client";
  const activeClientEmail = selectedLead?.client_email || manualClientEmail || "client@company.com";
  const activeClientPhone = selectedLead?.client_phone || manualClientPhone || "+91-XXXXXXXXXX";

  return (
    <div className="space-y-6">
      {/* Editing Alert Banner */}
      {editingProposal && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-600 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-purple-900">Editing Proposal #{editingProposal.id}: {editingProposal.title}</p>
              <p className="text-[11px] text-purple-700">Modify the custom scope, price, terms, or images and save updates.</p>
            </div>
          </div>
          {onClearEditing && (
            <button
              onClick={onClearEditing}
              className="px-3 py-1 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      )}

      {exportSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          {exportSuccessMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 print:block">
        {/* LEFT COLUMN: Composer Form (Hidden during print) */}
        <div className="xl:col-span-6 space-y-6 print:hidden">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h4 className="text-base font-display font-bold text-slate-800">
                    {editingProposal ? "Modify Proposal Specs" : "Proposal Composer & Scope Builder"}
                  </h4>
                  <p className="text-xs text-slate-500">Draft custom proposals with manual rich-text scope, images & dynamic pricing</p>
                </div>
              </div>

              {/* Template Quick Loader */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Templates:</span>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("web")}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  title="Web Design Template"
                >
                  Web
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("software")}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-700 text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  title="Software/ERP Template"
                >
                  App
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("branding")}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  title="Branding Template"
                >
                  Brand
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate("blank")}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  title="Clear to Blank"
                >
                  Blank
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProposal} className="space-y-4">
              {/* Target Lead Selector OR Manual Client Details */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Client / Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">-- Choose registered Lead from CRM (or enter manually below) --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.client_name} - {l.service_interested} [{l.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual Client Fields if no CRM Lead selected */}
              {!selectedLeadId && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mukesh Ambani"
                      value={manualClientName}
                      onChange={(e) => setManualClientName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client Email *</label>
                    <input
                      type="email"
                      placeholder="e.g. client@company.com"
                      value={manualClientEmail}
                      onChange={(e) => setManualClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91-9876543210"
                      value={manualClientPhone}
                      onChange={(e) => setManualClientPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Proposal Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Proposal Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Interactive Digital Growth & Full Stack Platform Proposal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-medium focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Price & Timeline & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Dynamic Price (₹ INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="39999"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold bg-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Estimated Timeline *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 Weeks"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Proposal Status</label>
                  <select
                    value={proposalStatus}
                    onChange={(e) => setProposalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold bg-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="draft">Draft Outline</option>
                    <option value="sent">Sent to Client</option>
                    <option value="accepted">Accepted / Approved</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* SCOPE OF WORK - MANUAL RICH TEXT EDITOR BOX */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Scope of Work (Manual Rich Text Editor) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Type manually & format text/images below</span>
                </div>

                {/* The Editable Blank Canvas */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="w-full min-h-[220px] max-h-[380px] overflow-y-auto p-4 rounded-2xl border-2 border-purple-200/80 bg-slate-50/40 text-xs text-slate-800 leading-relaxed focus:outline-none focus:bg-white focus:border-purple-500 shadow-inner transition-all font-sans"
                  style={{ minHeight: "220px" }}
                />

                {/* TOOLBAR BUTTONS UNDER THE TEXT BOX */}
                <div className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Editor Formatting Controls:</div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Bold, Italic, Underline, Strike */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => executeCommand("bold")}
                        className="p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 cursor-pointer font-bold"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand("italic")}
                        className="p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 cursor-pointer italic"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand("underline")}
                        className="p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 cursor-pointer underline"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand("strikeThrough")}
                        className="p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 cursor-pointer"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Headings */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => executeCommand("formatBlock", "h2")}
                        className="px-2 py-1 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-[11px] font-extrabold cursor-pointer"
                        title="Large Heading"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand("formatBlock", "h3")}
                        className="px-2 py-1 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-[11px] font-bold cursor-pointer"
                        title="Subheading"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand("formatBlock", "p")}
                        className="px-2 py-1 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-[11px] font-medium cursor-pointer"
                        title="Normal Paragraph"
                      >
                        P
                      </button>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => executeCommand("insertUnorderedList")}
                        className="p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 cursor-pointer"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand("insertOrderedList")}
                        className="p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-700 text-slate-700 cursor-pointer"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Colorful Text Buttons Palette */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 gap-1 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 px-1">Colors:</span>
                      {[
                        { color: "#0f172a", name: "Dark" },
                        { color: "#9333ea", name: "Purple" },
                        { color: "#ec4899", name: "Pink" },
                        { color: "#2563eb", name: "Blue" },
                        { color: "#059669", name: "Green" },
                        { color: "#d97706", name: "Gold" },
                        { color: "#dc2626", name: "Red" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => executeCommand("foreColor", c.color)}
                          className="w-4.5 h-4.5 rounded-full border border-black/10 hover:scale-125 transition-transform cursor-pointer shadow-2xs"
                          style={{ backgroundColor: c.color }}
                          title={`Color ${c.name}`}
                        />
                      ))}

                      {/* Custom Color Input */}
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          executeCommand("foreColor", e.target.value);
                        }}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                        title="Custom Color Picker"
                      />
                    </div>

                    {/* INSERT IMAGE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setShowImageModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-4 h-4" /> + Insert Image in Scope
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contract Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white resize-none focus:border-purple-500 focus:outline-none font-medium"
                />
              </div>

              {/* Digital Signature */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Digital Signature Authority</label>
                <div className="relative">
                  <Signature className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-medium focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:opacity-95 text-white text-xs font-display font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      {editingProposal ? "Update Proposal Record" : "Save & Generate Proposal"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={exportingPdf}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {exportingPdf ? (
                    <>
                      <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                      Generating Crisp PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Crisp PDF
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Pixel-Perfect Live Side Preview & Printable Canvas */}
        <div className="xl:col-span-6 space-y-4">
          {/* Action Ribbon above Preview (Hidden during print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h5 className="text-xs font-bold text-slate-800">Live Proposal Preview Canvas</h5>
                <p className="text-[10px] text-slate-400">Exported PDF will be 100% identical to this preview with zero blur</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={exportingPdf}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                title="Download High-Res PDF (Identical to Preview)"
              >
                {exportingPdf ? (
                  <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Export PDF
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-all"
                title="Print or Vector Browser PDF"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>

          {/* THE EXACT PRINTABLE CANVAS CONTAINER */}
          <div
            id="proposal-printable-canvas"
            className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0 font-sans text-slate-800 space-y-7 select-text"
            style={{ minHeight: "820px", backgroundColor: "#ffffff" }}
          >
            {/* Header with Agency Branding */}
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

            {/* Proposal Document Title & Generated Date */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-100 uppercase">
                  Ref: PROPOSAL #{editingProposal ? editingProposal.id : "2026-NEW"}
                </span>
                <span className="text-xs text-slate-400 font-mono">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <h3 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">
                {title}
              </h3>
            </div>

            {/* Client Target & Contract Metrics */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">PROPOSAL PREPARED FOR</span>
                <div className="text-xs space-y-0.5 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-sm">{activeClientName}</p>
                  <p className="text-slate-600 font-mono">Email: {activeClientEmail}</p>
                  <p className="text-slate-600 font-mono">Phone: {activeClientPhone}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">CONTRACT METRICS</span>
                <div className="text-xs space-y-0.5 text-slate-700 font-medium">
                  <p>Handover Timeline: <span className="font-bold text-slate-900">{timeline}</span></p>
                  <p>Contract Currency: <span className="font-bold text-slate-900">INR (₹ / Rs.)</span></p>
                  <p>Document Status: <span className="font-bold text-purple-700 uppercase">{proposalStatus}</span></p>
                </div>
              </div>
            </div>

            {/* SCOPE OF WORK - LIVE RENDER OF MANUAL RICH HTML & IMAGES */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Detailed Scope of Deliverables
              </h4>
              
              {/* The rendered HTML Scope */}
              <div
                className="proposal-rendered-scope text-xs text-slate-700 leading-relaxed font-sans space-y-3"
                dangerouslySetInnerHTML={{ __html: scopeHtml }}
              />
            </div>

            {/* Terms & Mobilization Agreements */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1">
                Terms & Mobilization Agreements
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {terms}
              </p>
            </div>

            {/* Financial Summary */}
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
                  ₹{customPrice ? Number(customPrice).toLocaleString('en-IN') : "0"}
                </span>
              </div>
            </div>

            {/* Signatures Row */}
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                  CLIENT ACCEPTANCE
                </span>
                <div className="h-10 border-b border-dashed border-slate-300 flex items-end">
                  <span className="text-xs text-slate-400 font-mono italic">Awaiting Client E-Signature</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{activeClientName}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                  CREATTIVEE AUTHORIZATION
                </span>
                <div className="h-10 border-b border-dashed border-slate-300 flex items-end">
                  <span className="text-xs text-purple-700 font-mono font-bold tracking-wide italic">{signature}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Creattivee Director & Labs Lead</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSERT IMAGE MODAL */}
      <AnimatePresence>
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowImageModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 z-10"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  <h5 className="font-display font-bold text-slate-800 text-sm">Insert Image in Scope of Work</h5>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload or URL */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">1. Upload Image from Computer</label>
                  <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/40 hover:bg-purple-50 text-purple-700 text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Choose File (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center text-[10px] font-bold uppercase text-slate-400">-- OR --</div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">2. Paste Image URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Preview Image if selected */}
                {imageUrl && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Image Preview:</p>
                    <img src={imageUrl} alt="Selected preview" className="w-full h-28 object-cover rounded-lg" />
                  </div>
                )}

                {/* Image Size Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Select Image Size / Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "small", label: "Small (Compact)", desc: "180px width" },
                      { id: "medium", label: "Medium (Standard)", desc: "320px width" },
                      { id: "large", label: "Large (Full Width)", desc: "100% banner" },
                      { id: "fit-text", label: "Fit with Text (Float)", desc: "Inline text wrap" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setImageSize(s.id as any)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          imageSize === s.id
                            ? "bg-purple-50 border-purple-500 text-purple-900"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-bold">{s.label}</p>
                        <p className="text-[10px] text-slate-500">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Caption */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Optional Caption</label>
                  <input
                    type="text"
                    placeholder="e.g. Architecture Blueprint / Wireframe Sample"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertImage}
                  disabled={!imageUrl}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                >
                  Insert into Scope
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
