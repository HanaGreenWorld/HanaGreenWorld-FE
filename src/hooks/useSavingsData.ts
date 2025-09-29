import { useState, useEffect, useCallback } from 'react';
import { fetchSavingsProducts, fetchSavingsProductsByType, SavingsProduct } from '../utils/productApi';

export const useSavingsData = (userId?: number) => {
  const [savingsProducts, setSavingsProducts] = useState<SavingsProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 적금 상품 조회
  const getSavingsProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await fetchSavingsProducts();
      setSavingsProducts(products);
      console.log('적금 상품 조회 성공:', products);
    } catch (error) {
      // AbortError와 네트워크 에러는 조용히 처리 (기본 데이터 사용)
      if (error.name === 'AbortError' || 
          error.message?.includes('timeout') || 
          error.message?.includes('Network request failed') ||
          error.message?.includes('Aborted')) {
        console.log('적금 상품 네트워크 에러, 기본 데이터 사용:', error.message);
        setError(null);
      } else {
        console.error('적금 상품 조회 실패:', error);
        setError('적금 상품을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 타입별 적금 상품 조회
  const getSavingsProductsByType = useCallback(async (productType: string) => {
    try {
      setLoading(true);
      setError(null);
      const products = await fetchSavingsProductsByType(productType);
      setSavingsProducts(products);
      console.log(`${productType} 적금 상품 조회 성공:`, products);
    } catch (error) {
      console.error(`${productType} 적금 상품 조회 실패:`, error);
      setError(`${productType} 적금 상품을 불러오는데 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    getSavingsProducts();
  }, [getSavingsProducts]);

  return {
    savingsProducts,
    loading,
    error,
    getSavingsProducts,
    getSavingsProductsByType,
    clearError
  };
};
