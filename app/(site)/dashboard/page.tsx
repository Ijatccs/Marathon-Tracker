"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Printer, RefreshCw, RotateCcw } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalInput } from "@/components/ui/BrutalInput";
import {
  BrutalBadge,
  statusLabel,
  statusToBadgeVariant,
} from "@/components/ui/BrutalBadge";
import type { ParticipantStatus } from "@/lib/leaderboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CheckpointFlow {
  slug: string;
  name: string;
  order: number;
  count: number;
}

interface ParticipantResult {
  id: string;
  bibNumber: string;
  name: string | null;
  status: ParticipantStatus;
  scans: Array<{
    checkpointName: string;
    scannedAt: string;
  }>;
}

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [resetting, setResetting] = useState(false);

  const { data: statsData, mutate: mutateStats } = useSWR("/api/stats", fetcher, {
    refreshInterval: 3000,
  });

  const { data: scansData, mutate: mutateScans } = useSWR(
    "/api/scans?limit=20",
    fetcher,
    { refreshInterval: 3000 }
  );

  const { data: participantsData } = useSWR(
    debouncedSearch
      ? `/api/participants?search=${encodeURIComponent(debouncedSearch)}`
      : null,
    fetcher
  );

  const { data: allParticipants } = useSWR("/api/participants", fetcher);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = statsData?.stats ?? {
    totalRegistered: 0,
    notStarted: 0,
    started: 0,
    atCp1: 0,
    atCp2: 0,
    finished: 0,
  };

  const checkpointFlow: CheckpointFlow[] = statsData?.checkpointFlow ?? [];
  const maxCount = Math.max(...checkpointFlow.map((c) => c.count), 1);

  const handleRefresh = () => {
    void mutateStats();
    void mutateScans();
  };

  const handlePrintQR = () => {
    window.print();
  };

  const handleResetRace = async () => {
    const confirmed = window.confirm(
      "Reset the entire race? This will delete ALL scan records. Participants and QR codes are kept."
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      void mutateStats();
      void mutateScans();
      alert(data.message ?? "Race reset successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="font-mono text-sm text-muted-fg">
            Live race control — refreshes every 3s
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BrutalButton variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </BrutalButton>
          <BrutalButton variant="neo" onClick={handlePrintQR}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print QR Sheet
          </BrutalButton>
          <BrutalButton
            variant="danger"
            onClick={() => void handleResetRace()}
            disabled={resetting}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {resetting ? "Resetting…" : "Reset Race"}
          </BrutalButton>
        </div>
      </div>

      <section className="mb-8">
        <StatsCards stats={stats} />
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <BrutalCard className="p-0">
          <div className="border-b-[3px] border-fg px-4 py-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Checkpoint Flow
            </h2>
          </div>
          <div className="space-y-4 p-4">
            {checkpointFlow.map((cp) => (
              <div key={cp.slug}>
                <div className="mb-1 flex justify-between font-mono text-sm">
                  <span>{cp.name}</span>
                  <span className="font-bold tabular-nums">{cp.count}</span>
                </div>
                <div className="h-6 border-[2px] border-fg bg-muted">
                  <div
                    className={`h-full transition-all duration-300 ${
                      cp.order === checkpointFlow.length - 1
                        ? "bg-neo"
                        : "bg-fg"
                    }`}
                    style={{ width: `${(cp.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </BrutalCard>

        <BrutalCard className="p-0">
          <div className="border-b-[3px] border-fg px-4 py-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Recent Activity
            </h2>
          </div>
          <ActivityFeed scans={scansData?.scans ?? []} />
        </BrutalCard>
      </div>

      <section className="mb-8">
        <BrutalCard className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">
            Participant Search
          </h2>
          <BrutalInput
            label="Search by bib or name"
            placeholder="RN001"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
          />

          {debouncedSearch && participantsData?.participants && (
            <div className="mt-6 space-y-4">
              {(participantsData.participants as ParticipantResult[]).map(
                (p) => (
                  <div
                    key={p.id}
                    className="border-[2px] border-fg p-4"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="font-mono text-xl font-bold text-neo">
                        {p.bibNumber}
                      </span>
                      <BrutalBadge variant={statusToBadgeVariant(p.status)}>
                        {statusLabel(p.status)}
                      </BrutalBadge>
                      {p.name && (
                        <span className="text-muted-fg">{p.name}</span>
                      )}
                    </div>
                    {p.scans.length > 0 ? (
                      <div className="relative ml-3 border-l-[3px] border-fg pl-6">
                        {p.scans.map((scan, i) => (
                          <div key={i} className="relative mb-3 last:mb-0">
                            <div className="absolute -left-[calc(1.5rem+4.5px)] top-1.5 h-3 w-3 bg-neo" />
                            <p className="font-mono text-sm">
                              {scan.checkpointName}
                            </p>
                            <p className="font-mono text-xs text-muted-fg">
                              {new Date(scan.scannedAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-muted-fg">
                        No scans recorded
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </BrutalCard>
      </section>

      {/* QR Print Sheet — visible on screen and in print */}
      <section className="print:block" id="qr-sheet">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            QR Code Sheet
          </h2>
          <p className="font-mono text-xs text-muted-fg">
            {allParticipants?.participants?.length ?? 0} participants
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 print:grid-cols-4">
          {(allParticipants?.participants ?? []).map(
            (p: { bibNumber: string }) => (
              <div
                key={p.bibNumber}
                className="flex flex-col items-center border-[2px] border-fg p-3 print:break-inside-avoid"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${p.bibNumber}`}
                  alt={`QR code for ${p.bibNumber}`}
                  width={120}
                  height={120}
                  className="mb-2"
                />
                <span className="font-mono text-sm font-bold">
                  {p.bibNumber}
                </span>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
