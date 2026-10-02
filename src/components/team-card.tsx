import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DriverAvatar } from "@/components/driver-avatar";
import { getDriverById } from "@/lib/mock-data";
import type { Team } from "@/types/team";

export function TeamCard({ team }: { team: Team }) {
  return <Card className="p-5">
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-lg text-xs font-black" style={{ backgroundColor: team.logoColor, color: team.logoTextColor }}>{team.logoInitials}</span>
      <div><h3 className="text-sm font-bold">{team.name}</h3><p className="text-[10px] text-[var(--muted)]">{team.memberIds.length} drivers</p></div>
    </div>
    <div className="mt-4 flex items-center">
      {team.memberIds.map((id, i) => {
        const d = getDriverById(id);
        return d ? <DriverAvatar key={id} color={d.avatarColor} textColor={d.avatarTextColor} initials={d.nickname} size="sm" className={i > 0 ? "-ml-2 ring-2 ring-[var(--panel)]" : ""} /> : null;
      })}
    </div>
    <div className="mt-3 space-y-1">{team.memberIds.map((id) => {
      const d = getDriverById(id);
      return d ? <div key={id} className="flex items-center gap-2 text-xs text-[var(--muted)]"><Users size={11} />{d.name} <span className="font-mono text-[10px]">#{d.racingNumber}</span></div> : null;
    })}</div>
  </Card>;
}
