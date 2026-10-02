import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getRatingLabel, getRatingColor } from "@/lib/mock-data";

export function RatingBadge({ rating, className }: { rating: number; className?: string }) {
  return <Badge className={cn("border", getRatingColor(rating), className)}>{rating} {getRatingLabel(rating)}</Badge>;
}
