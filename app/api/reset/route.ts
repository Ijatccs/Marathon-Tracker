import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const result = await prisma.scan.deleteMany();

    return NextResponse.json({
      success: true,
      message: `Race reset — ${result.count} scan(s) cleared`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset race" },
      { status: 500 }
    );
  }
}
