import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "../../hooks/useToast";
import { X } from "../icons";

export const Toaster = () => {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  const toastContent = (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-[#1a1a1a] border border-cyan-500/30 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slideIn"
          style={{
            animationDuration: "300ms",
            animationFillMode: "forwards",
          }}
        >
          <div className="flex-1">
            {toast.title && (
              <h4 className="font-medium text-white">{toast.title}</h4>
            )}
            {toast.description && (
              <p className="text-gray-300 text-sm mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );

  return createPortal(toastContent, document.body);
};
