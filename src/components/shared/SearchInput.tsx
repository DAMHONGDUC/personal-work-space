"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * The search box, shared by the app directory and the guide index so both
 * behave the same way. `type="search"` is what gives the browser's own clear
 * button, and the label is real text for a screen reader rather than a
 * placeholder that disappears as soon as anything is typed.
 */
export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  /** Width overrides, for a box placed somewhere narrower than a toolbar. */
  className?: string;
}) {
  return (
    <label className={cn("relative w-full sm:max-w-xs", className)}>
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl bg-surface pl-10"
      />
    </label>
  );
}
