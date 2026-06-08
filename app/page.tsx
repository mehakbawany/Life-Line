export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 drop-shadow-sm">
          Emergency Ambulance Dispatch
        </h1>
        <p className="text-xl text-slate-300 font-medium">
          System is running successfully!
        </p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:scale-105 hover:border-red-500/50">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Next.js App Router</h3>
            <p className="text-sm text-slate-400 mt-2">Server components & fast routing</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:scale-105 hover:border-red-500/50">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Prisma + MongoDB</h3>
            <p className="text-sm text-slate-400 mt-2">Connected and configured</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:scale-105 hover:border-red-500/50">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Socket.io</h3>
            <p className="text-sm text-slate-400 mt-2">Real-time updates ready</p>
          </div>
        </div>
      </div>
    </main>
  );
}
