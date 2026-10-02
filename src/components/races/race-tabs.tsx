"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRace } from "@/components/races/race-provider";
import type { RaceStatus } from "@/types/race";

const enabledStatuses: Record<string, RaceStatus[]> = {
  overview: ["draft", "lobby", "qualifying", "grid", "racing", "completed", "cancelled"],
  setup: ["draft", "lobby"],
  lobby: ["draft", "lobby", "qualifying"],
  qualifying: ["lobby", "qualifying", "grid", "racing", "completed"],
  grid: ["qualifying", "grid", "racing", "completed"],
  control: ["grid", "racing"],
  results: ["completed"],
};

const raceTabs = [
  { label: "Overview", href: "" },
  { label: "Setup", href: "/setup" },
  { label: "Lobby", href: "/lobby" },
  { label: "Qualifying", href: "/qualifying" },
  { label: "Grid", href: "/grid" },
  { label: "Control", href: "/control" },
  { label: "Results", href: "/results" },
];

export function RaceTabs({ raceId }: { raceId: string }) {
  const pathname = usePathname();
  const { state } = useRace();
  const basePath = `/races/${raceId}`;

  return <nav className="flex gap-1 overflow-x-auto border-b border-[var(--line)] scrollbar-none" aria-label="Race navigation">
    {raceTabs.map(({ label, href }) => {
      const fullHref = `${basePath}${href}`;
      const key = href === "" ? "overview" : href.slice(1);
      const active = href === "" ? pathname === basePath : pathname.startsWith(fullHref);
      const enabled = enabledStatuses[key]?.includes(state.race.status) ?? false;
      if (!enabled) return <span key={label} className="shrink-0 cursor-not-allowed px-4 py-3 text-xs font-semibold text-[#3c454c]" aria-disabled="true">{label}</span>;
      return <Link key={label} href={fullHref} className={cn("shrink-0 px-4 py-3 text-xs font-semibold transition border-b-2 -mb-px", active ? "border-[var(--red)] text-white" : "border-transparent text-[var(--muted)] hover:text-white")}>{label}</Link>;
    })}
  </nav>;
}