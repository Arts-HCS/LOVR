/*
  Warnings:

  - You are about to drop the `Contexto` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "modelName" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Contexto";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Docs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Docs_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
