import { cn } from "@/lib/utils";

interface BrutalTableProps {
  children: React.ReactNode;
  className?: string;
}

export function BrutalTable({ children, className }: BrutalTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto border-brutal", className)}>
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function BrutalTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 border-b-[3px] border-fg bg-fg text-bg">
      <tr>{children}</tr>
    </thead>
  );
}

export function BrutalTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 font-display text-xs font-bold uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
}

export function BrutalTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function BrutalTableRow({
  children,
  alternate,
}: {
  children: React.ReactNode;
  alternate?: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border-light",
        alternate && "bg-muted"
      )}
    >
      {children}
    </tr>
  );
}

export function BrutalTableCell({
  children,
  className,
  mono,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm",
        mono && "font-mono tabular-nums",
        className
      )}
    >
      {children}
    </td>
  );
}
