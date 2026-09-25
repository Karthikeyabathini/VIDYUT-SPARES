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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  const lines = [];
  lines.push(`URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`);
  const tables = ['categories', 'products', 'orders', 'order_items', 'users', 'payments', 'invoices', 'payment_methods', 'stock_movements', 'admin_audit_logs', 'carts', 'cart_items', 'addresses'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      lines.push(`TABLE [${table}]: ERROR - Code: ${error.code} - Message: ${error.message}`);
    } else {
      lines.push(`TABLE [${table}]: COUNT = ${data.length}`);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test-output.txt'), lines.join('\n'));
}

testConnection();
