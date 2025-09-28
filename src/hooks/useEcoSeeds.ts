import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { 
  fetchEcoSeedInfo, 
  earnEcoSeeds, 
  earnFromChallenge,
  convertToHanaMoney,
  fetchTransactionHistory,
  fetchTransactionHistoryByCategory,
  EcoSeedEarnRequest,
  EcoSeedConvertRequest
} from '../utils/ecoSeedApi';
import { EcoSeedResponse, EcoSeedTransactionResponse } from '../types/ecoSeed';
import { isLoggedIn } from '../utils/authUtils';

export const useEcoSeeds = () => {
  const [ecoSeedInfo, setEcoSeedInfo] = useState<EcoSeedResponse>({
    totalSeeds: 0,
    currentSeeds: 0,
    usedSeeds: 0,
    convertedSeeds: 0,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 원큐씨앗 정보 조회
  const getEcoSeedInfo = useCallback(async () => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        console.log('로그인이 필요합니다. API 호출을 건너뜁니다.');
        return;
      }

      setLoading(true);
      setError(null);
      const data = await fetchEcoSeedInfo();
      setEcoSeedInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '원큐씨앗 정보 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 원큐씨앗 적립
  const earnSeeds = useCallback(async (request: EcoSeedEarnRequest) => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);
      const data = await earnEcoSeeds(request);
      setEcoSeedInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '원큐씨앗 적립에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);



  // 퀴즈 적립은 서버 제출(attempt)에서 처리하므로 별도 호출 제거

  // 챌린지로 원큐씨앗 적립
  const earnFromChallengeActivity = useCallback(async (challengeName: string) => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);
      const data = await earnFromChallenge(challengeName);
      setEcoSeedInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '챌린지 원큐씨앗 적립에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 하나머니로 전환
  const convertSeedsToHanaMoney = useCallback(async (request: EcoSeedConvertRequest) => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);
      const data = await convertToHanaMoney(request);
      setEcoSeedInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '하나머니 전환에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 거래 내역 조회
  const getTransactionHistory = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);
      const data = await fetchTransactionHistory(page, size);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '거래 내역 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 카테고리별 거래 내역 조회
  const getTransactionHistoryByCategory = useCallback(async (category: string) => {
    try {
      // 로그인 상태 확인
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);
      const data = await fetchTransactionHistoryByCategory(category);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '카테고리별 거래 내역 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 프로필 새로고침
  const refreshProfile = useCallback(async () => {
    try {
      await getEcoSeedInfo();
    } catch (err) {
      console.error('프로필 새로고침 실패:', err);
    }
  }, [getEcoSeedInfo]);

  // 컴포넌트 마운트 시 로그인 상태 확인 후 원큐씨앗 정보 조회
  useEffect(() => {
    const checkLoginAndFetch = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        getEcoSeedInfo();
      } else {
        console.log('로그인되지 않음. eco-seeds API 호출을 건너뜁니다.');
      }
    };
    
    checkLoginAndFetch();
  }, [getEcoSeedInfo]);

  // 앱이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleAppStateChange = () => {
      const checkLoginAndFetch = async () => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          getEcoSeedInfo();
        }
      };
      
      checkLoginAndFetch();
    };

    // 앱이 포커스될 때마다 실행
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        handleAppStateChange();
      }
    });

    return () => subscription?.remove();
  }, [getEcoSeedInfo]);

  return {
    ecoSeedInfo,
    loading,
    error,
    getEcoSeedInfo,
    earnSeeds,
    earnFromChallengeActivity,
    convertSeedsToHanaMoney,
    getTransactionHistory,
    getTransactionHistoryByCategory,
    clearError,
    refreshProfile
  };
};
