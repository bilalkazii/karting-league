"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const groupTabs = [
  { label: "Overview", href: "", groupScoped: true },
  { label: "Members", href: "/members", groupScoped: true },
  { label: "Races", href: "/races", groupScoped: false },
  { label: "Championship", href: "/championship", groupScoped: false },
  { label: "Chat", href: "/chat", groupScoped: false },
  { label: "Settings", href: "/settings", groupScoped: false },
];

export function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const basePath = `/groups/${groupId}`;

  return <nav className="flex gap-1 overflow-x-auto border-b border-[var(--line)] scrollbar-none" aria-label="Group navigation">
    {groupTabs.map(({ label, href, groupScoped }) => {
      const fullHref = groupScoped ? `${basePath}${href}` : href;
      const active = groupScoped ? (href === "" ? pathname === basePath : pathname.startsWith(fullHref)) : pathname === fullHref;
      return <Link key={label} href={fullHref} className={cn("shrink-0 px-4 py-3 text-xs font-semibold transition border-b-2 -mb-px", active ? "border-[var(--red)] text-white" : "border-transparent text-[var(--muted)] hover:text-white")}>{label}</Link>;
    })}
  </nav>;
}
