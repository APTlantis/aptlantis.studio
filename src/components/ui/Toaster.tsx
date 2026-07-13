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
    <div className="fixed bottom-0 right-0 z-50 flex w-full max-w-md flex-col gap-2 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="atl-card flex animate-slideIn items-start gap-3 p-4 shadow-lg"
          style={{
            animationDuration: "300ms",
            animationFillMode: "forwards",
          }}
        >
          <div className="flex-1">
            {toast.title && (
              <h4 className="font-medium text-atl-archive">{toast.title}</h4>
            )}
            {toast.description && (
              <p className="mt-1 text-sm text-atl-silver">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-atl-frost transition-colors hover:text-atl-archive"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );

  return createPortal(toastContent, document.body);
};
