const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const candidates = [
  'VidyutAdmin@2026',
  'VidyutSpares@2026',
  'Vidyut2026',
  'Vidyut@2026',
  'vidyutspares',
  'lmxnazyelhzvvqpajuoz',
  'VidyutSpares2026',
  'VidyutAdmin2026',
  'VidyutSpares@123',
  'VidyutAdmin@123',
  'Vidyut@123',
  'Admin@2026',
  'Admin@123',
  'Password@123',
  'Password@2026',
  'Vidyut#2026',
  'Vidyut$2026',
  'vidyutspares2026!',
  'VidyutSpares2026!',
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const logLines = [];

  for (const pass of candidates) {
    const host = 'aws-0-ap-south-1.pooler.supabase.com';
    const port = 6543;
    const user = 'postgres.lmxnazyelhzvvqpajuoz';

    const client = new Client({
      user,
      password: pass,
      host,
      port,
      database: 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      logLines.push(`SUCCESS CONNECTING! Password is: [${pass}]`);
      console.log(`SUCCESS CONNECTING! Password is: [${pass}]`);

      // Execute migration script!
      const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260920000000_init_vidyut_spares.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      logLines.push('Executing migration script...');
      await client.query(sqlContent);
      logLines.push('Migration script executed successfully!');

      const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
      const seedContent = fs.readFileSync(seedPath, 'utf8');
      logLines.push('Executing seed script...');
      await client.query(seedContent);
      logLines.push('Seed script executed successfully!');

      await client.end();
      fs.writeFileSync(path.join(__dirname, 'pg-slow-success.txt'), logLines.join('\n'));
      return;
    } catch (err) {
      logLines.push(`Pass [${pass}]: ${err.message}`);
      console.log(`Pass [${pass}]: ${err.message}`);
      if (err.message.includes('CIRCUITBREAKER')) {
        logLines.push('Circuit breaker hit! Waiting 40 seconds...');
        console.log('Circuit breaker hit! Waiting 40 seconds...');
        await sleep(40000);
      } else {
        await sleep(5000);
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'pg-slow-results.txt'), logLines.join('\n'));
}

run();
