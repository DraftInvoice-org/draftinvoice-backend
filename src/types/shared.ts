/** Shared domain types used by both API responses and frontend consumers. */

export type Plan = 'free' | 'pro';
export type PaymentStatus = 'unpaid' | 'paid' | 'overdue';
export type InvoiceStatus = 'draft' | 'sent' | 'archived';

export interface ClientRecord {
    id: string;
    user_id: string;
    company_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string;
    tax_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClientSnapshot {
    company_name: string;
    contact_name: string | null;
    email: string | null;
    address_line1: string | null;
    city: string | null;
    country: string;
}

export interface InvoiceRecord {
    id: string;
    user_id: string;
    title: string;
    invoice_data: Record<string, unknown>;
    status: InvoiceStatus;
    payment_status: PaymentStatus;
    client_id: string | null;
    client_snapshot: ClientSnapshot | null;
    due_date: string | null;
    invoice_number: string | null;
    amount_due: number | null;
    last_sent_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmailJobPayload {
    invoiceId: string;
    pdfBase64: string;
    filename: string;
}
