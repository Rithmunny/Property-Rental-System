-- Workflow integrity constraints for the request-to-rent path.
-- 1. A tenant can hold at most one request per property and kind, so a
--    double-click or two parallel submits can never create duplicate rows.
CREATE UNIQUE INDEX "RentalRequest_propertyId_tenantId_kind_key"
    ON "RentalRequest"("propertyId", "tenantId", "kind");

-- 2. A property can have at most one active contract, so simultaneous or
--    repeated acceptance attempts can never grant two occupancies of the
--    same listing. This is enforced by the database even if two API
--    instances race past the application-level check.
CREATE UNIQUE INDEX "Contract_propertyId_active_key"
    ON "Contract"("propertyId")
    WHERE "status" = 'active';
