require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const citiesRoutes = require('./routes/cities');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/search', searchRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Weather App API' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 