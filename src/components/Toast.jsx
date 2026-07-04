import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/lib/store";

export default function Toast() {
  const { toast } = useDashboard();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="toast-pop pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6 md:justify-end md:pr-8"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white shadow-2xl shadow-zinc-900/30 dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:shadow-black/50">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
        {toast.message}
      </div>
    </div>
  );
}
