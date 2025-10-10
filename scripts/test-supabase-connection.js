// Test Supabase connection from Node.js
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vwwcprauksknefwslips.supabase.co';

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);

// Test 1: Basic HTTPS request
https.get(SUPABASE_URL + '/auth/v1/health', (res) => {
  console.log('\n✅ HTTPS request successful');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on('error', (err) => {
  console.error('\n❌ HTTPS request failed:', err.message);
  console.error('Error code:', err.code);
  
  if (err.code === 'ENOTFOUND') {
    console.error('\n→ DNS resolution failed. Check internet connection.');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('\n→ Connection refused. Supabase might be down.');
  } else if (err.code === 'CERT_HAS_EXPIRED' || err.code.includes('CERT')) {
    console.error('\n→ SSL certificate issue. Try: set NODE_TLS_REJECT_UNAUTHORIZED=0 (dev only!)');
  }
});

// Test 2: Fetch API (what Supabase uses)
console.log('\nTesting fetch API...');
setTimeout(async () => {
  try {
    const response = await fetch(SUPABASE_URL + '/auth/v1/health');
    console.log('✅ Fetch API works');
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('❌ Fetch API failed:', err.message);
  }
}, 1000);

