"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmergencyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [severity, setSeverity] = useState("HIGH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { label: "Accident", value: "HIGH" },
    { label: "Heart Attack", value: "CRITICAL" },
    { label: "Stroke", value: "CRITICAL" },
    { label: "Breathing", value: "HIGH" },
    { label: "Pregnancy", value: "HIGH" },
    { label: "Trauma", value: "HIGH" },
    { label: "Unknown", value: "MEDIUM" },
  ];

  const handleEmergency = () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number so the driver can reach you.");
      return;
    }

    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/emergency/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              severity,
              patientName: "Emergency Patient"
            })
          });

          const data = await res.json();
          if (res.ok) {
            router.push(`/user-dashboard?requestId=${data.requestId}`);
          } else {
            setError(data.error || "Failed to create emergency request");
            setLoading(false);
          }
        } catch (err) {
          setError("Network error occurred.");
          setLoading(false);
        }
      },
      (err) => {
        setError("Please allow location access to dispatch an ambulance.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold text-red-500 tracking-tight">Need Help?</h1>
          <p className="text-slate-400 text-sm">Enter your phone number and press SOS. Location is auto-detected.</p>
        </div>

        {/* Emergency Category */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Emergency Type</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSeverity(cat.value)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                  severity === cat.value && cat.label === (categories.find(c => c.value === severity)?.label)
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Your Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +1 234 567 8900"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-slate-600"
            disabled={loading}
          />
          <p className="text-xs text-slate-600 mt-1.5">Driver will use this number to reach you</p>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleEmergency}
          disabled={loading}
          className={`w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
            loading
              ? "bg-slate-800 cursor-not-allowed scale-95"
              : "bg-gradient-to-b from-red-500 to-red-700 hover:scale-105 active:scale-95 shadow-red-500/50 hover:shadow-red-500/60"
          }`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          ) : (
            <>
              <svg className="w-14 h-14 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white font-black text-2xl tracking-widest uppercase">SOS</span>
              <span className="text-red-200/70 text-xs mt-0.5">Tap to dispatch</span>
            </>
          )}
        </button>

        <p className="text-xs text-slate-600 text-center pb-2">
          No sign-up required. Emergency services will be dispatched immediately.
        </p>
      </div>
    </div>
  );
}
