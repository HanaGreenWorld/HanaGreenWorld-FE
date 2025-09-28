import { useState, useEffect } from 'react';
import { PointsHookReturn } from '../types';
import { fetchMemberProfile } from '../utils/ecoSeedApi';

export function usePoints(): PointsHookReturn {
  const [points, setPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [hanaMoney, setHanaMoney] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await fetchMemberProfile();
      setPoints(profile.currentPoints);
      setTodayPoints(profile.currentMonthPoints);
      setHanaMoney(profile.hanaMoney);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch member profile:', err);
      setError('프로필 정보를 불러오는데 실패했습니다.');
      // 기본값 설정
      setPoints(0);
      setTodayPoints(0);
      setHanaMoney(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const addPoints = async (newPoints: number) => {
    // 포인트 추가 후 프로필을 다시 불러와서 실제 DB 값과 동기화
    await fetchProfile();
  };

  const usePoints = async (usedPoints: number) => {
    if (points >= usedPoints) {
      // 포인트 사용 후 프로필을 다시 불러와서 실제 DB 값과 동기화
      await fetchProfile();
      return true;
    }
    return false;
  };

  const refreshProfile = () => {
    fetchProfile();
  };

  return {
    points,
    todayPoints,
    hanaMoney,
    loading,
    error,
    addPoints,
    usePoints,
    refreshProfile,
  };
} 