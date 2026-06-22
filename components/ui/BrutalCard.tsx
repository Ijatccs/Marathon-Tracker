import { cn } from "@/lib/utils";

interface BrutalCardProps {
  children: React.ReactNode;
  className?: string;
  stripe?: boolean;
}

export function BrutalCard({ children, className, stripe }: BrutalCardProps) {
  return (
    <div
      className={cn(
        "relative border-brutal bg-bg shadow-brutal",
        stripe && "pt-1",
        className
      )}
    >
      {stripe && <div className="absolute inset-x-0 top-0 h-1 bg-neo" />}
      {children}
    </div>
  );
}
