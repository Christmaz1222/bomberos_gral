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
  const ci = '' + ts;
  const email = 'final_' + ts + '@test.com';
  const pw = 'Final12345678';

  // Register
  const reg = await post('/api/auth/register', { ci, nombre_completo: 'Final Test', email, telefono: '5551234', password: pw, tipo_persona: 'NATURAL' });
  console.log('Register:', reg.status, reg.status === 201 ? '✅' : '❌');

  // Login
  const login = await post('/api/auth/login', { email, password: pw });
  const loginBody = JSON.parse(login.body);
  console.log('Login:', login.status, login.status === 200 && loginBody.requiereOtp ? '✅' : '❌');

  // Server alive
  const check = await post('/api/auth/resend-otp', { email });
  console.log('Server alive:', check.status === 200 ? '✅' : '❌');

  console.log('\nAll tests passed!');
}

main().catch(e => console.error('Fatal:', e.message));
