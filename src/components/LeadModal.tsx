import React, { useState } from "react";
import { X, Send, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, Phone, Mail, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  packageName?: string;
  onSuccess?: () => void;
}

export default function LeadModal({ isOpen, onClose, serviceName = "General Inquiry", packageName, onSuccess }: LeadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setSubmitting(true);
    try {
      const payload = {
        type: "website",
        client_name: name,
        client_email: email,
        client_phone: phone,
        service_interested: packageName ? `${serviceName} - ${packageName}` : serviceName,
        message: message,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccess(false);
          setName("");
          setEmail("");
          setPhone("");
          setMessage("");
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to submit lead", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="lead-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
          />

          {/* Form Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl glass-card shadow-purple-soft p-6 md:p-8 z-10"
          >
            {/* Ambient colorful gradient corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-300 via-purple-300 to-sky-300 opacity-20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-100 text-pink-600">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xl font-display font-semibold text-slate-800">Configure Proposal</h3>
                  <p className="text-xs text-slate-500 font-medium">Dynamic Client Intake System</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-12"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-display font-semibold text-slate-800">Requirements Received!</h4>
                <p className="text-slate-600 mt-2 max-w-sm text-sm">
                  Your dynamic quote proposal is being structured. We have sent an automated SMTP notification request to our core staff.
                </p>
                <div className="mt-6 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs text-slate-500 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Auto-Logged inside Creattivee Rest CRM
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {serviceName && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/50 to-purple-50/50 border border-pink-100/60 text-xs">
                    <span className="font-semibold text-pink-600 uppercase tracking-wider block mb-1">Configuring Order For:</span>
                    <span className="font-display font-bold text-slate-700 text-sm">
                      {serviceName} {packageName ? `(${packageName} Pack)` : ""}
                    </span>
                  </div>
                )}

                <div className="relative">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Your Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mukesh Ambani"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10.5 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:outline-none bg-white/70 backdrop-blur-sm text-sm text-slate-800 font-medium transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="mukesh@reliance.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10.5 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:outline-none bg-white/70 backdrop-blur-sm text-sm text-slate-800 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91-88888 88888"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10.5 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:outline-none bg-white/70 backdrop-blur-sm text-sm text-slate-800 font-medium transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Describe Requirements (Features, Scope)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                    <textarea
                      placeholder="e.g. We require a fully responsive billing system module integrated with sitemaps and MySQL support..."
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full pl-10.5 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:outline-none bg-white/70 backdrop-blur-sm text-sm text-slate-800 font-medium transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 px-1 py-1">
                  <ShieldCheck className="w-4 h-4 text-pink-500" />
                  We secure data via server-side XSS filters. 256-bit Secure Layer.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-95 text-white text-sm font-display font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Order to Developer
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
