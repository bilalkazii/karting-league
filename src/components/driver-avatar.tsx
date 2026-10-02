import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-8 text-[9px]",
  md: "size-10 text-[10px]",
  lg: "size-14 text-sm",
  xl: "size-20 text-lg",
};

export function DriverAvatar({ color, textColor, initials, size = "md", className }: { color: string; textColor: string; initials: string; size?: keyof typeof sizes; className?: string }) {
  return <span className={cn("grid shrink-0 place-items-center rounded-full font-black", sizes[size], className)} style={{ backgroundColor: color, color: textColor }}>{initials}</span>;
}
