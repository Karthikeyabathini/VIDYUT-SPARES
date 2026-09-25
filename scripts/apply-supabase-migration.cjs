const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function applyMigration(dbConnectionString) {
  if (!dbConnectionString) {
    console.error('Usage: node scripts/apply-supabase-migration.cjs <POSTGRES_CONNECTION_STRING>');
    console.log('Example: postgresql://postgres:[YOUR-PASSWORD]@db.lmxnazyelhzvvqpajuoz.supabase.co:5432/postgres');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbConnectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260920000000_init_vidyut_spares.sql');
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');

    console.log('Applying database migration (20260920000000_init_vidyut_spares.sql)...');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('✅ Migration applied successfully!');

    console.log('Applying database seed (seed.sql)...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('✅ Database seeded successfully!');

    await client.end();
    console.log('\n🎉 ALL TABLES CREATED AND SEEDED IN POSTGRESQL!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

const dbUri = process.argv[2] || process.env.DATABASE_URL;
applyMigration(dbUri);
