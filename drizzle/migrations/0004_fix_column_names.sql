-- Migration: Rename columns to match Drizzle schema
ALTER TABLE change_requests RENAME COLUMN title TO document_title;
ALTER TABLE change_requests RENAME COLUMN number TO document_number;
-- Add more ALTER TABLE ... RENAME COLUMN statements as needed for all mismatches
-- Example:
-- ALTER TABLE change_requests RENAME COLUMN revision_number TO revision;
-- ALTER TABLE change_requests RENAME COLUMN req_date TO request_date;
-- ALTER TABLE change_requests RENAME COLUMN req_by TO requested_by;
-- ALTER TABLE change_requests RENAME COLUMN dept TO department;
-- ALTER TABLE change_requests RENAME COLUMN type TO change_type;
-- ALTER TABLE change_requests RENAME COLUMN impact TO impact_assessment;
-- ...
-- You may need to inspect your actual DB schema for exact mismatches.
