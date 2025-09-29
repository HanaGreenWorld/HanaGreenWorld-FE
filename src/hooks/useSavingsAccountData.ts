import { useState, useEffect, useCallback } from 'react';
import { integrationApi } from '../services/integrationApi';

export const useSavingsAccountData = (userId: number) => {
  const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSavingsAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏦 적금 계좌 조회 시작 (하나그린세상 통합 API):', userId);
      
      // 하나그린세상 통합 API를 통해 은행 계좌 정보 조회
      const bankAccounts = await integrationApi.getBankAccounts(userId);
      console.log('🏦 은행 계좌 전체 응답:', JSON.stringify(bankAccounts, null, 2));
      
      // 적금 계좌만 필터링
      const allSavingsData = bankAccounts.savingsAccounts || [];
      console.log('🏦 모든 적금 계좌 데이터:', JSON.stringify(allSavingsData, null, 2));
      
      // 모든 적금 계좌 표시 (필터링 제거)
      const savingsData = allSavingsData;
      console.log('🏦 하나green세상 적금 데이터:', JSON.stringify(savingsData, null, 2));
      
      // 각 적금 계좌의 상세 정보 로그
      savingsData.forEach((account, index) => {
        console.log(`🏦 적금 계좌 ${index + 1} 상세 정보:`);
        console.log(`  - 계좌번호: ${account.accountNumber}`);
        console.log(`  - 상품명: ${account.productName}`);
        console.log(`  - 잔액: ${account.balance}`);
        console.log(`  - 기본금리: ${account.baseRate}`);
        console.log(`  - 우대금리: ${account.preferentialRate}`);
        console.log(`  - 적용금리: ${account.interestRate}`);
        console.log(`  - 만기일: ${account.maturityDate}`);
        console.log(`  - 가입일: ${account.openDate}`);
      });
      
      setSavingsAccounts(savingsData);
      console.log('✅ 적금 계좌 조회 성공:', savingsData);
    } catch (err) {
      console.error('❌ 적금 계좌 조회 실패:', err);
      setError('적금 계좌 정보를 불러오는데 실패했습니다.');
      setSavingsAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId > 0) {
      getSavingsAccounts();
    }
  }, [getSavingsAccounts]);

  return { savingsAccounts, loading, error, getSavingsAccounts };
};
