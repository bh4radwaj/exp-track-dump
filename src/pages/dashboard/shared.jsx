import React from "react";

export function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TopBar({ title, subtitle = "Dashboard", action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{title}</h1>
      </div>
      {action && <div className="min-w-0 max-w-full">{action}</div>}
    </div>
  );
}
