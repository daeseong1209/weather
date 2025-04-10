// 도시 검색
async function searchCities(query) {
    try {
        const response = await apiRequest(`/search/cities?query=${encodeURIComponent(query)}`);
        
        if (response.success) {
            displaySearchResults(response.data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('도시 검색 오류:', error);
        return false;
    }
}

// 검색 결과 표시
function displaySearchResults(cities) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        if (cities.length === 0) {
            searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        searchResults.innerHTML = `
            <div class="search-results-list">
                ${cities.map(city => `
                    <div class="search-result-item" onclick="selectCity('${city.name}', '${city.country}')">
                        <div class="city-name">${city.name}</div>
                        <div class="country-name">${city.country}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// 도시 선택
function selectCity(city, country) {
    const searchInput = document.getElementById('citySearch');
    if (searchInput) {
        searchInput.value = `${city}, ${country}`;
    }
    
    // 검색 결과 숨기기
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    
    // 도시 좌표 가져오기
    getCityCoordinates(city, country)
        .then(coordinates => {
            if (coordinates) {
                // 날씨 정보 업데이트
                updateWeather(coordinates.latitude, coordinates.longitude);
            } else {
                displayMessage('도시 좌표를 찾을 수 없습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('도시 좌표 조회 오류:', error);
            displayMessage('도시 좌표 조회에 실패했습니다.', 'error');
        });
}

// 검색 입력 이벤트 처리
function setupSearchInput() {
    const searchInput = document.getElementById('citySearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    searchCities(query);
                }, 300);
            } else {
                const searchResults = document.getElementById('searchResults');
                if (searchResults) {
                    searchResults.innerHTML = '';
                }
            }
        });
    }
} 