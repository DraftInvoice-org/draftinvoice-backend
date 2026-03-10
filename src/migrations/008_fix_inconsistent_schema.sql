-- Migration 008: Fix inconsistent schema mapping (Sync script)
-- Resolve "column company_name does not exist" and missing invoice columns

DO $$ 
BEGIN
    -- 1. Fix clients table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'name') THEN
        ALTER TABLE clients RENAME COLUMN name TO company_name;
    END IF;

    -- Add missing columns to clients if they don't exist
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_name  TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_line1 TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_line2 TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS city          TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS state         TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip           TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS country       TEXT DEFAULT 'NG';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id        TEXT;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW();

    -- 2. Fix invoices table
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_id        UUID REFERENCES clients(id) ON DELETE SET NULL;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_snapshot  JSONB;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number   TEXT;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_due       NUMERIC(12,2);
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date         DATE;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'unpaid';
    
    -- Ensure check constraint for payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'invoices_payment_status_check') THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_payment_status_check CHECK (payment_status IN ('unpaid', 'paid', 'overdue'));
    END IF;

    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_sent_at     TIMESTAMPTZ;

END $$;
