import React, { useState } from "react";
import { FileText, Download, Check, Sparkles, Printer, DollarSign, Calendar, ShieldCheck, Signature } from "lucide-react";
import { Lead, Service, AgencyPackage, Proposal } from "../types";
import { motion } from "motion/react";
import Logo from "./Logo";

interface ProposalPrintableProps {
  leads: Lead[];
  services: Service[];
  packages: AgencyPackage[];
  onProposalCreated: () => void;
}

export default function ProposalPrintable({ leads, services, packages, onProposalCreated }: ProposalPrintableProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<number | "">("");
  const [title, setTitle] = useState("Interactive Digital Growth Proposal");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [customPrice, setCustomPrice] = useState("");
  const [timeline, setTimeline] = useState("2 Weeks");
  const [terms, setTerms] = useState("50% advance mobilization, remaining 50% on successful source handover. Unlimited revisions on design prototype phase.");
  const [signature, setSignature] = useState("Creattivee Director Sign");

  const [saving, setSaving] = useState(false);
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null);

  // Computed Values
  const selectedLead = leads.find((l) => l.id === Number(selectedLeadId));

  const handleServiceToggle = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handlePackageToggle = (name: string) => {
    setSelectedPackages((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      alert("Please select a target Lead first!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        lead_id: Number(selectedLeadId),
        title,
        services_selected: selectedServices,
        packages_selected: selectedPackages,
        price: Number(customPrice) || 999,
        terms,
        timeline,
        signature_data: signature,
      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedProposal(data.proposal);
        onProposalCreated();
        
        // Audit update lead status to proposal_sent
        await fetch(`/api/leads/${selectedLeadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "proposal_sent" }),
        });
      }
    } catch (err) {
      console.error("Failed creating proposal", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:block">
      {/* LEFT: Config Form (Hidden on Print) */}
      <div className="space-y-6 print:hidden">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-lg font-display font-bold text-slate-800">Proposal Composer</h4>
              <p className="text-xs text-slate-500">Draft beautiful quotes instantly for registered leads</p>
            </div>
          </div>

          <form onSubmit={handleCreateProposal} className="space-y-4">
            {/* Lead Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Select Target Lead *</label>
              <select
                required
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="">-- Choose active lead from CRM --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.client_name} - {l.service_interested} [{l.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Proposal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              />
            </div>

            {/* Custom price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Add Dynamic Pricing ($ USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Estimated Timeline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Select Services Checkboxes */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Scope of Services Included</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                {services.map((ser) => (
                  <label key={ser.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(ser.title)}
                      onChange={() => handleServiceToggle(ser.title)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{ser.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Select Packages Checkboxes */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Add Packages Specifiers</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                {packages.map((pkg) => (
                  <label key={pkg.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPackages.includes(pkg.title)}
                      onChange={() => handlePackageToggle(pkg.title)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{pkg.title} ({pkg.price})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Terms */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Contract terms & conditions</label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white resize-none"
              />
            </div>

            {/* Digital Signature */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Digital Signature Authority</label>
              <div className="relative">
                <Signature className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 text-white text-xs font-display font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Save & Generate Proposal Document
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: High-Fidelity Preview & Print Container */}
      <div className="space-y-4">
        {/* Actions bar (Hidden on Print) */}
        <div className="flex items-center justify-between print:hidden">
          <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Check className="w-4.5 h-4.5 text-emerald-500" /> Active Print-Out Canvas
          </h5>
          {createdProposal && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Export PDF
            </button>
          )}
        </div>

        {/* The beautiful Printable Layout */}
        <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-md print:shadow-none print:border-none print:p-0 font-sans text-slate-800 space-y-8 select-text">
          {/* Header strip */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
            <div className="space-y-1">
              <Logo size="sm" />
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase mt-1">Bespoke Full Stack Studio</span>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-700">Creattivee Labs India</p>
              <p>D-561, Pocket 11, Jasola, New Delhi</p>
              <p>creattivee@gmail.com | +91-8796380455</p>
            </div>
          </div>

          {/* Proposal Meta info */}
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-extrabold text-slate-800 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400">Date Generated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Client target */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">PROPOSAL PREPARED FOR</span>
              {selectedLead ? (
                <div className="text-xs space-y-0.5 text-slate-700 font-medium">
                  <p className="font-bold text-slate-800 text-sm">{selectedLead.client_name}</p>
                  <p>Email: {selectedLead.client_email}</p>
                  {selectedLead.client_phone && <p>Phone: {selectedLead.client_phone}</p>}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No lead selected yet. Choose a target from the composer on the left.</p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">CONTRACT METRICS</span>
              <div className="text-xs space-y-0.5 text-slate-700 font-medium">
                <p>Estimates Handover: <span className="font-bold text-slate-800">{timeline}</span></p>
                <p>Contract Currency: <span className="font-bold text-slate-800">USD ($)</span></p>
                <p>Status: <span className="font-bold text-purple-600 uppercase">Draft Outline</span></p>
              </div>
            </div>
          </div>

          {/* Scope details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Functional Scope of Deliverables</h4>
            
            <div className="space-y-2">
              {selectedServices.length === 0 && selectedPackages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No service scope checked. Complete the configuration form to populate itemized metrics.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedServices.map((ser, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                      <span>{ser} (Full Dynamic Integration & Administration panels included)</span>
                    </li>
                  ))}
                  {selectedPackages.map((pkg, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span>{pkg} Spec Package Modules Added</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Terms & Mobilization Agreements</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{terms}</p>
          </div>

          {/* Financial summary */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="space-y-0.5 text-xs text-slate-500 font-semibold">
              <p>System Engine: Creattivee rest API v1.2</p>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Fully verifiable ledger logs
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">TOTAL CONTRACT QUOTE</span>
              <span className="text-3xl font-display font-black text-slate-800">${customPrice || "0.00"}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-10">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-100 pb-1">CLIENT AUTHORIZATION</span>
              <div className="h-10 border-b border-dashed border-slate-300 flex items-end">
                <span className="text-xs text-slate-300 font-mono italic">Awaiting E-Sign</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Authorized Lead Representative</p>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-100 pb-1">CREATTIVEE HANDSHAKE</span>
              <div className="h-10 border-b border-dashed border-slate-300 flex items-end">
                <span className="text-xs text-purple-700 font-mono font-bold tracking-wide italic">{signature}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Creative Director Handover</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
