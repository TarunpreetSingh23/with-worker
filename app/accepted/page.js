"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function TasksPage() {
  const router = useRouter();

  const [worker, setWorker] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState("");
  const [otpTaskId, setOtpTaskId] = useState(null);

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
  useEffect(() => {
    if (!worker?.workerId) return;
    fetch(`/api/tasks?workerId=${worker.workerId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setTasks);
  }, [worker]);

  const acceptedTasks = useMemo(() => {
    if (!worker) return [];
    return tasks.filter((t) =>
      t.assignedWorkers.some(
        (w) => w.workerId === worker.workerId && w.status === "accepted"
      )
    );
  }, [tasks, worker]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (!worker) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Tasks</h1>

      {acceptedTasks.map((task) => (
        <div key={task._id} className="bg-white p-4 rounded shadow">
          <h2 className="font-bold">{task.order_id}</h2>
          <p>
            Status: <b>{task.status}</b>
          </p>

          {/* ✅ ACCEPTED → REQUEST OTP */}
          {task.status === "accepted" &&
            !task.serviceOtp?.verified && (
              <div className="mt-3 space-y-2">
                {!task.is_requested ? (
                  <button
                    onClick={async () => {
                      await fetch("/api/tasks/request-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ taskId: task._id }),
                      });
                      window.location.reload();
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Request OTP
                  </button>
                ) : (
                  <>
                    <input
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter OTP"
                      className="border px-3 py-2 rounded w-full"
                    />
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/tasks/verify-otp", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderId: task.order_id,
                            otp: otpInput,
                          }),
                        });

                        if (res.ok) window.location.reload();
                        else alert("Invalid OTP");
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Verify OTP
                    </button>
                  </>
                )}
              </div>
            )}

          {/* ✅ IN PROGRESS → COMPLETE */}
          {task.status === "In Progress" && (
            <button
              onClick={async () => {
                await fetch("/api/tasks/complete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: task.order_id, }),
                });
                window.location.reload();
              }}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Mark Completed
            </button>
          )}

          {/* ✅ COMPLETED */}
          {task.status === "Completed" && (
            <Link
              href={`/proof/${task.order_id}`}
              className="inline-block mt-3 bg-emerald-600 text-white px-4 py-2 rounded"
            >
              Upload Proof
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
