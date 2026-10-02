import { ArrowUpRight, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SectionPlaceholder({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
  return <div className="mx-auto max-w-3xl py-10 sm:py-20"><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--red-bright)]">{eyebrow}</p><h1 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">{title}</h1><p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">{description}</p><Card className="carbon mt-10 flex items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--red)]/10 text-[var(--red-bright)]"><Flag size={20} /></span><div><p className="text-sm font-semibold">This section is ready for the next phase</p><p className="mt-1 text-xs text-[var(--muted)]">The application foundation is in place. Race and group data will connect here later.</p></div><ArrowUpRight className="ml-auto text-[var(--muted)]" size={18} /></Card></div>;
}
