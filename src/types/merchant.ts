export interface EcoMerchant {
  id: number;
  name: string;
  category: string;
  categoryDisplayName: string;
  categoryImageUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  businessHours?: string;
  isVerified: boolean;
  distance?: number; // km 단위
  description?: string;
  websiteUrl?: string;
  ecoCertifications?: string;
  ecoPractices?: string;
}

export interface LocationSearchRequest {
  latitude: number;
  longitude: number;
  radius?: number; // km 단위, 기본값 10
  category?: string;
  searchKeyword?: string;
  verifiedOnly?: boolean;
}

export interface MerchantCategory {
  name: string;
  displayName: string;
  imageUrl: any; // require() returns number in React Native
}

export const MERCHANT_CATEGORIES: Record<string, MerchantCategory> = {
  ECO_FOOD: {
    name: 'ECO_FOOD',
    displayName: '친환경 식품/매장',
    imageUrl: require('../../assets/hana3dIcon/hanaIcon3d_105.png')
  },
  EV_CHARGING: {
    name: 'EV_CHARGING',
    displayName: '전기차 충전',
    imageUrl: require('../../assets/hana3dIcon/hanaIcon3d_29.png')
  },
  RECYCLING_STORE: {
    name: 'RECYCLING_STORE',
    displayName: '재활용/제로웨이스트',
    imageUrl: require('../../assets/hana3dIcon/zero_waste.png')
  },
  GREEN_BEAUTY: {
    name: 'GREEN_BEAUTY',
    displayName: '친환경 뷰티',
    imageUrl: require('../../assets/hana3dIcon/hanaIcon3d_4_119.png')
  },
  ECO_SHOPPING: {
    name: 'ECO_SHOPPING',
    displayName: '친환경 쇼핑',
    imageUrl: require('../../assets/hana3dIcon/hanaIcon3d_107.png')
  },
  ORGANIC_CAFE: {
    name: 'ORGANIC_CAFE',
    displayName: '유기농 카페',
    imageUrl: require('../../assets/hana3dIcon/hanaIcon3d_4_89.png')
  }
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  ECO_FOOD: '🥗',
  EV_CHARGING: '⚡️',
  RECYCLING_STORE: '♻️',
  GREEN_BEAUTY: '🌿',
  ECO_SHOPPING: '🛍️',
  ORGANIC_CAFE: '☕'
};

