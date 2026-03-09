-- Migration 002: Clients, SMTP config, and invoice enhancements
-- Run after: 001_auth_schema.sql

-- =========================================================
-- Clients table (Pro feature)
-- =========================================================
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  contact_name  TEXT,
  email         TEXT,
  phone         TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  country       TEXT DEFAULT 'NG',
  tax_id        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- =========================================================
-- SMTP configuration per user (Pro feature, credentials encrypted at app layer)
-- =========================================================
CREATE TABLE IF NOT EXISTS smtp_configs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host               TEXT NOT NULL,
  port               INTEGER NOT NULL DEFAULT 587,
  secure             BOOLEAN NOT NULL DEFAULT FALSE,
  username           TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  from_name          TEXT,
  from_email         TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Invoice enhancements: client association, due dates, payment status
-- =========================================================
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS client_id        UUID REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_snapshot  JSONB,
  ADD COLUMN IF NOT EXISTS invoice_number   TEXT,
  ADD COLUMN IF NOT EXISTS amount_due       NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS due_date         DATE,
  ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'overdue')),
  ADD COLUMN IF NOT EXISTS last_sent_at     TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invoices_client_id      ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date       ON invoices(due_date);
