-- ─── Billing Events ──────────────────────────────────────────────────────────
-- Stores Paystack transaction references for one-time Pro upgrades.
-- References are saved at initialization (before redirect) for resilience.

CREATE TABLE IF NOT EXISTS billing_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference   TEXT UNIQUE NOT NULL,           -- Paystack tx reference
    status      TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'failed'
    amount_kobo INTEGER NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'NGN',
    payload     JSONB,                           -- full Paystack verify response
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_user_id  ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_reference ON billing_events(reference);
CREATE INDEX IF NOT EXISTS idx_billing_status    ON billing_events(status);
