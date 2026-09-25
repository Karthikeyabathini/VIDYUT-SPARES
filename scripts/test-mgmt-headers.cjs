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

async function testMgmtHeaders() {
  const logLines = [];

  const headersList = [
    { 'Authorization': `Bearer ${key}` },
    { 'apikey': key },
    { 'Authorization': `Bearer ${key}`, 'apikey': key },
    { 'x-api-key': key },
  ];

  const endpoints = [
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    `https://api.supabase.com/v1/projects/${projectRef}/sql`,
    `https://api.supabase.com/v1/projects/${projectRef}/query`,
  ];

  for (const ep of endpoints) {
    for (let i = 0; i < headersList.length; i++) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            ...headersList[i],
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: 'SELECT 1;', sql: 'SELECT 1;' }),
        });
        const text = await res.text();
        logLines.push(`Endpoint: ${ep} (Headers #${i+1}) - Status: ${res.status} - Response: ${text.substring(0, 200)}`);
      } catch (err) {
        logLines.push(`Endpoint: ${ep} (Headers #${i+1}) - Exception: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'mgmt-headers-audit.txt'), logLines.join('\n'));
}

testMgmtHeaders();
