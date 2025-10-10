import { getCurrentUserIdFromToken } from './jwtUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './constants';

// EcoReport 관련 타입 정의
export interface EcoReport {
  reportId: number;
  reportMonth: string;
  summary: {
    currentLevel: string;
    levelProgress: number;
    pointsToNextLevel: number;
    topActivity: string;
    topActivityMessage: string;
  };
  statistics: {
    totalSeeds: number;
    totalActivities: number;
    totalCarbonKg: number;
  };
  activities: Activity[];
  financialBenefit: {
    savingsInterest: number;
    cardDiscount: number;
    loanBenefit: number;
    total: number;
    nextLevelBenefit?: number;
  };
  ranking: {
    percentile: number;
    totalUsers: number;
    rank: number;
    userPoints?: number;
    averagePoints?: number;
  };
  environmentalImpact: {
    carbonKg: number;
    trees: number;
    waterLiters: number;
    plasticBags: number;
    energyKwh?: number;
    carKm?: number;
  };
  recommendations: Recommendation[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  label: string;
  count: number;
  points: number;
  countPercentage: number;
  pointsPercentage: number;
  color: string;
}

export interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description?: string;
  benefit?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * 사용자의 모든 친환경 리포트 조회
 */
export const fetchEcoReports = async (): Promise<EcoReport[]> => {
  try {
    const userId = await getCurrentUserIdFromToken();
    if (!userId) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/eco-reports?memberId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<EcoReport[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '리포트 조회에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('리포트 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 월의 친환경 리포트 조회
 */
export const fetchEcoReportByMonth = async (reportMonth: string): Promise<EcoReport> => {
  try {
    const userId = await getCurrentUserIdFromToken();
    if (!userId) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/eco-reports/${reportMonth}?memberId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('해당 월의 리포트를 찾을 수 없습니다.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<EcoReport> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '리포트 조회에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('특정 월 리포트 조회 실패:', error);
    throw error;
  }
};

/**
 * 리포트 수동 생성 (개발/테스트용)
 */
export const generateEcoReport = async (reportMonth: string): Promise<EcoReport> => {
  try {
    const userId = await getCurrentUserIdFromToken();
    if (!userId) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/eco-reports/generate?memberId=${userId}&reportMonth=${reportMonth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<EcoReport> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '리포트 생성에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('리포트 생성 실패:', error);
    throw error;
  }
};

/**
 * 현재 월의 리포트 조회 (없으면 생성)
 */
export const fetchCurrentMonthReport = async (): Promise<EcoReport> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM 형식
    
    try {
      // 먼저 기존 리포트 조회 시도
      return await fetchEcoReportByMonth(currentMonth);
    } catch (error) {
      // 리포트가 없으면 생성
      console.log('기존 리포트가 없습니다. 새로 생성합니다.');
      return await generateEcoReport(currentMonth);
    }
  } catch (error) {
    console.error('현재 월 리포트 조회/생성 실패:', error);
    throw error;
  }
};

/**
 * 최근 N개월 리포트 조회
 */
export const fetchRecentReports = async (months: number = 6): Promise<EcoReport[]> => {
  try {
    const allReports = await fetchEcoReports();
    
    // 최신순으로 정렬하고 지정된 개수만 반환
    return allReports
      .sort((a, b) => b.reportMonth.localeCompare(a.reportMonth))
      .slice(0, months);
  } catch (error) {
    console.error('최근 리포트 조회 실패:', error);
    throw error;
  }
};

/**
 * 리포트 통계 요약 조회
 */
export const fetchReportSummary = async (): Promise<{
  totalReports: number;
  totalSeeds: number;
  totalCarbonKg: number;
  averageMonthlySeeds: number;
  averageMonthlyCarbon: number;
  bestMonth: string;
  bestMonthSeeds: number;
}> => {
  try {
    const reports = await fetchEcoReports();
    
    if (reports.length === 0) {
      return {
        totalReports: 0,
        totalSeeds: 0,
        totalCarbonKg: 0,
        averageMonthlySeeds: 0,
        averageMonthlyCarbon: 0,
        bestMonth: '',
        bestMonthSeeds: 0,
      };
    }

    const totalSeeds = reports.reduce((sum, report) => sum + report.statistics.totalSeeds, 0);
    const totalCarbonKg = reports.reduce((sum, report) => sum + report.statistics.totalCarbonKg, 0);
    const averageMonthlySeeds = totalSeeds / reports.length;
    const averageMonthlyCarbon = totalCarbonKg / reports.length;
    
    const bestMonthReport = reports.reduce((best, current) => 
      current.statistics.totalSeeds > best.statistics.totalSeeds ? current : best
    );

    return {
      totalReports: reports.length,
      totalSeeds,
      totalCarbonKg,
      averageMonthlySeeds,
      averageMonthlyCarbon,
      bestMonth: bestMonthReport.reportMonth,
      bestMonthSeeds: bestMonthReport.statistics.totalSeeds,
    };
  } catch (error) {
    console.error('리포트 요약 조회 실패:', error);
    throw error;
  }
};

/**
 * 활동별 통계 조회
 */
export const fetchActivityStats = async (): Promise<{
  totalActivities: number;
  activityBreakdown: { [key: string]: { count: number; points: number; percentage: number } };
  topActivity: string;
  topActivityCount: number;
}> => {
  try {
    const reports = await fetchEcoReports();
    
    if (reports.length === 0) {
      return {
        totalActivities: 0,
        activityBreakdown: {},
        topActivity: '',
        topActivityCount: 0,
      };
    }

    const activityBreakdown: { [key: string]: { count: number; points: number; percentage: number } } = {};
    let totalActivities = 0;
    let totalPoints = 0;

    // 모든 리포트의 활동 데이터 집계
    reports.forEach(report => {
      report.activities.forEach(activity => {
        if (!activityBreakdown[activity.label]) {
          activityBreakdown[activity.label] = { count: 0, points: 0, percentage: 0 };
        }
        activityBreakdown[activity.label].count += activity.count;
        activityBreakdown[activity.label].points += activity.points;
        totalActivities += activity.count;
        totalPoints += activity.points;
      });
    });

    // 비율 계산
    Object.keys(activityBreakdown).forEach(label => {
      activityBreakdown[label].percentage = Math.round(
        (activityBreakdown[label].count / totalActivities) * 100
      );
    });

    // 가장 많이 한 활동 찾기
    const topActivity = Object.keys(activityBreakdown).reduce((a, b) => 
      activityBreakdown[a].count > activityBreakdown[b].count ? a : b
    );

    return {
      totalActivities,
      activityBreakdown,
      topActivity,
      topActivityCount: activityBreakdown[topActivity]?.count || 0,
    };
  } catch (error) {
    console.error('활동 통계 조회 실패:', error);
    throw error;
  }
};
