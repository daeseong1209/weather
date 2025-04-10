# 날씨 앱

실시간 날씨 정보를 제공하는 웹 애플리케이션입니다.


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
## 개발 환경
- Google Chrome
- Node.js 16+
- npm

## 기술 스택
### 백엔드
- Node.js + Express.js
- RESTful API
- JWT 인증
- SQLite 데이터베이스
- Open-Meteo API (날씨 데이터)
- Geocoding API (도시 정보)

### 프론트엔드
- HTML5/CSS3/JavaScript
- 반응형 웹 디자인

## 주요 기능
- 실시간 날씨 정보 제공
- 도시별 날씨 예보
- 도시 검색 및 즐겨찾기 관리
- 사용자 인증 및 개인화

## 시작하기

### 백엔드
```bash
cd Back
npm install
npm run dev
```

## 개발 팁
- Chrome DevTools로 디버깅
- Network 탭에서 API 테스트
- Device Toolbar로 반응형 테스트

## 배포
```bash
# 백엔드
cd Back
npm run build
npm start
``` 