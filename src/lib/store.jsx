import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Briefcase,
  HeartPulse,
  Plane,
  ReceiptText,
  ShoppingBag,
  Tag,
  Utensils,
} from "lucide-react";

const STORAGE_KEY = "notarium:dashboard:v1";

export const DEFAULT_CATEGORIES = ["Food", "Travel", "Bills", "Work", "Shopping", "Health"];

/** Visual identity per category — icon, badge colors, and a hex used in charts. */
export const CATEGORY_META = {
  Food: { icon: Utensils, bg: "bg-emerald-100", text: "text-emerald-700", hex: "#10b981" },
  Travel: { icon: Plane, bg: "bg-sky-100", text: "text-sky-700", hex: "#0ea5e9" },
  Bills: { icon: ReceiptText, bg: "bg-amber-100", text: "text-amber-700", hex: "#f59e0b" },
  Work: { icon: Briefcase, bg: "bg-violet-100", text: "text-violet-700", hex: "#8b5cf6" },
  Shopping: { icon: ShoppingBag, bg: "bg-pink-100", text: "text-pink-700", hex: "#ec4899" },
  Health: { icon: HeartPulse, bg: "bg-rose-100", text: "text-rose-700", hex: "#f43f5e" },
};

const FALLBACK_META = { icon: Tag, bg: "bg-zinc-100", text: "text-zinc-600", hex: "#a1a1aa" };

export function categoryMeta(name) {
  return CATEGORY_META[name] || FALLBACK_META;
}

/* ------------------------------------------------------------------ */
/* Seed data — a handful of months of history so Stats has something   */
/* meaningful to chart on first load.                                  */
/* ------------------------------------------------------------------ */

function seedExpenses() {
  const rows = [
    ["2026-01-06", "Rent", 1200, "Bills"],
    ["2026-01-11", "Groceries", 96, "Food"],
    ["2026-01-14", "Flight to Denver", 210, "Travel"],
    ["2026-01-19", "Gym membership", 40, "Health"],
    ["2026-01-24", "Freelance software", 89, "Work"],
    ["2026-02-03", "Rent", 1200, "Bills"],
    ["2026-02-08", "Groceries", 104, "Food"],
    ["2026-02-12", "New headphones", 149, "Shopping"],
    ["2026-02-18", "Coworking desk", 120, "Work"],
    ["2026-02-22", "Pharmacy", 34, "Health"],
    ["2026-03-05", "Rent", 1200, "Bills"],
    ["2026-03-09", "Groceries", 88, "Food"],
    ["2026-03-13", "Train tickets", 62, "Travel"],
    ["2026-03-21", "Dinner out", 58, "Food"],
    ["2026-03-27", "Client laptop stand", 45, "Work"],
    ["2026-04-04", "Rent", 1250, "Bills"],
    ["2026-04-10", "Groceries", 112, "Food"],
    ["2026-04-15", "Weekend getaway", 340, "Travel"],
    ["2026-04-20", "New shoes", 78, "Shopping"],
    ["2026-04-26", "Dentist", 150, "Health"],
    ["2026-05-02", "Rent", 1250, "Bills"],
    ["2026-05-07", "Groceries", 91, "Food"],
    ["2026-05-15", "Software subscription", 32, "Work"],
    ["2026-05-19", "Metro card", 32, "Travel"],
    ["2026-05-28", "Birthday gift", 60, "Shopping"],
    ["2026-06-03", "Rent", 1250, "Bills"],
    ["2026-06-06", "Groceries", 84, "Food"],
    ["2026-06-14", "Metro card", 32, "Travel"],
    ["2026-06-20", "Workspace tools", 129, "Work"],
    ["2026-06-25", "Yoga classes", 45, "Health"],
  ];
  return rows.map(([date, description, amount, category], i) => ({
    id: 1000 + i,
    date,
    description,
    amount,
    category,
  }));
}

const DEFAULTS = {
  budget: 4200,
  categories: DEFAULT_CATEGORIES,
  expenses: seedExpenses(),
  profile: {
    name: "Alex Rivera",
    email: "alex@notarium.app",
    memberSince: "2026-01-06",
    photo: null,
  },
  preferences: {
    emailReminders: true,
    weeklySummary: false,
    budgetAlerts: true,
  },
};

function loadState() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      profile: { ...DEFAULTS.profile, ...parsed.profile },
      preferences: { ...DEFAULTS.preferences, ...parsed.preferences },
    };
  } catch {
    return DEFAULTS;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState(null);
  // Not persisted — just tracks whether an overlay (like the add-expense
  // modal) is open, so the app shell can make the sidebar/bottom nav inert.
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private mode, quota, etc.) — fail silently
    }
  }, [state]);

  const notify = useCallback((message, tone = "default") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const addExpense = useCallback(
    (expense) => {
      setState((s) => ({
        ...s,
        expenses: [{ id: Date.now(), date: todayISO(), ...expense }, ...s.expenses],
      }));
      notify("Expense added");
    },
    [notify]
  );

  const removeExpense = useCallback(
    (id) => {
      setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
      notify("Expense removed");
    },
    [notify]
  );

  const updateBudget = useCallback(
    (budget) => {
      setState((s) => ({ ...s, budget }));
      notify("Budget updated");
    },
    [notify]
  );

  const addCategory = useCallback(
    (name) => {
      const clean = name.trim();
      if (!clean) return;
      setState((s) =>
        s.categories.some((c) => c.toLowerCase() === clean.toLowerCase())
          ? s
          : { ...s, categories: [...s.categories, clean] }
      );
      notify("Category added");
    },
    [notify]
  );

  const removeCategory = useCallback(
    (name) => {
      setState((s) => ({ ...s, categories: s.categories.filter((c) => c !== name) }));
      notify("Category removed");
    },
    [notify]
  );

  const updateProfile = useCallback(
    (profile, message = "Profile saved") => {
      setState((s) => ({ ...s, profile: { ...s.profile, ...profile } }));
      notify(message);
    },
    [notify]
  );

  const updatePreference = useCallback((key, value) => {
    setState((s) => ({ ...s, preferences: { ...s.preferences, [key]: value } }));
  }, []);

  const resetAllData = useCallback(() => {
    setState({ ...DEFAULTS, expenses: seedExpenses() });
    notify("All data reset");
  }, [notify]);

  const value = useMemo(
    () => ({
      ...state,
      toast,
      notify,
      modalOpen,
      setModalOpen,
      addExpense,
      removeExpense,
      updateBudget,
      addCategory,
      removeCategory,
      updateProfile,
      updatePreference,
      resetAllData,
    }),
    [
      state,
      toast,
      notify,
      modalOpen,
      addExpense,
      removeExpense,
      updateBudget,
      addCategory,
      removeCategory,
      updateProfile,
      updatePreference,
      resetAllData,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside a DashboardProvider");
  return ctx;
}
