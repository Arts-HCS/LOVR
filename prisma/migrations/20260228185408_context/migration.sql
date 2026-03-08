/*
  Warnings:

  - You are about to alter the column `context` on the `Tarea` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tarea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarea" ("baseID", "context", "createdAt", "day", "desc", "hour", "id", "month", "title", "userId", "year") SELECT "baseID", "context", "createdAt", "day", "desc", "hour", "id", "month", "title", "userId", "year" FROM "Tarea";
DROP TABLE "Tarea";
ALTER TABLE "new_Tarea" RENAME TO "Tarea";
CREATE UNIQUE INDEX "Tarea_baseID_key" ON "Tarea"("baseID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
