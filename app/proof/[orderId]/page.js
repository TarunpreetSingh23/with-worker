"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, X, Loader2, CheckCircle } from "lucide-react";

export default function UploadProof() {
  const params = useParams();
  const router = useRouter();

  const [worker, setWorker] = useState(null);
  const [orderId, setOrderId] = useState(params?.orderId || "");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  /* 🔐 CHECK WORKER COOKIE SESSION */
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
        setLoadingAuth(false);
      }
    }

    loadWorker();
  }, [router]);

  /* 🧹 CLEANUP PREVIEW */
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  /* 🔁 SYNC ORDER ID */
  useEffect(() => {
    if (params?.orderId) setOrderId(params.orderId);
  }, [params]);

  // ---------------- HANDLERS ----------------

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStatusMessage("");
      setIsError(false);
    } else {
      setImage(null);
      setImagePreview(null);
      setStatusMessage("Please select a valid image file (PNG, JPG, or WEBP).");
      setIsError(true);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
    setStatusMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setStatusMessage("Please select an image.");
      setIsError(true);
      return;
    }

    if (!orderId || !worker?.workerId) {
      setStatusMessage("Worker or Order ID is missing.");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage("");
    setIsError(false);

    const formData = new FormData();
    formData.append("workerId", worker.workerId);
    formData.append("image", image);

    try {
      const res = await fetch(`/api/proof/${orderId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setStatusMessage("Proof uploaded successfully! Redirecting...");
      setIsError(false);

      setTimeout(() => {
        router.push("/tasks");
      }, 1500);
    } catch (err) {
      setStatusMessage(`Upload error: ${err.message}`);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- RENDER ----------------

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!worker) return null;

  if (!orderId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600">Error: Missing Order ID in URL.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Submit Work Proof
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Order:{" "}
            <span className="font-mono font-semibold text-gray-700">
              {orderId}
            </span>{" "}
            | Worker:{" "}
            <span className="font-mono font-semibold text-gray-700">
              {worker.workerId}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                isError
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isError ? <X size={16} /> : <CheckCircle size={16} />}
              {statusMessage}
            </motion.div>
          )}

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Proof Image
            </label>

            {imagePreview ? (
              <div className="relative border rounded-lg p-4 bg-blue-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-56 rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center p-8 border-2 border-dashed rounded-xl"
              >
                <UploadCloud className="w-12 h-12 text-blue-500" />
                <span className="mt-3 text-sm font-medium text-blue-600">
                  Click to upload image
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !image}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:bg-blue-400"
          >
            {isLoading ? "Submitting..." : "Upload Proof"}
          </button>
        </form>
      </div>
    </div>
  );
}
