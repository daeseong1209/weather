const http = require('http');

const data = JSON.stringify({
  email: 'test@example.com',
  password: 'test1234',
  name: 'Test User'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', error => console.error(error));
req.write(data);
req.end(); 