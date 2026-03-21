/*
  Warnings:

  - You are about to drop the column `number` on the `Tarea` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tarea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hour" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "desc" TEXT,
    "baseID" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "generated" TEXT,
    "lovrGenerated" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tarea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarea" ("baseID", "context", "createdAt", "day", "desc", "generated", "hour", "id", "month", "title", "userId", "year") SELECT "baseID", "context", "createdAt", "day", "desc", "generated", "hour", "id", "month", "title", "userId", "year" FROM "Tarea";
DROP TABLE "Tarea";
ALTER TABLE "new_Tarea" RENAME TO "Tarea";
CREATE UNIQUE INDEX "Tarea_baseID_key" ON "Tarea"("baseID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
