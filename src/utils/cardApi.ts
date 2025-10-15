import { API_BASE_URL } from './constants';
import { getAuthToken } from './authUtils';

// 하나그린세상 통합 API URL 설정 (모든 카드 관련 API는 하나그린세상 서버를 통해)
const getIntegratedApiUrl = () => {
  return `${API_BASE_URL}/api/integration/cards`;
};

export interface UserCardResponse {
  id: number;
  userId: number;
  userName: string;
  cardId: number;
  cardName: string;
  cardType: string;
  cardNumber: string;
  cardNumberMasked: string;
  cardImageUrl?: string;
  expiryDate: string;
  creditLimit: number;
  currentBenefitType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardTransactionResponse {
  id: number;
  transactionDate: string;
  merchantName: string;
  category: string;
  amount: number;
  cashbackAmount: number;
  cashbackRate: number;
  description: string;
  tags: string;
}

export interface CardBenefitResponse {
  id: number;
  benefitType: string;
  category: string;
  description: string;
  cashbackRate: number;
  discountRate?: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 개별 카드 상세 정보
export interface CardDetail {
  cardNumber: string;
  cardName: string;
  cardType: string;
  cardStatus: string;
  creditLimit: number;
  availableLimit: number;
  monthlyUsage: number;
  cardImageUrl: string;
  issueDate: string;
  expiryDate: string;
  benefits: string[];
}

// 통합 카드 정보 응답 인터페이스
export interface CardIntegratedInfoResponse {
  cardList: {
    totalCards: number;
    totalCreditLimit: number;
    usedAmount: number;
    availableLimit: number;
    primaryCardName: string;
    primaryCardType: string;
    cards: CardDetail[]; // 실제 카드 목록 추가 💳
  };
  transactions: CardTransactionResponse[];
  consumptionSummary: {
    totalAmount: number;
    totalCashback: number;
    categoryAmounts: Record<string, number>;
  };
  ecoBenefits: {
    totalEcoAmount: number;
    totalEcoCashback: number;
    ecoCategories: Record<string, number>;
    ecoScore: number;
    monthlyGoal: number;
    achievementRate: number;
  };
}

export interface EcoConsumptionAnalysis {
  totalAmount: number;
  totalCashback: number;
  ecoAmount: number;
  ecoCashback: number;
  ecoRatio: number;
  categoryAmounts: { [key: string]: number };
  ecoCategoryAmounts: { [key: string]: number };
}

export interface CardConsumptionSummaryResponse {
  totalAmount: number;
  totalCashback: number;
  categoryAmounts: { [key: string]: number };
  recentTransactions: CardTransactionResponse[];
}

export interface CardBenefitResponse {
  id: number;
  cardId: number;
  category: string;
  benefitType: string;
  cashbackRate: number;
  discountRate?: number;
  description: string;
  isActive: boolean;
}

// 사용자 카드 조회 (하나그린세상 서버 통합 API 사용)
export const fetchUserCards = async (userId: number): Promise<UserCardResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${getIntegratedApiUrl()}/${userId}/cards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('사용자 카드 조회 실패:', error);
    throw error;
  }
};

// 카드 거래내역 조회 (하나그린세상 서버 통합 API 사용)
export const fetchCardTransactions = async (userId: number): Promise<CardTransactionResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/integration/cards/${userId}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('카드 거래내역 조회 실패:', error);
    throw error;
  }
};

// 월간 소비현황 요약 조회 (하나그린세상 서버 통합 API 사용)
export const fetchMonthlyConsumptionSummary = async (userId: number): Promise<CardConsumptionSummaryResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/integration/cards/${userId}/consumption/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || {
      totalAmount: 0,
      totalCashback: 0,
      categoryAmounts: {},
      recentTransactions: []
    };
  } catch (error) {
    console.error('월간 소비현황 조회 실패:', error);
    throw error;
  }
};

// 카테고리별 거래내역 조회 (하나그린세상 서버 통합 API 사용)
export const fetchTransactionsByCategory = async (userId: number, category: string): Promise<CardTransactionResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/integration/cards/${userId}/transactions/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('카테고리별 거래내역 조회 실패:', error);
    throw error;
  }
};

// 카드 혜택 조회 (하나그린세상 서버 통합 API 사용)
// export const fetchCardBenefits = async (cardId: number): Promise<CardBenefitResponse[]> => {
//   try {
//     // cardId가 유효하지 않으면 빈 배열 반환
//     if (!cardId || cardId === undefined || cardId === null) {
//       return [];
//     }
    
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('로그인이 필요합니다.');
//     }
    
//     const response = await fetch(`${getIntegratedApiUrl()}/cards/${cardId}/benefits`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('카드 혜택 조회 실패:', error);
//     throw error;
//   }
// };

// 카드 혜택 변경 (하나그린세상 서버 통합 API 사용)
// export const changeCardBenefit = async (userId: number, cardNumber: string, benefitType: string): Promise<UserCardResponse> => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('로그인이 필요합니다.');
//     }

//     const response = await fetch(`${getIntegratedApiUrl()}/${userId}/benefit?cardNumber=${encodeURIComponent(cardNumber)}&benefitType=${encodeURIComponent(benefitType)}`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error('카드 혜택 변경 실패:', error);
//     throw error;
//   }
// };

// 사용자 카드 혜택 조회 (하나그린세상 서버 통합 API 사용)
// export const fetchUserCardBenefits = async (userId: number): Promise<CardBenefitResponse[]> => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('로그인이 필요합니다.');
//     }

//     const response = await fetch(`${getIntegratedApiUrl()}/${userId}/benefits`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('사용자 카드 혜택 조회 실패:', error);
//     throw error;
//   }
// };

// 친환경 소비현황 분석 (하나그린세상 서버에서 조회)
export const fetchEcoConsumptionAnalysis = async (userId: number): Promise<EcoConsumptionAnalysis> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/eco-consumption/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('친환경 소비현황 분석 실패:', error);
    throw error;
  }
};

// 친환경 가맹점 혜택 조회 (하나그린세상 서버 통합 API 사용)
export const fetchEcoBenefits = async (userId: number): Promise<any> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${getIntegratedApiUrl().replace('/integration/cards', '')}/eco-consumption/${userId}/benefits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('친환경 가맹점 혜택 조회 실패:', error);
    throw error;
  }
};

// // 카드 혜택 패키지 조회 (하나그린세상 서버 통합 API 사용)
// export const fetchCardBenefitPackages = async (userId: number): Promise<any> => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('로그인이 필요합니다.');
//     }

//     const response = await fetch(`${getIntegratedApiUrl()}/${userId}/benefit-packages`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error('카드 혜택 패키지 조회 실패:', error);
//     throw error;
//   }
// };

// 혜택 패키지 변경 (하나그린세상 서버 통합 API 사용)
// export const updateUserBenefitPackage = async (userId: number, packageName: string): Promise<any> => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('로그인이 필요합니다.');
//     }

//     const response = await fetch(`${getIntegratedApiUrl()}/${userId}/benefit-packages`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ packageName }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error('혜택 패키지 변경 실패:', error);
//     throw error;
//   }
// };

// 태그별 거래내역 조회 (하나그린세상 서버 통합 API 사용)
export const fetchTransactionsByTag = async (userId: number, tag: string): Promise<CardTransactionResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${getIntegratedApiUrl()}/${userId}/transactions/tag/${encodeURIComponent(tag)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('태그별 거래내역 조회 실패:', error);
    throw error;
  }
};

// AI 기반 혜택 추천
// export const fetchBenefitRecommendation = async (userId: number): Promise<any> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/benefit-recommendation/users/${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error('혜택 추천 조회 실패:', error);
//     throw error;
//   }
// };

// 혜택 추천 상세 분석
// export const fetchRecommendationAnalysis = async (userId: number, packageCode?: string): Promise<any> => {
//   try {
//     const url = packageCode 
//       ? `${API_BASE_URL}/api/benefit-recommendation/users/${userId}/analysis?packageCode=${packageCode}`
//       : `${API_BASE_URL}/api/benefit-recommendation/users/${userId}/analysis`;
      
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error('혜택 추천 분석 실패:', error);
//     throw error;
//   }
// };

// 혜택 패키지 비교
// export const compareBenefitPackages = async (userId: number, packageCodes: string[]): Promise<any> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/benefit-recommendation/users/${userId}/compare`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ packageCodes }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error('혜택 패키지 비교 실패:', error);
//     throw error;
//   }
// };

export const fetchCardIntegratedInfo = async (memberId: number): Promise<CardIntegratedInfoResponse> => {
  try {
    
    const token = await getAuthToken();
    const response = await fetch(`${getIntegratedApiUrl()}/${memberId}/integrated`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Internal-Service': 'aGFuYS1pbnRlcm5hbC1zZXJ2aWNlLTIwMjQ='
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result.data;
  } catch (error) {
    console.error('카드 통합 정보 조회 실패:', error);
    throw error;
  }
};

