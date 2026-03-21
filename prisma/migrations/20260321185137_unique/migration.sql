/*
  Warnings:

  - A unique constraint covering the columns `[modelID]` on the table `StyleRulebook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StyleRulebook_modelID_key" ON "StyleRulebook"("modelID");
