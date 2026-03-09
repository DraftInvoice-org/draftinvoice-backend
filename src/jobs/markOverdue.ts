import { invoicesRepository } from '../modules/invoices/invoices.repository';

const INTERVAL_MS = 60 * 60 * 1000; // Every 60 minutes

/**
 * Periodically sets payment_status = 'overdue' on all invoices
 * where `due_date < today` and `payment_status = 'unpaid'`.
 *
 * Runs once immediately on startup, then every INTERVAL_MS.
 */
export function startOverdueCron(): void {
    const run = async () => {
        try {
            const count = await invoicesRepository.markOverdueBatch();
            if (count > 0) {
                console.log(`[OverdueCron] Marked ${count} invoice(s) as overdue.`);
            }
        } catch (err) {
            console.error('[OverdueCron] Failed to run:', err);
        }
    };

    // Run immediately on startup to catch anything that went overdue while the server was offline
    void run();
    setInterval(run, INTERVAL_MS);

    console.log('[OverdueCron] Started. Running every 60 minutes.');
}
