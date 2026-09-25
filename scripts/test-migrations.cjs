const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testSqlExecution() {
  const logLines = [];
  logLines.push('Testing SQL execution methods...');

  // Test 1: Check if rpc('exec_sql') exists
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    logLines.push(`RPC exec_sql test: data=${JSON.stringify(data)}, error=${JSON.stringify(error)}`);
  } catch (err) {
    logLines.push(`RPC exec_sql exception: ${err.message}`);
  }

  // Test 2: Try direct postgres connection if DATABASE_URL exists or default connections
  const dbUrls = [
    process.env.DATABASE_URL,
    env.DATABASE_URL,
  ].filter(Boolean);

  logLines.push(`Found ${dbUrls.length} DATABASE_URL configurations`);

  fs.writeFileSync(path.join(__dirname, 'migration-test-output.txt'), logLines.join('\n'));
}

testSqlExecution();
