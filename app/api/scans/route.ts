import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bibNumber = String(body.bibNumber ?? "")
      .trim()
      .toUpperCase();
    const checkpointSlug = String(body.checkpointSlug ?? "").trim().toLowerCase();

    if (!bibNumber || !checkpointSlug) {
      return NextResponse.json(
        { error: "Bib number and checkpoint are required" },
        { status: 400 }
      );
    }

    const [participant, checkpoint] = await Promise.all([
      prisma.participant.findUnique({ where: { bibNumber } }),
      prisma.checkpoint.findUnique({ where: { slug: checkpointSlug } }),
    ]);

    if (!checkpoint) {
      return NextResponse.json(
        { error: `Unknown checkpoint: ${checkpointSlug}` },
        { status: 404 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { error: `Unknown bib: ${bibNumber}` },
        { status: 404 }
      );
    }

    const existingScan = await prisma.scan.findUnique({
      where: {
        participantId_checkpointId: {
          participantId: participant.id,
          checkpointId: checkpoint.id,
        },
      },
    });

    if (existingScan) {
      return NextResponse.json(
        {
          error: `${bibNumber} already scanned at ${checkpoint.name}`,
        },
        { status: 409 }
      );
    }

    let warning = false;
    let message = `${bibNumber} scanned at ${checkpoint.name}`;

    if (checkpoint.order > 0) {
      const previousCheckpoint = await prisma.checkpoint.findFirst({
        where: { order: checkpoint.order - 1 },
      });

      if (previousCheckpoint) {
        const previousScan = await prisma.scan.findUnique({
          where: {
            participantId_checkpointId: {
              participantId: participant.id,
              checkpointId: previousCheckpoint.id,
            },
          },
        });

        if (!previousScan) {
          warning = true;
          message = `${bibNumber} scanned — missed ${previousCheckpoint.name}`;
        }
      }
    }

    const scan = await prisma.scan.create({
      data: {
        participantId: participant.id,
        checkpointId: checkpoint.id,
      },
      include: {
        participant: true,
        checkpoint: true,
      },
    });

    return NextResponse.json({
      success: true,
      warning,
      message,
      scan: {
        id: scan.id,
        bibNumber: scan.participant.bibNumber,
        checkpointName: scan.checkpoint.name,
        checkpointSlug: scan.checkpoint.slug,
        scannedAt: scan.scannedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Failed to record scan" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);

  const scans = await prisma.scan.findMany({
    take: Math.min(limit, 100),
    orderBy: { scannedAt: "desc" },
    include: {
      participant: true,
      checkpoint: true,
    },
  });

  return NextResponse.json({
    scans: scans.map((scan) => ({
      id: scan.id,
      bibNumber: scan.participant.bibNumber,
      participantName: scan.participant.name,
      checkpointName: scan.checkpoint.name,
      checkpointSlug: scan.checkpoint.slug,
      scannedAt: scan.scannedAt.toISOString(),
    })),
  });
}
