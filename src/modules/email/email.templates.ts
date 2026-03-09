interface InvoiceEmailParams {
    clientName: string;
    invoiceNumber: string | null;
    amountDue: number | null;
    dueDate: string | null;
    senderName: string;
    note?: string;
}

/**
 * Builds the HTML body for an invoice email.
 * Kept as a plain string builder — no external templating engine required.
 */
export function buildInvoiceEmailHtml(params: InvoiceEmailParams): string {
    const { clientName, invoiceNumber, amountDue, dueDate, senderName, note } = params;

    const formattedAmount = amountDue != null
        ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amountDue)
        : null;

    const formattedDue = dueDate
        ? new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice${invoiceNumber ? ` #${invoiceNumber}` : ''}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
              <p style="margin:0;color:#e0e7ff;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">DraftInvoice</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:800;">
                ${invoiceNumber ? `Invoice #${invoiceNumber}` : 'Invoice'}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${clientName}</strong>,</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                ${note ? note : `Please find your invoice attached to this email.`}
              </p>

              ${formattedAmount || formattedDue ? `
              <!-- Invoice Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin:0 0 28px;">
                <tr><td style="padding:20px 24px;">
                  ${formattedAmount ? `
                  <table width="100%"><tr>
                    <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Amount Due</td>
                    <td align="right" style="color:#111827;font-size:20px;font-weight:800;">${formattedAmount}</td>
                  </tr></table>` : ''}
                  ${formattedDue ? `
                  <table width="100%" style="margin-top:${formattedAmount ? '12px' : '0'}"><tr>
                    <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Due Date</td>
                    <td align="right" style="color:#374151;font-size:14px;font-weight:600;">${formattedDue}</td>
                  </tr></table>` : ''}
                </td></tr>
              </table>` : ''}

              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">The invoice is attached to this email as a PDF file. Please don't hesitate to reach out if you have any questions.</p>
              <p style="margin:0;color:#374151;font-size:15px;">Best regards,<br /><strong>${senderName}</strong></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">Sent via <a href="https://draftinvoice.io" style="color:#6366f1;text-decoration:none;">DraftInvoice</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
