import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ListFilter, Plus, ReceiptText, Trash2, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { categoryMeta, useDashboard } from "@/lib/store";
import { currency, TopBar } from "./shared";

function monthKey(date) {
  return date.slice(0, 7);
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function CategoryFilter({ categories, value, onChange, counts }) {
  const options = ["All", ...categories];
  return (
    <div
      className="flex min-w-0 max-w-full items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50/80 p-1 pl-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:max-w-md"
      role="tablist"
      aria-label="Filter by category"
    >
      <ListFilter className="hidden h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500 sm:block" />
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {options.map((option) => {
          const active = value === option;
          const meta = option === "All" ? null : categoryMeta(option);
          const count = counts?.[option] ?? 0;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                active
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-transparent bg-transparent text-zinc-600 hover:bg-white hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              )}
            >
              {meta ? (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? "currentColor" : meta.hex }}
                />
              ) : (
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-current" : "bg-zinc-400 dark:bg-zinc-500")} />
              )}
              {option}
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                    active
                      ? "bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-900"
                      : "bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExpenseRow({ expense, isRemoving, onRemove }) {
  const meta = categoryMeta(expense.category);
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "expense-row-enter group flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-2 transition-all duration-200 hover:border-zinc-100 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-800/60",
        isRemoving && "expense-row-exit"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", meta.bg, meta.text)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{expense.description}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {expense.category} · {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currency(expense.amount)}</span>
        <button
          type="button"
          onClick={() => onRemove(expense.id)}
          aria-label={`Delete ${expense.description}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-300 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none dark:text-zinc-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyExpenses({ onAdd }) {
  return (
    <div className="empty-bounce flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 px-6 py-10 text-center dark:border-zinc-800">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <ReceiptText className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No expenses here yet</p>
      <p className="mt-1 max-w-[22rem] text-xs text-zinc-500 dark:text-zinc-400">
        Nothing matches this filter, or you haven't logged anything yet. Add your first expense to see it show up here.
      </p>
      <Button size="sm" className="mt-4" onClick={onAdd}>
        <Plus />
        Add expense
      </Button>
    </div>
  );
}

export default function DashboardHome() {
  const { expenses, budget, categories, addExpense, removeExpense, setModalOpen } = useDashboard();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [removingIds, setRemovingIds] = useState(() => new Set());

  function openModal() {
    setOpen(true);
    setModalOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setModalOpen(false);
  }

  const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
  const spent = useMemo(
    () =>
      expenses
        .filter((expense) => monthKey(expense.date) === currentMonth)
        .reduce((sum, expense) => sum + expense.amount, 0),
    [expenses, currentMonth]
  );
  const remaining = Math.max(budget - spent, 0);
  const spentPercent = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const isOverBudget = spent > budget;

  const filtered = useMemo(
    () => (filter === "All" ? expenses : expenses.filter((e) => e.category === filter)),
    [expenses, filter]
  );

  const categoryCounts = useMemo(() => {
    const counts = { All: expenses.length };
    for (const expense of expenses) {
      counts[expense.category] = (counts[expense.category] || 0) + 1;
    }
    return counts;
  }, [expenses]);

  function handleAdd(expense) {
    addExpense(expense);
    closeModal();
  }

  function handleRemove(id) {
    setRemovingIds((current) => new Set(current).add(id));
    setTimeout(() => {
      removeExpense(id);
      setRemovingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }, 220);
  }

  return (
    <>
      <TopBar
        title="Money overview"
        action={
          <CategoryFilter categories={categories} value={filter} onChange={setFilter} counts={categoryCounts} />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="overflow-hidden border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                <WalletCards className="h-5 w-5" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Remaining balance</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {currency(remaining)}
              </h2>
              {isOverBudget && (
                <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                  You're {currency(spent - budget)} over budget this month
                </p>
              )}
            </div>
            <Button onClick={openModal}>
              <Plus />
              Add expense
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <StatPill label="Spent this month" value={currency(spent)} />
            <StatPill label="Monthly budget" value={currency(budget)} />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Budget used</span>
              <span className="text-zinc-500 dark:text-zinc-400">{spentPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  isOverBudget ? "bg-red-500" : "bg-zinc-900 dark:bg-zinc-50"
                )}
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{filter === "All" ? "Recent" : filter}</p>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Expenses</h2>
            </div>
            <ReceiptText className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          </div>

          {filtered.length === 0 ? (
            <EmptyExpenses onAdd={openModal} />
          ) : (
            <div className="max-h-[26rem] space-y-1 overflow-y-auto pr-1">
              {filtered.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  isRemoving={removingIds.has(expense.id)}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <ExpenseModal
        open={open}
        categories={categories}
        onClose={closeModal}
        onSave={handleAdd}
      />
    </>
  );
}

function ExpenseModal({ open, categories, onClose, onSave }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const dialogRef = useRef(null);

  const canSave = useMemo(() => {
    return description.trim().length > 0 && Number(amount) > 0;
  }, [amount, description]);

  // Lock body scroll and let Escape close the dialog while it's open.
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      // Simple focus trap: keep Tab cycling inside the dialog since the
      // rest of the app (sidebar, bottom nav, page content) is inert.
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSave) return;
    onSave({
      description: description.trim(),
      amount: Number(amount),
      category,
    });
    setDescription("");
    setAmount("");
    setCategory(categories[0]);
  }

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/35 backdrop-blur-sm dark:bg-black/70 sm:items-center sm:p-4 md:pl-20"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
        className={cn(
          "modal-pop w-full rounded-t-2xl border border-white/60 bg-white/90 p-5 shadow-2xl shadow-zinc-950/20 backdrop-blur-2xl",
          "dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/60",
          // Bottom-sheet on mobile: flush against the true bottom edge of
          // the viewport (it sits above the bottom nav in z-index, so the
          // nav is fully covered, not just dimmed with a gap peeking
          // through). Safe-area is handled with padding, not a margin,
          // so there's no visible strip below the sheet.
          "pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
          // From sm+ it's back to a centered, fully-rounded dialog card.
          "sm:rounded-xl sm:pb-5 sm:max-w-md"
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="expense-modal-title" className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Add expense
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Save a new spend to your monthly budget.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="expense-description">Description</Label>
            <Input
              id="expense-description"
              className="mt-2 bg-white/70 dark:bg-zinc-800/70"
              placeholder="Coffee, groceries, rent"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="expense-amount">Amount</Label>
            <Input
              id="expense-amount"
              className="mt-2 bg-white/70 dark:bg-zinc-800/70"
              type="number"
              min="0"
              step="0.01"
              placeholder="45"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="expense-category">Category</Label>
            <select
              id="expense-category"
              className="mt-2 flex h-9 w-full rounded-md border border-zinc-200 bg-white/70 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100 dark:focus-visible:ring-zinc-300"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={!canSave}>
            Save expense
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
