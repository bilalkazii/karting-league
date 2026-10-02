"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, FlaskConical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/races/demo-notice";
import { CURRENT_USER_ID, getDriverGroups } from "@/lib/mock-data";
import type { RaceFormat } from "@/types/race";

const formats: { value: RaceFormat; label: string; hint: string }[] = [
  { value: "sprint", label: "Sprint", hint: "Short shake-down. One qualifying lap." },
  { value: "feature", label: "Feature", hint: "Main event of the day." },
  { value: "custom", label: "Custom", hint: "Fully custom rules." },
];

const formatLabels: Record<RaceFormat, string> = { sprint: "Sprint", feature: "Feature", custom: "Custom" };

interface FormState {
  name: string;
  venueName: string;
  date: string;
  startTime: string;
  format: RaceFormat;
  groupId: string;
}

const initialState: FormState = {
  name: "",
  venueName: "",
  date: "2026-10-10",
  startTime: "16:00",
  format: "sprint",
  groupId: "",
};

interface FormErrors {
  name?: string;
  venueName?: string;
  groupId?: string;
}

function validateForm(form: FormState): FormErrors {
  const next: FormErrors = {};
  if (!form.name.trim()) next.name = "Race name is required";
  if (!form.venueName.trim()) next.venueName = "Venue name is required";
  if (!form.groupId) next.groupId = "Please select a group";
  return next;
}

export default function NewRacePage() {
  const userGroups = getDriverGroups(CURRENT_USER_ID);
  const [form, setForm] = useState<FormState>(() => ({ ...initialState, groupId: userGroups[0]?.id ?? "" }));
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" && errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
    if (key === "venueName" && errors.venueName) setErrors((prev) => ({ ...prev, venueName: undefined }));
    if (key === "groupId" && errors.groupId) setErrors((prev) => ({ ...prev, groupId: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateForm(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    const groupName = userGroups.find((g) => g.id === form.groupId)?.name ?? "";
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/races" className="flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} />Back to races</Link>
        </div>
        <PageHeaderCompact />
        <Card className="carbon border-[var(--green)]/30 p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--green)]/10"><FlaskConical className="size-7 text-[var(--green)]" /></div>
          <h2 className="mt-4 text-lg font-bold">Race draft captured — locally previewed</h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
            &ldquo;{form.name.trim()}&rdquo; was validated successfully. This is a local demo flow &mdash; nothing is saved to a backend and the draft resets when you reload.
          </p>
          <div className="mt-5 rounded-lg border border-[var(--line)] bg-white/[.02] p-4 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Draft preview</p>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Race</dt><dd className="font-semibold">{form.name.trim()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Venue</dt><dd className="font-semibold">{form.venueName.trim()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Date</dt><dd className="font-semibold">{form.date} · {form.startTime}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Format</dt><dd className="font-semibold">{formatLabels[form.format]}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Group</dt><dd className="font-semibold">{groupName}</dd></div>
            </dl>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/races"><Button variant="secondary">Back to races</Button></Link>
            <Button variant="ghost" onClick={() => { setSubmitted(false); setForm(initialState); }}>Edit draft</Button>
          </div>
        </Card>
      </div>
    );
  }

  return <div className="mx-auto max-w-2xl space-y-6">
    <div className="flex items-center gap-3 text-sm text-[var(--muted)]"><Link href="/races" className="flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} />Back to races</Link></div>
    <PageHeaderCompact />
    <DemoNotice text="Races created here exist as local demo data and reset on reload." />

    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card><CardHeader><CardTitle>Basics</CardTitle></CardHeader><CardContent className="space-y-5">
        <Field label="Race name" htmlFor="race-name" error={errors.name} errorId="race-name-error">
          <input id="race-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Saturday GP" aria-invalid={!!errors.name} aria-describedby={errors.name ? "race-name-error" : undefined} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]" />
        </Field>
        <Field label="Group" htmlFor="race-group" error={errors.groupId} errorId="race-group-error">
          <div className="relative">
            <select id="race-group" value={form.groupId} onChange={(e) => set("groupId", e.target.value)} aria-invalid={!!errors.groupId} aria-describedby={errors.groupId ? "race-group-error" : undefined} className="w-full appearance-none rounded-lg border border-[var(--line)] bg-[#0b1013] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--red)]">
              <option value="">Select group</option>{userGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Venue" htmlFor="race-venue" error={errors.venueName} errorId="race-venue-error">
            <input id="race-venue" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} placeholder="Nashik Karting Arena" aria-invalid={!!errors.venueName} aria-describedby={errors.venueName ? "race-venue-error" : undefined} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]" />
          </Field>
          <Field label="Date" htmlFor="race-date">
            <input id="race-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--red)]" />
          </Field>
        </div>
        <Field label="Start time" htmlFor="race-start-time">
          <input id="race-start-time" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--red)]" />
        </Field>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Format</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-3">{formats.map((f) => <button key={f.value} type="button" onClick={() => set("format", f.value)} className={`rounded-xl border p-4 text-left transition ${form.format === f.value ? "border-[var(--red)]/50 bg-[var(--red)]/10" : "border-[var(--line)] bg-white/[.02] hover:border-white/20"}`}><p className="text-sm font-bold">{f.label}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{f.hint}</p></button>)}</div>
        <p className="text-[10px] text-[var(--muted)]">V1 measures one official qualifying lap per driver.</p>
      </CardContent></Card>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit"><Plus size={14} />Preview race draft</Button>
        <Link href="/races"><Button type="button" variant="ghost">Cancel</Button></Link>
      </div>
      <p className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><FlaskConical size={11} className="text-[var(--amber)]" />Submitting shows a local preview only &mdash; nothing is saved.</p>
    </form>
  </div>;
}

function PageHeaderCompact() {
  return <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--red-bright)]">New race</p><h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-4xl">Set up a race</h1></div>;
}

function Field({ label, htmlFor, children, error, errorId }: { label: string; htmlFor?: string; children: React.ReactNode; error?: string; errorId?: string }) {
  return <div><label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">{label}</label>{children}{error && <p id={errorId} className="mt-1 flex items-center gap-1 text-[10px] text-[var(--red-bright)]">{error}</p>}</div>;
}
