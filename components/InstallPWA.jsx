"use client";

import { useEffect, useState } from "react";

let deferredPrompt;

export default function InstallPWA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt = null;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <button
      onClick={installApp}
      className="fixed bottom-4 right-4 rounded-xl bg-slate-900 px-4 py-2 text-white shadow-lg"
    >
      Install App
    </button>
  );
}
