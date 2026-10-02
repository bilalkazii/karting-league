"use client";

import { useState } from "react";
import { Check, Copy, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvitePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!open) return null;

  function handleCopyLink() {
    navigator.clipboard.writeText("https://karting.app/invite/x7Km2pQ9").then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function handleCopyCode() {
    navigator.clipboard.writeText("x7Km2pQ9").then(() => { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); });
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
    <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close invite panel" />
    <div className="relative w-full max-w-lg rounded-t-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:rounded-2xl">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Invite drivers</h2><button onClick={onClose} className="text-[var(--muted)] hover:text-white" aria-label="Close"><X size={18} /></button></div>
      <p className="mt-2 text-xs text-[var(--muted)]">Share this link or code with drivers you want to invite. This is mock data; backend integration will handle real invitations.</p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white/[.03] p-3"><Link2 size={15} className="shrink-0 text-[var(--muted)]" /><p className="min-w-0 flex-1 truncate font-mono text-xs">https://karting.app/invite/x7Km2pQ9</p><Button size="sm" variant="secondary" onClick={handleCopyLink}>{copied ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</Button></div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white/[.03] p-3"><span className="shrink-0 text-xs font-bold text-[var(--muted)]">Code</span><p className="min-w-0 flex-1 font-mono text-sm font-bold tracking-wider">x7Km2pQ9</p><Button size="sm" variant="secondary" onClick={handleCopyCode}>{copiedCode ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={13} />}{copiedCode ? "Copied" : "Copy"}</Button></div>
      </div>

      <div className="mt-5 rounded-lg border border-[var(--line)] bg-white/[.02] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Pending invitations</p>
        <p className="mt-2 text-xs text-[var(--muted)]">No pending invitations yet. Share the link or code above to get started.</p>
      </div>
    </div>
  </div>;
}
