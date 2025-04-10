// 기본 도시 설정 (서울)
const DEFAULT_CITY = {
    latitude: 37.5665,
    longitude: 126.9780
};

// 인증 체크
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        window.location.replace('./login.html');
        return;
    }

    // 사용자 이름 표시
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
}

// 로그아웃 처리
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('./login.html');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 초기화
    const citySearch = document.getElementById('city-search');
    const searchResults = document.getElementById('search-results');
    const authPage = document.getElementById('auth-page');
    const mainPage = document.getElementById('main-page');

    // 인증 체크
    checkAuth();

    // 로그인 상태 확인
    const token = localStorage.getItem('token');
    if (token) {
        // 로그인 상태면 메인 페이지 표시
        if (authPage) authPage.classList.add('hidden');
        if (mainPage) mainPage.classList.remove('hidden');
        
        // 초기 날씨 정보 로드 (서울)
        updateWeather(DEFAULT_CITY.latitude, DEFAULT_CITY.longitude);
        
        // 즐겨찾기 목록 로드
        loadFavoriteCities();

        // 검색 관련 이벤트 리스너 설정
        if (citySearch && searchResults) {
            // 검색창 포커스 이벤트
            citySearch.addEventListener('focus', () => {
                searchResults.style.display = 'block';
            });

            // 검색창 포커스 아웃 이벤트
            document.addEventListener('click', (e) => {
                if (!citySearch.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.style.display = 'none';
                }
            });

            // 키보드 이벤트 처리
            document.addEventListener('keydown', (e) => {
                // ESC 키로 검색창 닫기
                if (e.key === 'Escape') {
                    searchResults.style.display = 'none';
                    citySearch.blur();
                }
            });
        }

        // 로그아웃 버튼 이벤트 설정
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        // 로그인 상태가 아니면 인증 페이지 표시
        if (mainPage) mainPage.classList.add('hidden');
        if (authPage) authPage.classList.remove('hidden');
        
        if (!window.location.pathname.endsWith('login.html') && 
            !window.location.pathname.endsWith('signup.html')) {
            window.location.href = 'login.html';
        }
    }
});

// 에러 메시지 표시 함수
function showErrorMessage(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    element.innerHTML = '';
    element.appendChild(errorDiv);
}

// 성공 메시지 표시 함수
function showSuccessMessage(element, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    element.innerHTML = '';
    element.appendChild(successDiv);
}

// 로딩 상태 표시 함수
function showLoading(element) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '로딩 중...';
    
    element.innerHTML = '';
    element.appendChild(loadingDiv);
}

// 날씨 정보 자동 업데이트 (5분마다)
setInterval(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const currentWeather = document.querySelector('.weather-info');
        if (currentWeather) {
            const latitude = currentWeather.dataset.latitude;
            const longitude = currentWeather.dataset.longitude;
            if (latitude && longitude) {
                updateWeather(latitude, longitude);
            }
        }
    }
}, 5 * 60 * 1000); 