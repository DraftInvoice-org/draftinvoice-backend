import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { query } from '../config/database';

const MIGRATIONS = [
    '000_base_schema.sql',
    '001_auth_schema.sql',
    '002_clients_and_invoice_updates.sql',
    '003_billing.sql',
    '004_api_keys.sql',
    '005_granular_downloads.sql',
    '006_password_reset.sql',
    '007_kyc_schema.sql',
    '008_fix_inconsistent_schema.sql',
    '009_fix_apikey_prefix_length.sql'
];

async function runMigrations() {
    console.log('Running migrations...');
    for (const file of MIGRATIONS) {
        try {
            const sql = readFileSync(join(__dirname, file), 'utf-8');
            await query(sql);
            console.log(`✅ ${file} applied successfully`);
        } catch (err) {
            console.error(`❌ Migration ${file} failed:`, err);
            process.exit(1);
        }
    }
    process.exit(0);
}

runMigrations().catch(err => {
    console.error('Fatal migration error:', err);
    process.exit(1);
});

