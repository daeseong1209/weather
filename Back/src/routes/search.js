const express = require('express');
const router = express.Router();
const axios = require('axios');

// 도시 검색
router.get('/cities', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: '검색어가 필요합니다.'
      }
    });
  }

  // 검색어가 너무 짧은 경우 처리
  if (query.length < 2) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: '검색어는 최소 2자 이상이어야 합니다.'
      }
    });
  }

  try {
    // Nominatim API를 사용하여 도시 검색
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`,
      {
        headers: {
          'User-Agent': 'WeatherApp/1.0'
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.json({
        success: true,
        data: {
          cities: []
        }
      });
    }

    // 중복 제거 및 정렬 (같은 도시명이 다른 국가에 있는 경우 처리)
    const cityMap = new Map();
    
    response.data.forEach(place => {
      const cityName = place.display_name.split(',')[0];
      const country = place.address?.country || 'Unknown';
      const key = `${cityName}-${country}`;
      
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          name: cityName,
          country: country,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          // 정렬을 위한 점수 계산 (검색어와 일치하는 정도)
          score: calculateMatchScore(cityName, query)
        });
      }
    });

    // 점수 기준으로 정렬
    const cities = Array.from(cityMap.values())
      .sort((a, b) => b.score - a.score)
      .map(({ name, country, latitude, longitude }) => ({ 
        name, 
        country,
        latitude,
        longitude
      }));

    res.json({
      success: true,
      data: {
        cities
      }
    });
  } catch (error) {
    console.error('도시 검색 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_API_ERROR',
        message: '도시 검색 중 오류가 발생했습니다.'
      }
    });
  }
});

// 검색어와 도시명의 일치 정도를 계산하는 함수
function calculateMatchScore(cityName, query) {
  const cityLower = cityName.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // 정확히 일치하는 경우 최고 점수
  if (cityLower === queryLower) {
    return 100;
  }
  
  // 도시명이 검색어로 시작하는 경우 높은 점수
  if (cityLower.startsWith(queryLower)) {
    return 80;
  }
  
  // 도시명에 검색어가 포함된 경우 중간 점수
  if (cityLower.includes(queryLower)) {
    return 60;
  }
  
  // 부분 일치 (문자열 거리 기반)
  const distance = levenshteinDistance(cityLower, queryLower);
  const maxLength = Math.max(cityLower.length, queryLower.length);
  const similarity = 1 - (distance / maxLength);
  
  return Math.round(similarity * 40); // 최대 40점
}

// Levenshtein 거리 계산 함수 (문자열 유사도)
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // 초기화
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // 거리 계산
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 대체
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j] + 1      // 삭제
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

module.exports = router; 