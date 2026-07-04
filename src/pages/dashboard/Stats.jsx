import React, { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, ChevronDown, Download, FileSpreadsheet, FileText, Receipt, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { categoryMeta, useDashboard } from "@/lib/store";
import { useCountUp, useInView } from "@/lib/useInView";
import { currency, TopBar } from "./shared";

const CIRCUMFERENCE = 2 * Math.PI * 70;

function CountValue({ value, prefix = "", suffix = "", decimals = 0 }) {
  const [ref, isInView] = useInView();
  const animated = useCountUp(value, isInView, 1000);
  return (
    <span ref={ref}>
      {prefix}
      {animated.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

function DonutChart({ segments, total }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 80);
    return () => clearTimeout(t);
  }, []);

  let cumulative = 0;

  return (
    <svg viewBox="0 0 180 180" className="mx-auto h-48 w-48 -rotate-90">
      <circle cx="90" cy="90" r="70" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="22" />
      {segments.map((segment) => {
        const fraction = total > 0 ? segment.amount / total : 0;
        const dash = fraction * CIRCUMFERENCE;
        const offset = CIRCUMFERENCE - cumulative;
        cumulative += dash;
        return (
          <circle
            key={segment.category}
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke={segment.hex}
            strokeWidth="22"
            strokeLinecap="butt"
            strokeDasharray={`${drawn ? dash : 0} ${CIRCUMFERENCE - (drawn ? dash : 0)}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)" }}
          />
        );
      })}
    </svg>
  );
}

function MonthlyBars({ months, max }) {
  return (
    <div className="flex h-40 items-end justify-between gap-2 sm:gap-3">
      {months.map((month, i) => (
        <div key={month.key} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end justify-center">
            <div
              className="stat-bar-grow w-full max-w-8 rounded-t-md bg-gradient-to-t from-zinc-900 to-zinc-600"
              style={{
                height: `${max > 0 ? Math.max((month.total / max) * 100, month.total > 0 ? 6 : 0) : 0}%`,
                animationDelay: `${i * 70}ms`,
              }}
              title={currency(month.total)}
            />
          </div>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{month.label}</span>
        </div>
      ))}
    </div>
  );
}

function ExportMenu({ disabled, onExportExcel, onExportPDF }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null); // "excel" | "pdf" | null
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleChoice(kind, action) {
    setBusy(kind);
    try {
      // Let the button's pressed state paint before the (sync but
      // occasionally chunky) document generation runs.
      await new Promise((resolve) => setTimeout(resolve, 30));
      await action();
      setOpen(false);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Download />
        Export
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-180")} />
      </Button>

      {open && (
        <div
          role="menu"
          className="chip-pop absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40"
        >
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            onClick={() => handleChoice("excel", onExportExcel)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1">
              <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                {busy === "excel" ? "Preparing…" : "Export as Excel"}
              </span>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">.xlsx workbook</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            onClick={() => handleChoice("pdf", onExportPDF)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1">
              <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                {busy === "pdf" ? "Preparing…" : "Export as PDF"}
              </span>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">Formatted report</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Stats() {
  const { expenses, notify } = useDashboard();

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const byCategory = useMemo(() => {
    const map = new Map();
    for (const expense of expenses) {
      map.set(expense.category, (map.get(expense.category) || 0) + expense.amount);
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount, hex: categoryMeta(category).hex }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const monthlyTotals = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      months.push({ key, label: d.toLocaleDateString("en-US", { month: "short" }), total: 0 });
    }
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    for (const expense of expenses) {
      const key = expense.date.slice(0, 7);
      if (byKey[key]) byKey[key].total += expense.amount;
    }
    return months;
  }, [expenses]);

  const maxMonth = Math.max(...monthlyTotals.map((m) => m.total), 1);
  const topExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [expenses]
  );

  const avgTransaction = expenses.length > 0 ? totalSpent / expenses.length : 0;

  // The Excel/PDF generators pull in xlsx and jspdf, which are sizeable
  // libraries — loaded lazily so they never touch the page's initial bundle.
  async function handleExportExcel() {
    const { exportStatsToExcel } = await import("@/lib/export");
    exportStatsToExcel({ expenses, byCategory, totalSpent, avgTransaction, monthlyTotals });
    notify("Excel report downloaded");
  }

  async function handleExportPDF() {
    const { exportStatsToPDF } = await import("@/lib/export");
    exportStatsToPDF({ expenses, byCategory, totalSpent, avgTransaction, monthlyTotals, topExpenses });
    notify("PDF report downloaded");
  }

  if (expenses.length === 0) {
    return (
      <>
        <TopBar title="Spending stats" />
        <Card className="border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add a few expenses and your charts will show up here.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Spending stats"
        action={<ExportMenu onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total tracked</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            <CountValue value={totalSpent} prefix="$" />
          </p>
        </Card>
        <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Transactions</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            <CountValue value={expenses.length} />
          </p>
        </Card>
        <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Avg. per expense</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            <CountValue value={avgTransaction} prefix="$" />
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Spending by category</h2>
            <BarChart3 className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>

          <div className="relative">
            <DonutChart segments={byCategory} total={totalSpent} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">All time</p>
              <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{currency(totalSpent)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {byCategory.map((item) => {
              const percent = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
              return (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.hex }} />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">{item.category}</span>
                  <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{currency(item.amount)}</span>
                  <span className="w-9 shrink-0 text-right text-xs text-zinc-400 dark:text-zinc-500">{percent}%</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Monthly trend</h2>
            <TrendingUp className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <MonthlyBars months={monthlyTotals} max={maxMonth} />

          <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Largest expenses</h3>
              <Receipt className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="space-y-2.5">
              {topExpenses.map((expense) => {
                const meta = categoryMeta(expense.category);
                const Icon = meta.icon;
                return (
                  <div key={expense.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", meta.bg, meta.text)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">{expense.description}</span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-zinc-950 dark:text-zinc-50">{currency(expense.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
