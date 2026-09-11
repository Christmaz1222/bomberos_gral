const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({ hostname: 'localhost', port: 3000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const ts = Date.now();
  const email = 'debug_' + ts + '@test.com';
  const pw = 'Debug12345678';

  // Register
  console.log('1. Register:', email);
  const reg = await post('/api/auth/register', {
    ci: '3333333', nombre_completo: 'Debug Login',
    email, telefono: '70000111', password: pw,
    tipo_persona: 'NATURAL', departamento: 'La Paz'
  });
  console.log('   Register:', reg.status, reg.body.substring(0,100));

  if (reg.status !== 201) {
    console.log('Registration failed');
    return;
  }

  // Wait a moment
  await new Promise(r => setTimeout(r, 1000));

  // Login
  console.log('\n2. Login');
  const login = await post('/api/auth/login', { email, password: pw });
  console.log('   Login:', login.status, login.body.substring(0,200));

  // Check if server still running
  await new Promise(r => setTimeout(r, 500));
  try {
    const check = await post('/api/auth/resend-otp', { email });
    console.log('3. Resend OTP:', check.status);
    console.log('\n✅ Server is still alive!');
  } catch (e) {
    console.log('3. Server CRASHED:', e.message);
  }
}

main().catch(e => console.error('Fatal:', e.message));
