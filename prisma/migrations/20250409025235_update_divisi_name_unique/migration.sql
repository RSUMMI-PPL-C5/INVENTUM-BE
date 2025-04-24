/*
  Warnings:

  - A unique constraint covering the columns `[divisi]` on the table `ListDivisi` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ListDivisi_divisi_key` ON `ListDivisi`(`divisi`);
