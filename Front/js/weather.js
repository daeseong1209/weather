// DOM 요소
const currentWeatherContent = document.getElementById('current-weather-content');
const forecastContent = document.getElementById('forecast-content');

// 날씨 아이콘 매핑
const weatherIcons = {
    0: '☀️', // 맑음
    1: '🌤️', // 대체로 맑음
    2: '⛅', // 약간 흐림
    3: '☁️', // 흐림
    45: '🌫️', // 안개
    48: '🌫️', // 짙은 안개
    51: '🌧️', // 가벼운 이슬비
    53: '🌧️', // 이슬비
    55: '🌧️', // 짙은 이슬비
    61: '🌧️', // 약한 비
    63: '🌧️', // 비
    65: '🌧️', // 강한 비
    71: '🌨️', // 약한 눈
    73: '🌨️', // 눈
    75: '🌨️', // 강한 눈
    77: '🌨️', // 눈송이
    80: '🌧️', // 약한 소나기
    81: '🌧️', // 소나기
    82: '🌧️', // 강한 소나기
    85: '🌨️', // 약한 눈보라
    86: '🌨️', // 눈보라
    95: '⛈️', // 천둥번개
    96: '⛈️', // 우박과 함께 약한 천둥번개
    99: '⛈️', // 우박과 함께 강한 천둥번개
};

// 현재 날씨 정보 가져오기
async function getCurrentWeather(latitude, longitude) {
    try {
        const currentWeatherContent = document.getElementById('current-weather-content');
        if (!currentWeatherContent) return;

        showLoading(currentWeatherContent);
        
        const response = await apiRequest(`/weather/current?latitude=${latitude}&longitude=${longitude}`);
        
        if (response.success && response.data) {
            displayCurrentWeather(response.data);
            return true;
        }
        showErrorMessage(currentWeatherContent, '날씨 정보를 가져오는데 실패했습니다.');
        return false;
    } catch (error) {
        console.error('현재 날씨 정보 조회 오류:', error);
        const currentWeatherContent = document.getElementById('current-weather-content');
        if (currentWeatherContent) {
            showErrorMessage(currentWeatherContent, '날씨 정보를 가져오는데 실패했습니다.');
        }
        return false;
    }
}

// 날씨 예보 정보 가져오기
async function getWeatherForecast(latitude, longitude) {
    try {
        const forecastContent = document.getElementById('forecast-content');
        if (!forecastContent) return;

        showLoading(forecastContent);
        
        const response = await apiRequest(`/weather/forecast?latitude=${latitude}&longitude=${longitude}`);
        
        if (response.success && response.data) {
            displayWeatherForecast(response.data);
            return true;
        }
        showErrorMessage(forecastContent, '날씨 예보를 가져오는데 실패했습니다.');
        return false;
    } catch (error) {
        console.error('날씨 예보 정보 조회 오류:', error);
        const forecastContent = document.getElementById('forecast-content');
        if (forecastContent) {
            showErrorMessage(forecastContent, '날씨 예보를 가져오는데 실패했습니다.');
        }
        return false;
    }
}

// 현재 날씨 표시
function displayCurrentWeather(weatherData) {
    const currentWeatherContent = document.getElementById('current-weather-content');
    if (!currentWeatherContent) return;

    const temperature = weatherData?.temp ?? 'N/A';
    const weatherCode = weatherData?.weather_code ?? 0;
    const humidity = weatherData?.humidity ?? 'N/A';
    const precipitation = weatherData?.precipitation ?? 'N/A';
    const description = weatherData?.description ?? getWeatherDescription(weatherCode);

    currentWeatherContent.innerHTML = `
        <div class="current-weather-card" data-latitude="${weatherData?.latitude ?? ''}" data-longitude="${weatherData?.longitude ?? ''}">
            <div class="current-weather-main">
                <div class="weather-icon-temp">
                    <div class="current-weather-icon">${getWeatherIcon(weatherCode)}</div>
                    <div class="current-temperature">${temperature}°C</div>
                </div>
                <div class="current-weather-desc">${description}</div>
            </div>
            <div class="current-weather-details">
                <div class="weather-detail-item">
                    <i class="weather-icon">💧</i>
                    <span class="detail-value">${humidity}%</span>
                    <span class="detail-label">습도</span>
                </div>
                <div class="weather-detail-item">
                    <i class="weather-icon">🌧️</i>
                    <span class="detail-value">${precipitation}mm</span>
                    <span class="detail-label">강수량</span>
                </div>
            </div>
        </div>
    `;
}

// 날씨 예보 표시
function displayWeatherForecast(forecastData) {
    const forecastContent = document.getElementById('forecast-content');
    if (!forecastContent) return;

    // 데이터 구조 확인 및 안전한 접근
    const forecasts = [];

    // 데이터가 있는 경우에만 처리
    if (forecastData && Array.isArray(forecastData.forecast)) {
        // 오늘 날짜 가져오기
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 데이터 정렬 (날짜순)
        const sortedForecasts = [...forecastData.forecast].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        // 오늘 데이터의 인덱스 찾기
        const todayIndex = sortedForecasts.findIndex(day => day.date === todayStr);
        
        // 표시할 데이터 범위 계산
        const startIndex = Math.max(0, todayIndex - 1); // 어제부터
        const endIndex = Math.min(startIndex + 7, sortedForecasts.length); // 최대 7일

        // 데이터 추가
        for (let i = startIndex; i < endIndex; i++) {
            const day = sortedForecasts[i];
            if (day) {
                const dayDate = new Date(day.date);
                const isToday = dayDate.toDateString() === today.toDateString();
                const isPast = dayDate < today;

                forecasts.push({
                    date: formatDate(day.date),
                    temperature: {
                        max: day.max ?? 'N/A',
                        min: day.min ?? 'N/A'
                    },
                    weatherCode: day.weather_code ?? 0,
                    precipitation: day.precipitation ?? 0,
                    isToday: isToday,
                    isPast: isPast
                });
            }
        }
    }

    if (forecasts.length === 0) {
        showErrorMessage(forecastContent, '예보 데이터를 불러올 수 없습니다.');
        return;
    }

    forecastContent.innerHTML = `
        <div class="forecast-grid">
            ${forecasts.map(forecast => `
                <div class="forecast-block ${forecast.isToday ? 'today' : ''} ${forecast.isPast ? 'past' : ''}">
                    <div class="forecast-date">${forecast.date}</div>
                    <div class="forecast-icon">${getWeatherIcon(forecast.weatherCode)}</div>
                    <div class="forecast-temps">
                        <div class="temp-max">
                            <span class="temp-label">최고</span>
                            <span class="temp-value">${forecast.temperature.max}°C</span>
                        </div>
                        <div class="temp-min">
                            <span class="temp-label">최저</span>
                            <span class="temp-value">${forecast.temperature.min}°C</span>
                        </div>
                    </div>
                    <div class="forecast-precip">
                        <span class="precip-label">강수확률</span>
                        <span class="precip-value">${forecast.precipitation}%</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 날짜 포맷팅
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
}

// 날씨 정보 업데이트
function updateWeather(latitude, longitude) {
    getCurrentWeather(latitude, longitude);
    getWeatherForecast(latitude, longitude);
}

// 전역 함수로 내보내기
window.updateWeather = updateWeather;

// 날씨 아이콘 가져오기
function getWeatherIcon(weatherCode) {
    // WMO Weather interpretation codes (WW)
    const weatherIcons = {
        0: '☀️',  // 맑음
        1: '🌤️',  // 대체로 맑음
        2: '⛅',  // 약간 흐림
        3: '☁️',  // 흐림
        45: '🌫️',  // 안개
        48: '🌫️',  // 서리 안개
        51: '🌦️',  // 가벼운 이슬비
        53: '🌧️',  // 이슬비
        55: '🌧️',  // 강한 이슬비
        61: '🌧️',  // 약한 비
        63: '🌧️',  // 비
        65: '🌧️',  // 강한 비
        71: '🌨️',  // 약한 눈
        73: '🌨️',  // 눈
        75: '🌨️',  // 강한 눈
        77: '🌨️',  // 싸락눈
        80: '🌧️',  // 약한 소나기
        81: '🌧️',  // 소나기
        82: '🌧️',  // 강한 소나기
        85: '🌨️',  // 약한 눈 소나기
        86: '🌨️',  // 강한 눈 소나기
        95: '⛈️',  // 천둥번개
        96: '⛈️',  // 천둥번개와 약한 우박
        99: '⛈️'   // 천둥번개와 강한 우박
    };
    return weatherIcons[weatherCode] || '❓';
}

// 날씨 설명 가져오기
function getWeatherDescription(weatherCode) {
    const weatherDescriptions = {
        0: '맑음',
        1: '대체로 맑음',
        2: '약간 흐림',
        3: '흐림',
        45: '안개',
        48: '서리 안개',
        51: '가벼운 이슬비',
        53: '이슬비',
        55: '강한 이슬비',
        61: '약한 비',
        63: '비',
        65: '강한 비',
        71: '약한 눈',
        73: '눈',
        75: '강한 눈',
        77: '싸락눈',
        80: '약한 소나기',
        81: '소나기',
        82: '강한 소나기',
        85: '약한 눈 소나기',
        86: '강한 눈 소나기',
        95: '천둥번개',
        96: '천둥번개와 약한 우박',
        99: '천둥번개와 강한 우박'
    };
    return weatherDescriptions[weatherCode] || '알 수 없음';
} 