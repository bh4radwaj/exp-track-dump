import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-900",
          checked ? "bg-zinc-900 dark:bg-zinc-50" : "bg-zinc-200 dark:bg-zinc-700",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-[18px] w-[18px] translate-x-1 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-zinc-900",
            checked && "translate-x-[22px]"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
