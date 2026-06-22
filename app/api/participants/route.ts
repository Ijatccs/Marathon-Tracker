import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLeaderboard } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim().toUpperCase();

  const participants = await prisma.participant.findMany({
    where: search
      ? {
          OR: [
            { bibNumber: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : undefined,
    include: {
      scans: {
        include: { checkpoint: true },
        orderBy: { scannedAt: "asc" },
      },
    },
    orderBy: { bibNumber: "asc" },
  });

  const progress = computeLeaderboard(participants);

  return NextResponse.json({
    participants: progress.map((p) => ({
      id: p.id,
      bibNumber: p.bibNumber,
      name: p.name,
      status: p.status,
      lastCheckpointName: p.lastCheckpointName,
      lastScannedAt: p.lastScannedAt?.toISOString() ?? null,
      scans: p.scans.map((s) => ({
        checkpointName: s.checkpointName,
        checkpointSlug: s.checkpointSlug,
        checkpointOrder: s.checkpointOrder,
        scannedAt: s.scannedAt.toISOString(),
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const participants = Array.isArray(body.participants) ? body.participants : [];

    const created = [];
    for (const item of participants) {
      const bibNumber = String(item.bibNumber ?? item).trim().toUpperCase();
      const name = item.name ? String(item.name) : null;

      if (!bibNumber) continue;

      const participant = await prisma.participant.upsert({
        where: { bibNumber },
        update: { name },
        create: { bibNumber, name },
      });
      created.push(participant);
    }

    return NextResponse.json({ created: created.length, participants: created });
  } catch (error) {
    console.error("Participant import error:", error);
    return NextResponse.json(
      { error: "Failed to import participants" },
      { status: 500 }
    );
  }
}
