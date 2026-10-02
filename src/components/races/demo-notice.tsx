import { FlaskConical } from "lucide-react";

export function DemoNotice({ text }: { text?: string }) {
  return <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--line)] bg-white/[.02] px-3 py-2 text-[11px] text-[var(--muted)]"><FlaskConical size={13} className="shrink-0 text-[var(--amber)]" />{text ?? "Demo data — changes live in this browser session and reset when you reload."}</div>;
}