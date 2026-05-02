-- Add user-level controls for the public Roaster feature list.
ALTER TABLE "User" ADD COLUMN "roasterFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "roasterOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "roasterFeaturedAt" DATETIME;

CREATE INDEX "User_roasterFeatured_roasterOrder_idx" ON "User"("roasterFeatured", "roasterOrder");
