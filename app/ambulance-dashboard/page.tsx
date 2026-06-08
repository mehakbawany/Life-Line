"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function AmbulanceDashboardPage() {
  const [ambulanceId, setAmbulanceId] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [lat, setLat] = useState(40.7128);
  const [lng, setLng] = useState(-74.0060);
  const [updateCount, setUpdateCount] = useState(0);
  const [pendingDispatch, setPendingDispatch] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSimulation = () => {
    if (!ambulanceId.trim()) {
      alert("Please enter your Ambulance ID");
      return;
    }
    fetch("/api/socket");
    setIsSimulating(true);
    setUpdateCount(0);
    setStatusText("📡 Broadcasting location...");

    intervalRef.current = setInterval(async () => {
      const newLat = lat + (Math.random() - 0.5) * 0.001;
      const newLng = lng + (Math.random() - 0.5) * 0.001;
      setLat(newLat);
      setLng(newLng);

      try {
        await fetch("/api/ambulance/update-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ambulanceId, latitude: newLat, longitude: newLng })
        });
        setUpdateCount(c => c + 1);
        setStatusText(`📍 ${newLat.toFixed(5)}, ${newLng.toFixed(5)}`);
      } catch {
        setStatusText("❌ Location update failed");
      }
    }, 5000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setStatusText("⏹ Broadcasting stopped.");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const acceptDispatch = () => {
    setPendingDispatch(null);
    setStatusText("✅ Dispatch accepted! Navigating to patient...");
  };

  const rejectDispatch = () => {
    setPendingDispatch(null);
    setStatusText("❌ Dispatch rejected.");
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Driver Console</h1>
              <p className="text-xs text-slate-500">Ambulance Operations Panel</p>
            </div>
          </div>
        </div>

        {/* Dispatch Alert */}
        {pendingDispatch && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-red-400 font-bold text-sm uppercase tracking-widest">Incoming Dispatch!</span>
            </div>
            <p className="text-white font-medium mb-1">📍 {pendingDispatch.location || "Patient Location"}</p>
            <p className="text-slate-400 text-sm mb-4">{pendingDispatch.severity || "HIGH"} severity emergency</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={acceptDispatch} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all">
                ✓ Accept
              </button>
              <button onClick={rejectDispatch} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-xl transition-all">
                ✗ Reject
              </button>
            </div>
          </div>
        )}

        {/* Location Broadcasting */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">GPS Broadcasting</h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Ambulance ID</label>
            <input
              type="text"
              value={ambulanceId}
              onChange={e => setAmbulanceId(e.target.value)}
              placeholder="Enter your ambulance DB ID..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-600"
              disabled={isSimulating}
            />
          </div>

          {/* Status Panel */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Status</span>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isSimulating ? "text-emerald-400" : "text-slate-500"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                {isSimulating ? "Broadcasting" : "Idle"}
              </div>
            </div>
            <p className="text-sm text-slate-300 font-mono min-h-[20px]">{statusText || "Ready"}</p>
            {isSimulating && (
              <div className="flex gap-4 pt-1 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-500">Updates Sent</div>
                  <div className="text-sm font-bold text-emerald-400">{updateCount}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Coordinates</div>
                  <div className="text-xs font-mono text-slate-400">{lat.toFixed(5)}, {lng.toFixed(5)}</div>
                </div>
              </div>
            )}
          </div>

          <button
            id="broadcast-toggle"
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={`w-full py-3.5 rounded-xl font-bold tracking-wide transition-all duration-200 ${
              isSimulating
                ? "bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            }`}
          >
            {isSimulating ? "⏹ Stop Broadcasting" : "📡 Start Location Broadcasting"}
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin" className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Control Center
            </Link>
            <Link href="/admin/events" className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Active Events
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
