const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const axios = require('axios');

// 즐겨찾기 도시 추가
router.post('/favorite', auth, async (req, res) => {
  const { city } = req.body;
  const userId = req.user.id;

  if (!city) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: '도시명이 필요합니다.'
      }
    });
  }

  try {
    // 도시 정보 조회 또는 생성
    const cityResult = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM cities WHERE name = ?',
        [city],
        async (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });

    let cityId;
    if (cityResult) {
      cityId = cityResult.id;
    } else {
      // 도시가 없는 경우 Open-Meteo Geocoding API를 통해 위도/경도 조회
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      if (!response.data.results || response.data.results.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CITY_NOT_FOUND',
            message: '도시를 찾을 수 없습니다.'
          }
        });
      }

      const cityData = response.data.results[0];
      
      // 도시 정보 저장
      cityId = await new Promise((resolve, reject) => {
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
      });
    }

    // 이미 즐겨찾기에 있는지 확인
    const existingFavorite = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM favorites WHERE user_id = ? AND city_id = ?',
        [userId, cityId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_FAVORITE',
          message: '이미 즐겨찾기에 추가된 도시입니다.'
        }
      });
    }

    // 즐겨찾기 추가
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO favorites (user_id, city_id) VALUES (?, ?)',
        [userId, cityId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });

    // 도시 정보 조회
    const cityInfo = await new Promise((resolve, reject) => {
      db.get(
        'SELECT name, country FROM cities WHERE id = ?',
        [cityId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });

    res.status(201).json({
      success: true,
      data: {
        id: cityId,
        city: cityInfo.name,
        country: cityInfo.country
      }
    });
  } catch (error) {
    console.error('즐겨찾기 추가 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    });
  }
});

// 즐겨찾기 도시 목록
router.get('/favorite', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await new Promise((resolve, reject) => {
      db.all(
        `SELECT f.id, c.name as city, c.country 
         FROM favorites f 
         JOIN cities c ON f.city_id = c.id 
         WHERE f.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      data: {
        favorites
      }
    });
  } catch (error) {
    console.error('즐겨찾기 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    });
  }
});

// 즐겨찾기 도시 삭제
router.delete('/favorite/:id', auth, async (req, res) => {
  const favoriteId = req.params.id;
  const userId = req.user.id;

  try {
    // 즐겨찾기 존재 여부 확인
    const favorite = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM favorites WHERE id = ? AND user_id = ?',
        [favoriteId, userId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FAVORITE_NOT_FOUND',
          message: '즐겨찾기를 찾을 수 없습니다.'
        }
      });
    }

    // 즐겨찾기 삭제
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM favorites WHERE id = ?',
        [favoriteId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });

    res.json({
      success: true,
      message: '즐겨찾기가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('즐겨찾기 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    });
  }
});

module.exports = router; 