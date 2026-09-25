const { Client } = require('pg');

async function testSinglePassword(pass, port) {
  const user = 'postgres.lmxnazyelhzvvqpajuoz';
  const host = 'aws-0-ap-south-1.pooler.supabase.com';

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
    console.log(`SUCCESS CONNECTING WITH PASSWORD (${port}):`, pass);
    const res = await client.query('SELECT current_database(), current_user;');
    console.log('QueryResult:', res.rows);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed for password "${pass}" on port ${port}:`, err.message);
    return false;
  }
}

async function run() {
  await testSinglePassword('VidyutAdmin@2026', 5432);
}

run();
