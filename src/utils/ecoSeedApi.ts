import { EcoSeedResponse, EcoSeedTransactionResponse } from '../types/ecoSeed';
import { Quiz, QuizAttemptRequest, QuizAttemptResponse, QuizRecord } from '../types';
import { getAuthToken } from './authUtils';
import { API_BASE_URL } from './constants';

export interface EcoSeedEarnRequest {
  category: string;
  pointsAmount: number;
  description?: string;
}

export interface EcoSeedConvertRequest {
  pointsAmount: number;
}


/**
 * 원큐씨앗 정보 조회
 */
export const fetchEcoSeedInfo = async (): Promise<EcoSeedResponse> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/eco-seeds`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch eco seed info:', error);
    throw error;
  }
};

/**
 * 원큐씨앗 적립
 */
export const earnEcoSeeds = async (request: EcoSeedEarnRequest): Promise<EcoSeedResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/eco-seeds/earn`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to earn eco seeds:', error);
    throw error;
  }
};



/**
 * 퀴즈로 원큐씨앗 적립
 */
export const earnFromQuiz = async (quizType: string): Promise<EcoSeedResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/eco-seeds/quiz?quizType=${encodeURIComponent(quizType)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to earn eco seeds from quiz:', error);
    throw error;
  }
};

/**
 * 챌린지로 원큐씨앗 적립
 */
export const earnFromChallenge = async (challengeName: string): Promise<EcoSeedResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/eco-seeds/challenge?challengeName=${encodeURIComponent(challengeName)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to earn eco seeds from challenge:', error);
    throw error;
  }
};

/**
 * 하나머니로 전환
 */
export const convertToHanaMoney = async (request: EcoSeedConvertRequest): Promise<EcoSeedResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/eco-seeds/convert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to convert eco seeds:', error);
    throw error;
  }
};

/**
 * 거래 내역 조회
 */
export const fetchTransactionHistory = async (page: number = 0, size: number = 20): Promise<{
  content: EcoSeedTransactionResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/eco-seeds/transactions?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    throw error;
  }
};

/**
 * 카테고리별 거래 내역 조회
 */
export const fetchTransactionHistoryByCategory = async (category: string): Promise<EcoSeedTransactionResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/eco-seeds/transactions/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch transaction history by category:', error);
    throw error;
  }
};

export const fetchMemberProfile = async (): Promise<{
  currentPoints: number;
  totalPoints: number;
  currentMonthPoints: number;
  hanaMoney: number;
}> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/eco-seeds/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch member profile:', error);
    throw error;
  }
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const fetchCurrentUser = async (): Promise<{
  id: number;
  loginId: string;
  email: string;
  name: string;
  role: string;
  status: string;
}> => {
  try {
    // JWT 토큰 가져오기
    const token = await getAuthToken();
    console.log('🔍 fetchCurrentUser에서 사용하는 JWT 토큰:', token ? `${token.substring(0, 50)}...` : 'null');
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log('🔍 fetchCurrentUser 응답:', userData);
    return userData;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

/**
 * 사용자 통계 정보 조회 (레벨, 탄소 절약량 등)
 */
export const fetchUserStats = async (): Promise<{
  totalPoints: number;
  totalCarbonSaved: number;
  totalActivities: number;
  monthlyPoints: number;
  monthlyCarbonSaved: number;
  monthlyActivities: number;
  currentLevel: {
    id: string;
    name: string;
    description: string;
    requiredPoints: number;
    icon: string;
    color: string;
  };
  nextLevel: {
    id: string;
    name: string;
    description: string;
    requiredPoints: number;
    icon: string;
    color: string;
  };
  progressToNextLevel: number;
  pointsToNextLevel: number;
}> => {
  try {
    // JWT 토큰 가져오기
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    const response = await fetch(`${API_BASE_URL}/eco-seeds/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('User stats API error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    throw error;
  }
};
/**
 * 오늘의 퀴즈 조회
 */
export const fetchDailyQuiz = async (): Promise<Quiz> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/quiz/daily`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as Quiz;
  } catch (error) {
    console.error('Failed to fetch daily quiz:', error);
    throw error;
  }
};

/**
 * 퀴즈 답변 제출
 */
export const submitQuizAnswer = async (quizId: number, request: QuizAttemptRequest): Promise<QuizAttemptResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/attempt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as QuizAttemptResponse;
  } catch (error) {
    console.error('Failed to submit quiz answer:', error);
    throw error;
  }
};

/**
 * 오늘의 퀴즈 결과 조회
 */
export const fetchTodayQuizResult = async (): Promise<QuizRecord> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/quiz/daily/result`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 400) {
      // 오늘 아직 퀴즈를 참여하지 않음(QUIZ_NOT_ATTEMPTED). 호출 측에서 null 처리.
      return null as unknown as QuizRecord;
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as QuizRecord;
  } catch (error) {
    console.error('Failed to fetch today quiz result:', error);
    throw error;
  }
};

/**
 * 퀴즈 참여 이력 조회
 */
export const fetchQuizHistory = async (): Promise<QuizRecord[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/quiz/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as QuizRecord[];
  } catch (error) {
    console.error('Failed to fetch quiz history:', error);
    throw error;
  }
};

/**
 * 오늘 퀴즈 참여 여부 확인
 */
export const checkTodayQuizParticipation = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/quiz/daily/participation-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as boolean;
  } catch (error) {
    console.error('Failed to check today quiz participation:', error);
    return false; // 에러 시 기본값으로 false 반환
  }
};

// 걷기 관련 API 함수들
export interface WalkingConsentRequest {
  isConsented: boolean;
  dailyGoalSteps?: number;
}

export interface WalkingConsentResponse {
  isConsented: boolean;
  consentedAt: string | null;
  lastSyncAt: string | null;
  dailyGoalSteps: number;
  message: string;
}

export interface WalkingStepsRequest {
  steps: number;
  date?: string; // YYYY-MM-DD 형식
}

export interface WalkingResponse {
  walkingId?: number;
  steps?: number;
  distanceKm?: number;
  carbonSaved?: number;
  pointsAwarded?: number;
  activityDate?: string;
  message: string;
}

/**
 * 걷기 측정 동의 상태 조회
 */
export const fetchWalkingConsent = async (): Promise<WalkingConsentResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/walking/consent`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as WalkingConsentResponse;
  } catch (error) {
    console.error('Failed to fetch walking consent:', error);
    throw error;
  }
};

/**
 * 걷기 측정 동의 상태 업데이트
 */
export const updateWalkingConsent = async (request: WalkingConsentRequest): Promise<WalkingConsentResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/walking/consent`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as WalkingConsentResponse;
  } catch (error) {
    console.error('Failed to update walking consent:', error);
    throw error;
  }
};

/**
 * 걸음수 제출
 */
export const submitWalkingSteps = async (request: WalkingStepsRequest): Promise<WalkingResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/walking/steps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as WalkingResponse;
  } catch (error) {
    console.error('Failed to submit walking steps:', error);
    throw error;
  }
};

/**
 * 오늘의 걷기 기록 조회
 */
export const fetchTodayWalkingRecord = async (): Promise<WalkingResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/walking/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as WalkingResponse;
  } catch (error) {
    console.error('Failed to fetch today walking record:', error);
    throw error;
  }
};

/**
 * 연속 걷기 일수 조회
 */
export const fetchWalkingStreak = async (): Promise<number> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/walking/streak`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as number;
  } catch (error) {
    console.error('Failed to fetch walking streak:', error);
    throw error;
  }
};

/**
 * 환경 임팩트 정보 조회
 */
export const fetchEnvironmentalImpact = async (): Promise<{
  totalCarbonSaved: number;
  monthlyCarbonSaved: number;
  totalWaterSaved: number;
  monthlyWaterSaved: number;
  totalEnergySaved: number;
  monthlyEnergySaved: number;
  totalRecycled: number;
  monthlyRecycled: number;
  environmentalGrade: string;
  environmentalScore: number;
  impactLevel: string;
  impactDescription: string;
  impactIcon: string;
  impactColor: string;
  categoryImpacts: Array<{
    category: string;
    carbonSaved: number;
    description: string;
    icon: string;
  }>;
  impactTrends: Array<{
    date: string;
    carbonSaved: number;
    waterSaved: number;
    energySaved: number;
  }>;
  ranking: number;
  rankingDescription: string;
  achievements: string[];
  goals: {
    nextGrade: string;
    remainingCarbon: number;
    progressPercentage: number;
    description: string;
  };
  recommendations: string[];
  analysisDate: string;
}> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    // 현재 로그인한 사용자 ID 가져오기
    const { getCurrentUserIdFromToken } = await import('./jwtUtils');
    const userId = await getCurrentUserIdFromToken();
    if (!userId) {
      throw new Error('사용자 ID를 가져올 수 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/environmental-impact/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data;
  } catch (error) {
    console.error('Failed to fetch environmental impact:', error);
    throw error;
  }
};

/**
 * 월간 환경 임팩트 정보 조회
 */
export const fetchMonthlyEnvironmentalImpact = async (): Promise<{
  totalCarbonSaved: number;
  monthlyCarbonSaved: number;
  totalWaterSaved: number;
  monthlyWaterSaved: number;
  totalEnergySaved: number;
  monthlyEnergySaved: number;
  totalRecycled: number;
  monthlyRecycled: number;
  environmentalGrade: string;
  environmentalScore: number;
  impactLevel: string;
  impactDescription: string;
  impactIcon: string;
  impactColor: string;
  categoryImpacts: Array<{
    category: string;
    carbonSaved: number;
    description: string;
    icon: string;
  }>;
  impactTrends: Array<{
    date: string;
    carbonSaved: number;
    waterSaved: number;
    energySaved: number;
  }>;
  ranking: number;
  rankingDescription: string;
  achievements: string[];
  goals: {
    nextGrade: string;
    remainingCarbon: number;
    progressPercentage: number;
    description: string;
  };
  recommendations: string[];
  analysisDate: string;
}> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    // 현재 로그인한 사용자 ID 가져오기
    const { getCurrentUserIdFromToken } = await import('./jwtUtils');
    const userId = await getCurrentUserIdFromToken();
    if (!userId) {
      throw new Error('사용자 ID를 가져올 수 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/environmental-impact/${userId}/monthly`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data;
  } catch (error) {
    console.error('Failed to fetch monthly environmental impact:', error);
    throw error;
  }
};

/**
 * 최근 걷기 기록 조회 (최대 5개)
 */
export const fetchRecentWalkingRecords = async (): Promise<WalkingResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/walking/recent`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json?.data as WalkingResponse[];
  } catch (error) {
    console.error('Failed to fetch recent walking records:', error);
    throw error;
  }
};

/**
 * 사용자 비교 통계 정보 조회 (가입일, 평균 대비 비교 등)
 */
export const fetchUserComparisonStats = async (): Promise<{
  registrationDate: string;
  practiceDays: number;
  averageComparison: number;
  monthlyGrowthRate: number;
  comparisonDescription: string;
  userRanking: number;
  totalUsers: number;
}> => {
  try {
    const token = await getAuthToken();
    
    // 현재 로그인한 사용자 ID 가져오기
    const { getCurrentUserIdFromToken } = await import('./jwtUtils');
    const userId = await getCurrentUserIdFromToken();
    if (!userId) {
      throw new Error('사용자 ID를 가져올 수 없습니다.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/user-stats/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user comparison stats:', error);
    throw error;
  }
};
