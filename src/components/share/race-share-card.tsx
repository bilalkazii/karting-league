import { ShareCardPreview, type ShareCardLine } from "@/components/share/share-card-preview";
import type { ShareCardType } from "@/types/championship";

const kindKickers: Record<ShareCardType, string> = {
  race_winner: "Race winner",
  podium: "Podium",
  pole_position: "Pole position",
  qualifying: "Qualifying",
  championship_standings: "Championship standings",
  driver_profile: "Driver profile",
  season_award: "Season award",
};

export interface RaceShareCardProps {
  kind: ShareCardType;
  title: string;
  subtitle?: string;
  lines: ShareCardLine[];
  footer?: string;
  badge?: string;
}

export function RaceShareCard({ kind, title, subtitle, lines, footer, badge }: RaceShareCardProps) {
  return <ShareCardPreview kicker={kindKickers[kind]} title={title} subtitle={subtitle} lines={lines} footer={footer} badge={badge} />;
}