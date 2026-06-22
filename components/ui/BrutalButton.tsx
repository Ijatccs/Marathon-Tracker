import Link from "next/link";
import { cn } from "@/lib/utils";

type BrutalButtonVariant = "neo" | "outline" | "danger" | "ghost";

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrutalButtonVariant;
  href?: string;
}

const variants: Record<BrutalButtonVariant, string> = {
  neo: "bg-neo text-fg border-brutal shadow-brutal hover:bg-neo-dark",
  outline: "bg-bg text-fg border-brutal shadow-brutal hover:bg-muted",
  danger: "bg-danger text-white border-brutal shadow-brutal",
  ghost: "bg-transparent text-fg border-2 border-border hover:bg-muted",
};

export function BrutalButton({
  variant = "outline",
  className,
  href,
  children,
  ...props
}: BrutalButtonProps) {
  const classes = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 px-6 font-display text-sm font-bold uppercase tracking-wide press-brutal transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
