const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ0MjE2MDc2LCJleHAiOjE3NDQzMDI0NzZ9.IvYt_-dd4a_sgpZ4-kJWJ0FxcuxdVA0Z-3Hc_adwhtc';

const data = JSON.stringify({
  city: 'Seoul'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cities/favorite',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end(); 