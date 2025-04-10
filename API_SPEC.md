# 날씨 앱 API 명세서

## 기본 정보
- 기본 URL: `http://localhost:3000/api`
- 모든 응답은 JSON 형식
- 날씨 데이터는 Open-Meteo API 사용
- 도시 검색은 Nominatim API 사용
- 인증이 필요한 엔드포인트는 Authorization 헤더에 JWT 토큰 필요

## 응답 형식
### 성공 응답
```json
{
  "success": true,
  "data": {
    // 응답 데이터
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "에러 코드",
    "message": "에러 메시지"
  }
}
```

## 데이터베이스 스키마
### Users 테이블
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Cities 테이블
```sql
CREATE TABLE cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Favorites 테이블
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  city_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);
```

## API 엔드포인트

### 1. 인증 API

#### 1.1 회원가입
- **URL**: `/auth/register`
- **Method**: `POST`
- **인증 필요**: 아니오
- **요청 본문**:
```json
{
  "email": "사용자 이메일",
  "password": "비밀번호",
  "name": "사용자 이름"
}
```
- **응답**:
```json
{
  "success": true,
  "data": {
    "id": "사용자 ID",
    "email": "사용자 이메일",
    "name": "사용자 이름"
  }
}
```
- **에러 코드**:
  - `INVALID_INPUT`: 필수 필드 누락
  - `EMAIL_EXISTS`: 이미 등록된 이메일
  - `DB_ERROR`: 데이터베이스 오류
  - `SERVER_ERROR`: 서버 오류

#### 1.2 로그인
- **URL**: `/auth/login`
- **Method**: `POST`
- **인증 필요**: 아니오
- **요청 본문**:
```json
{
  "email": "사용자 이메일",
  "password": "비밀번호"
}
```
- **응답**:
```json
{
  "success": true,
  "data": {
    "token": "JWT 토큰",
    "user": {
      "id": "사용자 ID",
      "email": "사용자 이메일",
      "name": "사용자 이름"
    }
  }
}
```
- **에러 코드**:
  - `INVALID_INPUT`: 필수 필드 누락
  - `INVALID_CREDENTIALS`: 잘못된 인증 정보
  - `DB_ERROR`: 데이터베이스 오류
  - `SERVER_ERROR`: 서버 오류

### 2. 날씨 API

#### 2.1 현재 날씨 조회
- **URL**: `/weather/current`
- **Method**: `GET`
- **인증 필요**: 아니오
- **쿼리 파라미터**:
  - `latitude`: 위도 (필수)
  - `longitude`: 경도 (필수)
- **응답**:
```json
{
  "success": true,
  "data": {
    "latitude": "위도",
    "longitude": "경도",
    "temp": "현재 기온",
    "humidity": "습도",
    "precipitation": "강수량",
    "weather_code": "날씨 코드",
    "description": "날씨 설명"
  }
}
```
- **에러 코드**:
  - `INVALID_PARAMS`: 필수 파라미터 누락
  - `WEATHER_API_ERROR`: 날씨 API 오류
  - `SERVER_ERROR`: 서버 오류

#### 2.2 날씨 예보 조회
- **URL**: `/weather/forecast`
- **Method**: `GET`
- **인증 필요**: 아니오
- **쿼리 파라미터**:
  - `latitude`: 위도 (필수)
  - `longitude`: 경도 (필수)
- **응답**:
```json
{
  "success": true,
  "data": {
    "latitude": "위도",
    "longitude": "경도",
    "forecast": [
      {
        "date": "날짜",
        "min": "최저 기온",
        "max": "최고 기온",
        "precipitation": "강수량",
        "weather_code": "날씨 코드",
        "description": "날씨 설명"
      }
    ]
  }
}
```
- **에러 코드**:
  - `INVALID_PARAMS`: 필수 파라미터 누락
  - `WEATHER_API_ERROR`: 날씨 API 오류
  - `SERVER_ERROR`: 서버 오류

### 3. 도시 관리 API

#### 3.1 즐겨찾기 도시 추가
- **URL**: `/cities/favorite`
- **Method**: `POST`
- **인증 필요**: 예
- **요청 본문**:
```json
{
  "city": "도시명"
}
```
- **응답**:
```json
{
  "success": true,
  "data": {
    "id": "즐겨찾기 ID",
    "city": "도시명",
    "country": "국가명"
  }
}
```
- **에러 코드**:
  - `INVALID_INPUT`: 필수 필드 누락
  - `CITY_NOT_FOUND`: 도시를 찾을 수 없음
  - `DUPLICATE_FAVORITE`: 이미 즐겨찾기에 추가된 도시
  - `SERVER_ERROR`: 서버 오류

#### 3.2 즐겨찾기 도시 목록
- **URL**: `/cities/favorite`
- **Method**: `GET`
- **인증 필요**: 예
- **응답**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "즐겨찾기 ID",
        "city": "도시명",
        "country": "국가명"
      }
    ]
  }
}
```
- **에러 코드**:
  - `SERVER_ERROR`: 서버 오류

#### 3.3 즐겨찾기 도시 삭제
- **URL**: `/cities/favorite/:id`
- **Method**: `DELETE`
- **인증 필요**: 예
- **응답**:
```json
{
  "success": true,
  "message": "즐겨찾기가 삭제되었습니다."
}
```
- **에러 코드**:
  - `FAVORITE_NOT_FOUND`: 즐겨찾기를 찾을 수 없음
  - `SERVER_ERROR`: 서버 오류

### 4. 도시 검색 API

#### 4.1 도시 검색
- **URL**: `/search/cities`
- **Method**: `GET`
- **인증 필요**: 아니오
- **쿼리 파라미터**:
  - `query`: 검색어 (필수, 최소 2자)
- **응답**:
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "name": "도시명",
        "country": "국가명",
        "latitude": "위도",
        "longitude": "경도"
      }
    ]
  }
}
```
- **에러 코드**:
  - `INVALID_PARAMS`: 필수 파라미터 누락
  - `SEARCH_API_ERROR`: 검색 API 오류
  - `SERVER_ERROR`: 서버 오류 