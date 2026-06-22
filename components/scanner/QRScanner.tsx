"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Flashlight, FlashlightOff } from "lucide-react";
import { BrutalToastContainer } from "@/components/ui/BrutalToast";
import {
  ScanQueue,
  playBeep,
  type ScanFeedback,
} from "@/lib/scan-queue";

interface RecentScan {
  bibNumber: string;
  time: string;
}

interface QRScannerProps {
  checkpointSlug: string;
  checkpointName: string;
}

export function QRScanner({ checkpointSlug, checkpointName }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const queueRef = useRef<ScanQueue | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [sessionCount, setSessionCount] = useState(0);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [toasts, setToasts] = useState<ScanFeedback[]>([]);
  const [flashBib, setFlashBib] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const addToast = useCallback((feedback: ScanFeedback) => {
    setToasts((prev) => [feedback, ...prev].slice(0, 5));
    playBeep(feedback.status === "error" ? "error" : feedback.status === "warning" ? "warning" : "success");

    if (feedback.status !== "error") {
      setFlashBib(feedback.bibNumber);
      setTimeout(() => setFlashBib(null), 150);
    }
  }, []);

  const recordScan = useCallback((bibNumber: string) => {
    setSessionCount((c) => c + 1);
    const time = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setRecentScans((prev) => [{ bibNumber, time }, ...prev].slice(0, 10));
  }, []);

  useEffect(() => {
    queueRef.current = new ScanQueue({
      dedupMs: 3000,
      onFeedback: addToast,
      onScanRecorded: recordScan,
    });
  }, [addToast, recordScan]);

  useEffect(() => {
    let active = true;

    async function startScanner() {
      if (!videoRef.current) return;

      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCamera =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ??
          devices[devices.length - 1];

        if (!backCamera) {
          setCameraError("No camera found on this device");
          return;
        }

        const controls = await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result) => {
            if (!active || !result) return;
            const text = result.getText().trim().toUpperCase();
            if (text) {
              queueRef.current?.enqueue(text, checkpointSlug);
            }
          }
        );

        controlsRef.current = controls;

        const stream = videoRef.current.srcObject as MediaStream | null;
        streamRef.current = stream;
        setScanning(true);
        setCameraError(null);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(
          "Camera access denied. Use HTTPS or localhost and allow camera permission."
        );
      }
    }

    void startScanner();

    return () => {
      active = false;
      controlsRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [checkpointSlug]);

  const toggleTorch = async () => {
    const stream = streamRef.current;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
        torch?: boolean;
      };

      if (!capabilities.torch) return;

      const next = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      // Torch not supported
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-fg">
      {/* Header */}
      <header className="flex items-center justify-between border-b-[3px] border-neo bg-fg px-4 py-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-widest text-neo">
            Marshal Station
          </p>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-bg">
            {checkpointName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 animate-pulse-neo bg-neo"
            aria-hidden="true"
          />
          <span className="font-mono text-xs font-bold uppercase text-neo">
            Live
          </span>
        </div>
      </header>

      {/* Camera viewport — compact, centered */}
      <div className="flex flex-col items-center gap-4 bg-fg px-4 py-6">
        <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
          <div className="relative aspect-square w-full border-[4px] border-bg">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* Corner brackets */}
            <div className="pointer-events-none absolute inset-3">
              <div className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-neo" />
              <div className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-neo" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-neo" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-neo" />
            </div>

            {/* Scan flash overlay */}
            {flashBib && (
              <div className="animate-scan-flash pointer-events-none absolute inset-0 flex items-center justify-center bg-neo">
                <span className="font-mono text-3xl font-bold text-fg sm:text-4xl">
                  {flashBib}
                </span>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-fg/90 p-4">
                <p className="text-center font-mono text-xs text-bg sm:text-sm">
                  {cameraError}
                </p>
              </div>
            )}

            {!scanning && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-fg/80">
                <p className="font-display text-sm uppercase tracking-wide text-bg">
                  Starting camera…
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Session counter + torch — below camera */}
        <div className="flex w-full max-w-[320px] items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => void toggleTorch()}
            className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-bg bg-fg text-bg shadow-brutal-sm press-brutal"
            aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
          >
            {torchOn ? (
              <FlashlightOff className="h-5 w-5" />
            ) : (
              <Flashlight className="h-5 w-5" />
            )}
          </button>

          <div className="flex flex-1 items-center justify-between border-[3px] border-bg bg-bg px-4 py-2 shadow-brutal-sm">
            <p className="font-display text-xs font-bold uppercase tracking-wider">
              Scanned
            </p>
            <p className="font-mono text-3xl font-bold text-neo tabular-nums">
              {sessionCount}
            </p>
          </div>
        </div>
      </div>

      {/* Recent scans drawer */}
      <div className="border-t-[3px] border-fg bg-bg">
        <div className="flex items-center justify-between border-b border-border-light px-4 py-2">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">
            Recent Scans
          </h2>
          <span className="font-mono text-xs text-muted-fg">
            Last {recentScans.length}
          </span>
        </div>
        {recentScans.length === 0 ? (
          <p className="px-4 py-6 text-center font-mono text-sm text-muted-fg">
            No scans yet — point camera at QR code
          </p>
        ) : (
          <ul className="max-h-48 overflow-y-auto">
            {recentScans.map((scan, i) => (
              <li
                key={`${scan.bibNumber}-${scan.time}-${i}`}
                className="flex items-center justify-between border-b border-border-light px-4 py-2"
              >
                <span className="font-mono text-lg font-bold text-neo">
                  {scan.bibNumber}
                </span>
                <span className="font-mono text-xs text-muted-fg tabular-nums">
                  {scan.time}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BrutalToastContainer
        toasts={toasts}
        onDismiss={(index) =>
          setToasts((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </div>
  );
}
