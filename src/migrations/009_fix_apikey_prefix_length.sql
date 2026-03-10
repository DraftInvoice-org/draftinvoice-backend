-- Migration 009: Fix API Key prefix length
-- Increase key_prefix from VARCHAR(8) to VARCHAR(32) to accommodate 'drft_live_' + 8 chars (18 chars)

DO $$ 
BEGIN
    ALTER TABLE api_keys ALTER COLUMN key_prefix TYPE VARCHAR(32);
END $$;
