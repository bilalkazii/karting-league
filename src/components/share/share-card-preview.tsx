export interface ShareCardLine {
  label: string;
  value: string;
  emphasize?: boolean;
}

export interface ShareCardPreviewProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  lines: ShareCardLine[];
  footer?: string;
  badge?: string;
}

export function ShareCardPreview({ kicker, title, subtitle, lines, footer, badge }: ShareCardPreviewProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="carbon relative h-24 bg-[#16100e]">
        <div className="absolute -right-10 -top-16 size-48 rounded-full bg-[var(--red)]/20 blur-3xl" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between">
          <span className="relative flex h-6 w-8 skew-x-[-20deg] items-center justify-center bg-[var(--red)]"><span className="absolute right-1 top-0 h-2.5 w-6 bg-[var(--red)]" /></span>
          <span className="text-[10px] font-black uppercase tracking-[.25em] text-[var(--red-bright)]">{kicker ?? "Karting"}</span>
        </div>
        <div className="absolute inset-x-5 bottom-3"><p className="truncate text-lg font-black tracking-[-.03em]">{title}</p></div>
      </div>
      <div className="space-y-2 p-5">
        {subtitle && <p className="text-[11px] text-[var(--muted)]">{subtitle}</p>}
        {badge && <span className="inline-flex items-center rounded-full border border-[var(--red)]/30 bg-[var(--red)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--red-bright)]">{badge}</span>}
        <div className="mt-3 divide-y divide-[var(--line)]/70">
          {lines.map((line) => (
            <div key={line.label} className="flex items-baseline justify-between gap-4 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{line.label}</span>
              <span className={line.emphasize ? "font-mono text-sm font-black text-[var(--red-bright)]" : "truncate text-right text-xs font-semibold"}>{line.value}</span>
            </div>
          ))}
        </div>
      </div>
      {footer && <p className="border-t border-[var(--line)] px-5 py-2.5 text-[9px] uppercase tracking-widest text-[var(--muted)]">{footer}</p>}
    </div>
  );
}