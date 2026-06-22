"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanFeedback } from "@/lib/scan-queue";

interface BrutalToastProps {
  toasts: ScanFeedback[];
  onDismiss: (index: number) => void;
}

export function BrutalToastContainer({ toasts, onDismiss }: BrutalToastProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col gap-2 p-4"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={`${toast.bibNumber}-${toast.timestamp.getTime()}-${index}`}
          toast={toast}
          onDismiss={() => onDismiss(index)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ScanFeedback;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon =
    toast.status === "success"
      ? CheckCircle2
      : toast.status === "warning"
        ? AlertTriangle
        : XCircle;

  return (
    <div
      className={cn(
        "animate-slide-down pointer-events-auto flex items-center gap-3 border-brutal bg-bg p-4 shadow-brutal",
        toast.status === "success" && "border-l-[6px] border-l-neo",
        toast.status === "warning" && "border-l-[6px] border-l-warning",
        toast.status === "error" && "border-l-[6px] border-l-danger"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-mono text-lg font-bold">{toast.bibNumber}</p>
        <p className="text-sm text-muted-fg">{toast.message}</p>
      </div>
    </div>
  );
}
