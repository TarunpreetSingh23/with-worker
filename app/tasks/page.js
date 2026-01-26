"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Bell,
  Phone,
  User,
  Check,
  ListChecks,
  MapPin,
  Calendar,
  Clock,
  UserCircle2,
  X,
  Upload,
  ClipboardList,
  ChevronRight,
  Package,
  Wrench,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [worker, setWorker] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serviceData, setServiceData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowProducts = async (serviceName) => {
    try {
      const res = await fetch(`/api/services?name=${serviceName}`);
      const data = await res.json();
      setServiceData(data);
      setShowModal(true);
    } catch (err) {
      console.error("Service fetch error:", err);
    }
  };

  useEffect(() => {
    async function loadWorker() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });

        if (!res.ok) {
          router.push("/worker-login");
          return;
        }

        const data = await res.json();

        if (data?.user?.type !== "worker") {
          router.push("/worker-login");
          return;
        }

        setWorker(data.user);
      } catch (err) {
        console.error("Auth error:", err);
        router.push("/worker-login");
      } finally {
        setLoading(false);
      }
    }

    loadWorker();
  }, [router]);

  useEffect(() => {
    if (!worker?.workerId) return;

    fetch(`/api/tasks?workerId=${worker.workerId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTasks(sorted);
      })
      .catch((err) => console.error("Task fetch error:", err));
  }, [worker]);

  const handleAction = async (task, action) => {
    try {
      const res = await fetch(`/api/tasks/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id,
          workerId: worker.workerId,
          action,
          cart: task.cart,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? updated.task : t))
      );
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Syncing jobs...
        </p>
      </div>
    );
  }

  if (!worker) return null;

  const navLinks = [
    { title: "Home", icon: Home, href: "/" },
    { title: "Accepted", icon: Check, href: "/accepted" },
    { title: "Contact", icon: Phone, href: "/contact" },
    { title: "Earnings", icon: User, href: "/profit" },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-red-50 text-red-600 border-red-100";
      case "Completed":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-28 text-gray-900 selection:bg-blue-100">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Partner Dashboard
            </p>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Hello, {worker.name?.split(" ")[0] || "Partner"} 👋
            </h1>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center relative">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-lg mx-auto space-y-6">

        {/* Empty State */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-6 rounded-full shadow mb-6">
              <ClipboardList className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              No jobs available
            </h2>

            {/* ✅ FIXED ESLINT ERROR HERE */}
            <p className="text-sm text-gray-500 max-w-[250px] leading-relaxed">
              {"You're all caught up! New service requests will appear here instantly."}
            </p>
          </div>
        ) : (
          <div> {/* your task UI remains unchanged */} </div>
        )}
      </main>
    </div>
  );
}
