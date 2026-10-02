"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DriverAvailability } from "@/types/driver";

const options: { value: DriverAvailability; label: string; color: string }[] = [
  { value: "available", label: "Available", color: "border-[var(--green)]/40 bg-[var(--green)]/10 text-[var(--green)]" },
  { value: "maybe", label: "Maybe", color: "border-[var(--amber)]/40 bg-[var(--amber)]/10 text-[var(--amber)]" },
  { value: "not-available", label: "Not available", color: "border-white/15 bg-white/5 text-[var(--muted)]" },
];

export function AvailabilitySelector({ value, onChange }: { value: DriverAvailability; onChange: (v: DriverAvailability) => void }) {
  const [selected, setSelected] = useState(value);

  function handleSelect(v: DriverAvailability) {
    setSelected(v);
    onChange(v);
  }

  return <div className="flex gap-1.5" role="radiogroup" aria-label="Availability status">
    {options.map((opt) => <button key={opt.value} role="radio" aria-checked={selected === opt.value} onClick={() => handleSelect(opt.value)} className={cn("rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition", selected === opt.value ? opt.color : "border-[var(--line)] bg-white/[.02] text-[var(--muted)] hover:bg-white/5")}>{opt.label}</button>)}
  </div>;
}
