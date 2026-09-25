const { createClient } = require('@supabase/supabase-js');
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

async function findFunctions() {
  const logLines = [];

  // Try fetching definitions from /rest/v1/?schema=auth or storage
  const schemas = ['public', 'auth', 'storage', 'extensions'];
  for (const s of schemas) {
    try {
      const res = await fetch(`${url}/rest/v1/?schema=${s}`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        }
      });
      const data = await res.json();
      logLines.push(`Schema [${s}] paths: ${Object.keys(data.paths || {}).join(', ')}`);
      logLines.push(`Schema [${s}] definitions: ${Object.keys(data.definitions || {}).join(', ')}`);
    } catch (err) {
      logLines.push(`Schema [${s}] exception: ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'rpcs-audit.txt'), logLines.join('\n'));
}

findFunctions();
