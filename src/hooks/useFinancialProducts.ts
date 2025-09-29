import { useState, useEffect, useCallback } from 'react';

// 삭제된 API 대신 빈 타입 정의
interface IntegratedFinancialProductsResponse {
  bankProducts?: { products: BankProductInfo[] };
  cardProducts?: { products: CardProductInfo[] };
}

interface BankProductInfo {
  id: string;
  name: string;
  type: string;
}

interface CardProductInfo {
  id: string;
  name: string;
  type: string;
}

export const useFinancialProducts = (memberId: number = 1) => {
  const [financialProducts, setFinancialProducts] = useState<IntegratedFinancialProductsResponse | null>(null);
  const [bankProducts, setBankProducts] = useState<BankProductInfo[]>([]);
  const [cardProducts, setCardProducts] = useState<CardProductInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 통합 금융상품 조회 (비활성화됨 - 삭제된 API)
  const getIntegratedFinancialProducts = useCallback(async () => {
    console.log('🚫 통합 금융상품 조회 비활성화됨 - 삭제된 API');
    setBankProducts([]);
    setCardProducts([]);
    return null;
  }, [memberId]);

  // 은행 상품만 조회 (비활성화됨)
  const getBankProducts = useCallback(async () => {
    console.log('🚫 은행 상품 조회 비활성화됨');
    setBankProducts([]);
    return null;
  }, [memberId]);

  // 카드 상품만 조회 (비활성화됨)
  const getCardProducts = useCallback(async () => {
    console.log('🚫 카드 상품 조회 비활성화됨');
    setCardProducts([]);
    return null;
  }, [memberId]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 데이터 새로고침
  const refreshProducts = useCallback(async () => {
    try {
      await getIntegratedFinancialProducts();
    } catch (err) {
      console.error('금융상품 새로고침 실패:', err);
      // 에러가 발생해도 앱이 크래시되지 않도록 함
    }
  }, [getIntegratedFinancialProducts]);

  // 컴포넌트 마운트 시 데이터 조회 (비활성화됨)
  useEffect(() => {
    console.log('🚫 통합 금융상품 자동 조회 비활성화됨');
    // getIntegratedFinancialProducts().catch(err => {
    //   console.error('초기 금융상품 조회 실패:', err);
    // });
  }, [getIntegratedFinancialProducts]);

  return {
    financialProducts,
    bankProducts,
    cardProducts,
    loading,
    error,
    getIntegratedFinancialProducts,
    getBankProducts,
    getCardProducts,
    clearError,
    refreshProducts
  };
};
