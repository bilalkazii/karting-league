import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) { return <span className={cn("inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.12em]", className)}>{children}</span>; }
