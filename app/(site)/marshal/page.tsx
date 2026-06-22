import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarshalPickerPage() {
  const checkpoints = await prisma.checkpoint.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight">
        Select Checkpoint
      </h1>
      <p className="mt-2 font-mono text-sm text-muted-fg">
        Choose your marshal station to open the scanner
      </p>

      <div className="mt-8 border-brutal bg-bg shadow-brutal">
        {checkpoints.map((cp) => (
          <Link
            key={cp.slug}
            href={`/marshal/${cp.slug}`}
            className="group flex items-center justify-between border-b border-border-light px-6 py-5 transition-colors last:border-b-0 hover:bg-neo"
          >
            <div>
              <p className="font-display text-xl font-bold uppercase tracking-wide">
                {cp.name}
              </p>
              <p className="font-mono text-xs text-muted-fg group-hover:text-fg">
                /marshal/{cp.slug}
              </p>
            </div>
            <ArrowRight
              className="h-6 w-6 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
