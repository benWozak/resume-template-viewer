import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './index';

async function main() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed', error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

main().catch((err) => {
  console.error('Unexpected error', err);
  process.exit(1);
});