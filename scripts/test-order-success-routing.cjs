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

console.log('==================================================');
console.log('VIDYUT SPARES ORDER SUCCESS ROUTING TEST SUITE');
console.log('==================================================');

const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

async function testOrderQueries() {
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Test 1: Query with order number string (e.g., VS-20261010-1234)
  const orderNumberTest = 'VS-20261010-8547';
  console.log(`\nTest 1: Testing Order Number string input "${orderNumberTest}"`);
  console.log(`Is UUID: ${isUuid(orderNumberTest)}`);
  
  try {
    let query = supabase.from('orders').select('*, items:order_items(*)');
    if (isUuid(orderNumberTest)) {
      query = query.or(`id.eq.${orderNumberTest},order_number.eq.${orderNumberTest}`);
    } else {
      query = query.eq('order_number', orderNumberTest);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error('❌ Test 1 Failed with error:', error);
    } else {
      console.log('✅ Test 1 Passed! Query executed without Postgres UUID syntax error.');
    }
  } catch (err) {
    console.error('❌ Test 1 Exception:', err.message);
  }

  // Test 2: Query with UUID string (e.g., 550e8400-e29b-41d4-a716-446655440000)
  const uuidTest = '550e8400-e29b-41d4-a716-446655440000';
  console.log(`\nTest 2: Testing UUID string input "${uuidTest}"`);
  console.log(`Is UUID: ${isUuid(uuidTest)}`);

  try {
    let query = supabase.from('orders').select('*, items:order_items(*)');
    if (isUuid(uuidTest)) {
      query = query.or(`id.eq.${uuidTest},order_number.eq.${uuidTest}`);
    } else {
      query = query.eq('order_number', uuidTest);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error('❌ Test 2 Failed with error:', error);
    } else {
      console.log('✅ Test 2 Passed! Query executed safely without error.');
    }
  } catch (err) {
    console.error('❌ Test 2 Exception:', err.message);
  }
}

testOrderQueries();
