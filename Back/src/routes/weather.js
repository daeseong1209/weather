const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getWeatherDescription } = require('../utils/cityUtils');

// 현재 날씨 조회
router.get('/current', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '위도와 경도가 필요합니다.'
        }
      });
    }

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code`
    );

    const weatherData = response.data.current;
    
    res.json({
      success: true,
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        temp: weatherData.temperature_2m,
        humidity: weatherData.relative_humidity_2m,
        precipitation: weatherData.precipitation,
        weather_code: weatherData.weather_code,
        description: getWeatherDescription(weatherData.weather_code)
      }
    });
  } catch (error) {
    console.error('날씨 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEATHER_API_ERROR',
        message: '날씨 정보를 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

// 날씨 예보 조회
router.get('/forecast', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '위도와 경도가 필요합니다.'
        }
      });
    }

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code`
    );

    const forecastData = response.data.daily;
    
    const forecast = forecastData.time.map((date, index) => ({
      date,
      min: forecastData.temperature_2m_min[index],
      max: forecastData.temperature_2m_max[index],
      precipitation: forecastData.precipitation_sum[index],
      weather_code: forecastData.weather_code[index],
      description: getWeatherDescription(forecastData.weather_code[index])
    }));

    res.json({
      success: true,
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        forecast
      }
    });
  } catch (error) {
    console.error('날씨 예보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEATHER_API_ERROR',
        message: '날씨 예보를 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

module.exports = router; 