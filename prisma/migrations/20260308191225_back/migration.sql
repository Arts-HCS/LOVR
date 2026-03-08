/*
  Warnings:

  - A unique constraint covering the columns `[baseID]` on the table `Tarea` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tarea_baseID_key" ON "Tarea"("baseID");
