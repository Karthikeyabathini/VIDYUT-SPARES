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

async function testGraphQL() {
  const logLines = [];

  const query = `
    query {
      __schema {
        types {
          name
        }
      }
    }
  `;

  try {
    const res = await fetch(`${url}/graphql/v1`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    logLines.push(`GraphQL response: ${JSON.stringify(data).substring(0, 500)}`);
  } catch (err) {
    logLines.push(`GraphQL exception: ${err.message}`);
  }

  fs.writeFileSync(path.join(__dirname, 'graphql-audit.txt'), logLines.join('\n'));
}

testGraphQL();
