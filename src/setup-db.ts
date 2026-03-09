import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function setup() {
    const dbName = process.env.DB_NAME || 'DraftInvoice';

    // Connect to 'postgres' database initially to create the target database
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: Number.parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('Connected to postgres database.');

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Now connect to the new database to run schema
    const targetClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: Number.parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: dbName,
    });

    try {
        await targetClient.connect();
        console.log(`Connected to ${dbName}. Running schema...`);

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await targetClient.query(schema);
        console.log('Schema applied successfully.');

    } catch (err) {
        console.error('Error applying schema:', err);
    } finally {
        await targetClient.end();
        process.exit();
    }
}

setup();
