"use client";

import { useEffect, useState } from "react";
import { getSocket, connectSocket } from "@/socket/client";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Overview", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/admin/events", label: "Event Command", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  { href: "/emergency", label: "New Emergency", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

const healthColor: Record<string, string> = {
  NORMAL: "text-emerald-400",
  STRESSED: "text-yellow-400",
  CRITICAL: "text-orange-400",
  OVERLOAD: "text-red-500",
  LOADING: "text-slate-400",
};

const healthBg: Record<string, string> = {
  NORMAL: "bg-emerald-500/10 border-emerald-500/30",
  STRESSED: "bg-yellow-500/10 border-yellow-500/30",
  CRITICAL: "bg-orange-500/10 border-orange-500/30",
  OVERLOAD: "bg-red-500/10 border-red-500/30",
  LOADING: "bg-slate-500/10 border-slate-500/30",
};

const severityBadge: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  NATIONAL_EMERGENCY: "bg-red-700/30 text-red-300 border-red-700/50",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-slate-700 text-slate-300",
  QUEUED: "bg-purple-500/20 text-purple-400",
  ASSIGNED: "bg-blue-500/20 text-blue-400",
  EN_ROUTE: "bg-cyan-500/20 text-cyan-400",
  ON_SCENE: "bg-amber-500/20 text-amber-400",
  TRANSPORTING: "bg-indigo-500/20 text-indigo-400",
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ activeAmbulances: 0, ongoingDispatches: 0, systemHealth: "LOADING" });
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchAll = () => {
    fetch("/api/admin/status").then(r => r.json()).then(d => d.success && setStats(d.status));
    fetch("/api/admin/ambulances").then(r => r.json()).then(d => d.success && setAmbulances(d.ambulances));
    fetch("/api/admin/requests").then(r => r.json()).then(d => d.success && setRequests(d.requests));
  };

  useEffect(() => {
    fetchAll();

    connectSocket();
    const socket = getSocket();
    fetch("/api/socket").finally(() => {
      socket.emit("join_dispatch_operations");
      socket.emit("join_system_alerts");
      setLogs(prev => ["✅ Connected to dispatch operations feed.", ...prev]);
    });

    socket.on("emergency_created", (data: any) => {
      setLogs(prev => [`🚨 NEW EMERGENCY: ${data.pickupLocation || "Unknown Location"}`, ...prev]);
      fetchAll();
    });

    socket.on("dispatch_accepted", (data: any) => {
      setLogs(prev => [`✅ DISPATCH ACCEPTED: Ambulance ${data.ambulanceId} assigned`, ...prev]);
      fetchAll();
    });

    socket.on("ambulance_location_update", (data: any) => {
      setAmbulances(prev =>
        prev.map(amb =>
          amb.id === data.ambulanceId ? { ...amb, latitude: data.latitude, longitude: data.longitude } : amb
        )
      );
    });

    socket.on("system_alert", (data: any) => {
      setLogs(prev => [`⚠️ SYSTEM ALERT [${data.type}]: ${JSON.stringify(data.payload)}`, ...prev]);
      fetchAll();
    });

    return () => {
      socket.off("emergency_created");
      socket.off("dispatch_accepted");
      socket.off("ambulance_location_update");
      socket.off("system_alert");
    };
  }, []);

  const health = stats.systemHealth;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Admin Topbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-white">Admin Panel</span>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${healthBg[health] || healthBg.LOADING}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${health === "NORMAL" ? "bg-emerald-400" : health === "OVERLOAD" ? "bg-red-500" : "bg-yellow-400"}`} />
          <span className={healthColor[health]}>{health}</span>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">System Health</p>
            <p className={`text-2xl font-black ${healthColor[health]}`}>{health}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Active Units</p>
            <p className="text-2xl font-black text-blue-400">{stats.activeAmbulances}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Live Dispatches</p>
            <p className="text-2xl font-black text-orange-400">{stats.ongoingDispatches}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Fleet</p>
            <p className="text-2xl font-black text-slate-200">{ambulances.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Fleet Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Fleet Status</h2>
                <button onClick={fetchAll} className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all">
                  Refresh
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ambulances.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">
                    No ambulances registered in the fleet
                  </div>
                ) : ambulances.map(amb => (
                  <div key={amb.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${amb.status === "AVAILABLE" ? "bg-emerald-400" : amb.status === "EN_ROUTE" ? "bg-blue-400 animate-pulse" : "bg-slate-600"}`} />
                      <div>
                        <span className="font-bold text-white text-sm">{amb.vehicleNumber}</span>
                        <span className="ml-2 text-xs text-slate-500">{amb.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">
                        {amb.latitude ? `${amb.latitude.toFixed(4)}, ${amb.longitude?.toFixed(4)}` : "No GPS"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${amb.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                        {amb.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Requests Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Active Requests
                <span className="ml-2 text-xs font-normal text-slate-500">({requests.length} live)</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="pb-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Patient / Location</th>
                      <th className="pb-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Severity</th>
                      <th className="pb-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="text-slate-200 font-medium">{req.patientName || "Unknown"}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{req.pickupLocation}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${severityBadge[req.severity] || "bg-slate-700 text-slate-400"}`}>
                            {req.severity}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusBadge[req.status] || "bg-slate-700 text-slate-300"}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 text-blue-400 font-mono text-xs">
                          {req.dispatchAssignments?.[0]?.ambulance?.vehicleNumber || "—"}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-600 text-sm">No active requests</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 1/3 — Live Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Feed
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[600px] pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">Waiting for events...</div>
              ) : logs.map((log, i) => (
                <div key={i} className="text-xs p-2.5 bg-slate-950 border border-slate-800/60 rounded-lg">
                  <p className="text-slate-400 leading-relaxed">{log}</p>
                </div>
              ))}
            </div>
            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <Link href="/admin/events"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Declare Emergency Event
              </Link>
              <Link href="/"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
