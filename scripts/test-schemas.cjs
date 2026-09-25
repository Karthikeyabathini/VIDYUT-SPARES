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
const supabase = createClient(url, key);

async function checkSystemTables() {
  const logLines = [];

  // Check auth users via admin API
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    logLines.push(`Auth admin listUsers: error=${JSON.stringify(error)}, count=${data?.users?.length}`);
    if (data?.users) {
      logLines.push(`Users in auth: ${JSON.stringify(data.users.map(u => ({ id: u.id, email: u.email })))}`);
    }
  } catch (err) {
    logLines.push(`Auth admin exception: ${err.message}`);
  }

  // Check storage buckets
  try {
    const { data, error } = await supabase.storage.listBuckets();
    logLines.push(`Storage listBuckets: error=${JSON.stringify(error)}, buckets=${JSON.stringify(data)}`);
  } catch (err) {
    logLines.push(`Storage listBuckets exception: ${err.message}`);
  }

  // PostgREST Schema reload NOTIFY
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'schema-cache=reload'
      }
    });
    logLines.push(`Reload schema cache response: ${res.status}`);
  } catch (err) {
    logLines.push(`Reload schema cache exception: ${err.message}`);
  }

  fs.writeFileSync(path.join(__dirname, 'system-audit.txt'), logLines.join('\n'));
}

checkSystemTables();
