import { Dimensions, Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import { KAKAO_MAP_API_KEY as ENV_KAKAO_MAP_API_KEY } from '@env';

const { width, height } = Dimensions.get('window');

// 기준 화면 크기 (iPhone 14 기준: 393 x 852)
export const BASE_WIDTH = 393;
export const BASE_HEIGHT = 852;

// 반응형 스케일 계산
export const SCALE = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);

// 실제 화면 크기 (반응형)
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// 반응형 크기 계산 함수
export const scaleSize = (size: number) => size * SCALE;
export const scaleWidth = (width: number) => width * (SCREEN_WIDTH / BASE_WIDTH);
export const scaleHeight = (height: number) => height * (SCREEN_HEIGHT / BASE_HEIGHT);

// Safe Area 정보는 이제 useSafeAreaInsets() 훅을 사용하여 동적으로 처리
// 하드코딩된 값 제거 - 각 컴포넌트에서 useSafeAreaInsets() 사용 권장

// 기존 호환성을 위한 상수 (deprecated)
export const IPHONE_WIDTH = SCREEN_WIDTH;
export const IPHONE_HEIGHT = SCREEN_HEIGHT;

// 색상 상수
export const COLORS = {
  primary: '#138072',
  secondary: '#81C784',
  accent: '#FFE55C',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textLighter: '#999999',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  blue: '#007AFF',
  GREEN: '#00A651',
  RED: '#FF6B6B',
} as const;

// 등급 시스템 상수
export const ECO_LEVELS = [
  {
    id: 'beginner',
    name: '친환경 새내기',
    description: '작은 실천부터 시작해보세요',
    requiredPoints: 0,
    icon: '🌱',
    color: '#81C784',
  },
  {
    id: 'intermediate',
    name: '친환경 실천가',
    description: '꾸준한 노력이 빛나고 있어요',
    requiredPoints: 50000,
    icon: '🌳',
    color: '#66BB6A',
  },
  {
    id: 'expert',
    name: '친환경 달인',
    description: '당신이 바로 지구의 영웅입니다',
    requiredPoints: 200000,
    icon: '🌍',
    color: '#4CAF50',
  },
] as const;

// 업적 시스템 상수
export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    name: '첫 걸음',
    description: '첫 번째 친환경 활동을 완료했어요',
    icon: '👣',
  },
  {
    id: 'weekly_streak',
    name: '일주일 연속',
    description: '일주일 연속으로 친환경 활동을 했어요',
    icon: '🔥',
  },
  {
    id: 'monthly_streak',
    name: '한 달 연속',
    description: '한 달 연속으로 친환경 활동을 했어요',
    icon: '📅',
  },
  {
    id: 'carbon_10kg',
    name: '탄소 절약 10kg',
    description: '총 10kg의 탄소를 절약했어요',
    icon: '🌱',
  },
  {
    id: 'carbon_50kg',
    name: '탄소 절약 50kg',
    description: '총 50kg의 탄소를 절약했어요',
    icon: '🌿',
  },
  {
    id: 'points_1000',
    name: '에코머니 1,000P',
    description: '총 1,000P의 에코머니를 모았어요',
    icon: '💰',
  },
  {
    id: 'points_5000',
    name: '에코머니 5,000P',
    description: '총 5,000P의 에코머니를 모았어요',
    icon: '��',
  },
] as const;

// 적금 상품 데이터 (MyScreen에서 사용)
export const SAVINGS_PRODUCTS = [
  {
    id: 'earth_savings',
    name: '지구사랑 적금',
    accountNumber: '506-910483-06021',
    balance: 10000,
    currency: '원',
    startDate: '2025-01-11',
    maturityDate: '2026-01-11',
    baseRate: 1.8,
    preferentialRate: 2.5,
    finalRate: 4.3,
    features: {
      periodMonths: 12,
      minJoin: 10000,
      maxJoin: 300000,
      depositType: '자유적립식',
      interestPayment: '만기일시지급식',
    },
    donation: {
      description: '만기 이자를 환경보호단체에 전부 또는 일부 후원',
      organizations: ['환경운동연합 (KFEM)', '그린피스 코리아', '산림청 나무심기 프로젝트', '한국환경보전협회'],
      options: ['이자 전액', '이자의 50%', '이자의 10%'],
    },
    rateNoticeDate: '2025-08-06',
  },
];

export const RECOMMENDED_SAVINGS = [
  {
    id: 'green_world_savings',
    name: '하나green세상 적금',
    tagline:
      '환경을 지키는 마음을 담아, 환경 실천 활동과 그린라이프 카드 사용 실적으로 우대금리를 제공하는 하나원큐 전용 상품',
    rate: {
      base: 2.0,
      max: 7.0,
      noticeDate: '2025-08-05',
    },
    target: '만 14세 이상 개인 또는 개인사업자 (1인 1계좌)',
    amountMin: 10000,
    amountMax: 500000,
    periodNotice: '가입자별 상이 [가입일 ~ 2026.12.31(일)]',
    maturityDate: '2026-12-31',
  },
];

// 기존 하드코딩된 데이터는 productApi.ts의 API 호출로 대체됨
// 이 상수들은 API 호출이 실패할 경우를 위한 fallback 데이터로 사용
export const FALLBACK_SAVINGS_PRODUCTS = [
  {
  id: 'earth_savings',
  name: '지구사랑 적금',
  accountNumber: '506-910483-06021',
  balance: 10000,
  currency: '원',
  startDate: '2025-01-11',
  maturityDate: '2026-01-11',
  baseRate: 1.8,
  preferentialRate: 2.5,
  finalRate: 4.3,
  features: {
    periodMonths: 12,
    minJoin: 10000,
    maxJoin: 300000,
    depositType: '자유적립식',
    interestPayment: '만기일시지급식',
  },
  donation: {
    description: '만기 이자를 환경보호단체에 전부 또는 일부 후원',
    organizations: ['환경운동연합 (KFEM)', '그린피스 코리아', '산림청 나무심기 프로젝트', '한국환경보전협회'],
    options: ['이자 전액', '이자의 50%', '이자의 10%'],
  },
  rateNoticeDate: '2025-08-06',
  },
];

export const FALLBACK_RECOMMENDED_SAVINGS = [
  {
    id: 'green_world_savings',
    name: '하나green세상 적금',
    tagline:
      '환경을 지키는 마음을 담아, 환경 실천 활동과 그린라이프 카드 사용 실적으로 우대금리를 제공하는 하나원큐 전용 상품',
    rate: {
      base: 2.0,
      max: 7.0,
      noticeDate: '2025-08-05',
    },
    target: '만 14세 이상 개인 또는 개인사업자 (1인 1계좌)',
    amountMin: 10000,
    amountMax: 500000,
    periodNotice: '가입자별 상이 [가입일 ~ 2026.12.31(일)]',
    maturityDate: '2026-12-31',
  },
];

// 카카오 지도 API 설정
export const KAKAO_MAP_API_KEY = ENV_KAKAO_MAP_API_KEY;

// 카카오지도 API 키 검증 함수
export const isKakaoMapApiKeyValid = (): boolean => {
  const apiKey = KAKAO_MAP_API_KEY;
  return Boolean(apiKey && 
         apiKey !== 'YOUR_KAKAO_MAP_API_KEY_HERE' && 
         apiKey !== 'undefined' && 
         apiKey.length > 10);
};

// API 설정 - 플랫폼별 최적화
export const API_BASE_URL = (() => {
  if (Platform.OS === 'android') {
    // 안드로이드 에뮬레이터는 10.0.2.2를 사용 (호스트 머신의 localhost)
    // 하나그린세상 서버 (로그인, 챌린지 등)
    return 'http://10.0.2.2:8080';
  }
  
  if (Platform.OS === 'ios') {
    // iOS 에뮬레이터는 localhost 사용
    return 'http://localhost:8080';
  }
  
  // 웹 환경
  return 'http://localhost:8080';
})();

// 하나카드 서버는 백엔드에서만 접근
// 프론트엔드는 하나그린세상 서버(API_BASE_URL)를 통해서만 데이터 접근
// CARD_API_BASE_URL 제거 - 잘못된 아키텍처

// 개발 중 확인용 로그
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('API_BASE_URL =', API_BASE_URL);
}

// 카드 이미지 매핑 함수
export const getCardImageSource = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return require('../../assets/hana_greenlife_card.png');
  }

  // 이미지 파일명 매핑
  const imageMap: { [key: string]: any } = {
    'hana_greenlife_card.png': require('../../assets/hana_greenlife_card.png'),
    'hana_card.png': require('../../assets/hana_card.png'),
    'hana_green_card.png': require('../../assets/hana_green_card.png'),
    'hana_1q_card.png': require('../../assets/hana_1q_card.png'),
  };

  return imageMap[imageUrl] || require('../../assets/hana_greenlife_card.png');
};

// 친환경 가맹점 아이콘 매핑 함수
export const getEcoMerchantIconSource = (iconName?: string | null) => {
  if (!iconName) {
    return require('../../assets/hana3dIcon/hanaIcon3d_85.png'); // 기본 친환경 아이콘
  }

  // 친환경 가맹점 아이콘 매핑 (hana3dIcon 폴더의 아이콘 사용)
  const ecoIconMap: { [key: string]: any } = {
    'eco-store.png': require('../../assets/hana3dIcon/hanaIcon3d_85.png'), // 친환경 매장
    'ev-charging.png': require('../../assets/hana3dIcon/charging_station.png'), // 전기차 충전
    'zero-waste.png': require('../../assets/hana3dIcon/zero_waste.png'), // 제로웨이스트
    'green-beauty.png': require('../../assets/hana3dIcon/hanaIcon3d_103.png'), // 친환경 뷰티
    'eco-shopping.png': require('../../assets/hana3dIcon/hanaIcon3d_107.png'), // 친환경 쇼핑
    'organic-cafe.png': require('../../assets/hana3dIcon/hanaIcon3d_4_89.png'), // 유기농 카페
    'eco-default.png': require('../../assets/hana3dIcon/hanaIcon3d_85.png'), // 기본 친환경 아이콘
  };

  return ecoIconMap[iconName] || require('../../assets/hana3dIcon/hanaIcon3d_85.png');
};