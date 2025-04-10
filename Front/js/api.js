// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// API 요청 함수
async function apiRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();
        
        if (!data.success && data.error) {
            throw new Error(data.error.message);
        }

        return data;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 인증 API
const authAPI = {
    // 회원가입
    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // 로그인
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
};

// 날씨 API
const weatherAPI = {
    // 현재 날씨 조회
    getCurrentWeather: async (latitude, longitude) => {
        return apiRequest(`/weather/current?latitude=${latitude}&longitude=${longitude}`);
    },

    // 날씨 예보 조회
    getForecast: async (latitude, longitude) => {
        return apiRequest(`/weather/forecast?latitude=${latitude}&longitude=${longitude}`);
    }
};

// 도시 API
const citiesAPI = {
    // 도시 검색
    searchCities: async (query) => {
        return apiRequest(`/search/cities?query=${encodeURIComponent(query)}`);
    },

    // 즐겨찾기 도시 추가
    addFavorite: async (city) => {
        return apiRequest('/cities/favorite', {
            method: 'POST',
            body: JSON.stringify({ city })
        });
    },

    // 즐겨찾기 도시 목록
    getFavorites: async () => {
        return apiRequest('/cities/favorite');
    },

    // 즐겨찾기 도시 삭제
    removeFavorite: async (id) => {
        return apiRequest(`/cities/favorite/${id}`, {
            method: 'DELETE'
        });
    }
}; 