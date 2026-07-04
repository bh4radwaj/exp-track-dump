import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  Coins,
  DollarSign,
  PiggyBank,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FloatingIcons from "@/components/FloatingIcons";
import { cn } from "@/lib/utils";
import { useCountUp, useInView } from "@/lib/useInView";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function Reveal({ as: Tag = "div", className, delay = 0, children }) {
  const [ref, isInView] = useInView();
  return (
    <Tag
      ref={ref}
      className={cn("fade-up", isInView && "is-visible", className)}
      style={{ transitionDelay: isInView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

function Stat({ value, prefix = "", suffix = "", label, decimals = 0 }) {
  const [ref, isInView] = useInView();
  const animated = useCountUp(value, isInView);

  return (
    <div ref={ref} className="text-center">
      <p className={cn("text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl", isInView && "count-pop")}>
        {prefix}
        {animated.toLocaleString("en-US", {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        })}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero mockup — a little living preview of the dashboard              */
/* ------------------------------------------------------------------ */

function HeroMockup() {
  const bars = [38, 62, 44, 80, 56, 70, 30];
  return (
    <div className="hero-card-float relative mx-auto w-full max-w-sm">
      <Card className="relative overflow-hidden border-white/60 bg-white/80 p-5 shadow-2xl shadow-zinc-900/10 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Remaining balance</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">$2,438</p>
          </div>
          <div className="coin-flip flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shadow-amber-500/30">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700">Budget used</span>
            <span className="text-zinc-500">58%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full w-[58%] rounded-full bg-zinc-900" />
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-2 rounded-lg bg-zinc-50 p-3">
          {bars.map((height, i) => (
            <div
              key={i}
              className="chart-bar w-full rounded-sm bg-gradient-to-t from-zinc-900 to-zinc-600"
              style={{ height: `${height}px`, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <ReceiptText className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-zinc-700">Groceries</span>
            </div>
            <span className="text-sm font-medium text-zinc-950">$84</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                <WalletCards className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-zinc-700">Workspace tools</span>
            </div>
            <span className="text-sm font-medium text-zinc-950">$129</span>
          </div>
        </div>
      </Card>

      <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-900/20 sm:-right-6 sm:-top-6 sm:h-14 sm:w-14">
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: WalletCards,
    title: "Effortless logging",
    description: "Drop in a description and an amount — Notarium takes care of the rest in seconds.",
  },
  {
    icon: ReceiptText,
    title: "Smart categorization",
    description: "Every expense lands in the right bucket, so your spending story tells itself.",
  },
  {
    icon: BarChart3,
    title: "Visual insights",
    description: "Clean charts turn a month of receipts into patterns you can actually act on.",
  },
  {
    icon: TrendingUp,
    title: "Spending trends",
    description: "Spot the categories quietly eating your budget before they become a habit.",
  },
  {
    icon: PiggyBank,
    title: "Custom budgets",
    description: "Set a monthly number per category and get a nudge before you go over.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-level security",
    description: "Encrypted sessions and secure sign-in keep your financial data yours alone.",
  },
];

const STEPS = [
  {
    title: "Create your account",
    description: "Sign up in seconds with email or Google. No card required, ever.",
  },
  {
    title: "Log expenses on the go",
    description: "Add a purchase the moment it happens, from your phone or your desk.",
  },
  {
    title: "Watch your budget work",
    description: "See remaining balance, category breakdowns, and trends update instantly.",
  },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20">
            N
          </div>
          <span className="text-sm font-semibold text-zinc-950">Notarium</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 sm:flex">
          <a href="#features" className="transition-colors hover:text-zinc-950">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-zinc-950">
            How it works
          </a>
          <a href="#faq" className="transition-colors hover:text-zinc-950">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">
              Get started
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="landing-hero-bg relative overflow-hidden">
      <FloatingIcons />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center lg:py-32">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Budgeting that feels effortless
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              See where your money
              <br />
              <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-zinc-900 bg-clip-text text-transparent">
                actually goes.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-500 sm:text-lg">
              Notarium turns everyday spending into clear, actionable insight —
              log expenses in seconds, set category budgets, and watch your
              trends update in real time.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Start tracking for free
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-4 text-sm text-zinc-400">
              Free to start · No credit card · Cancel anytime
            </p>
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:justify-self-end">
          <HeroMockup />
        </Reveal>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <Stat value={2.4} suffix="M+" prefix="$" decimals={1} label="Tracked by our users" />
        <Stat value={12000} suffix="+" label="Budgets managed" />
        <Stat value={98} suffix="%" label="Stay under budget" />
        <Stat value={4.9} suffix="/5" decimals={1} label="Average rating" />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Everything you need, nothing you don't
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-500">
          Notarium is built around the handful of things that actually change
          how you spend — not a hundred features you'll never open.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 60}>
            <Card className="landing-feature-card h-full border-zinc-200 bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{feature.description}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-zinc-200 bg-zinc-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Up and running in three steps
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-500">
            No spreadsheets, no setup wizard. Just sign up and start logging.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className="relative rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-zinc-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Is Notarium free to use?",
    a: "Yes. Creating an account, logging expenses, and setting budgets is free — no credit card needed to get started.",
  },
  {
    q: "Can I sign in with Google?",
    a: "Yes, both the login and sign-up pages offer Google as a one-click alternative to email and password.",
  },
  {
    q: "Is my financial data secure?",
    a: "Your session is authenticated and your data is kept private to your account — we never sell or share it.",
  },
];

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Frequently asked questions
        </h2>
      </Reveal>

      <div className="mt-10 space-y-3">
        {FAQS.map((item, i) => (
          <Reveal key={item.q} delay={i * 60}>
            <Card className="border-zinc-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{item.q}</p>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500">{item.a}</p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="landing-hero-bg relative overflow-hidden border-t border-zinc-200">
      <FloatingIcons />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <Reveal>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20">
            <Coins className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Start seeing your spending clearly today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-500">
            It takes less than a minute to create an account. Your first
            budget could be set before your coffee gets cold.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">
                Create your free account
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-white">
            N
          </div>
          <span className="text-sm font-semibold text-zinc-950">Notarium</span>
        </div>
        <p className="text-sm text-zinc-400">
          © {new Date().getFullYear()} Notarium. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Faq />
      <ClosingCta />
      <Footer />
    </div>
  );
}
