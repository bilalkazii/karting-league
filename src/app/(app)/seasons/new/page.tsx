"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Check, FlaskConical, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/races/demo-notice";
import { cn } from "@/lib/utils";

type ScoringPreset = "points_top8" | "points_top6" | "points_top3";

const presetLabels: Record<ScoringPreset, string> = {
  points_top8: "Top 8 score (25/18/15/12/10/8/6/4)·+1 pole",
  points_top6: "Top 6 score (25/18/15/12/10/8)·+1 pole",
  points_top3: "Top 3 score (20/12/10)·+1 pole",
};

interface FormState {
  name: string;
  year: string;
  preset: ScoringPreset;
  plannedRaces: string;
  notes: string;
  fastestLapPoints: boolean;
  penaltyAdjustment: boolean;
}

const initialState: FormState = { name: "", year: "2026", preset: "points_top8", plannedRaces: "5", notes: "", fastestLapPoints: false, penaltyAdjustment: false };

interface FormErrors {
  name?: string;
  plannedRaces?: string;
}

function validateNameInput(name: string): string | undefined {
  if (!name.trim()) return "Season name is required";
  if (name.trim().length > 60) return "Season name must be 60 characters or less";
  return undefined;
}

function validateRacesInput(value: string): string | undefined {
  const n = Number(value);
  if (!value.trim()) return "Planned races is required";
  if (!Number.isInteger(n) || n < 1) return "Planned races must be a positive whole number";
  if (n > 30) return "Planned races must be 30 or fewer";
  return undefined;
}

export default function NewSeasonPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" && errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
    if (key === "plannedRaces" && errors.plannedRaces) setErrors((prev) => ({ ...prev, plannedRaces: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors = {};
    const nameError = validateNameInput(form.name);
    const racesError = validateRacesInput(form.plannedRaces);
    if (nameError) next.name = nameError;
    if (racesError) next.plannedRaces = racesError;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    const displayName = `${form.name.trim()} ${form.year}`;
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader eyebrow="New season" title="Create a season" description="Standings, points, and awards across a planned set of races." />
        <Card className="carbon border-[var(--green)]/30 p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--green)]/10"><Check className="size-7 text-[var(--green)]" /></div>
          <h2 className="mt-4 text-lg font-bold">Season draft ready — locally previewed</h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
            “{displayName}” was validated successfully. This is a local demo flow — nothing is saved to a backend and the draft resets when you reload.
          </p>
          <div className="mt-5 rounded-lg border border-[var(--line)] bg-white/[.02] p-4 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Draft preview</p>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Season</dt><dd className="font-semibold">{displayName}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Scoring</dt><dd className="font-semibold">{presetLabels[form.preset]}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Planned races</dt><dd className="font-semibold">{Number(form.plannedRaces)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Fastest lap points</dt><dd className="font-semibold">{form.fastestLapPoints ? "Enabled" : "Disabled"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Penalty adjustment</dt><dd className="font-semibold">{form.penaltyAdjustment ? "Enabled" : "Disabled"}</dd></div>
            </dl>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/championship"><Button variant="secondary">Back to championship</Button></Link>
            <Button variant="ghost" onClick={() => { setSubmitted(false); setForm((prev) => ({ ...prev, name: "", notes: "" })); }}>Edit draft</Button>
          </div>
        </Card>
      </div>
    );
  }

  const inputClass = (hasError?: string) => cn("w-full rounded-lg border bg-white/[.03] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]", hasError ? "border-[var(--red)]" : "border-[var(--line)]");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader eyebrow="New season" title="Create a season" description="Standings, points, and awards across a planned set of races." />
      <DemoNotice text="Local demo flow — this form only previews a draft. No data is persisted." />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card className="space-y-5 p-5">
          <div className="flex items-center gap-2 text-sm font-bold"><CalendarDays size={14} className="text-[var(--red-bright)]" />Season details</div>

          <div className="space-y-2">
            <label htmlFor="season-name" className="text-xs font-semibold">Season name <span className="text-[var(--red)]">*</span></label>
            <input id="season-name" type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Crew Championship" maxLength={60} className={inputClass(errors.name)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "season-name-error" : undefined} />
            {errors.name && <p id="season-name-error" className="flex items-center gap-1 text-[10px] text-[var(--red-bright)]"><AlertCircle size={11} />{errors.name}</p>}
            <p className="text-[10px] text-[var(--muted)]">{form.name.length}/60 characters</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="season-year" className="text-xs font-semibold">Year <span className="text-[var(--red)]">*</span></label>
            <input id="season-year" type="number" min={2000} max={2100} value={form.year} onChange={(e) => set("year", e.target.value)} className={inputClass()} />
            <p className="text-[10px] text-[var(--muted)]">Used for the display name and date range.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="planned-races" className="text-xs font-semibold">Planned races <span className="text-[var(--red)]">*</span></label>
            <input id="planned-races" type="number" min={1} max={30} value={form.plannedRaces} onChange={(e) => set("plannedRaces", e.target.value)} className={inputClass(errors.plannedRaces)} aria-invalid={!!errors.plannedRaces} aria-describedby={errors.plannedRaces ? "planned-races-error" : undefined} />
            {errors.plannedRaces && <p id="planned-races-error" className="flex items-center gap-1 text-[10px] text-[var(--red-bright)]"><AlertCircle size={11} />{errors.plannedRaces}</p>}
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <div className="text-sm font-bold">Scoring</div>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold">Points preset</legend>
            {(["points_top8", "points_top6", "points_top3"] as const).map((preset) => (
              <label key={preset} className={cn("flex items-start gap-3 rounded-lg border border-[var(--line)] bg-white/[.02] px-4 py-3 transition has-[:checked]:border-[var(--red)]/50 has-[:checked]:bg-[var(--red)]/5", form.preset === preset && "border-[var(--red)]/50 bg-[var(--red)]/5")}>
                <input type="radio" name="preset" checked={form.preset === preset} onChange={() => set("preset", preset)} className="mt-0.5 accent-[var(--red)]" />
                <span className="min-w-0"><span className="block text-xs font-semibold">{presetLabels[preset]}</span><span className="mt-0.5 block text-[10px] text-[var(--muted)]">Positions ≥9 score 0 pts; DNF/DNS score 0 pts.</span></span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.fastestLapPoints} onChange={(e) => set("fastestLapPoints", e.target.checked)} className="accent-[var(--red)]" />Fastest-lap points</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.penaltyAdjustment} onChange={(e) => set("penaltyAdjustment", e.target.checked)} className="accent-[var(--red)]" />Penalty adjustment</label>
          </div>
          <p className="text-[10px] leading-relaxed text-[var(--muted)]">Fastest-lap points only apply when a fastest lap is recorded. Penalty adjustment recalculates finishing order from penalty seconds when enabled — disabled by default in V1.</p>
        </Card>

        <Card className="space-y-5 p-5">
          <div className="space-y-2">
            <label htmlFor="season-notes" className="text-xs font-semibold">Notes</label>
            <textarea id="season-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes about this season" rows={3} className={inputClass()} />
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit"><Plus size={14} />Preview season draft</Button>
          <Link href="/championship"><Button type="button" variant="ghost">Cancel</Button></Link>
        </div>

        <p className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><FlaskConical size={11} className="text-[var(--amber)]" />Submitting shows a local preview only — nothing is saved.</p>
      </form>
    </div>
  );
}