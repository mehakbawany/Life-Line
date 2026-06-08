"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSocket, connectSocket } from "@/socket/client";
import Link from "next/link";

function DashboardContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  
  const [status, setStatus] = useState("Pending");
  const [ambulanceId, setAmbulanceId] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!requestId) return;

    connectSocket();
    const socket = getSocket();

    // Wake up Next.js socket API
    fetch("/api/socket").finally(() => {
      socket.emit("join_request_room", requestId);
      setLogs(prev => [...prev, `Joined tracking room for request: ${requestId}`]);
    });

    const onDispatchSent = (data: any) => {
      setStatus("Ambulance Assigned");
      setAmbulanceId(data.ambulanceId);
      setLogs(prev => [...prev, `Ambulance ${data.ambulanceId} has been dispatched!`]);
    };

    const onDispatchAccepted = (data: any) => {
      setStatus("Ambulance En Route");
      setLogs(prev => [...prev, `Driver accepted! Ambulance ${data.ambulanceId} is on the way.`]);
    };

    socket.on("dispatch_sent", onDispatchSent);
    socket.on("dispatch_accepted", onDispatchAccepted);

    return () => {
      socket.off("dispatch_sent", onDispatchSent);
      socket.off("dispatch_accepted", onDispatchAccepted);
    };
  }, [requestId]);

  if (!requestId) {
    return (
      <div className="w-full max-w-lg text-center space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Request</h2>
          <p className="text-slate-400 text-sm mb-6">You haven't created an emergency request yet, or your session expired.</p>
          <Link href="/emergency" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Request Emergency Ambulance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Live Tracking</h2>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium">
          Status: {status}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Activity Log</h3>
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 h-64 overflow-y-auto space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start space-x-3 text-sm">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
              <p className="text-slate-300">{log}</p>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-slate-500 text-sm italic">Waiting for updates...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
      </div>
      <Suspense fallback={<div className="text-white">Loading dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
