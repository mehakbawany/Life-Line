"use client";

import { useEffect, useState } from "react";
import { getSocket, connectSocket } from "@/socket/client";
import Link from "next/link";

interface EventAssignment {
  id: string;
  ambulance: {
    vehicleNumber: string;
    status: string;
  };
}

interface EMSEvent {
  id: string;
  title: string;
  severity: string;
  status: string;
  location: string;
  estimatedVictims: number;
  maxAmbulanceCapacity: number;
  eventAssignments: EventAssignment[];
}

export default function EventCommandCenter() {
  const [events, setEvents] = useState<EMSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FIRE",
    location: "",
    severity: "CRITICAL",
    estimatedVictims: "10",
    maxAmbulanceCapacity: "5"
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events/list");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    connectSocket();
    const socket = getSocket();
    socket.emit("join_system_alerts");

    const onSystemAlert = (data: any) => {
      if (data.type === "MASS_ESCALATION") {
        fetchEvents();
      }
    };

    socket.on("system_alert", onSystemAlert);

    return () => {
      socket.off("system_alert", onSystemAlert);
    };
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: "", description: "", type: "FIRE", location: "", severity: "CRITICAL", estimatedVictims: "10", maxAmbulanceCapacity: "5" });
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Admin Topbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Admin Overview
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-sm text-white font-semibold">Event Command Center</span>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-500">Event Command Center</h1>
            <p className="text-slate-400 mt-1">Declare and manage mass casualty incidents in real-time.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {events.length} Active Event{events.length !== 1 ? "s" : ""}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Launch Event Form */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-white">Declare New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="e.g. Mall Fire"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
                  <select 
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="NATIONAL_EMERGENCY">National Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Max Ambulances</label>
                  <input 
                    type="number" 
                    value={formData.maxAmbulanceCapacity}
                    onChange={(e) => setFormData({...formData, maxAmbulanceCapacity: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors mt-4"
              >
                LAUNCH EMERGENCY EVENT
              </button>
            </form>
          </div>

          {/* Active Events Feed */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center justify-between">
              <span>Active Deployments</span>
              <span className="bg-red-500/10 text-red-400 text-xs px-3 py-1 rounded-full border border-red-500/20">
                {events.length} Live
              </span>
            </h2>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-slate-500 py-8">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center text-slate-500 py-8 border border-dashed border-slate-700 rounded-lg">
                  No active events
                </div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="bg-slate-900 rounded-lg p-5 border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                        <p className="text-sm text-slate-400">{ev.location}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-900/30 text-red-400 text-xs font-medium rounded border border-red-800/50">
                        {ev.severity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 py-3 border-t border-slate-800">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Status</div>
                        <div className="text-sm font-medium text-emerald-400">{ev.status}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Est. Victims</div>
                        <div className="text-sm font-medium text-white">{ev.estimatedVictims}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Units Deployed</div>
                        <div className="text-sm font-medium text-white">
                          {ev.eventAssignments?.length || 0} / {ev.maxAmbulanceCapacity}
                        </div>
                      </div>
                    </div>

                    {/* Assigned Units Pill List */}
                    {ev.eventAssignments && ev.eventAssignments.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {ev.eventAssignments.map(assignment => (
                          <span key={assignment.id} className="text-xs bg-blue-900/30 text-blue-300 border border-blue-800/50 px-2 py-1 rounded">
                            {assignment.ambulance.vehicleNumber} ({assignment.ambulance.status})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
