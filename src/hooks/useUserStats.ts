import { useState, useEffect, useCallback } from 'react';
import { fetchUserStats } from '../utils/ecoSeedApi';
import { isLoggedIn } from '../utils/authUtils';
import { UserStats } from '../types';

export const useUserStats = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
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
      const data = await fetchUserStats();
      setUserStats(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 통계 조회에 실패했습니다.';
      setError(errorMessage);
      console.error('사용자 통계 조회 실패:', err);
      
      // 기본값 설정
      setUserStats({
        totalPoints: 0,
        totalCarbonSaved: 0,
        totalActivities: 0,
        monthlyPoints: 0,
        monthlyCarbonSaved: 0,
        monthlyActivities: 0,
        currentLevel: {
          id: 'beginner',
          name: '친환경 새내기',
          description: '환경 보호의 첫 걸음을 내딛는 단계',
          requiredPoints: 0,
          icon: '🌱',
          color: '#10B981'
        },
        nextLevel: {
          id: 'intermediate',
          name: '친환경 실천가',
          description: '환경 보호를 실천하는 단계',
          requiredPoints: 1000,
          icon: '🌿',
          color: '#059669'
        },
        progressToNextLevel: 0,
        pointsToNextLevel: 1000
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