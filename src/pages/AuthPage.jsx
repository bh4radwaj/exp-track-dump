import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" width="16" height="16" {...props}>
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18A13.96 13.96 0 0 1 10.9 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

// Points the browser at the backend's OAuth entry route.
// The backend redirects to Google, then back to the backend callback,
// which establishes the session and redirects into the app.
const GOOGLE_AUTH_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:4000") + "/auth/google";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || "http://localhost:4000") + "/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Try again.");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-4">
            Forgot your password?
          </a>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Login"}
      </Button>

      <Divider />

      <Button type="button" variant="outline" className="w-full" asChild>
        <a href={GOOGLE_AUTH_URL}>
          <GoogleIcon />
          Continue with Google
        </a>
      </Button>
    </form>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || "http://localhost:4000") + "/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Try again.");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <Divider />

      <Button type="button" variant="outline" className="w-full" asChild>
        <a href={GOOGLE_AUTH_URL}>
          <GoogleIcon />
          Continue with Google
        </a>
      </Button>
    </form>
  );
}

function Divider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-white/60" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white/70 px-2 text-zinc-500 backdrop-blur-sm">Or continue with</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = location.pathname === "/signup" ? "signup" : "login";
  const [tab, setTab] = useState(initial);

  function onTabChange(value) {
    setTab(value);
    navigate(value === "signup" ? "/signup" : "/login", { replace: true });
  }

  return (
    <div className="auth-glass-bg relative min-h-screen w-full overflow-hidden flex items-center justify-center p-6">
      <div className="auth-glass-orb auth-glass-orb-one" />
      <div className="auth-glass-orb auth-glass-orb-two" />
      <div className="auth-glass-orb auth-glass-orb-three" />
      <div className="auth-glass-sheen" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-zinc-900/90 flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-zinc-900/20">
            N
          </div>
          <span className="font-semibold text-zinc-900 text-sm">Notarium</span>
        </div>

        <Card className="p-6 border-white/60 bg-white/70 shadow-2xl shadow-zinc-900/10 backdrop-blur-2xl">
          <Tabs value={tab} onValueChange={onTabChange}>
            <TabsList>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
                  Login to your account
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Enter your email below to login to your account
                </p>
              </div>
              <LoginForm />
            </TabsContent>

            <TabsContent value="signup">
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Enter your details below to create your account
                </p>
              </div>
              <SignupForm />
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-zinc-400 mt-6">
          By continuing, you agree to Notarium's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
