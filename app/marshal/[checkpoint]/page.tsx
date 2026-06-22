import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CHECKPOINT_NAMES: Record<string, string> = {
  start: "Starting Line",
  cp1: "CP 1",
  cp2: "CP 2",
  finish: "Finish Line",
};

export default async function MarshalPage({
  params,
}: {
  params: Promise<{ checkpoint: string }>;
}) {
  const { checkpoint } = await params;
  const slug = checkpoint.toLowerCase();

  const dbCheckpoint = await prisma.checkpoint.findUnique({
    where: { slug },
  });

  const checkpointName =
    dbCheckpoint?.name ?? CHECKPOINT_NAMES[slug];

  if (!checkpointName) {
    notFound();
  }

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 flex h-12 w-12 items-center justify-center border-[3px] border-bg bg-fg text-bg shadow-brutal-sm press-brutal"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <QRScanner checkpointSlug={slug} checkpointName={checkpointName} />
    </>
  );
}
