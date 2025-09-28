import { useState, useEffect } from 'react';
import { fetchCurrentUser } from '../utils/ecoSeedApi';

export interface UserInfo {
  id: number;
  loginId: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      console.log('🔍 useUser에서 가져온 사용자 정보:', user);
      setUserInfo(user);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = () => {
    fetchUser();
  };

  return {
    userInfo,
    loading,
    error,
    refreshUser,
  };
}
