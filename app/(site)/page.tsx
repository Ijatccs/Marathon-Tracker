import Link from "next/link";
import { ArrowRight, BarChart3, QrCode, Trophy } from "lucide-react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";

const CHECKPOINTS = [
  { slug: "start", name: "Starting Line" },
  { slug: "cp1", name: "CP 1" },
  { slug: "cp2", name: "CP 2" },
  { slug: "finish", name: "Finish Line" },
];

const NAV_CARDS = [
  {
    href: "/dashboard",
    title: "Dashboard",
    desc: "Live race stats & QR generator",
    icon: BarChart3,
  },
  {
    href: "/leaderboard",
    title: "Leaderboard",
    desc: "Public rankings & progress",
    icon: Trophy,
  },
  {
    href: "/marshal",
    title: "Marshal Scan",
    desc: "Choose checkpoint & open scanner",
    icon: QrCode,
  },
];

export default function HomePage() {
  return (
    <div className="grid-texture min-h-dvh">
      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16 md:py-24">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-fg">
            Race Control System
          </p>
          <h1 className="font-display text-[clamp(4rem,15vw,8rem)] font-black uppercase leading-[0.85] tracking-tight">
            Marathon
            <br />
            <span className="text-neo">Scan</span>
          </h1>
          <p className="max-w-md font-body text-lg text-muted-fg">
            Continuous QR scanning for marathon checkpoints. Marshals scan
            without stopping the camera.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {NAV_CARDS.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <BrutalCard
                stripe
                className="h-full p-6 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal-lg"
              >
                <card.icon className="mb-4 h-8 w-8" aria-hidden="true" />
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm text-muted-fg">{card.desc}</p>
              </BrutalCard>
            </Link>
          ))}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide">
            Marshal Checkpoints
          </h2>
          <div className="border-brutal bg-bg shadow-brutal">
            {CHECKPOINTS.map((cp, i) => (
              <Link
                key={cp.slug}
                href={`/marshal/${cp.slug}`}
                className="group flex items-center justify-between border-b border-border-light px-6 py-4 transition-colors last:border-b-0 hover:bg-muted"
              >
                <div>
                  <p className="font-mono text-lg font-bold">{cp.name}</p>
                  <p className="font-mono text-xs text-muted-fg">
                    /marshal/{cp.slug}
                  </p>
                </div>
                <ArrowRight
                  className="h-5 w-5 text-neo transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        <footer className="flex gap-4">
          <BrutalButton href="/dashboard" variant="neo">
            Open Dashboard
          </BrutalButton>
          <BrutalButton href="/leaderboard" variant="outline">
            View Leaderboard
          </BrutalButton>
        </footer>
      </main>
    </div>
  );
}
