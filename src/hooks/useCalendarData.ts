import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { getAuthToken } from '../utils/authUtils';

interface CalendarData {
  year: number;
  month: number;
  totalEarnings: number;
  dailyEarnings: Record<number, number>;
}

interface UseCalendarDataReturn {
  calendarData: CalendarData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCalendarData(year: number, month: number): UseCalendarDataReturn {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/eco-seeds/calendar?year=${year}&month=${month}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      console.error('달력 데이터 조회 실패:', err);
      setError(err instanceof Error ? err.message : '달력 데이터를 불러오는데 실패했습니다.');
      
      // 에러 시 기본값 설정
      setCalendarData({
        year,
        month,
        totalEarnings: 0,
        dailyEarnings: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // year와 month가 유효한 경우에만 API 호출
    if (year > 0 && month > 0) {
      fetchCalendarData();
    } else {
      // 로그인되지 않은 경우 기본값 설정
      setCalendarData({
        year: 0,
        month: 0,
        totalEarnings: 0,
        dailyEarnings: {},
      });
      setLoading(false);
    }
  }, [year, month]);

  const refetch = () => {
    fetchCalendarData();
  };

  return {
    calendarData,
    loading,
    error,
    refetch,
  };
}
