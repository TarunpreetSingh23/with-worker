// app/proof/[orderId]/page.js
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter for optional redirection
import { motion } from "framer-motion"; // Assuming you have framer-motion installed
import { UploadCloud, X, Loader2, CheckCircle } from "lucide-react"; 

export default function UploadProof() {
  const { data: session, status } = useSession();
  const params = useParams(); 
  const router = useRouter(); 
  
  // --- STATE ---
  // Initialize from session and params
  const [workerId, setWorkerId] = useState(session?.user?.workerId || "");
  const [orderId, setOrderId] = useState(params?.orderId || ""); 

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECTS ---
  // 1. Cleanup image preview URL
  useEffect(() => {
    return () => { 
      if (imagePreview) URL.revokeObjectURL(imagePreview); 
    };
  }, [imagePreview]);
  
  // 2. Sync session/params to state
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.workerId) {
      setWorkerId(session.user.workerId);
    }
    if (params?.orderId) {
      setOrderId(params.orderId);
    }
  }, [status, session, params]);


  // --- HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
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
    if (!image) return setStatusMessage("Please select an image."), setIsError(true);
    if (!orderId || !workerId) return setStatusMessage("Worker/Order ID is missing."), setIsError(true);

    setIsLoading(true);
    setStatusMessage("");
    setIsError(false);

    const formData = new FormData();
    formData.append("workerId", workerId);
    formData.append("image", image);
    
    try {
      // Correct POST request to the API route handler
      const res = await fetch(`/api/proof/${orderId}`, { 
        method: "POST", 
        body: formData 
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed. Check console for details.");

      setStatusMessage("Proof uploaded successfully! Redirecting...");
      setIsError(false);
      
      // Optional: Redirect back to task list after a delay
      setTimeout(() => {
          router.push('/tasks'); 
      }, 1500); 

    } catch (err) {
      setStatusMessage(err.message.includes('Upload failed.') ? err.message : `Upload error: ${err.message}`);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- RENDERING ---

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user?.workerId) {
    // If not authenticated, redirect the worker to the login page
    router.push('/worker-login');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600">Redirecting to login...</p>
      </div>
    );
  }
  
  if (!orderId) {
       return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
           <p className="text-red-600">Error: Missing Order ID in URL.</p>
        </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Submit Work Proof</h1>
          <p className="mt-2 text-sm text-gray-500">
            Order: <span className="font-mono text-gray-700 font-semibold">{orderId}</span> | 
            Worker ID: <span className="font-mono text-gray-700 font-semibold">{workerId}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Status Message */}
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}
            >
              {isError ? <X size={16} /> : <CheckCircle size={16} />}
              {statusMessage}
            </motion.div>
          )}

          {/* Hidden fields ensure data is always passed in formData */}
          <div className="space-y-4 hidden"> 
            <input id="workerId" type="hidden" value={workerId} readOnly />
            <input id="orderId" type="hidden" value={orderId} readOnly />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Proof Image (Required)</label>
            {imagePreview ? (
              <div className="relative border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                <img src={imagePreview} alt="Preview" className="mx-auto max-h-56 w-auto rounded-md shadow-md" />
                <button type="button" onClick={removeImage} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label htmlFor="file-upload" className="relative cursor-pointer flex flex-col items-center p-8 border-2 border-dashed rounded-xl hover:border-blue-600 transition bg-white/70">
                <UploadCloud className="w-12 h-12 text-blue-500" />
                <span className="mt-3 text-sm font-medium text-blue-600">Click to upload image</span>
                <span className="text-xs text-gray-500 mt-1">JPEG, PNG, or WEBP only</span>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileChange} 
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !image || !orderId || !workerId} 
            className="w-full px-4 py-3 flex items-center justify-center gap-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Upload Proof"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}