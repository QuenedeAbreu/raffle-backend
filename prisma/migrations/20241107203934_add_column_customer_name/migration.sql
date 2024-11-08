/*
  Warnings:

  - Added the required column `customerName` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Entry` ADD COLUMN `customerName` VARCHAR(191) NOT NULL;
