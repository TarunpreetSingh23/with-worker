"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Star, Check, Briefcase, 
  LogOut, Phone, Power, ChevronRight, 
  Wallet, Bell, Zap
} from "lucide-react";
import Link from "next/link";

export default function WorkerHome() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchWorker() {
      try {
        const res = await fetch("/api/worker/profile", { cache: "no-store" });
        if (!res.ok) { router.push("/worker-login"); return; }
        const data = await res.json();
        setWorker(data.worker);
        setLoading(false);
      } catch { router.push("/worker-login"); }
    }
    fetchWorker();
  }, [router]);

  const toggleAvailability = async () => {
    if (!worker || updatingStatus) return;
    const newStatus = worker.availability === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
    try {
      setUpdatingStatus(true);
      const res = await fetch("/api/worker/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: newStatus }),
      });
      if (res.ok) setWorker((prev) => ({ ...prev, availability: newStatus }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const isOnline = worker.availability === "AVAILABLE";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-x-hidden">
      
      {/* TOP BAR */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
            W
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">Worker<span className="text-blue-600">Pro</span></h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 flex items-center gap-1">
              <ShieldCheck size={10} className="text-emerald-500" /> ID: {worker.workerId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            {/* <button className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm relative text-slate-600">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button> */}
            <button onClick={() => fetch("/api/logout", {method: "POST"}).then(() => router.push("/worker-login"))} className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400">
                <LogOut size={18} />
            </button>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-5 pb-24">
        
        {/* AVAILABILITY CARD */}
        <div className={`p-1 rounded-[2rem] transition-all duration-500 shadow-inner ${isOnline ? 'bg-emerald-500/10' : 'bg-slate-200/50'}`}>
            <div className="bg-white rounded-[1.8rem] p-5 shadow-sm border border-white/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`relative flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-500 ${isOnline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                        <Power size={20} />
                        {isOnline && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">{isOnline ? "You are Online" : "You are Offline"}</h2>
                        <p className="text-xs text-slate-400">{isOnline ? "Ready to receive tasks" : "Tap to start working"}</p>
                    </div>
                </div>
                <button 
                    disabled={updatingStatus}
                    onClick={toggleAvailability}
                    className={`h-8 w-14 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                    <motion.div 
                        animate={{ x: isOnline ? 24 : 0 }}
                        className="h-6 w-6 bg-white rounded-full shadow-md"
                    />
                </button>
            </div>
        </div>

        {/* WORKER STATS */}
        <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Wallet className="text-blue-600" />} label="Earnings" value={`₹${worker.earning || 0}`} sub="This week" />
            <StatCard icon={<Star className="text-amber-500" />} label="Rating" value={worker.rating?.average?.toFixed(1) || "4.7"} sub="Top 5%" />
        </div>

        {/* ACTION CARD */}
        <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/20"
        >
            <Zap className="absolute right-[-10px] top-[-10px] h-32 w-32 text-white/5 rotate-12" />
            <div className="relative z-10">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Demand High</span>
                <h3 className="text-xl font-bold mt-4 mb-1">New Tasks Nearby</h3>
                <p className="text-slate-400 text-xs mb-6">There are 8 tasks available in your 5km radius.</p>
                <Link href="/tasks" className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    Start Earning <ChevronRight size={16} />
                </Link>
            </div>
        </motion.div>

      </main>

      {/* NAV BAR */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50">
          <NavIcon href="/worker-home" icon={Briefcase} label="Home" active={pathname === '/worker-home'} />
          <NavIcon href="/tasks" icon={Zap} label="Tasks" active={pathname === '/tasks'} />
          <NavIcon href="/accepted" icon={Check} label="Active" active={pathname === '/accepted'} />
          <NavIcon href="/contact" icon={Phone} label="Help" active={pathname === '/contact'} />
      </nav>
    </div>
  );
}

/* SUB-COMPONENTS */

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm">
            <div className="bg-slate-50 h-10 w-10 rounded-xl flex items-center justify-center mb-4">
                {icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
            <p className="text-xl font-black text-slate-900">{value}</p>
            <p className="text-[9px] text-emerald-500 font-bold mt-1">{sub}</p>
        </div>
    )
}

function NavIcon({ href, icon: Icon, label, active }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
      <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[9px] font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </Link>
  );
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-lg" />
            </div>
            <div className="h-32 w-full bg-slate-200 animate-pulse rounded-[2rem]" />
            <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-slate-200 animate-pulse rounded-[1.8rem]" />
                <div className="h-32 bg-slate-200 animate-pulse rounded-[1.8rem]" />
            </div>
            <div className="h-48 w-full bg-slate-200 animate-pulse rounded-[2rem]" />
        </div>
    )
}