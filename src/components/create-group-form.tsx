"use client";

import { AlertCircle, CalendarDays, ChevronRight, Loader2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreateGroupFormProps {
  onCreated: () => void;
}

export function CreateGroupForm({ onCreated }: CreateGroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  function validate(): boolean {
    const next: { name?: string } = {};
    if (!name.trim()) next.name = "Group name is required";
    else if (name.trim().length > 40) next.name = "Group name must be 40 characters or less";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onCreated(); }, 600);
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-6">
    <div className="space-y-2">
      <label htmlFor="group-name" className="text-xs font-semibold">Group name <span className="text-[var(--red)]">*</span></label>
      <input id="group-name" type="text" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({}); }} placeholder="e.g. Karting Crew" maxLength={40} className={cn("w-full rounded-lg border bg-white/[.03] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]", errors.name ? "border-[var(--red)]" : "border-[var(--line)]")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "group-name-error" : undefined} />
      {errors.name && <p id="group-name-error" className="flex items-center gap-1 text-[10px] text-[var(--red-bright)]"><AlertCircle size={11} />{errors.name}</p>}
      <p className="text-[10px] text-[var(--muted)]">{name.length}/40 characters</p>
    </div>

    <div className="space-y-2">
      <label htmlFor="group-desc" className="text-xs font-semibold">Description</label>
      <textarea id="group-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group about?" rows={3} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <span className="text-xs font-semibold">Logo</span>
        <Card className="carbon flex h-24 items-center justify-center border-dashed"><span className="text-[10px] text-[var(--muted)]">Upload placeholder</span></Card>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-semibold">Cover image</span>
        <Card className="carbon flex h-24 items-center justify-center border-dashed"><span className="text-[10px] text-[var(--muted)]">Upload placeholder</span></Card>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
      <span className="inline-flex items-center gap-1 rounded bg-[var(--panel-raised)] px-2 py-1"><CalendarDays size={11} />Private group</span>
      <span className="inline-flex items-center gap-1 rounded bg-[var(--panel-raised)] px-2 py-1"><Users size={11} />Invitation only</span>
    </div>

    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={loading}>{loading ? <><Loader2 size={14} className="animate-spin" />Creating...</> : <><Plus size={14} />Create group</>}</Button>
      <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
    </div>
  </form>;
}

export function CreateGroupSuccess({ groupId }: { groupId: string }) {
  const router = useRouter();

  return <Card className="carbon mx-auto max-w-md p-8 text-center">
    <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--green)]/10"><svg className="size-7 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
    <h2 className="mt-4 text-lg font-bold">Group created!</h2>
    <p className="mt-1 text-xs text-[var(--muted)]">Your group is ready. You can now invite drivers and set up your first race.</p>
    <Button className="mt-6" onClick={() => router.push(`/groups/${groupId}`)}>Go to group <ChevronRight size={14} /></Button>
  </Card>;
}
