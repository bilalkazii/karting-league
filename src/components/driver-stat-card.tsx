import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function DriverStatCard({ label, value, detail, accent, icon }: { label: string; value: string; detail?: string; accent?: boolean; icon?: React.ReactNode }) {
  return <Card className="p-4"><div className="flex items-start justify-between">{icon && <span className={cn("grid size-8 place-items-center rounded-lg", accent ? "bg-[var(--red)]/10 text-[var(--red-bright)]" : "bg-white/5 text-[var(--muted)]")}>{icon}</span>}</div><p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</p><p className="mt-0.5 text-xl font-black tracking-tight">{value}</p>{detail && <p className={cn("mt-0.5 text-[10px]", accent ? "text-[var(--green)]" : "text-[var(--muted)]")}>{detail}</p>}</Card>;
}
