import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StandingTrend as StandingTrendType } from "@/types/championship";

export interface StandingTrendProps {
  trend: StandingTrendType;
  previousPosition: number | null;
}

export function trendFromPositions(position: number, previousPosition: number | null): StandingTrendType {
  if (previousPosition === null || previousPosition === undefined) return "same";
  if (previousPosition > position) return "up";
  if (previousPosition < position) return "down";
  return "same";
}

export function StandingTrend({ trend, previousPosition }: StandingTrendProps) {
  const isNew = previousPosition === null || previousPosition === undefined;
  const label = isNew ? "New entry" : trend === "up" ? `Up from P${previousPosition}` : trend === "down" ? `Down from P${previousPosition}` : `Held P${previousPosition}`;
  const iconClass =
    isNew ? "text-[var(--muted)]" :
    trend === "up" ? "text-[var(--green)]" :
    trend === "down" ? "text-[var(--red-bright)]" :
    "text-[var(--muted)]";
  const Icon = isNew ? Plus : trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  return <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium", iconClass)}><Icon size={11} aria-hidden="true" /><span>{label}</span></span>;
}