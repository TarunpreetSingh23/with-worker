"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react"; // Added useMemo for efficiency
import Link from "next/link";
import { Home, Bell, Phone, User ,ListChecks,} from "lucide-react";

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/worker-login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.workerId) {
      fetch(`/api/tasks?workerId=${session.user.workerId}`)
        .then((res) => res.json())
        .then((data) => {
          // Sort the tasks array to show the most recent first
          const sortedTasks = data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt) // 'b - a' for descending (newest first)
          );
          setTasks(sortedTasks);
        })
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [session]);

  const handleAction = async (taskId, action) => {
    try {
      const res = await fetch(`/api/tasks/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, workerId: session.user.workerId, action }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updated.task : t))
        );
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };
  
  // ✅ FIX: Filter the tasks to show only those the current worker has accepted
  const acceptedTasks = useMemo(() => {
    if (!session?.user?.workerId) return [];
    const currentWorkerId = session.user.workerId;

    return tasks.filter(task => {
      const workerEntry = task.assignedWorkers.find(
        (w) => w.workerId === currentWorkerId
      );
      
      // We only want to display tasks where the worker's personal status is 'accepted'
      return workerEntry?.status?.toLowerCase() === 'accepted';
    });
  }, [tasks, session]);


  // ------------------------------------------
  // Handling Task Invitation State (Pending/Rejected)
  // This section is now used for the "inbox" of tasks requiring a response, 
  // but we'll still keep the functionality for now, just filtering the main display.

  const pendingOrRejectedTasks = useMemo(() => {
    if (!session?.user?.workerId) return [];
    const currentWorkerId = session.user.workerId;

    return tasks.filter(task => {
        const workerEntry = task.assignedWorkers.find(
          (w) => w.workerId === currentWorkerId
        );
        // Includes pending invites and rejected tasks for a complete "inbox" view if needed later
        const status = workerEntry?.status?.toLowerCase();
        return status === 'pending' || status === 'rejected'; 
    });
  }, [tasks, session]);
  // ------------------------------------------


  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="animate-pulse">Loading tasks...</p>
      </div>
    );
  }

  if (!session) return null;

  const navLinks = [
    { title: "Home", icon: Home, href: "/" },
    { title: "Tasks", icon: ListChecks, href: "/tasks" },
    { title: "Contact", icon: Phone, href: "/contact" },
    { title: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 p-6 pb-24">
        {/* Main List Title: Focus on Accepted/Actionable Tasks */}
        <h1 className="text-3xl font-bold mb-6">My Accepted Tasks ({acceptedTasks.length})</h1>

        {acceptedTasks.length === 0 ? (
          <p className="text-gray-500 italic">No accepted tasks found. Check your pending invites!</p>
        ) : (
          <ul className="space-y-6">
            {acceptedTasks.map((task) => {
              const workerEntry = task.assignedWorkers.find(
                (w) => w.workerId === session.user.workerId
              );

              return (
                <li
                  key={task._id}
                  className="p-6 bg-white rounded-xl shadow hover:shadow-md transition"
                >
                  {/* Task Details Display (Simplified) */}
                  <h2 className="text-xl font-semibold mb-2 text-blue-600">{task.order_id}</h2>
                  <p className="text-gray-700">
                    <strong>Customer:</strong> {task.customerName} ({task.phone})
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> {task.address}, {task.pincode}
                  </p>
                  <p className="text-gray-700">
                    <strong>Date:</strong> {task.date} | <strong>Time:</strong> {task.timeSlot}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <strong>Payment:</strong> {task.paymentMethod}
                  </p>
                  <p className="text-gray-700">
                    <strong>Status:</strong>{" "}
                    <span className="font-medium text-green-600">
                      {task.status}
                    </span>
                  </p>

                  <div className="mt-3">
                    <strong>Services:</strong>
                    <ul className="list-disc list-inside text-gray-700">
                      {task.cart.map((item, idx) => (
                        <li key={idx}>
                          {item.name} - ₹{item.price} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Section (Simplified to only show Upload Proof for Accepted) */}
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-green-600 font-semibold">
                      You accepted this order. Time to work!
                    </p>
                    <Link
                      href={`/proof/${task.order_id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-max transition shadow-md"
                    >
                      Upload Proof
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        
        {/* --- Pending/Rejected Inbox (Optional but useful for visibility) --- */}
        {pendingOrRejectedTasks.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-300">
                <h2 className="text-2xl font-bold mb-4 text-gray-700">Pending Invites & Rejected Tasks ({pendingOrRejectedTasks.length})</h2>
                <ul className="space-y-4">
                    {pendingOrRejectedTasks.map(task => {
                        const workerEntry = task.assignedWorkers.find(w => w.workerId === session.user.workerId);
                        const workerStatus = workerEntry.status.toLowerCase();

                        return (
                            <li key={task._id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                                <p className="font-semibold">{task.order_id}</p>
                                <p className="text-sm text-gray-600">Scheduled: {task.date} at {task.timeSlot}</p>
                                
                                {workerStatus === "pending" && (
                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={() => handleAction(task._id, "accept")}
                                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(task._id, "reject")}
                                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {workerStatus === "rejected" && (
                                    <p className="mt-2 text-sm text-red-500 font-medium">You rejected this order.</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 text-center py-3">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="flex flex-col items-center text-gray-600 hover:text-blue-500 transition"
            >
              <link.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{link.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}