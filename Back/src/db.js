const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로 설정
const dbPath = path.join(__dirname, '../data/weather.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err.message);
  } else {
    console.log('데이터베이스 연결 성공');
    initDatabase();
  }
});

// 데이터베이스 초기화 함수
function initDatabase() {
  db.serialize(() => {
    // Users 테이블 생성
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Cities 테이블 생성
    db.run(`CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      UNIQUE(name, country)
    )`);

    // Favorites 테이블 생성
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (city_id) REFERENCES cities(id)
    )`);
  });
}

module.exports = db; 