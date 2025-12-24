"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Star,
  Briefcase,
  Clock,
  LogOut,
  ListTodo,
  Phone,
  User,
  Power,
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
      <div className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOnline = worker.availability === "AVAILABLE";

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">

      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-6">
        <div>
          <h1 className="text-2xl font-black">
            WORKER<span className="text-blue-500">PRO</span>
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 uppercase">
            <ShieldCheck size={14} className="text-emerald-400" />
            ID: {worker.workerId}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* PROFILE */}
      <main className="flex-1 px-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827]/70 rounded-[2.5rem] p-6 border border-white/5"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black">{worker.name}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                {worker.role === "CL" ? "Cleaning Professional" : "Service Pro"}
              </p>
            </div>

            {/* ONLINE / OFFLINE BUTTON */}
            <button
              disabled={updatingStatus}
              onClick={toggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition
                ${
                  isOnline
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
                }
              `}
            >
              <Power size={14} />
              {isOnline ? "Online" : "Offline"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <Stat icon={<Star size={18} />} label="Rating" value="4.7" />
            <Stat icon={<Briefcase size={18} />} label="Experience" value="7 yrs" />
            <Stat
              icon={<Clock size={18} />}
              label="Status"
              value={worker.availability}
            />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8"
        >
          <h3 className="text-xl font-black mb-2">New tasks are waiting</h3>
          <p className="text-blue-100/80 text-sm mb-6">
            Go online to receive nearby service requests.
          </p>

          <Link
            href="/tasks"
            className="block text-center bg-white text-black py-4 rounded-2xl font-black uppercase text-xs"
          >
            View Tasks
          </Link>
        </motion.div>
      </main>

      {/* NAV */}
      <nav className="sticky bottom-0 bg-[#030712]/90 border-t border-white/5 px-4 py-4">
        <div className="grid grid-cols-4 max-w-lg mx-auto">
          <NavItem href="/worker-home" icon={ListTodo} label="Home" />
          <NavItem href="/tasks" icon={Briefcase} label="Tasks" />
          <NavItem href="/contact" icon={Phone} label="Support" />
          <NavItem href="/profile" icon={User} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

/* COMPONENTS */
function Stat({ icon, label, value }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 text-center">
      <div className="flex justify-center mb-2 text-blue-400">{icon}</div>
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="font-black text-lg">{value}</p>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-400">
      <Icon size={20} />
      <span className="text-[9px] font-black uppercase">{label}</span>
    </Link>
  );
}
