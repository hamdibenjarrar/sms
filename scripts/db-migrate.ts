import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

async function main() {
  console.log('Starting migration...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  // Workaround for "redis-cli" junk in DATABASE_URL if user didn't fix it
  if (process.env.DATABASE_URL.startsWith('redis-cli')) {
      console.error('DATABASE_URL is set to a Redis CLI command. Please fix .env with a valid Postgres connection string.');
      process.exit(1);
  }

  // If URL is placeholder
  if (process.env.DATABASE_URL.includes('postgresql://place:holder')) {
      console.error('DATABASE_URL is a placeholder. Please update .env with real credentials.');
      process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 001
    const schemaPath = path.join(process.cwd(), 'scripts', '001-initial-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying 001-initial-schema.sql...');
    
    // Split schema by semicolons to execute statements individually
    // This is required because the driver doesn't support multiple statements in one query call
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      // @ts-ignore
      await (sql as any).query(statement, []); 
    }
    console.log('Applied schema.');

    // 002 is just one insert so it might be fine, or split it too
    const seedPath = path.join(process.cwd(), 'scripts', '002-seed-admin.sql');
    if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log('Applying 002-seed-admin.sql...');
         const seedStatements = seedSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        for (const statement of seedStatements) {
             // @ts-ignore
            await (sql as any).query(statement, []);
        }
        console.log('Applied seed.');
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
