-- ─── Granular Download Tracking ──────────────────────────────────────────────
-- Upgrades the downloads table to track specifically which invoice was downloaded and from where.

-- Add invoice_id and source columns to downloads table
ALTER TABLE downloads 
ADD COLUMN IF NOT EXISTS invoice_id UUID,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web'; -- 'web' or 'api'

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_downloads_invoice_id ON downloads(invoice_id);
CREATE INDEX IF NOT EXISTS idx_downloads_source ON downloads(source);
