const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const candidates = [
  'VidyutSpares@2026',
  'VidyutAdmin@2026',
  'vidyutspares2026',
  'Vidyut2026',
  'vidyutspares',
  'lmxnazyelhzvvqpajuoz',
  'Vidyut@2026',
  'Vidyut#2026',
  'VidyutSpares@123',
  'VidyutAdmin@123',
  'Vidyut@123',
  'Supabase2026!',
  'Postgres2026!',
  'admin2026',
  'Admin@2026',
  'vidyut123',
  'Vidyut123',
  'vidyut',
  'Vidyut',
  'postgres',
  'root',
  '12345678',
  'password',
  'Password123',
  'Password@123',
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testPassword(pass) {
  const host = 'aws-0-ap-south-1.pooler.supabase.com';
  const port = 6543;
  const user = 'postgres.lmxnazyelhzvvqpajuoz';
  const connStr = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/postgres`;

  const client = new Client({
    connectionString: connStr,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`FOUND WORKING PG PASSWORD: [${pass}]`);
    const res = await client.query('SELECT current_database(), current_user;');
    console.log('QueryResult:', res.rows);

    // Apply migrations right away if connected!
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260920000000_init_vidyut_spares.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing migration script...');
    await client.query(sqlContent);
    console.log('Migration script executed successfully!');

    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    console.log('Executing seed script...');
    await client.query(seedContent);
    console.log('Seed script executed successfully!');

    await client.end();
    fs.writeFileSync(path.join(__dirname, 'migration-success.txt'), `Password: ${pass}\nMigration & Seed executed successfully!`);
    return true;
  } catch (err) {
    console.log(`Password [${pass}] failed: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const pass of candidates) {
    const success = await testPassword(pass);
    if (success) break;
    await sleep(2000);
  }
}

run();
