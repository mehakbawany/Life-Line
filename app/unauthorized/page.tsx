import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-black text-slate-800">403</div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-slate-400">You don't have the required role to view this page. Please log in with the correct account.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all">
            Go to Login
          </Link>
          <Link href="/" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
