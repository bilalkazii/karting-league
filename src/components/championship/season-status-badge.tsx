import { Badge } from "@/components/ui/badge";
import type { SeasonStatus } from "@/types/championship";

const statusStyles: Record<SeasonStatus, string> = {
  draft: "border-white/10 bg-white/5 text-[var(--muted)]",
  active: "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]",
  completed: "border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red-bright)]",
  archived: "border-white/10 bg-white/5 text-[var(--muted)] line-through",
};

const statusLabels: Record<SeasonStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export function SeasonStatusBadge({ status }: { status: SeasonStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>;
}