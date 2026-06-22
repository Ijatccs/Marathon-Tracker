export type ScanResultStatus = "success" | "warning" | "error";

export interface ScanFeedback {
  bibNumber: string;
  status: ScanResultStatus;
  message: string;
  timestamp: Date;
}

export interface ScanQueueOptions {
  dedupMs?: number;
  onFeedback: (feedback: ScanFeedback) => void;
  onScanRecorded?: (bibNumber: string) => void;
}

export class ScanQueue {
  private dedupMs: number;
  private onFeedback: (feedback: ScanFeedback) => void;
  private onScanRecorded?: (bibNumber: string) => void;
  private lastScanned = new Map<string, number>();
  private pending = new Set<string>();

  constructor(options: ScanQueueOptions) {
    this.dedupMs = options.dedupMs ?? 3000;
    this.onFeedback = options.onFeedback;
    this.onScanRecorded = options.onScanRecorded;
  }

  enqueue(bibNumber: string, checkpointSlug: string) {
    const normalized = bibNumber.trim().toUpperCase();
    if (!normalized) return;

    const now = Date.now();
    const lastTime = this.lastScanned.get(normalized);
    if (lastTime && now - lastTime < this.dedupMs) {
      return;
    }

    const key = `${normalized}:${checkpointSlug}`;
    if (this.pending.has(key)) return;

    this.pending.add(key);
    this.lastScanned.set(normalized, now);

    void this.processScan(normalized, checkpointSlug, key);
  }

  private async processScan(
    bibNumber: string,
    checkpointSlug: string,
    key: string
  ) {
    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bibNumber, checkpointSlug }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        warning?: boolean;
        message?: string;
        error?: string;
      };

      if (response.ok && data.success) {
        this.onFeedback({
          bibNumber,
          status: data.warning ? "warning" : "success",
          message: data.message ?? "Scan recorded",
          timestamp: new Date(),
        });
        this.onScanRecorded?.(bibNumber);
      } else {
        this.onFeedback({
          bibNumber,
          status: "error",
          message: data.error ?? "Scan failed",
          timestamp: new Date(),
        });
      }
    } catch {
      this.onFeedback({
        bibNumber,
        status: "error",
        message: "Network error — scan not saved",
        timestamp: new Date(),
      });
    } finally {
      this.pending.delete(key);
    }
  }
}

export function playBeep(type: "success" | "error" | "warning" = "success") {
  if (typeof window === "undefined") return;

  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value =
      type === "success" ? 880 : type === "warning" ? 660 : 440;
    oscillator.type = "square";

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio not available
  }
}
