const fs = require('fs');
const path = require('path');

const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase') || k.toLowerCase().includes('db') || k.toLowerCase().includes('database') || k.toLowerCase().includes('postg') || k.toLowerCase().includes('secret') || k.toLowerCase().includes('pass') || k.toLowerCase().includes('key'));

const lines = [];
lines.push(`Process Environment Keys: ${JSON.stringify(envKeys)}`);
for (const k of envKeys) {
  lines.push(`${k}: ${process.env[k]?.substring(0, 15)}... (len ${process.env[k]?.length})`);
}

fs.writeFileSync(path.join(__dirname, 'env-audit.txt'), lines.join('\n'));
