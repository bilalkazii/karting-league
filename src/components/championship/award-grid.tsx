import { AwardCard, type AwardMark } from "@/components/championship/award-card";
import { EmptyChampionshipState } from "@/components/championship/empty-championship-state";
import type { Award, AwardType } from "@/types/championship";

export interface AwardGridItem {
  award: Award;
  recipientName: string | null;
  recipMark?: AwardMark | null;
}

export interface AwardGridProps {
  items: AwardGridItem[];
  demo?: boolean;
  emptyAction?: React.ReactNode;
}

export function AwardGrid({ items, demo, emptyAction }: AwardGridProps) {
  if (items.length === 0) return <EmptyChampionshipState variant="no_awards" action={emptyAction} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ award, recipientName, recipMark }) => (
        <AwardCard key={award.id} label={award.label} description={award.description} type={award.type as AwardType} recipientName={recipientName} value={award.value} recipMark={recipMark} demo={demo} />
      ))}
    </div>
  );
}