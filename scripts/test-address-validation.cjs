const { z } = require('zod');

// 1. Re-create the refined Zod schema logic from src/lib/validators/index.ts
const addressSchema = z.object({
  full_name: z
    .string()
    .transform((val) => (val || '').trim())
    .pipe(z.string().min(2, 'Full contact name is required (at least 2 characters)')),
  phone: z
    .string()
    .transform((val) => {
      let digits = (val || '').replace(/[^0-9]/g, '');
      if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
      if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
      return digits;
    })
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)')),
  address_line_1: z
    .string()
    .transform((val) => (val || '').trim())
    .pipe(z.string().min(3, 'Street address / House No. is required (at least 3 characters)')),
  address_line_2: z
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .optional()
    .nullable(),
  city: z
    .string()
    .transform((val) => (val && val.trim() ? val.trim() : 'Vijayawada'))
    .pipe(z.string().min(2, 'City name is required'))
    .default('Vijayawada'),
  state: z
    .string()
    .transform((val) => (val && val.trim() ? val.trim() : 'Andhra Pradesh'))
    .pipe(z.string().min(2, 'State name is required'))
    .default('Andhra Pradesh'),
  pincode: z
    .string()
    .transform((val) => (val || '').replace(/[^0-9]/g, ''))
    .pipe(z.string().regex(/^[1-9]\d{5}$/, 'Pincode must be a valid 6-digit Indian PIN code (e.g. 520001)')),
  landmark: z
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .optional()
    .nullable(),
});

function validateAddressObject(address) {
  if (!address) {
    return { valid: false, error: 'Delivery address not found. Please select or add a valid delivery address.' };
  }
  const fullName = (address.full_name || '').trim();
  if (fullName.length < 2) {
    return { valid: false, error: 'Selected address is invalid: Contact name is required.' };
  }
  const phoneDigits = (address.phone || '').replace(/[^0-9]/g, '');
  if (phoneDigits.length < 10) {
    return { valid: false, error: 'Selected address is invalid: Please enter a valid 10-digit mobile phone number.' };
  }
  const streetAddr = (address.address_line_1 || '').trim();
  if (streetAddr.length < 3) {
    return { valid: false, error: 'Selected address is invalid: Street address / House No. is required.' };
  }
  const pincodeDigits = (address.pincode || '').replace(/[^0-9]/g, '');
  if (pincodeDigits.length !== 6) {
    return { valid: false, error: 'Selected address is invalid: Pincode must be a 6-digit number.' };
  }
  return { valid: true };
}

console.log('==================================================');
console.log('VIDYUT SPARES CHECKOUT ADDRESS VALIDATION TEST SUITE');
console.log('==================================================');

const testCases = [
  {
    name: 'Valid Indian address with +91 phone & formatted pincode',
    input: {
      full_name: '  Karthikeya B  ',
      phone: '+91 94401 46599',
      address_line_1: '  11-39-15, Katurivari St  ',
      address_line_2: 'Tarapet',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520 001',
      landmark: 'Beside 1 Town Police Station',
    },
    shouldPass: true,
  },
  {
    name: 'Valid Indian address with short door number (Plot 5)',
    input: {
      full_name: 'Ramesh Kumar',
      phone: '09876543210',
      address_line_1: 'Plot 5',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520001',
    },
    shouldPass: true,
  },
  {
    name: 'Invalid phone number (too short)',
    input: {
      full_name: 'Test User',
      phone: '98765',
      address_line_1: 'Main Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520001',
    },
    shouldPass: false,
  },
  {
    name: 'Invalid PIN code (5 digits)',
    input: {
      full_name: 'Test User',
      phone: '9876543210',
      address_line_1: 'Main Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '52000',
    },
    shouldPass: false,
  },
  {
    name: 'Invalid Street Address (1 char)',
    input: {
      full_name: 'Test User',
      phone: '9876543210',
      address_line_1: ' A ',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520001',
    },
    shouldPass: false,
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((tc) => {
  try {
    const res = addressSchema.parse(tc.input);
    const objVal = validateAddressObject(res);
    if (tc.shouldPass && objVal.valid) {
      console.log(`✅ [PASS] ${tc.name}`);
      console.log(`   Cleaned Output: Name="${res.full_name}", Phone="${res.phone}", Addr1="${res.address_line_1}", PIN="${res.pincode}"`);
      passed++;
    } else if (!tc.shouldPass) {
      console.log(`❌ [FAIL - expected rejection] ${tc.name}`);
      failed++;
    } else {
      console.log(`❌ [FAIL - validateAddressObject error] ${tc.name}: ${objVal.error}`);
      failed++;
    }
  } catch (err) {
    if (!tc.shouldPass) {
      console.log(`✅ [PASS - correctly rejected] ${tc.name}`);
      console.log(`   Expected Error: ${err.issues ? err.issues[0].message : err.message}`);
      passed++;
    } else {
      console.log(`❌ [FAIL - unexpectedly rejected] ${tc.name}: ${err.message}`);
      failed++;
    }
  }
});

console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed out of ${testCases.length} tests.`);
if (failed > 0) {
  process.exit(1);
}
