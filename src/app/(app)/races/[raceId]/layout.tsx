import { notFound } from "next/navigation";
import { RaceProvider } from "@/components/races/race-provider";
import { RaceHeader } from "@/components/races/race-header";
import { RaceTabs } from "@/components/races/race-tabs";
import { getRaceById, getRaceDrivers, getRacePenalties, getRaceEvents } from "@/lib/repositories/races";

export default async function RaceLayout({ params, children }: { params: Promise<{ raceId: string }>; children: React.ReactNode }) {
  const { raceId } = await params;
  const race = await getRaceById(raceId);
  if (!race) notFound();
  const drivers = await getRaceDrivers(raceId);
  return (
    <RaceProvider key={raceId} race={race} drivers={drivers} penalties={await getRacePenalties(raceId)} events={await getRaceEvents(raceId)}>
      <div className="space-y-6">
        <RaceHeader />
        <RaceTabs raceId={raceId} />
        {children}
      </div>
    </RaceProvider>
  );
}