"use client";

interface Stats {
  totalRegistered: number;
  notStarted: number;
  started: number;
  atCp1: number;
  atCp2: number;
  finished: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const STAT_ITEMS: Array<{ key: keyof Stats; label: string; accent?: boolean }> = [
  { key: "totalRegistered", label: "Registered" },
  { key: "notStarted", label: "Not Started" },
  { key: "started", label: "Started", accent: true },
  { key: "atCp1", label: "At CP 1", accent: true },
  { key: "atCp2", label: "At CP 2", accent: true },
  { key: "finished", label: "Finished", accent: true },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="border-brutal bg-bg p-4 shadow-brutal-sm"
        >
          <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-fg">
            {item.label}
          </p>
          <p
            className={`font-mono text-4xl font-bold tabular-nums ${
              item.accent ? "text-neo" : "text-fg"
            }`}
          >
            {stats[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
