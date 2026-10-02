"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ChevronRight, CircleUserRound, Flag, Grid2X2, Home, MessageSquare, Settings, Trophy, Users, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Home }, { label: "My groups", href: "/groups", icon: Users }, { label: "Races", href: "/races", icon: Flag }, { label: "Championship", href: "/championship", icon: Trophy }, { label: "Chat", href: "/chat", icon: MessageSquare },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-[var(--background)]">
    <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--line)] bg-[#0b1013]/95 px-4 py-6 backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-2"><Brand /><button className="text-[var(--muted)] lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="mt-11 px-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#66727a]">Your paddock</div>
      <nav className="mt-3 space-y-1">{navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[var(--muted)] transition hover:bg-white/5 hover:text-white", pathname.startsWith(href) && "bg-[var(--red)]/10 text-white ring-1 ring-[var(--red)]/20") }><Icon size={18} strokeWidth={pathname.startsWith(href) ? 2.4 : 1.8} /><span>{label}</span>{label === "Chat" && <span className="ml-auto rounded-full bg-[var(--red)] px-1.5 py-0.5 text-[9px] text-white">3</span>}</Link>)}</nav>
      <div className="mt-auto space-y-1"><Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[var(--muted)] hover:bg-white/5 hover:text-white"><CircleUserRound size={18} />Profile</Link><Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[var(--muted)] hover:bg-white/5 hover:text-white"><Settings size={18} />Settings</Link><div className="mt-5 flex items-center gap-3 border-t border-[var(--line)] px-3 pt-5"><div className="grid size-8 place-items-center rounded-full bg-[#d5a182] text-xs font-bold text-[#29150c]">BD</div><div><p className="text-xs font-semibold">Bilal D.</p><p className="text-[10px] text-[var(--muted)]">KART 07</p></div><ChevronRight size={14} className="ml-auto text-[var(--muted)]" /></div></div>
    </aside>
    {open && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[#07090b]/80 px-5 backdrop-blur-xl sm:px-8"><button className="text-white lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Grid2X2 size={21} /></button><div className="lg:hidden"><Brand /></div><div className="ml-auto flex items-center gap-2"><Link href="/races" className="hidden items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-white sm:flex"><CalendarDays size={15} />Next race</Link><Link href="/notifications" className="relative grid size-9 place-items-center rounded-lg text-[var(--muted)] hover:bg-white/5 hover:text-white"><Bell size={18} /><span className="absolute right-1 top-1 size-1.5 rounded-full bg-[var(--red)]" /></Link></div></header><main className="mx-auto max-w-[1440px] px-5 py-7 pb-24 sm:px-8 lg:px-10 lg:py-10">{children}</main></div>
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-[var(--line)] bg-[#0b1013]/95 px-2 backdrop-blur-xl lg:hidden">{navigation.slice(0, 5).map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 px-3 py-1 text-[10px] text-[var(--muted)]", pathname.startsWith(href) && "text-[var(--red-bright)]")}><Icon size={18} /><span>{label}</span></Link>)}</nav>
  </div>;
}
