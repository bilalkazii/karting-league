import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <Card className="carbon flex flex-col items-center gap-4 p-10 text-center"><span className="grid size-12 place-items-center rounded-xl bg-white/5 text-[var(--muted)]"><Inbox size={22} /></span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 max-w-xs text-xs text-[var(--muted)]">{description}</p></div>{action && <div>{action}</div>}</Card>;
}
