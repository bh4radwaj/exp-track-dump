import React, { useState } from "react";
import { AlertTriangle, Moon, Plus, Settings as SettingsIcon, Sun, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { categoryMeta, useDashboard } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { TopBar } from "./shared";

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <Card className="border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function AppearanceSettings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <SectionCard
      icon={isDark ? Moon : Sun}
      title="Appearance"
      description="Switch between light and dark mode. Your choice is remembered on this device."
    >
      <div className="flex items-center justify-between gap-4 py-1">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Dark mode</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isDark ? "Currently on — easier on the eyes at night." : "Currently off — using the light theme."}
          </p>
        </div>
        <Switch checked={isDark} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
      </div>
    </SectionCard>
  );
}

function BudgetSettings() {
  const { budget, updateBudget } = useDashboard();
  const [value, setValue] = useState(String(budget));

  const dirty = Number(value) !== budget && Number(value) > 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!dirty) return;
    updateBudget(Number(value));
  }

  return (
    <SectionCard icon={SettingsIcon} title="Monthly budget" description="Used to calculate remaining balance and budget-used progress.">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <div className="flex-1">
          <Label htmlFor="budget-amount">Amount (USD)</Label>
          <Input
            id="budget-amount"
            type="number"
            min="0"
            step="1"
            className="mt-2"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={!dirty}>
          Save budget
        </Button>
      </form>
    </SectionCard>
  );
}

function CategorySettings() {
  const { categories, addCategory, removeCategory } = useDashboard();
  const [name, setName] = useState("");
  const [removingName, setRemovingName] = useState(null);

  function handleAdd(event) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    addCategory(clean);
    setName("");
  }

  function handleRemove(category) {
    setRemovingName(category);
    setTimeout(() => {
      removeCategory(category);
      setRemovingName(null);
    }, 180);
  }

  return (
    <SectionCard icon={Tag} title="Categories" description="Add categories that fit how you spend, or remove ones you don't use.">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const meta = categoryMeta(category);
          const Icon = meta.icon;
          return (
            <span
              key={category}
              className={
                "chip-pop flex items-center gap-1.5 rounded-full border border-zinc-200 py-1.5 pl-3 pr-2 text-xs font-medium text-zinc-700 transition-all duration-150 dark:border-zinc-700 dark:text-zinc-300 " +
                (removingName === category ? "scale-90 opacity-0" : "")
              }
            >
              <Icon className={"h-3 w-3 " + meta.text} />
              {category}
              <button
                type="button"
                aria-label={`Remove ${category}`}
                onClick={() => handleRemove(category)}
                className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-50"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No categories yet — add one below.</p>
        )}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={handleAdd}>
        <Input
          placeholder="e.g. Subscriptions"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="New category name"
        />
        <Button type="submit" variant="outline" disabled={!name.trim()}>
          <Plus />
          Add
        </Button>
      </form>
    </SectionCard>
  );
}

function PreferenceRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PreferenceSettings() {
  const { preferences, updatePreference } = useDashboard();

  return (
    <SectionCard icon={SettingsIcon} title="Preferences" description="Choose what Notarium keeps you posted about.">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <PreferenceRow
          label="Email reminders"
          description="A nudge if you haven't logged anything in a few days."
          checked={preferences.emailReminders}
          onChange={(value) => updatePreference("emailReminders", value)}
        />
        <PreferenceRow
          label="Weekly summary"
          description="A short recap of last week's spending every Monday."
          checked={preferences.weeklySummary}
          onChange={(value) => updatePreference("weeklySummary", value)}
        />
        <PreferenceRow
          label="Budget alerts"
          description="Get notified as you approach your monthly budget."
          checked={preferences.budgetAlerts}
          onChange={(value) => updatePreference("budgetAlerts", value)}
        />
      </div>
    </SectionCard>
  );
}

function DangerZone() {
  const { resetAllData } = useDashboard();
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetAllData();
    setConfirming(false);
  }

  return (
    <Card className="border-red-200 bg-red-50/40 p-5 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-600 text-white">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Danger zone</h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Reset your budget, categories, and expenses back to the sample defaults. This can't be undone.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={confirming ? "default" : "outline"}
          className={confirming ? "bg-red-600 text-white hover:bg-red-700" : "border-red-200 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"}
          onClick={handleReset}
        >
          {confirming ? "Click again to confirm" : "Reset all data"}
        </Button>
        {confirming && (
          <button
            type="button"
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        )}
      </div>
    </Card>
  );
}

export default function Settings() {
  return (
    <>
      <TopBar title="Settings" />
      <div className="grid gap-4">
        <AppearanceSettings />
        <BudgetSettings />
        <CategorySettings />
        <PreferenceSettings />
        <DangerZone />
      </div>
    </>
  );
}
