-- CreateTable
CREATE TABLE "DesignContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "designOrderId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "baseColor" TEXT,
    "position" TEXT,
    "size" TEXT,
    "leafletType" TEXT,
    "fileUrl" TEXT,
    CONSTRAINT "DesignContent_designOrderId_fkey" FOREIGN KEY ("designOrderId") REFERENCES "DesignOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DesignOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "baseColor" TEXT,
    "pattern" JSONB,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "salesId" INTEGER NOT NULL,
    "designerId" INTEGER,
    "isClosed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_DesignOrder" ("baseColor", "brand", "createdAt", "designerId", "fileUrl", "id", "pattern", "priority", "salesId", "status", "type", "updatedAt") SELECT "baseColor", "brand", "createdAt", "designerId", "fileUrl", "id", "pattern", "priority", "salesId", "status", "type", "updatedAt" FROM "DesignOrder";
DROP TABLE "DesignOrder";
ALTER TABLE "new_DesignOrder" RENAME TO "DesignOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DesignContent_designOrderId_key" ON "DesignContent"("designOrderId");
