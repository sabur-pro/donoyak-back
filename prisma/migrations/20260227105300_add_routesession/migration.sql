-- CreateTable
CREATE TABLE "RouteSession" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "courierId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "trackPoints" JSONB NOT NULL DEFAULT '[]',
    "totalDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouteSession" ADD CONSTRAINT "RouteSession_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteSession" ADD CONSTRAINT "RouteSession_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
