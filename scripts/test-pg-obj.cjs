const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const passwords = [
  'VidyutAdmin@2026',
  'VidyutSpares@2026',
  'Vidyut@2026',
  'VidyutSpares2026',
  'VidyutAdmin2026',
  'Vidyut2026',
  'Vidyut@123',
  'VidyutSpares@123',
  'VidyutAdmin@123',
  'vidyutspares',
  'vidyut123',
  'postgres',
  'lmxnazyelhzvvqpajuoz',
  'Admin@2026',
  'Admin@123',
  'Password@123',
  'Password@2026',
  'Vidyut#2026',
  'Vidyut$2026',
];

const hosts = [
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, user: 'postgres.lmxnazyelhzvvqpajuoz' },
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 5432, user: 'postgres.lmxnazyelhzvvqpajuoz' },
];

async function testPgPasswords() {
  const logLines = [];

  for (const item of hosts) {
    for (const pass of passwords) {
      const client = new Client({
        user: item.user,
        password: pass,
        host: item.host,
        port: item.port,
        database: 'postgres',
        connectionTimeoutMillis: 3000,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();
        logLines.push(`SUCCESS CONNECTING TO PG! Host: ${item.host}:${item.port}, Pass: ${pass}`);
        const res = await client.query('SELECT current_database(), current_user;');
        logLines.push(`Query result: ${JSON.stringify(res.rows)}`);
        await client.end();
        fs.writeFileSync(path.join(__dirname, 'pg-success.txt'), logLines.join('\n'));
        return;
      } catch (err) {
        logLines.push(`Failed for host ${item.host}:${item.port}, pass ${pass}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'pg-obj-results.txt'), logLines.join('\n'));
}

testPgPasswords();
