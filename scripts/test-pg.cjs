const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const passwords = [
  'VidyutAdmin@2026',
  'VidyutSpares@2026',
  'Vidyut@2026',
  'vidyutspares',
  'postgres',
  'lmxnazyelhzvvqpajuoz',
  'Admin@2026',
];

const hosts = [
  'db.lmxnazyelhzvvqpajuoz.supabase.co',
  'aws-0-ap-south-1.pooler.supabase.com',
];

async function testPgPasswords() {
  const logLines = [];

  for (const host of hosts) {
    for (const pass of passwords) {
      const user = host.includes('pooler') ? 'postgres.lmxnazyelhzvvqpajuoz' : 'postgres';
      const port = host.includes('pooler') ? 6543 : 5432;
      const connectionString = `postgres://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres`;

      const client = new Client({
        connectionString,
        connectionTimeoutMillis: 4000,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();
        logLines.push(`SUCCESS CONNECTING TO PG! Host: ${host}, Pass: ${pass}`);
        const res = await client.query('SELECT current_database(), current_user;');
        logLines.push(`Query result: ${JSON.stringify(res.rows)}`);
        await client.end();
        fs.writeFileSync(path.join(__dirname, 'pg-test-success.txt'), logLines.join('\n'));
        return;
      } catch (err) {
        logLines.push(`Failed for host ${host}, pass ${pass}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'pg-test-results.txt'), logLines.join('\n'));
}

testPgPasswords();
