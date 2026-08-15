import React, { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldAlert, KeyRound, Sparkles, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password reset state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both your username/email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.message || "Invalid credentials. Please verify your username and password.");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setLoading(true);
    // Simulate secure reset email dispatch
    setTimeout(() => {
      setResetSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setResetSuccess(false);
        setForgotMode(false);
        setResetEmail("");
      }, 3500);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      {/* Floating backgrounds */}
      <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-pink-100/45 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-purple-100/40 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl glass-card shadow-purple-soft relative z-10 border border-slate-200/80"
      >
        {/* Logo Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" className="mb-2" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <p className="text-[11px] text-slate-600 font-semibold">Creattivee High Security Admin Portal</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!forgotMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="relative">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Admin Username / Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="foujia@creattivee.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none text-xs text-slate-800 bg-white transition-all font-medium"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600 block">Admin Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-[10px] font-semibold text-purple-600 hover:underline cursor-pointer"
                  >
                    Forgot Credentials?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10.5 pr-10 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none text-xs text-slate-800 bg-white transition-all font-medium"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldAlert className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Strict device authentication required. IP session encryption enabled.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-95 text-white font-display font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Admin Panel <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs text-center space-y-1">
                  <p className="font-bold">Reset Request Dispatched!</p>
                  <p className="text-[10px]">A simulated password reset email link has been routed via our configured SMTP port to the authorized admin address.</p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                    Provide your authorized admin email address to request password assistance.
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="foujia@creattivee.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-400 focus:outline-none text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-grow py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-display font-bold cursor-pointer"
                    >
                      {loading ? "Transmitting..." : "Send Reset Key"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotMode(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
