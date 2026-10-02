import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { RaceCard } from "@/components/races/race-card";
import { DemoNotice } from "@/components/races/demo-notice";
import { getCurrentDriverProfile } from "@/lib/supabase/profile";
import { getRacesForUser, getRaceDrivers } from "@/lib/repositories/races";
import type { Race } from "@/types/race";

export default async function RacesPage() {
  const driver = await getCurrentDriverProfile();
  const races = driver ? await getRacesForUser(driver.id) : [];

  const withCounts: { race: Race; driverCount: number }[] = await Promise.all(
    races.map(async (race) => ({
      race,
      driverCount: (await getRaceDrivers(race.id)).length,
    })),
  );

  return <div className="space-y-8">
    <PageHeader eyebrow="Race weekends" title="Races" description="Lobbies, qualifying, grids, and results for your groups." actions={<Link href="/races/new"><Button><Plus size={14} />Create race</Button></Link>} />
    <DemoNotice />
    {withCounts.length === 0 ? <EmptyState title="No races yet" description="Create your first race to open a lobby and start qualifying." action={<Link href="/races/new"><Button><Plus size={14} />Create race</Button></Link>} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{withCounts.map(({ race, driverCount }) => <RaceCard key={race.id} race={race} driverCount={driverCount} />)}</div>}
  </div>;
}