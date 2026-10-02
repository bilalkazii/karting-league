import { Shield, Star, Wrench } from "lucide-react";
import Link from "next/link";
import { DriverAvatar } from "@/components/driver-avatar";
import { RatingBadge } from "@/components/rating-badge";
import { Badge } from "@/components/ui/badge";
import { getDriverById, getAvailabilityLabel, getAvailabilityColor, getRoleBadgeStyle } from "@/lib/mock-data";
import type { GroupMember } from "@/types/group";

export function MemberCard({ member, actions }: { member: GroupMember; actions?: React.ReactNode }) {
  const driver = getDriverById(member.driverId);
  if (!driver) return null;

  return <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:bg-[var(--panel-raised)]">
    <Link href={`/drivers/${member.driverId}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)]">
      <DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{driver.name}</p><Badge className={getRoleBadgeStyle(member.role)}>
          {member.role === "admin" && <Shield size={8} className="mr-0.5" />}
          {member.role === "organizer" && <Star size={8} className="mr-0.5" />}
          {member.role === "member" && <Wrench size={8} className="mr-0.5" />}
          {member.role}
        </Badge></div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-[var(--muted)]">
          <span className="font-mono">#{driver.racingNumber}</span>
          <span className={getAvailabilityColor(member.availability)}>{getAvailabilityLabel(member.availability)}</span>
          {member.teamId && <span>Team assigned</span>}
        </div>
      </div>
    </Link>
    <RatingBadge rating={driver.rating} className="hidden sm:flex" />
    {actions}
  </div>;
}