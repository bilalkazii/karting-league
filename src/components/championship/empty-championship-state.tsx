import { EmptyState } from "@/components/empty-state";

export type EmptyChampionshipVariant = "no_active_season" | "no_completed_races" | "no_standings" | "no_awards" | "no_results" | "missing";

export interface EmptyChampionshipStateProps {
  variant: EmptyChampionshipVariant;
  customTitle?: string;
  customDescription?: string;
  action?: React.ReactNode;
}

const copy: Record<string, { title: string; description: string }> = {
  no_active_season: { title: "No active season", description: "Create a season to start tracking points, standings, and awards across races." },
  no_completed_races: { title: "No completed races", description: "Standings and results build from completed races with recorded finishing positions." },
  no_standings: { title: "No standings yet", description: "Standings appear as soon as a season has at least one completed race with results." },
  no_awards: { title: "No awards yet", description: "Awards are granted from season milestones and races with recorded results." },
  no_results: { title: "No results yet", description: "Complete a race and record finishing positions to publish official results." },
};

export function EmptyChampionshipState({ variant, customTitle, customDescription, action }: EmptyChampionshipStateProps) {
  if (variant === "missing") return <EmptyState title={customTitle ?? "Not found"} description={customDescription ?? "The requested item could not be found or is not available to you."} action={action} />;
  const { title, description } = copy[variant];
  return <EmptyState title={customTitle ?? title} description={customDescription ?? description} action={action} />;
}