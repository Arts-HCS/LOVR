/*
  Warnings:

  - The required column `modelID` was added to the `StyleRulebook` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "modelID" TEXT;
ALTER TABLE "Usuario" ADD COLUMN "modelRules" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StyleRulebook" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "modelID" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "desc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StyleRulebook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StyleRulebook" ("createdAt", "desc", "id", "label", "modelUsed", "rules", "userId") SELECT "createdAt", "desc", "id", "label", "modelUsed", "rules", "userId" FROM "StyleRulebook";
DROP TABLE "StyleRulebook";
ALTER TABLE "new_StyleRulebook" RENAME TO "StyleRulebook";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
