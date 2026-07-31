/**
 * test-openrouter.js
 * Run with: node test-openrouter.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

const raw = fs.readFileSync(envPath, 'utf-8');
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (key && process.env[key] === undefined) process.env[key] = value;
}

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('❌ OPENROUTER_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('Testing OpenRouter key:', apiKey.slice(0, 12) + '...');

async function runTest() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // In test.js
        body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: 'Say "Ready to generate!" in 3 words.' }],
        }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Failed:', res.status, data);
      return;
    }

    console.log('✅ SUCCESS! Response:', data.choices[0].message.content.trim());
  } catch (err) {
    console.error('❌ Error testing connection:', err);
  }
}

runTest();