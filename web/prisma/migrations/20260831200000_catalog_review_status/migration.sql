-- AlterEnum
ALTER TYPE "ProductCountryStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "ProductCountry" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
