import { useState, useEffect } from 'react';
import { fetchUserStats } from '../utils/ecoSeedApi';
import { UserStats } from '../types';

export function useUserStats() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const stats = await fetchUserStats();
      setUserStats(stats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      setError('사용자 통계 정보를 불러오는데 실패했습니다.');
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
          description: '🌱 환경 보호 여정을 시작했어요!',
          requiredPoints: 0,
          icon: '🌱',
          color: '#10B981'
        },
        nextLevel: {
          id: 'intermediate',
          name: '친환경 실천가',
          description: '🌿 환경 보호를 실천하고 있어요!',
          requiredPoints: 20000,
          icon: '🌿',
          color: '#059669'
        },
        progressToNextLevel: 0,
        pointsToNextLevel: 20000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    userStats,
    loading,
    error,
    refreshStats,
  };
}
