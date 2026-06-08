import Link from "next/link";

const stats = [
  { value: "< 15s", label: "Emergency Request Time" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "3-Layer", label: "Failure Recovery" },
  { value: "Real-Time", label: "Live Tracking" },
];

const features = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "red",
    title: "Instant SOS Dispatch",
    description: "Press one button. We auto-detect your GPS and dispatch the nearest available unit in under 15 seconds."
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    color: "blue",
    title: "Live Ambulance Tracking",
    description: "Track your ambulance on a live map with real-time ETA and driver contact information."
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    color: "emerald",
    title: "Admin Control Center",
    description: "Full operational visibility. Real-time fleet status, active emergencies, and system health monitoring."
  },
  {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    color: "amber",
    title: "Mass Casualty Events",
    description: "Coordinate multi-ambulance deployments for disasters with a dedicated Event Command Center."
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    color: "purple",
    title: "State Machine Dispatch Engine",
    description: "Persistent worker loop with hard locking, cascade recovery, and city-wide reserve protection. Never collapses."
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    color: "sky",
    title: "Trust & Abuse Prevention",
    description: "Every user has a trust score that influences dispatch priority, preventing system abuse without blocking genuine emergencies."
  },
];

const colorMap: Record<string, string> = {
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const quickLinks = [
  { href: "/emergency", label: "Request Ambulance", desc: "Citizen SOS Portal", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "from-red-600 to-red-800", badge: "EMERGENCY" },
  { href: "/user-dashboard", label: "Track My Request", desc: "Live status + ETA", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", color: "from-blue-700 to-blue-900", badge: "USER" },
  { href: "/ambulance-dashboard", label: "Driver Console", desc: "Broadcast GPS location", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-emerald-700 to-emerald-900", badge: "DRIVER" },
  { href: "/admin", label: "Control Center", desc: "Admin operational view", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "from-slate-700 to-slate-900", badge: "ADMIN" },
  { href: "/admin/events", label: "Event Command", desc: "Mass casualty response", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color: "from-amber-700 to-amber-900", badge: "DISPATCHER" },
  { href: "/login", label: "Authenticate", desc: "Role-based secure login", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "from-violet-700 to-violet-900", badge: "SECURE" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">System Live · All Units Online</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Emergency Response
            <br />
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              at the Speed of Life
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            LifeLine EMS is a professional, centralized dispatch platform engineered for rapid emergency response. 
            Not a startup app — infrastructure-grade EMS coordination.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/emergency"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Request Emergency Ambulance
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Staff Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Portal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Quick Access Portal</h2>
          <p className="text-slate-400">Navigate directly to your operational area</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative bg-gradient-to-br ${link.color} border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:-translate-y-1 transition-all duration-200 shadow-xl overflow-hidden`}
            >
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{link.badge}</span>
              </div>
              <div className="bg-white/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{link.label}</h3>
              <p className="text-sm text-white/50">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Enterprise-Grade EMS Infrastructure</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Built beyond a demo app. Designed to operate under real-world disaster conditions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[feat.color]}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={feat.icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/30 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-300">LifeLine <span className="text-red-500">EMS</span></span>
          </div>
          <p className="text-xs text-slate-600">National Emergency Operating System · Hackathon Build 2026</p>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
