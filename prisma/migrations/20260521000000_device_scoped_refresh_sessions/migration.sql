-- Keep one legacy row per admin/user-agent bucket before adding device-scoped uniqueness.
DELETE FROM "RefreshSession"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      row_number() OVER (
        PARTITION BY "adminUserId", COALESCE("userAgent", '')
        ORDER BY
          CASE
            WHEN "revokedAt" IS NULL AND "expiresAt" > CURRENT_TIMESTAMP THEN 0
            ELSE 1
          END,
          "updatedAt" DESC,
          "createdAt" DESC
      ) AS "rowNumber"
    FROM "RefreshSession"
  ) ranked_sessions
  WHERE "rowNumber" > 1
);

ALTER TABLE "RefreshSession" ADD COLUMN "deviceId" TEXT;

UPDATE "RefreshSession"
SET "deviceId" = 'legacy-' || md5("adminUserId" || ':' || COALESCE("userAgent", 'unknown'))
WHERE "deviceId" IS NULL;

ALTER TABLE "RefreshSession" ALTER COLUMN "deviceId" SET NOT NULL;

CREATE UNIQUE INDEX "RefreshSession_adminUserId_deviceId_key" ON "RefreshSession"("adminUserId", "deviceId");
