const fs = require('fs');
const path = require('path');

const allEnv = process.env;
const keys = Object.keys(allEnv);

const matches = keys.filter(k => {
  const lower = k.toLowerCase();
  return lower.includes('supabase') || lower.includes('postgres') || lower.includes('db') || lower.includes('secret') || lower.includes('token') || lower.includes('key');
});

const output = [];
for (const k of matches) {
  output.push(`${k}: ${allEnv[k]}`);
}

fs.writeFileSync(path.join(__dirname, 'win-env-audit.txt'), output.join('\n'));
