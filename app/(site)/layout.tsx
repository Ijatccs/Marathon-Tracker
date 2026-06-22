import Link from "next/link";
import { BarChart3, Home, QrCode, Trophy } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/marshal", label: "Scan", icon: QrCode },
];

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav
        className="sticky top-0 z-40 flex items-center gap-1 border-b-[3px] border-fg bg-bg px-4 py-2 md:gap-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="mr-2 font-display text-lg font-black uppercase tracking-tight"
        >
          Marathon<span className="text-neo">Scan</span>
        </Link>
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 min-w-11 items-center gap-1.5 px-3 font-display text-xs font-bold uppercase tracking-wide transition-colors hover:bg-neo hover:text-fg"
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
}
