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

async function testRpcGraphql() {
  const logLines = [];

  try {
    const res = await fetch(`${url}/rest/v1/rpc/graphql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Accept-Profile': 'graphql_public',
        'Content-Profile': 'graphql_public',
      },
      body: JSON.stringify({
        query: 'query { __typename }'
      }),
    });
    const text = await res.text();
    logLines.push(`Status: ${res.status}, Body: ${text}`);
  } catch (err) {
    logLines.push(`Exception: ${err.message}`);
  }

  fs.writeFileSync(path.join(__dirname, 'rpc-graphql-test.txt'), logLines.join('\n'));
}

testRpcGraphql();
