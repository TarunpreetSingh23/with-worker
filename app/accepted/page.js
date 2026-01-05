"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Camera
} from "lucide-react";

export default function TasksPage() {
  const router = useRouter();

  const [worker, setWorker] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Local loading state
  const [otpInput, setOtpInput] = useState("");

  /* 🔐 AUTH */
  useEffect(() => {
    async function loadWorker() {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) return router.push("/worker-login");
      const data = await res.json();
      setWorker(data.user);
      setLoading(false);
    }
    loadWorker();
  }, [router]);

  /* 📦 TASKS */
  const fetchTasks = async () => {
    if (!worker?.workerId) return;
    const r = await fetch(`/api/tasks?workerId=${worker.workerId}`, { cache: "no-store" });
    const data = await r.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [worker]);

  const acceptedTasks = useMemo(() => {
    if (!worker) return [];
    return tasks.filter((t) =>
      t.assignedWorkers.some(
        (w) => w.workerId === worker.workerId && w.status === "accepted"
      )
    );
  }, [tasks, worker]);

  // Handle action without full page reload
  const handleAction = async (id, apiPath, body) => {
    setProcessingId(id);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) await fetchTasks();
      else if (apiPath.includes("verify")) alert("Invalid OTP");
    } finally {
      setProcessingId(null);
      setOtpInput("");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-6 py-5 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">My Tasks</h1>
        <p className="text-sm text-slate-500">Manage your assigned services</p>
      </div>

      <div className="p-4 space-y-4">
        {acceptedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-3">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-600">No active tasks</p>
            <p className="text-sm text-slate-400">Accepted tasks will appear here.</p>
          </div>
        )}

        {acceptedTasks.map((task) => (
          <div key={task._id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all active:scale-[0.98]">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                  <h2 className="text-lg font-bold text-slate-800">#{task.order_id}</h2>
                </div>
                <StatusBadge status={task.status} />
              </div>

              {/* Action Section */}
              <div className="mt-6 border-t border-slate-50 pt-4">
                
                {/* ✅ ACCEPTED → REQUEST OTP */}
                {task.status === "accepted" && !task.serviceOtp?.verified && (
                  <div className="space-y-3">
                    {!task.is_requested ? (
                      <button
                        disabled={processingId === task._id}
                        onClick={() => handleAction(task._id, "/api/tasks/request-otp", { taskId: task._id })}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processingId === task._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                        Request Customer OTP
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Customer Verification</label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-bold tracking-widest focus:border-blue-500 focus:ring-0"
                          />
                          <button
                            disabled={processingId === task._id || otpInput.length < 4}
                            onClick={() => handleAction(task._id, "/api/tasks/verify-otp", { orderId: task.order_id, otp: otpInput })}
                            className="rounded-xl bg-green-600 px-6 font-bold text-white disabled:opacity-50"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ IN PROGRESS → COMPLETE */}
                {task.status === "In Progress" && (
                  <button
                    disabled={processingId === task._id}
                    onClick={() => handleAction(task._id, "/api/tasks/complete", { orderId: task.order_id })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-bold text-white shadow-lg transition-all active:bg-black disabled:opacity-50"
                  >
                    {processingId === task._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Finish & Mark Complete
                  </button>
                )}

                {/* ✅ COMPLETED */}
                {task.status === "Completed" && (
                  <Link
                    href={`/proof/${task.order_id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3.5 font-bold text-emerald-700 border border-emerald-100"
                  >
                    <Camera className="h-5 w-5" />
                    Upload Work Proof
                    <ChevronRight className="h-4 w-4 ml-auto mr-2" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    accepted: "bg-blue-50 text-blue-600 border-blue-100",
    "In Progress": "bg-amber-50 text-amber-600 border-amber-100",
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[status] || "bg-slate-50 text-slate-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full fill-current ${status === "In Progress" ? "animate-pulse" : ""}`} style={{ backgroundColor: 'currentColor' }} />
      {status}
    </div>
  );
}