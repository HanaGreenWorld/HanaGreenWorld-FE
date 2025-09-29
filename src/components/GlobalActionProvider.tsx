import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

// 전역 액션을 설정하는 컴포넌트 (전역 변수 대체)
export const GlobalActionProvider: React.FC = () => {
  const { openEcoMerchants, openEcoReport } = useApp();

  useEffect(() => {
    // 전역 변수 대신 Context의 함수를 사용
    (global as any).openEcoMerchants = openEcoMerchants;
    (global as any).openEcoReport = openEcoReport;

    // 컴포넌트 언마운트 시 정리
    return () => {
      delete (global as any).openEcoMerchants;
      delete (global as any).openEcoReport;
    };
  }, [openEcoMerchants, openEcoReport]);

  return null;
};
