import React from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BarChart3, Home, Moon, Settings, Sun, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardProvider, useDashboard } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import Toast from "@/components/Toast";
import FloatingIcons from "@/components/FloatingIcons";
import DashboardHome from "./dashboard/Home";
import Stats from "./dashboard/Stats";
import SettingsPage from "./dashboard/Settings";
import Account from "./dashboard/Account";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home, end: true },
  { to: "/dashboard/stats", label: "Stats", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/account", label: "Account", icon: UserRound },
];

function NavIcon({ to, label, icon: Icon, end, showLabel = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex h-12 items-center justify-center rounded-md text-zinc-500 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          showLabel && "h-14 flex-col gap-1 text-[11px] font-medium",
          isActive && "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900"
        )
      }
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
      {showLabel && <span>{label}</span>}
    </NavLink>
  );
}

function ThemeToggle({ showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-12 items-center justify-center rounded-md text-zinc-500 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        showLabel && "h-14 flex-col gap-1 text-[11px] font-medium"
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {showLabel && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}

function DashboardShell({ children }) {
  const location = useLocation();
  const { modalOpen } = useDashboard();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Same drifting-icon animation as the landing page, dimmed down and
          fixed to the viewport so it reads as ambient texture behind every
          dashboard section (Home, Stats, Settings, Account). */}
      <FloatingIcons className="dashboard-floating-icons" />

      <aside
        // Inert while the add-expense modal is open so it can't be reached
        // by mouse, touch, or keyboard tabbing behind the dialog.
        inert={modalOpen || undefined}
        aria-hidden={modalOpen || undefined}
        className={cn(
          "hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-20 md:flex-col md:border-r md:border-zinc-200 md:bg-white/80 md:px-3 md:py-5 md:backdrop-blur-xl dark:md:border-zinc-800 dark:md:bg-zinc-900/80 transition-opacity duration-150",
          modalOpen && "md:pointer-events-none md:opacity-40"
        )}
      >
        <div className="mx-auto mb-8 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 dark:bg-zinc-50 dark:text-zinc-900">
          N
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavIcon key={item.to} {...item} />
          ))}
        </nav>
        <ThemeToggle />
      </aside>

      <div className="flex min-h-screen w-full flex-col md:pl-20">
        <main
          key={location.pathname}
          inert={modalOpen || undefined}
          aria-hidden={modalOpen || undefined}
          className={cn(
            "page-fade mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pb-24 pt-4 sm:px-6 md:px-8 md:pb-8 md:pt-6 transition-opacity duration-150",
            modalOpen && "pointer-events-none opacity-40"
          )}
        >
          {children}
        </main>
      </div>

      <nav
        // Inert for the same reason as the sidebar above — the bottom nav
        // sits underneath the modal's backdrop on mobile.
        inert={modalOpen || undefined}
        aria-hidden={modalOpen || undefined}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/85 px-3 py-2 shadow-2xl shadow-zinc-900/10 backdrop-blur-xl md:hidden dark:border-zinc-800 dark:bg-zinc-900/85 dark:shadow-black/30 transition-opacity duration-150",
          modalOpen && "pointer-events-none opacity-40"
        )}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavIcon key={item.to} {...item} showLabel />
          ))}
          <ThemeToggle showLabel />
        </div>
      </nav>

      <Toast />
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardShell>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardShell>
    </DashboardProvider>
  );
}
