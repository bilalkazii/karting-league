"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvailabilitySelector } from "@/components/availability-selector";
import { getAvailabilityLabel, getAvailabilityColor } from "@/lib/mock-data";
import type { DriverAvailability } from "@/types/driver";

export function AvailabilityCard() {
  const [availability, setAvailability] = useState<DriverAvailability>("available");

  return <Card><CardHeader className="items-start gap-1"><CardTitle className="flex items-center gap-1.5"><CalendarDays size={14} className="text-[var(--red-bright)]" />Your weekend availability</CardTitle></CardHeader><CardContent><p className="mb-3 text-xs text-[var(--muted)]">Set your status for the next race. This updates local state only.</p><AvailabilitySelector value={availability} onChange={setAvailability} /><p className="mt-3 text-xs" >Status: <span className={getAvailabilityColor(availability)}>{getAvailabilityLabel(availability)}</span></p></CardContent></Card>;
}