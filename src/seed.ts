import { query } from './db';
import { templates } from './templates/defaultTemplates';

async function seed() {
    console.log('Starting template seeding...');

    try {
        for (const [key, template] of Object.entries(templates)) {
            console.log(`Seeding template: ${template.name || key}`);

            await query(
                `INSERT INTO templates (id, name, background, blocks, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             background = EXCLUDED.background,
             blocks = EXCLUDED.blocks,
             updated_at = NOW()`,
                [
                    template.id || key,
                    template.name || key.toUpperCase(),
                    template.background || 'white',
                    JSON.stringify(template.blocks)
                ]
            );
        }

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        process.exit();
    }
}

// Fix top-level await warning by wrapping in a self-invoking or just calling properly
(async () => {
    await seed();
})();
