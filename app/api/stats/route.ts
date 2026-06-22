import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLeaderboard, computeStats } from "@/lib/leaderboard";

export async function GET() {
  const [participants, totalRegistered] = await Promise.all([
    prisma.participant.findMany({
      include: {
        scans: {
          include: { checkpoint: true },
          orderBy: { scannedAt: "asc" },
        },
      },
    }),
    prisma.participant.count(),
  ]);

  const progress = computeLeaderboard(participants);
  const stats = computeStats(totalRegistered, progress);

  const checkpoints = await prisma.checkpoint.findMany({
    orderBy: { order: "asc" },
  });

  const checkpointFlow = checkpoints.map((cp) => ({
    slug: cp.slug,
    name: cp.name,
    order: cp.order,
    count: progress.filter((p) => p.highestOrder >= cp.order).length,
  }));

  return NextResponse.json({ stats, checkpointFlow });
}
