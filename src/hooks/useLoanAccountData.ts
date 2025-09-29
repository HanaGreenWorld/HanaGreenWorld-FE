import { useState, useEffect, useCallback } from 'react';
import { integrationApi } from '../services/integrationApi';

export const useLoanAccountData = (userId: number) => {
  const [loanAccounts, setLoanAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLoanAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💰 대출 계좌 조회 시작:', userId);
      
      // 통합 API를 통해 은행 계좌 정보 조회
      const bankAccounts = await integrationApi.getBankAccounts(userId);
      console.log('💰 은행 계좌 응답:', bankAccounts);
      
      // 대출 계좌만 필터링
      const loanData = bankAccounts.loanAccounts || [];
      setLoanAccounts(loanData);
      
      console.log('✅ 대출 계좌 조회 성공:', loanData);
    } catch (err) {
      console.error('❌ 대출 계좌 조회 실패:', err);
      
      // API 실패 시 빈 배열 반환 (하드코딩된 데이터 제거)
      setLoanAccounts([]);
      setError('대출 계좌 정보를 불러올 수 없습니다');
      console.log('❌ 대출 데이터 없음');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId > 0) {
      getLoanAccounts();
    }
  }, [getLoanAccounts]);

  return { loanAccounts, loading, error, getLoanAccounts };
};
