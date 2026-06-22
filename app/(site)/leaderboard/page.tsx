"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ScrollText } from "lucide-react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { BrutalButton } from "@/components/ui/BrutalButton";
import type { ParticipantStatus } from "@/lib/leaderboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface LeaderboardEntry {
  rank: number;
  bibNumber: string;
  name: string | null;
  status: ParticipantStatus;
  lastCheckpointName: string | null;
  lastScannedAt: string | null;
  elapsed: string | null;
}

export default function LeaderboardPage() {
  const [autoScroll, setAutoScroll] = useState(false);
  const [blink, setBlink] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useRef<1 | -1>(1);

  const { data, isValidating } = useSWR("/api/leaderboard", fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (isValidating) {
      setBlink(true);
      const timer = setTimeout(() => setBlink(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isValidating]);

  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      const atTop = el.scrollTop <= 2;

      if (atBottom) scrollDirection.current = -1;
      if (atTop) scrollDirection.current = 1;

      el.scrollTop += scrollDirection.current * 2;
    }, 50);

    return () => clearInterval(interval);
  }, [autoScroll]);

  const entries: LeaderboardEntry[] = data?.leaderboard ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Leaderboard
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`h-2 w-2 ${blink ? "bg-neo" : "bg-muted-fg"} transition-colors`}
              aria-hidden="true"
            />
            <p className="font-mono text-sm text-muted-fg">
              Live — refreshes every 5s
            </p>
          </div>
        </div>
        <BrutalButton
          variant={autoScroll ? "neo" : "outline"}
          onClick={() => setAutoScroll((v) => !v)}
        >
          <ScrollText className="mr-2 h-4 w-4" aria-hidden="true" />
          {autoScroll ? "Auto-Scroll On" : "Auto-Scroll Off"}
        </BrutalButton>
      </div>

      {entries.length === 0 ? (
        <div className="border-brutal bg-bg p-12 text-center shadow-brutal">
          <p className="font-display text-xl uppercase tracking-wide">
            No participants yet
          </p>
          <p className="mt-2 font-mono text-sm text-muted-fg">
            Scans will appear here as marshals check in runners
          </p>
        </div>
      ) : (
        <div ref={scrollRef}>
          <LeaderboardTable entries={entries} autoScroll={autoScroll} />
        </div>
      )}
    </div>
  );
}
