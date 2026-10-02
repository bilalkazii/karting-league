import { Activity, AlertTriangle, Ban, Check, Flag, Minus, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RaceDriverStatus } from "@/types/race";

export type ResultStatus = RaceDriverStatus | "invalid";

const statusStyles: Record<ResultStatus, string> = {
  finished: "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]",
  dnf: "border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red-bright)]",
  dns: "border-white/10 bg-white/5 text-[var(--muted)]",
  retired: "border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]",
  withdrawn: "border-white/10 bg-white/5 text-[var(--muted)] line-through",
  racing: "border-[var(--red)]/50 bg-[var(--red)]/15 text-[var(--red-bright)] animate-pulse",
  invalid: "border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]",
  ready: "border-white/10 bg-white/5 text-[var(--muted)]",
  confirmed: "border-white/10 bg-white/5 text-[var(--muted)]",
  invited: "border-white/10 bg-white/5 text-[var(--muted)]",
  declined: "border-white/10 bg-white/5 text-[var(--muted)]",
};

const statusLabels: Record<ResultStatus, string> = {
  finished: "Finished",
  dnf: "DNF",
  dns: "DNS",
  retired: "Retired",
  withdrawn: "Withdrawn",
  racing: "In progress",
  invalid: "Invalid",
  ready: "Ready",
  confirmed: "Confirmed",
  invited: "Invited",
  declined: "Declined",
};

const statusIcons: Record<ResultStatus, React.ComponentType<{ size?: number | string; className?: string }>> = {
  finished: Check,
  dnf: Flag,
  dns: Ban,
  retired: RotateCcw,
  withdrawn: X,
  racing: Activity,
  invalid: AlertTriangle,
  ready: Minus,
  confirmed: Minus,
  invited: Minus,
  declined: Minus,
};

export function ResultStatusBadge({ status, className }: { status: ResultStatus; className?: string }) {
  const Icon = statusIcons[status] ?? Minus;
  return <Badge className={cn("gap-1", statusStyles[status], className)}><Icon size={9} />{statusLabels[status]}</Badge>;
}