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
  CalendarClock,
  UserCircle2,
  X,
  Upload,
  ClipboardList,
} from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [worker, setWorker] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔐 CHECK WORKER SESSION */
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

  /* 📦 FETCH TASKS */
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

  const handleAction = async (taskId, action) => {
    try {
      const res = await fetch(`/api/tasks/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          workerId: worker.workerId,
          action,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updated.task : t))
      );
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="animate-pulse text-lg font-medium text-slate-600">
          Loading your tasks...
        </p>
      </div>
    );
  }

  if (!worker) return null;

  const navLinks = [
    { title: "Home", icon: Home, href: "/" },
    { title: "Accepted", icon: Check, href: "/accepted" },
    { title: "Contact", icon: Phone, href: "/contact" },
    { title: "Profile", icon: User, href: "/worker/profile" },
  ];

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";
    if (status === "Accepted") return `${base} bg-green-100 text-green-800`;
    if (status === "Rejected") return `${base} bg-red-100 text-red-800`;
    return `${base} bg-yellow-100 text-yellow-800`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 p-4 sm:p-6 pb-24">
        <header className="mb-8">
          <p className="text-slate-500">Welcome back,</p>
          <h1 className="text-3xl font-bold text-slate-800">
            {worker.name || worker.workerId}
          </h1>
        </header>

        {tasks.length === 0 ? (
          <div className="text-center mt-16 flex flex-col items-center gap-4">
            <ClipboardList className="w-16 h-16 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-700">
              No tasks yet
            </h2>
            <p className="text-slate-500">
              New tasks assigned to you will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {tasks.map((task) => {
              const workerEntry = task.assignedWorkers.find(
                (w) => w.workerId === worker.workerId
              );

              return (
                <li
                  key={task._id}
                  className="bg-white rounded-2xl shadow-sm border"
                >
                  <div className="p-4 flex justify-between border-b">
                    <h2 className="font-bold">{task.order_id}</h2>
                    <span className={getStatusBadge(task.status)}>
                      {task.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <Info icon={UserCircle2} value={task.customerName} />
                    <Info icon={MapPin} value={task.address} />
                    <Info icon={CalendarClock} value={`${task.date} • ${task.timeSlot}`} />

                    <div className="border-t pt-2">
                      <p className="font-semibold flex gap-2">
                        <ListChecks /> Services
                      </p>
                      {task.cart.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{i.name}</span>
                          <span>₹{i.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t">
                    {workerEntry?.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(task._id, "accept")}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(task._id, "reject")}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {workerEntry?.status === "accepted" && (
                      <Link
                        href={`/proof/${task.order_id}`}
                        className="block text-center bg-blue-600 text-white py-2 rounded-lg"
                      >
                        <Upload size={16} className="inline mr-2" />
                        Upload Proof
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t">
        <div className="grid grid-cols-4">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center py-3 ${
                  active ? "text-blue-600 font-bold" : "text-gray-500"
                }`}
              >
                <l.icon />
                <span className="text-xs">{l.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Info({ icon: Icon, value }) {
  return (
    <div className="flex gap-2 items-center text-sm text-slate-600">
      <Icon className="w-4 h-4" />
      <span>{value}</span>
    </div>
  );
}
