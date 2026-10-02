import Link from "next/link";

export function Brand() {
  return <Link href="/dashboard" className="group flex items-center gap-3" aria-label="Karting dashboard">
    <span className="relative block h-7 w-9 -skew-x-[30deg] bg-[var(--red)] after:absolute after:-right-3 after:top-0 after:h-3 after:w-7 after:bg-[var(--red)]" />
    <span className="text-xl font-black italic tracking-[-.07em]">KARTING</span>
  </Link>;
}
