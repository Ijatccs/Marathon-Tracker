import { cn } from "@/lib/utils";
import type { ParticipantStatus } from "@/lib/leaderboard";

type BadgeVariant = "neo" | "default" | "danger" | "warning";

interface BrutalBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  neo: "bg-neo text-fg border-fg",
  default: "bg-fg text-bg border-fg",
  danger: "bg-danger text-white border-fg",
  warning: "bg-warning text-fg border-fg",
};

export function BrutalBadge({
  children,
  variant = "default",
  className,
}: BrutalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(
  status: ParticipantStatus
): BadgeVariant {
  switch (status) {
    case "FINISHED":
    case "STARTED":
    case "CP1":
    case "CP2":
      return "neo";
    case "NOT_STARTED":
      return "default";
    default:
      return "default";
  }
}

export function statusLabel(status: ParticipantStatus): string {
  switch (status) {
    case "NOT_STARTED":
      return "Not Started";
    case "STARTED":
      return "Started";
    case "CP1":
      return "CP 1";
    case "CP2":
      return "CP 2";
    case "FINISHED":
      return "Finished";
    default:
      return status;
  }
}
