-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bibNumber" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scan_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Scan_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_bibNumber_key" ON "Participant"("bibNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_slug_key" ON "Checkpoint"("slug");

-- CreateIndex
CREATE INDEX "Scan_scannedAt_idx" ON "Scan"("scannedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Scan_participantId_checkpointId_key" ON "Scan"("participantId", "checkpointId");
