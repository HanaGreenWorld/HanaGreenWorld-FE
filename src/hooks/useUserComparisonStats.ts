import { useState, useEffect, useCallback } from 'react';
import { fetchUserComparisonStats } from '../utils/ecoSeedApi';
import { isLoggedIn } from '../utils/authUtils';

export interface UserComparisonStatsData {
  registrationDate: string;
  practiceDays: number;
  averageComparison: number;
  monthlyGrowthRate: number;
  comparisonDescription: string;
  userRanking: number;
  totalUsers: number;
}

export const useUserComparisonStats = () => {
  const [userStats, setUserStats] = useState<UserComparisonStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserStats = useCallback(async () => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        console.log('로그인이 필요합니다. API 호출을 건너뜁니다.');
        return;
      }

      setLoading(true);
      setError(null);
      const data = await fetchUserComparisonStats();
      setUserStats(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 비교 통계 조회에 실패했습니다.';
      setError(errorMessage);
      console.error('사용자 비교 통계 조회 실패:', err);
      
      // 기본값 설정
      setUserStats({
        registrationDate: '2024-01-15',
        practiceDays: 300,
        averageComparison: 25.0,
        monthlyGrowthRate: 12.0,
        comparisonDescription: '상위 30% 사용자',
        userRanking: 30,
        totalUsers: 1000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUserStats();
  }, [getUserStats]);

  return {
    userStats,
    loading,
    error,
    refetch: getUserStats
  };
};
