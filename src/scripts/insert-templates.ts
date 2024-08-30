import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { resumeTemplates } from '../../db/schema.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql);

async function insertTemplates() {
  const templatesDir = path.join(process.cwd(), 'latex', 'templates');
  const templates = fs.readdirSync(templatesDir);

  for (const template of templates) {
    const templatePath = path.join(templatesDir, template);
    const stats = fs.statSync(templatePath);
    
    if (stats.isDirectory()) {
      await db.insert(resumeTemplates).values({
        name: template,
        description: `LaTeX resume template ${template}`,
      }).onConflictDoUpdate({
        target: resumeTemplates.name,
        set: { description: `LaTeX resume template ${template}` }
      });
      console.log(`Inserted/Updated template: ${template}`);
    }
  }
}

async function main() {
  console.log('Inserting templates...');
  await insertTemplates();
  console.log('Templates inserted!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Insertion failed!', err);
  process.exit(1);
});