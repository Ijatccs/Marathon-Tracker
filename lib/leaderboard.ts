export type ParticipantStatus =
  | "NOT_STARTED"
  | "STARTED"
  | "CP1"
  | "CP2"
  | "FINISHED";

export interface ScanRecord {
  checkpointSlug: string;
  checkpointName: string;
  checkpointOrder: number;
  scannedAt: Date;
}

export interface ParticipantProgress {
  id: string;
  bibNumber: string;
  name: string | null;
  status: ParticipantStatus;
  highestOrder: number;
  lastCheckpointName: string | null;
  lastScannedAt: Date | null;
  scans: ScanRecord[];
}

const STATUS_BY_ORDER: Record<number, ParticipantStatus> = {
  [-1]: "NOT_STARTED",
  0: "STARTED",
  1: "CP1",
  2: "CP2",
  3: "FINISHED",
};

export function getStatusFromOrder(order: number): ParticipantStatus {
  return STATUS_BY_ORDER[order] ?? "NOT_STARTED";
}

export function formatDuration(from: Date, to: Date): string {
  const diffMs = to.getTime() - from.getTime();
  if (diffMs < 0) return "—";

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function computeLeaderboard(
  participants: Array<{
    id: string;
    bibNumber: string;
    name: string | null;
    scans: Array<{
      scannedAt: Date;
      checkpoint: { slug: string; name: string; order: number };
    }>;
  }>
): ParticipantProgress[] {
  const progress = participants.map((participant) => {
    const sortedScans = [...participant.scans].sort(
      (a, b) => a.checkpoint.order - b.checkpoint.order
    );

    const highestOrder =
      sortedScans.length > 0
        ? sortedScans[sortedScans.length - 1].checkpoint.order
        : -1;

    const lastScan =
      sortedScans.length > 0 ? sortedScans[sortedScans.length - 1] : null;

    return {
      id: participant.id,
      bibNumber: participant.bibNumber,
      name: participant.name,
      status: getStatusFromOrder(highestOrder),
      highestOrder,
      lastCheckpointName: lastScan?.checkpoint.name ?? null,
      lastScannedAt: lastScan?.scannedAt ?? null,
      scans: sortedScans.map((scan) => ({
        checkpointSlug: scan.checkpoint.slug,
        checkpointName: scan.checkpoint.name,
        checkpointOrder: scan.checkpoint.order,
        scannedAt: scan.scannedAt,
      })),
    };
  });

  return progress.sort((a, b) => {
    if (b.highestOrder !== a.highestOrder) {
      return b.highestOrder - a.highestOrder;
    }

    if (a.lastScannedAt && b.lastScannedAt) {
      return a.lastScannedAt.getTime() - b.lastScannedAt.getTime();
    }

    if (a.lastScannedAt) return -1;
    if (b.lastScannedAt) return 1;

    return a.bibNumber.localeCompare(b.bibNumber);
  });
}

export function computeStats(
  totalRegistered: number,
  progress: ParticipantProgress[]
) {
  const counts = {
    totalRegistered,
    notStarted: 0,
    started: 0,
    atCp1: 0,
    atCp2: 0,
    finished: 0,
  };

  for (const p of progress) {
    switch (p.status) {
      case "NOT_STARTED":
        counts.notStarted++;
        break;
      case "STARTED":
        counts.started++;
        break;
      case "CP1":
        counts.atCp1++;
        break;
      case "CP2":
        counts.atCp2++;
        break;
      case "FINISHED":
        counts.finished++;
        break;
    }
  }

  return counts;
}
