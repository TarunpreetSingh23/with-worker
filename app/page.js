"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Star,
  Check,
  Briefcase,
  Clock,
  LogOut,
  Phone,
  User,
  Power,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function WorkerHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  /* 🔐 FETCH WORKER FROM DB */
  useEffect(() => {
    async function fetchWorker() {
      try {
        const res = await fetch("/api/worker/profile", { cache: "no-store" });
        if (!res.ok) {
          router.push("/worker-login");
          return;
        }
        const data = await res.json();
        setWorker(data.worker);
        setLoading(false);
      } catch {
        router.push("/worker-login");
      }
    }
    fetchWorker();
  }, [router]);

  /* 🔁 TOGGLE AVAILABILITY */
  const toggleAvailability = async () => {
    if (!worker) return;

    const newStatus =
      worker.availability === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";

    try {
      setUpdatingStatus(true);

      const res = await fetch("/api/worker/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: newStatus }),
      });

      if (!res.ok) throw new Error();

      setWorker((prev) => ({ ...prev, availability: newStatus }));
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* 🚪 LOGOUT */
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/worker-login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-blue-600">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOnline = worker.availability === "AVAILABLE";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* BACKGROUND DECOR */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-100/50 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-indigo-50/50 blur-[80px] rounded-full" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex justify-between items-center px-6 py-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">
            WORKER<span className="text-blue-600">PRO</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-500" />
            Verified ID: {worker.workerId}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 shadow-sm active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 px-6 space-y-6">
        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{worker.name}</h2>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.15em] mt-1 italic">
                {worker.role === "CL" ? "Cleaning Specialist" : "Service Professional"}
              </p>
            </div>

            {/* ONLINE / OFFLINE TOGGLE */}
            <button
              disabled={updatingStatus}
              onClick={toggleAvailability}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95
                ${
                  isOnline
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }
              `}
            >
              <Power size={12} />
              {isOnline ? "Online" : "Offline"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8">
            <Stat icon={<Star size={18} />} label="Rating" value="4.7" color="text-amber-500" />
            <Stat icon={<Briefcase size={18} />} label="Exp" value="7 Yrs" color="text-blue-500" />
            <Stat
              icon={<Clock size={18} />}
              label="Availability"
              value={isOnline ? "Active" : "Quiet"}
              color="text-indigo-500"
            />
          </div>
        </motion.div>

        {/* CTA CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#030712] rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 relative overflow-hidden group"
        >
          {/* Abstract background shape */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-600/20 blur-[50px] rounded-full group-hover:scale-125 transition-transform duration-700" />
          
          <h3 className="text-xl font-black text-white mb-2 leading-tight">Earnings are live.</h3>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            Requests are peaking in your area. Go online to start receiving work.
          </p>

          <Link
            href="/tasks"
            className="flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-black/10"
          >
            View Live Tasks <ChevronRight size={14} />
          </Link>
        </motion.div>
      </main>

      {/* NAVIGATION */}
      <nav className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-5 z-20">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <NavItem href="/accepted" icon={Check} label="Accepted" />
          <NavItem href="/tasks" icon={Briefcase} label="Tasks" />
          <NavItem href="/contact" icon={Phone} label="Help" />
          <NavItem href="/profit" icon={User} label="Settings" />
        </div>
      </nav>
    </div>
  );
}

/* UI COMPONENTS */
function Stat({ icon, label, value, color }) {
  return (
    <div className="bg-slate-50/50 rounded-3xl p-4 text-center border border-slate-100 transition-colors hover:bg-white">
      <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="font-black text-sm text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors group">
      <div className="p-1 rounded-lg group-active:scale-90 transition-transform">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </Link>
  );
}