-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_APPROVED', 'PRESCRIPTION_REJECTED');

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "documentUrl" TEXT,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'PENDING_PRESCRIPTION',
    "note" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_accountId_key" ON "CustomerProfile"("accountId");
CREATE INDEX "CustomerProfile_countryId_idx" ON "CustomerProfile"("countryId");
CREATE INDEX "CustomerProfile_city_idx" ON "CustomerProfile"("city");
CREATE INDEX "PrescriptionRequest_customerId_idx" ON "PrescriptionRequest"("customerId");
CREATE INDEX "PrescriptionRequest_pharmacyId_idx" ON "PrescriptionRequest"("pharmacyId");
CREATE INDEX "PrescriptionRequest_productId_idx" ON "PrescriptionRequest"("productId");
CREATE INDEX "PrescriptionRequest_status_idx" ON "PrescriptionRequest"("status");

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrescriptionRequest" ADD CONSTRAINT "PrescriptionRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PrescriptionRequest" ADD CONSTRAINT "PrescriptionRequest_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrescriptionRequest" ADD CONSTRAINT "PrescriptionRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
