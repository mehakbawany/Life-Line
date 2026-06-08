"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const roles = [
  { value: "USER", label: "Citizen / User", desc: "Request & track ambulances", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { value: "DRIVER", label: "Ambulance Driver", desc: "Receive dispatches & GPS broadcast", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { value: "DISPATCHER", label: "Dispatcher", desc: "Monitor and manage operations", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "DISTRICT_ADMIN", label: "District Admin", desc: "Manage district fleet & events", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  { value: "MAIN_ADMIN", label: "Main Administrator", desc: "Full platform access & control", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "text-red-400 bg-red-500/10 border-red-500/30" },
];

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const selectedRole = roles.find(r => r.value === role)!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role })
      });
      if (res.ok) {
        if (role === "MAIN_ADMIN" || role === "DISTRICT_ADMIN") router.push("/admin");
        else if (role === "DRIVER") router.push("/ambulance-dashboard");
        else if (role === "DISPATCHER") router.push("/admin");
        else router.push("/user-dashboard");
      } else {
        setError("Authentication failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Back to home */}
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-xl shadow-red-500/25 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">LifeLine <span className="text-red-500">EMS</span></h1>
          <p className="text-slate-400 mt-1 text-sm">Secure Staff Authentication</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Select Your Role</label>
            <div className="space-y-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    role === r.value
                      ? r.color + " shadow-sm"
                      : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${role === r.value ? "bg-current/10" : "bg-slate-800"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={r.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.label}</div>
                    <div className="text-xs opacity-60">{r.desc}</div>
                  </div>
                  {role === r.value && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Input */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-slate-600"
                placeholder="+1 234 567 8900"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white tracking-wide transition-all ${
                loading ? "bg-slate-700 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/20"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                `Enter as ${selectedRole.label}`
              )}
            </button>
          </form>

          {/* Emergency bypass */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-600 mb-2">In an emergency? No login needed.</p>
            <Link href="/emergency" className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors">
              → Request Emergency Ambulance Directly
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
