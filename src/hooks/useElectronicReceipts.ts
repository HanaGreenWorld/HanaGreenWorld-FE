import { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/authUtils';
import { API_BASE_URL } from '../utils/constants';

export interface ElectronicReceiptRecord {
  recordId: number;
  transactionId: string;
  transactionType: string;
  transactionAmount: number;
  branchName: string;
  receiptDate: string;
  pointsEarned: number;
  createdAt: string;
}

export interface ElectronicReceiptStats {
  totalCount: number;
  totalPoints: number;
}

export function useElectronicReceipts() {
  const [records, setRecords] = useState<ElectronicReceiptRecord[]>([]);
  const [stats, setStats] = useState<ElectronicReceiptStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchElectronicReceipts = async () => {
    try {
      console.log('🔍 전자확인증 데이터 조회 시작');
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      console.log('🔑 토큰 확인:', token ? '토큰 존재' : '토큰 없음');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const url = `${API_BASE_URL}/api/electronic-receipts/all`;
      console.log('🌐 API 호출 시작:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 응답 상태:', response.status);
      console.log('📡 응답 헤더:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ 응답 에러 내용:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 응답 데이터:', data);
      
      if (data.success) {
        console.log('✅ 데이터 조회 성공, 레코드 수:', data.data?.length || 0);
        setRecords(data.data);
      } else {
        console.log('❌ API 응답 실패:', data.message);
        throw new Error(data.message || '전자확인증 데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 전자확인증 데이터 조회 실패:', err);
      setError(err instanceof Error ? err.message : '전자확인증 데이터를 가져오는데 실패했습니다.');
    } finally {
      console.log('🏁 전자확인증 데이터 조회 완료');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('전자확인증 통계 조회 시작');
      const token = await getAuthToken();
      console.log('통계용 토큰 확인:', token ? '토큰 존재' : '토큰 없음');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const url = `${API_BASE_URL}/api/electronic-receipts/stats`;
      console.log('통계 API 호출 시작:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('통계 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('통계 응답 에러 내용:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('통계 응답 데이터:', data);
      
      if (data.success) {
        console.log('통계 조회 성공:', data.data);
        setStats(data.data);
      } else {
        console.log('통계 API 응답 실패:', data.message);
        throw new Error(data.message || '전자확인증 통계를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('전자확인증 통계 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchElectronicReceipts();
    fetchStats();
  }, []);

  return {
    records,
    stats,
    loading,
    error,
    refetch: fetchElectronicReceipts,
  };
}
