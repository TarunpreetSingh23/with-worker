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

  // 👇 Product modal state
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
 console.log(tasks)
 const handleAction = async (task, action) => {
  try {
    const res = await fetch(`/api/tasks/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task._id,
        workerId: worker.workerId,
        action,
        cart: task.cart, // ✅ send cart data
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
        <p className="text-sm font-medium text-gray-500 animate-pulse">Syncing jobs...</p>
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
      case "Accepted": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-red-50 text-red-600 border-red-100";
      case "Completed": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200"; // Pending
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-28 text-gray-900 selection:bg-blue-100">
      
      {/* --- Sticky Header --- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Partner Dashboard</p>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Hello, {worker.name?.split(' ')[0] || "Partner"} 👋
            </h1>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center relative">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-lg mx-auto space-y-6">
        
        {/* --- Empty State --- */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-6 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-6">
              <ClipboardList className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No jobs available</h2>
            <p className="text-sm text-gray-500 max-w-[250px] leading-relaxed">
              You're all caught up! New service requests will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-gray-900">New Requests</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tasks.length} pending</span>
             </div>
            
            {tasks.map((task) => {
              const workerEntry = task.assignedWorkers.find(
                (w) => w.workerId === worker.workerId
              );

              return (
                <article key={task._id} className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative group transition-all hover:shadow-md">
                  
                  {/* Card Header: Status & ID */}
                  <div className="px-5 py-4 flex justify-between items-start border-b border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</span>
                      <span className="font-mono text-sm font-bold text-gray-700">#{task.order_id}</span>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Customer & Location Info */}
                  <div className="p-5 space-y-5">
                    
                    {/* Location Block */}
                    <div className="flex gap-4">
                       <div className="mt-1 h-8 w-8 shrink-0 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                          <MapPin size={16} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Service Location</p>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{task.address}</p>
                       </div>
                    </div>

                    {/* Time & Customer Block */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex gap-3 items-center">
                           <div className="h-8 w-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                              <Calendar size={16} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                              <p className="text-xs font-bold text-gray-900">{task.date}</p>
                           </div>
                        </div>
                        <div className="flex gap-3 items-center">
                           <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                              <Clock size={16} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Time</p>
                              <p className="text-xs font-bold text-gray-900">{task.timeSlot}</p>
                           </div>
                        </div>
                    </div>

                    {/* Customer Name */}
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                       <UserCircle2 size={18} className="text-gray-400" />
                       <span className="text-sm font-medium text-gray-700">{task.customerName}</span>
                    </div>

                    {/* Services List */}
                    <div className="border-t border-dashed border-gray-200 pt-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                         <ListChecks size={14} /> Service Details
                      </p>
                      <div className="space-y-3">
                        {task.cart.map((i, idx) => (
                          <div key={idx} className="flex justify-between items-center group/item">
                            <div className="flex flex-col">
                               <span className="text-sm font-semibold text-gray-800">{i.name}</span>
                               <span className="text-[10px] text-gray-400">Standard Service</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-900">₹{i.price}</span>
                              <button
                                onClick={() => handleShowProducts(i.name)}
                                className="h-7 w-7 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                                title="View Required Products"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    {workerEntry?.status === "pending" && task.status !== "Canceled" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(task, "reject")}
                          className="flex-1 py-3.5 text-sm font-bold text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(task, "accept")}
                          className="flex-[2] py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          Accept Job
                        </button>
                      </div>
                    )}

                    {/* {workerEntry?.status === "accepted" && (
                      <Link
                        href={`/products/${task.order_id}`}
                        className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Upload size={16} /> View & Upload Service Proof
                      </Link>
                    )} */}
                    
                    {/* Status Message if user responded */}
                    {workerEntry?.status === "rejected" && (
                       <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold py-2">
                          <AlertCircle size={14} /> You rejected this job
                       </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 🔥 PROFESSIONAL BOTTOM SHEET MODAL */}
      {showModal && serviceData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-md sm:rounded-2xl rounded-t-[2rem] shadow-2xl transform transition-transform animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            
            {/* Handle bar for mobile feel */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
               <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">Requirement List</span>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{serviceData.name}</h2>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                   <X size={20} className="text-gray-500" />
                 </button>
               </div>

               <div className="space-y-6">
                  {/* Products Section */}
                  <div className="space-y-3">
                     <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Package size={16} className="text-orange-500" /> Required Products
                     </h3>
                     <div className="bg-gray-50 rounded-xl p-1">
                        {serviceData.products?.length > 0 ? (
                            serviceData.products.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                                <span className="text-xs font-bold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{p.quantity} {p.unit}</span>
                              </div>
                            ))
                        ) : (
                           <p className="p-3 text-xs text-gray-400 italic">No consumables required.</p>
                        )}
                     </div>
                  </div>

                  {/* Accessories Section */}
                  <div className="space-y-3">
                     <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Wrench size={16} className="text-purple-500" /> Equipment / Tools
                     </h3>
                     <div className="bg-gray-50 rounded-xl p-1">
                        {serviceData.accessories?.length > 0 ? (
                           serviceData.accessories.map((a, idx) => (
                             <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                               <span className="text-sm font-medium text-gray-700">{a.name}</span>
                               <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${a.reusable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                 {a.reusable ? "Reusable" : "Disposable"}
                               </span>
                             </div>
                           ))
                        ) : (
                           <p className="p-3 text-xs text-gray-400 italic">No tools specified.</p>
                        )}
                     </div>
                  </div>
               </div>

               <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                     Please ensure you carry all listed equipment. Missing items may lead to penalties or job cancellation.
                  </p>
               </div>
            </div>

            <div className="p-4 border-t border-gray-100 sm:rounded-b-2xl">
               <button onClick={() => setShowModal(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">
                  Understood
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Professional Bottom Navigation --- */}
      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe z-40">
        <div className="max-w-lg mx-auto grid grid-cols-4 px-2">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center justify-center py-3 relative transition-all duration-300 group
                  ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                {active && (
                   <span className="absolute top-0 h-0.5 w-10 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.5)]"></span>
                )}
                <l.icon size={22} strokeWidth={active ? 2.5 : 2} className={`mb-1 transition-transform group-active:scale-90 ${active ? "animate-bounce-short" : ""}`} />
                <span className={`text-[10px] font-bold tracking-tight ${active ? "opacity-100" : "opacity-80"}`}>{l.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}