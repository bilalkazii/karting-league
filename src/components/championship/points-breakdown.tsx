import { Card } from "@/components/ui/card";

export interface PointsBreakdownItem {
  label: string;
  detail?: string;
  points: number;
}

export interface PointsBreakdownProps {
  title?: string;
  driverName?: string;
  items: PointsBreakdownItem[];
  total: number;
}

export function PointsBreakdown({ title = "Points breakdown", driverName, items, total }: PointsBreakdownProps) {
  if (items.length === 0) return null;
  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-2"><h2 className="text-sm font-bold">{title}</h2>{driverName && <span className="truncate text-[10px] uppercase tracking-widest text-[var(--muted)]">{driverName}</span>}</div>
      <div className="mt-3 divide-y divide-[var(--line)]/70">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-4 py-2">
            <div className="min-w-0"><p className="text-xs">{item.label}</p>{item.detail && <p className="text-[10px] text-[var(--muted)]">{item.detail}</p>}</div>
            <span className="font-mono text-xs">{item.points > 0 ? `+${item.points}` : item.points}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-3">
        <p className="text-xs font-bold uppercase tracking-widest">Total</p>
        <p className="font-mono text-lg font-black text-[var(--red-bright)]">{total} pts</p>
      </div>
    </Card>
  );
}