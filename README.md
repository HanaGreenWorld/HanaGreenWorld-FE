# Hana Green+ Web App

친환경 금융 플랫폼 Hana Green+의 React Native 웹 애플리케이션입니다.

## 프로젝트 구조

```
HanaGreenPlusWeb/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── Header.tsx       # 앱 헤더 컴포넌트
│   │   ├── ActivityTracker.tsx  # 친환경 활동 추적 컴포넌트
│   │   ├── FeatureCards.tsx     # 주요 활동 현황 카드 컴포넌트
│   │   ├── PointsUsage.tsx      # 포인트 사용 옵션 컴포넌트
│   │   └── index.ts
│   ├── screens/             # 화면 컴포넌트
│   │   ├── DashboardScreen.tsx  # 메인 대시보드 화면
│   │   ├── PointsHistoryScreen.tsx  # 포인트 내역 화면
│   │   └── index.ts
│   ├── hooks/               # 커스텀 훅
│   │   ├── usePoints.ts     # 포인트 관련 로직 훅
│   │   └── index.ts
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts
│   └── utils/               # 유틸리티 함수 및 상수
│       ├── constants.ts     # 앱에서 사용하는 상수들
│       └── index.ts
├── App.tsx                  # 메인 앱 컴포넌트
├── package.json
└── README.md
```

## 주요 기능

### 1. 대시보드 (DashboardScreen)
- 현재 보유 포인트 및 오늘 적립 포인트 표시
- 친환경 활동 추적 (걸음 수, 대중교통, 전자영수증, 다회용컵)
- 주요 활동 현황 카드
- 포인트 사용 옵션

### 2. 포인트 내역 (PointsHistoryScreen)
- 포인트 적립/사용 내역 조회
- 필터링 기능 (거래 유형, 기간, 정렬)
- 실시간 포인트 업데이트

## 컴포넌트 구조

### Header 컴포넌트
- 앱 로고 및 제목
- 알림 및 선물 버튼
- 포인트 카드 (클릭 시 내역 화면으로 이동)

### ActivityTracker 컴포넌트
- 4가지 친환경 활동 추적
- 각 활동별 진행률 표시
- 실시간 데이터 업데이트

### FeatureCards 컴포넌트
- 월간 교통비 절약
- 친환경 전자영수증
- 다회용컵 사용
- 캠페인 참여

### PointsUsage 컴포넌트
- 하나머니 전환
- 캐시백
- 보험료 할인
- ESG 투자
- 환경 기부

## 사용된 기술

- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **TypeScript**: 타입 안전성 보장
- **Expo**: 개발 환경 및 빌드 도구
- **Ionicons**: 아이콘 라이브러리

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 웹에서 실행
npm run web
```

## 개발 가이드

### 새로운 컴포넌트 추가
1. `src/components/` 폴더에 새 컴포넌트 파일 생성
2. `src/components/index.ts`에 export 추가
3. 필요한 타입은 `src/types/index.ts`에 정의

### 새로운 화면 추가
1. `src/screens/` 폴더에 새 화면 파일 생성
2. `src/screens/index.ts`에 export 추가
3. `App.tsx`에서 라우팅 로직 추가

### 새로운 훅 추가
1. `src/hooks/` 폴더에 새 훅 파일 생성
2. `src/hooks/index.ts`에 export 추가

## 스타일 가이드

- 모든 컴포넌트는 TypeScript로 작성
- Props 인터페이스 정의 필수
- 스타일은 StyleSheet.create() 사용
- 반응형 디자인을 위한 SCALE 상수 활용
- 색상은 constants.ts에서 관리 