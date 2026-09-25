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

const key = env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = 'lmxnazyelhzvvqpajuoz';

async function testMgmtApi() {
  const logLines = [];

  const urls = [
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    `https://api.supabase.com/v1/projects/${projectRef}/queries`,
    `https://${projectRef}.supabase.co/rest/v1/rpc/exec`,
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'apikey': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'SELECT 1;', sql: 'SELECT 1;' }),
      });
      const text = await res.text();
      logLines.push(`URL: ${u} - Status: ${res.status} - Response: ${text.substring(0, 300)}`);
    } catch (err) {
      logLines.push(`URL: ${u} - Exception: ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'mgmt-api-test.txt'), logLines.join('\n'));
}

testMgmtApi();
