"use client";

import {
  BrutalBadge,
  statusLabel,
  statusToBadgeVariant,
} from "@/components/ui/BrutalBadge";
import {
  BrutalTable,
  BrutalTableBody,
  BrutalTableCell,
  BrutalTableHead,
  BrutalTableHeaderCell,
  BrutalTableRow,
} from "@/components/ui/BrutalTable";
import type { ParticipantStatus } from "@/lib/leaderboard";

interface LeaderboardEntry {
  rank: number;
  bibNumber: string;
  name: string | null;
  status: ParticipantStatus;
  lastCheckpointName: string | null;
  lastScannedAt: string | null;
  elapsed: string | null;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  autoScroll?: boolean;
}

export function LeaderboardTable({
  entries,
  autoScroll = false,
}: LeaderboardTableProps) {
  return (
    <div
      className={autoScroll ? "max-h-[70dvh] overflow-y-auto" : undefined}
      id="leaderboard-scroll"
    >
      <BrutalTable>
        <BrutalTableHead>
          <BrutalTableHeaderCell>Rank</BrutalTableHeaderCell>
          <BrutalTableHeaderCell>Bib</BrutalTableHeaderCell>
          <BrutalTableHeaderCell>Name</BrutalTableHeaderCell>
          <BrutalTableHeaderCell>Status</BrutalTableHeaderCell>
          <BrutalTableHeaderCell>Last CP</BrutalTableHeaderCell>
          <BrutalTableHeaderCell>Time</BrutalTableHeaderCell>
        </BrutalTableHead>
        <BrutalTableBody>
          {entries.map((entry, i) => (
            <BrutalTableRow key={entry.bibNumber} alternate={i % 2 === 1}>
              <BrutalTableCell>
                <span
                  className={`font-display text-2xl font-black ${
                    entry.rank === 1
                      ? "inline-flex h-10 w-10 items-center justify-center bg-neo text-fg"
                      : ""
                  }`}
                >
                  {entry.rank}
                </span>
              </BrutalTableCell>
              <BrutalTableCell mono>
                <span className="font-bold text-neo">{entry.bibNumber}</span>
              </BrutalTableCell>
              <BrutalTableCell>{entry.name ?? "—"}</BrutalTableCell>
              <BrutalTableCell>
                <BrutalBadge variant={statusToBadgeVariant(entry.status)}>
                  {statusLabel(entry.status)}
                </BrutalBadge>
              </BrutalTableCell>
              <BrutalTableCell>
                {entry.lastCheckpointName ?? "—"}
              </BrutalTableCell>
              <BrutalTableCell mono>{entry.elapsed ?? "—"}</BrutalTableCell>
            </BrutalTableRow>
          ))}
        </BrutalTableBody>
      </BrutalTable>
    </div>
  );
}
