const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

console.log('==================================================');
console.log('VIDYUT SPARES PERSISTENCE AUDIT & DIAGNOSTIC');
console.log('==================================================');

console.log(`Supabase URL: ${url}`);
console.log(`Service Key Present: ${Boolean(key)}`);

// Audit code for remaining in-memory stores
const actionsDir = path.join(__dirname, '..', 'src', 'lib', 'actions');
const actionFiles = fs.readdirSync(actionsDir).filter(f => f.endsWith('.ts'));

let forbiddenFound = false;
const forbiddenTerms = ['customProductsStore', 'deletedProductIds', 'inMemoryOrdersStore', 'inMemoryAddressesStore', 'inMemoryCartStore', 'inMemoryInvoicesStore', 'inMemoryPaymentsStore'];

actionFiles.forEach(file => {
  const content = fs.readFileSync(path.join(actionsDir, file), 'utf8');
  forbiddenTerms.forEach(term => {
    if (content.includes(term)) {
      console.error(`❌ VIOLATION FOUND: File ${file} contains forbidden memory store: ${term}`);
      forbiddenFound = true;
    }
  });
});

if (!forbiddenFound) {
  console.log('✅ AUDIT PASSED: All in-memory sync stores have been 100% eradicated from server actions!');
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const tables = [
  'categories',
  'products',
  'users',
  'orders',
  'order_items',
  'payments',
  'invoices',
  'payment_methods',
  'stock_movements',
  'admin_audit_logs',
  'carts',
  'cart_items',
  'addresses'
];

async function checkTables() {
  console.log('\n--- Auditing Supabase PostgreSQL Database Tables ---');
  let tableErrors = 0;
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`⚠️ Table '${table}': ${error.message} (Code: ${error.code})`);
        tableErrors++;
      } else {
        console.log(`✅ Table '${table}': Accessible (Row Count: ${count})`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Exception: ${err.message}`);
      tableErrors++;
    }
  }

  if (tableErrors > 0) {
    console.log('\n⚠️ ACTION REQUIRED: Database tables in remote Supabase need to be created.');
    console.log('Please run the migration script in Supabase SQL Editor:');
    console.log('--> supabase/migrations/20260920000000_init_vidyut_spares.sql');
    console.log('--> supabase/seed.sql');
  } else {
    console.log('\n🎉 ALL TABLES ARE LIVE AND FULLY ACCESSIBLE IN POSTGRESQL!');
  }
}

checkTables();
