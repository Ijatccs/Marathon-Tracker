import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  const { bib } = await params;
  const bibNumber = bib.trim().toUpperCase();

  const participant = await prisma.participant.findUnique({
    where: { bibNumber },
  });

  if (!participant) {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  }

  const png = await QRCode.toBuffer(bibNumber, {
    type: "png",
    width: 256,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
