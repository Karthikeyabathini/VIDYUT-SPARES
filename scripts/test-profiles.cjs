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

async function checkProfiles() {
  const logLines = [];

  const schemas = ['public', 'storage', 'graphql_public'];
  for (const s of schemas) {
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Accept-Profile': s,
        }
      });
      const data = await res.json();
      logLines.push(`Profile [${s}] paths: ${Object.keys(data.paths || {}).join(', ')}`);
      logLines.push(`Profile [${s}] definitions: ${Object.keys(data.definitions || {}).join(', ')}`);
    } catch (err) {
      logLines.push(`Profile [${s}] exception: ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'profiles-audit.txt'), logLines.join('\n'));
}

checkProfiles();
