import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLeaderboard, formatDuration } from "@/lib/leaderboard";

export async function GET() {
  const participants = await prisma.participant.findMany({
    include: {
      scans: {
        include: { checkpoint: true },
        orderBy: { scannedAt: "asc" },
      },
    },
  });

  const ranked = computeLeaderboard(participants);

  const startScans = new Map<string, Date>();
  for (const p of participants) {
    const start = p.scans.find((s) => s.checkpoint.order === 0);
    if (start) startScans.set(p.id, start.scannedAt);
  }

  return NextResponse.json({
    leaderboard: ranked.map((entry, index) => {
      const startTime = startScans.get(entry.id);
      const elapsed =
        entry.lastScannedAt && startTime
          ? formatDuration(startTime, entry.lastScannedAt)
          : null;

      return {
        rank: index + 1,
        id: entry.id,
        bibNumber: entry.bibNumber,
        name: entry.name,
        status: entry.status,
        lastCheckpointName: entry.lastCheckpointName,
        lastScannedAt: entry.lastScannedAt?.toISOString() ?? null,
        elapsed,
        scans: entry.scans.map((s) => ({
          checkpointName: s.checkpointName,
          checkpointSlug: s.checkpointSlug,
          scannedAt: s.scannedAt.toISOString(),
        })),
      };
    }),
  });
}
