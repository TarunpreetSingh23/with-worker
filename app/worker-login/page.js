"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkerLogin() {
  const router = useRouter();
  const [workerId, setWorkerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!workerId) {
      setError("Enter Worker ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/worker/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white px-6">
      <div className="bg-[#111827] p-8 rounded-3xl w-full max-w-sm border border-white/10">
        <h1 className="text-2xl font-black mb-6 text-center">
          Worker Login
        </h1>

        <input
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          placeholder="Enter Worker ID"
          className="w-full px-4 py-4 rounded-xl bg-[#030712] border border-white/10 outline-none mb-4 text-center font-bold tracking-widest"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase text-xs tracking-widest"
        >
          {loading ? "Verifying..." : "Login"}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center mt-4 font-bold">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
