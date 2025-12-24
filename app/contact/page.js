"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronsRight,
} from "lucide-react";

// 🔹 Mock session for testing — replace with:  import { useSession } from "next-auth/react"
// const useSession = () => ({
//   data: {
//     user: { name: "Ravi Kumar", email: "ravi.k@provider.com", workerId: "WK-78C4F" },
//   },
//   status: "authenticated",
// });
import { useSession } from "next-auth/react";
export default function WorkerContactPage() {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    workerId: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const brandBlue = "#002366";

  // ✅ Ensure workerId is set AFTER session is ready
  useEffect(() => {
    if (status === "authenticated" && session?.user?.workerId) {
      setForm((prev) => ({ ...prev, workerId: session.user.workerId }));
    }
  }, [status, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject || !form.message) {
      setResponse({
        type: "error",
        message: "Please select a subject and write a message.",
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (res.ok) {
        setResponse({ type: "success", message: result.message });
        setForm((prev) => ({ ...prev, subject: "", message: "" }));
      } else {
        setResponse({
          type: "error",
          message: result.message || "Something went wrong.",
        });
      }
    } catch (error) {
      setResponse({ type: "error", message: "Server error. Try again later." });
    }

    setLoading(false);
  };

  // 🧠 Debug helper (optional)
  useEffect(() => {
    console.log("Session data:", session);
    console.log("Worker ID from session:", session?.user?.workerId);
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-300 flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-5rem] right-[-5rem] w-[20rem] h-[20rem] bg-blue-900/40 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-[-10rem] left-[-10rem] w-[25rem] h-[25rem]"
          style={{
            backgroundColor: `${brandBlue}50`,
            borderRadius: "9999px",
            filter: "blur(100px)",
          }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-gray-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Contact Admin</h1>
            <p className="text-gray-400 mt-2">
              Have a question or need support? Reach out to us.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Worker ID */}
            <div>
              <label
                htmlFor="workerId"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Worker ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  id="workerId"
                  name="workerId"
                  value={form.workerId || "Loading..."}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Subject
              </label>
              <div className="relative">
                <ChevronsRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>
                    Select a reason...
                  </option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Booking Problem">Booking Problem</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Account Help">Account Help</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-500" />
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder="Please describe your issue in detail..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Response Message */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                    response.type === "success"
                      ? "bg-emerald-900/50 text-emerald-300"
                      : "bg-red-900/50 text-red-300"
                  }`}
                >
                  {response.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{response.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !form.workerId}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
              style={{ backgroundColor: brandBlue }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
