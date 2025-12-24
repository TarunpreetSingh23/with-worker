"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/worker-login");
      return;
    }

    (async () => {
      const res = await fetch("/api/worker/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    })();
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        My Tasks ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t._id} className="p-4 bg-white rounded-lg shadow">
              <div className="font-semibold">{t.orderId}</div>
              <div className="text-sm text-gray-600">
                {t.customerName || "Customer"}
              </div>
              <div className="text-indigo-600 font-medium mt-2">
                {t.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
