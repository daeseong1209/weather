// DOM 요소
const citySearch = document.getElementById('city-search');
const searchResults = document.getElementById('search-results');
const favoriteCitiesContent = document.getElementById('favorite-cities-content');

// 검색 디바운스 타이머
let searchTimeout;

// 도시 검색
citySearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // 타이머 초기화
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    // 디바운스 적용 (300ms)
    searchTimeout = setTimeout(async () => {
        try {
            const response = await citiesAPI.searchCities(query);
            displaySearchResults(response.data.cities);
        } catch (error) {
            console.error('도시 검색 오류:', error);
            searchResults.innerHTML = '<div class="error-message">도시 검색에 실패했습니다.</div>';
        }
    }, 300);
});

// 검색 결과 표시
function displaySearchResults(cities) {
    if (cities.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">검색 결과가 없습니다.</div>';
        return;
    }

    const results = cities.map(city => `
        <div class="search-result-item" data-latitude="${city.latitude}" data-longitude="${city.longitude}">
            ${city.name}, ${city.country}
        </div>
    `).join('');

    searchResults.innerHTML = results;

    // 검색 결과 클릭 이벤트
    const resultItems = searchResults.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
        item.addEventListener('click', () => {
            const latitude = item.dataset.latitude;
            const longitude = item.dataset.longitude;
            
            // 날씨 정보 업데이트
            updateWeather(latitude, longitude);
            
            // 검색창 초기화
            citySearch.value = '';
            searchResults.innerHTML = '';
        });
    });
}

// 즐겨찾기 도시 목록 표시
async function displayFavoriteCities() {
    try {
        const response = await citiesAPI.getFavorites();
        const favorites = response.data.favorites;

        if (favorites.length === 0) {
            favoriteCitiesContent.innerHTML = '<div class="empty-message">즐겨찾기한 도시가 없습니다.</div>';
            return;
        }

        const cities = favorites.map(favorite => `
            <div class="favorite-city" data-id="${favorite.id}">
                <div class="city-info">
                    <div class="city-name">${favorite.city}</div>
                    <div class="city-country">${favorite.country}</div>
                </div>
                <button class="remove-favorite" title="즐겨찾기 삭제">×</button>
            </div>
        `).join('');

        favoriteCitiesContent.innerHTML = cities;

        // 즐겨찾기 도시 클릭 이벤트
        const favoriteItems = favoriteCitiesContent.querySelectorAll('.favorite-city');
        favoriteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // 삭제 버튼 클릭이 아닌 경우에만 날씨 정보 업데이트
                if (!e.target.classList.contains('remove-favorite')) {
                    const latitude = item.dataset.latitude;
                    const longitude = item.dataset.longitude;
                    updateWeather(latitude, longitude);
                }
            });
        });

        // 삭제 버튼 클릭 이벤트
        const removeButtons = favoriteCitiesContent.querySelectorAll('.remove-favorite');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); // 상위 요소의 클릭 이벤트 전파 방지
                
                const cityId = button.closest('.favorite-city').dataset.id;
                try {
                    await citiesAPI.removeFavorite(cityId);
                    displayFavoriteCities(); // 목록 새로고침
                } catch (error) {
                    console.error('즐겨찾기 삭제 오류:', error);
                }
            });
        });
    } catch (error) {
        console.error('즐겨찾기 목록 조회 오류:', error);
        favoriteCitiesContent.innerHTML = '<div class="error-message">즐겨찾기 목록을 불러오는데 실패했습니다.</div>';
    }
}

// 즐겨찾기 도시 추가
async function addFavoriteCity(city, country) {
    try {
        const response = await apiRequest('/cities/favorite', {
            method: 'POST',
            body: JSON.stringify({ city, country })
        });

        if (response.success) {
            displayMessage('도시가 즐겨찾기에 추가되었습니다.', 'success');
            loadFavoriteCities();
            return true;
        }
        return false;
    } catch (error) {
        console.error('즐겨찾기 추가 오류:', error);
        displayMessage('즐겨찾기 추가에 실패했습니다.', 'error');
        return false;
    }
}

// 즐겨찾기 도시 목록 불러오기
async function loadFavoriteCities() {
    try {
        const response = await apiRequest('/cities/favorite');
        
        if (response.success) {
            displayFavoriteCities(response.data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('즐겨찾기 목록 불러오기 오류:', error);
        displayMessage('즐겨찾기 목록을 불러오는데 실패했습니다.', 'error');
        return false;
    }
}

// 즐겨찾기 도시 삭제
async function removeFavoriteCity(id) {
    try {
        const response = await apiRequest(`/cities/favorite/${id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            displayMessage('도시가 즐겨찾기에서 삭제되었습니다.', 'success');
            loadFavoriteCities();
            return true;
        }
        return false;
    } catch (error) {
        console.error('즐겨찾기 삭제 오류:', error);
        displayMessage('즐겨찾기 삭제에 실패했습니다.', 'error');
        return false;
    }
}

// 즐겨찾기 도시 목록 표시
function displayFavoriteCities(cities) {
    const favoritesList = document.getElementById('favoritesList');
    if (favoritesList) {
        if (cities.length === 0) {
            favoritesList.innerHTML = '<div class="no-favorites">즐겨찾기한 도시가 없습니다.</div>';
            return;
        }

        favoritesList.innerHTML = `
            <div class="favorites-grid">
                ${cities.map(city => `
                    <div class="favorite-city-card">
                        <div class="city-info">
                            <div class="city-name">${city.city}</div>
                            <div class="country-name">${city.country}</div>
                        </div>
                        <div class="city-actions">
                            <button onclick="viewCityWeather(${city.latitude}, ${city.longitude})" class="view-weather-btn">
                                날씨 보기
                            </button>
                            <button onclick="removeFavoriteCity(${city.id})" class="remove-favorite-btn">
                                삭제
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// 도시 날씨 보기
function viewCityWeather(latitude, longitude) {
    updateWeather(latitude, longitude);
}

// 메시지 표시
function displayMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// 초기 즐겨찾기 목록 표시
displayFavoriteCities(); 