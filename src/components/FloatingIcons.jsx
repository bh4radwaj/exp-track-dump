import React from "react";
import { Coins, CreditCard, DollarSign, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating currency/finance glyphs that drift upward through a background.
 * Originally built for the landing page hero; also used behind the
 * dashboard shell so every authenticated page shares the same ambient
 * motion. Auth pages intentionally keep their own separate glass
 * background and don't use this.
 */
export const FLOATING_ICONS = [
  { Icon: DollarSign, left: "4%", size: 20, duration: "11s", delay: "0s", drift: "1.2rem", color: "#a1a1aa" },
  { Icon: Coins, left: "13%", size: 24, duration: "14s", delay: "2s", drift: "-1.6rem", color: "#facc15" },
  { Icon: DollarSign, left: "23%", size: 16, duration: "9s", delay: "4.5s", drift: "0.8rem", color: "#a1a1aa" },
  { Icon: PiggyBank, left: "33%", size: 22, duration: "16s", delay: "1s", drift: "-1rem", color: "#fb7185" },
  { Icon: Wallet, left: "43%", size: 18, duration: "12.5s", delay: "3.8s", drift: "1rem", color: "#38bdf8" },
  { Icon: Coins, left: "53%", size: 18, duration: "12s", delay: "3.2s", drift: "1.4rem", color: "#facc15" },
  { Icon: DollarSign, left: "62%", size: 26, duration: "13s", delay: "0.6s", drift: "-1.8rem", color: "#a1a1aa" },
  { Icon: TrendingUp, left: "71%", size: 20, duration: "15s", delay: "5s", drift: "1rem", color: "#4ade80" },
  { Icon: CreditCard, left: "80%", size: 22, duration: "13.5s", delay: "2.8s", drift: "-1.2rem", color: "#c084fc" },
  { Icon: DollarSign, left: "88%", size: 16, duration: "10s", delay: "2.4s", drift: "-0.8rem", color: "#a1a1aa" },
  { Icon: PiggyBank, left: "94%", size: 18, duration: "11.5s", delay: "1.6s", drift: "0.9rem", color: "#fb7185" },
  { Icon: TrendingUp, left: "98%", size: 15, duration: "10.5s", delay: "4.2s", drift: "-1.1rem", color: "#4ade80" },
];

export default function FloatingIcons({ className }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {FLOATING_ICONS.map(({ Icon, left, size, duration, delay, drift, color }, i) => (
        <Icon
          key={i}
          className="floating-icon"
          style={{
            left,
            width: size,
            height: size,
            animationDuration: duration,
            animationDelay: delay,
            "--coin-drift": drift,
            "--coin-color": color,
          }}
        />
      ))}
    </div>
  );
}
