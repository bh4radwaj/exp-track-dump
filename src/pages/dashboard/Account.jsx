import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, LogOut, Receipt, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/lib/store";
import { currency, TopBar } from "./shared";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Account() {
  const { profile, updateProfile, expenses } = useDashboard();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const dirty = name.trim() !== profile.name || email.trim() !== profile.email;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const memberSince = new Date(profile.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!dirty || !name.trim() || !email.trim()) return;
    updateProfile({ name: name.trim(), email: email.trim() });
  }

  function handleSignOut() {
    navigate("/login");
  }

  function handlePhotoPick() {
    setPhotoError("");
    fileInputRef.current?.click();
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image is too large — please pick one under 2MB.");
      return;
    }

    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ photo: reader.result }, "Profile photo updated");
    };
    reader.onerror = () => setPhotoError("Couldn't read that image — try another.");
    reader.readAsDataURL(file);
  }

  function handlePhotoRemove() {
    updateProfile({ photo: null }, "Profile photo removed");
  }

  return (
    <>
      <TopBar title="Account" />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative mx-auto w-fit">
            <div className="avatar-pop flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-xl font-semibold text-white shadow-lg shadow-zinc-900/20">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                initials(profile.name) || <UserRound className="h-7 w-7" />
              )}
            </div>
            <button
              type="button"
              onClick={handlePhotoPick}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-white shadow-md transition-transform duration-150 hover:scale-105 hover:bg-zinc-800 active:scale-95 dark:border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {photoError && <p className="mt-2 text-xs text-red-500">{photoError}</p>}

          {profile.photo && (
            <button
              type="button"
              onClick={handlePhotoRemove}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              Remove photo
            </button>
          )}

          <h2 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{profile.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.email}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Member since</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{memberSince}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Lifetime tracked</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{currency(totalSpent)}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Session secured
          </div>

          <Button variant="outline" className="mt-5 w-full text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-400" onClick={handleSignOut}>
            <LogOut />
            Sign out
          </Button>
        </Card>

        <Card className="border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Profile details</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Update how your name and email appear across Notarium.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="account-name">Name</Label>
              <Input id="account-name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="account-email">Email</Label>
              <Input
                id="account-email"
                type="email"
                className="mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!dirty}>
              Save changes
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            <Receipt className="h-3.5 w-3.5 shrink-0" />
            Profile changes are saved locally in this browser for this demo — no account data leaves your device.
          </div>
        </Card>
      </div>
    </>
  );
}
