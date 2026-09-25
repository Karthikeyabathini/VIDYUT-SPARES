const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function testEndpoints() {
  const logLines = [];

  const endpoints = [
    '/rest/v1/',
    '/pg_meta/v1/query',
    '/pg_meta/v1/schemas',
    '/rest/v1/rpc',
    '/admin/v1/query',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${url}${ep}`, {
        method: ep.includes('query') ? 'POST' : 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: ep.includes('query') ? JSON.stringify({ query: 'SELECT 1;' }) : undefined,
      });
      const text = await res.text();
      logLines.push(`Endpoint ${ep}: Status ${res.status} - Body: ${text.substring(0, 200)}`);
    } catch (err) {
      logLines.push(`Endpoint ${ep}: Exception ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'sql-api-test-output.txt'), logLines.join('\n'));
}

testEndpoints();
