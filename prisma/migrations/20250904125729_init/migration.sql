-- CreateTable
CREATE TABLE "DesignOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "baseColor" TEXT,
    "pattern" JSONB,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "salesId" INTEGER NOT NULL,
    "designerId" INTEGER
);
