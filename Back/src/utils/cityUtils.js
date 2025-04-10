const db = require('../db');
const axios = require('axios');

/**
 * 도시 정보 조회 함수
 * @param {string} city - 도시명
 * @returns {Promise<Object>} - 도시 정보 (id, name, country, latitude, longitude)
 */
async function getCityCoordinates(city) {
  return new Promise((resolve, reject) => {
    // 먼저 DB에서 도시 정보 조회
    db.get(
      'SELECT * FROM cities WHERE name = ?',
      [city],
      async (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          resolve(row);
          return;
        }

        // 도시가 DB에 없는 경우 Open-Meteo Geocoding API를 통해 위도/경도 조회
        try {
          const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
          
          if (response.data.results && response.data.results.length > 0) {
            const cityData = response.data.results[0];
            
            // 도시 정보를 DB에 저장
            db.run(
              'INSERT INTO cities (name, country, latitude, longitude) VALUES (?, ?, ?, ?)',
              [city, cityData.country, cityData.latitude, cityData.longitude],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve({
                  id: this.lastID,
                  name: city,
                  country: cityData.country,
                  latitude: cityData.latitude,
                  longitude: cityData.longitude
                });
              }
            );
          } else {
            reject(new Error('도시를 찾을 수 없습니다.'));
          }
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * 도시 정보 조회 또는 생성 함수
 * @param {string} city - 도시명
 * @returns {Promise<number>} - 도시 ID
 */
async function getOrCreateCity(city) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM cities WHERE name = ?',
      [city],
      async (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          resolve(row.id);
          return;
        }

        // 도시가 DB에 없는 경우 Open-Meteo Geocoding API를 통해 위도/경도 조회
        try {
          const response = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
          );

          if (!response.data.results || response.data.results.length === 0) {
            reject(new Error('도시를 찾을 수 없습니다.'));
            return;
          }

          const cityData = response.data.results[0];
          
          // 도시 정보 저장
          db.run(
            'INSERT INTO cities (name, country, latitude, longitude) VALUES (?, ?, ?, ?)',
            [city, cityData.country, cityData.latitude, cityData.longitude],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              resolve(this.lastID);
            }
          );
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * 날씨 코드에 따른 설명 반환 함수
 * @param {number} code - 날씨 코드
 * @returns {string} - 날씨 설명
 */
function getWeatherDescription(code) {
  const weatherCodes = {
    0: '맑음',
    1: '대체로 맑음',
    2: '약간 흐림',
    3: '흐림',
    45: '안개',
    48: '짙은 안개',
    51: '가벼운 가랑비',
    53: '보통 가랑비',
    55: '짙은 가랑비',
    61: '약한 비',
    63: '보통 비',
    65: '강한 비',
    71: '약한 눈',
    73: '보통 눈',
    75: '강한 눈',
    77: '눈송이',
    80: '약한 소나기',
    81: '보통 소나기',
    82: '강한 소나기',
    85: '약한 눈 소나기',
    86: '강한 눈 소나기',
    95: '천둥번개',
    96: '우박과 함께 천둥번개',
    99: '강한 우박과 함께 천둥번개'
  };
  
  return weatherCodes[code] || '알 수 없음';
}

module.exports = {
  getCityCoordinates,
  getOrCreateCity,
  getWeatherDescription
}; 