"use client";

interface ActivityScan {
  id: string;
  bibNumber: string;
  checkpointName: string;
  scannedAt: string;
}

interface ActivityFeedProps {
  scans: ActivityScan[];
}

export function ActivityFeed({ scans }: ActivityFeedProps) {
  if (scans.length === 0) {
    return (
      <p className="px-4 py-8 text-center font-mono text-sm text-muted-fg">
        No activity yet
      </p>
    );
  }

  return (
    <ul className="max-h-80 overflow-y-auto">
      {scans.map((scan) => {
        const time = new Date(scan.scannedAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        return (
          <li
            key={scan.id}
            className="border-b border-border-light px-4 py-2 font-mono text-sm"
          >
            <span className="text-muted-fg">[{time}]</span>{" "}
            <span className="font-bold text-neo">{scan.bibNumber}</span>{" "}
            <span className="text-muted-fg">→</span>{" "}
            <span>{scan.checkpointName}</span>
          </li>
        );
      })}
    </ul>
  );
}
