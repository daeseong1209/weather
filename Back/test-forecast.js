const http = require('http');

// 로그인 응답에서 받은 토큰을 여기에 넣어주세요
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ0MjE2MDc2LCJleHAiOjE3NDQzMDI0NzZ9.IvYt_-dd4a_sgpZ4-kJWJ0FxcuxdVA0Z-3Hc_adwhtc';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/weather/forecast?latitude=37.5665&longitude=126.9780',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', error => console.error(error));
req.end(); 