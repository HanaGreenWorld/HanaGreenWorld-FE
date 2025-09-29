import React from 'react';
import { TabNavigation } from './TabNavigation';
import { useApp } from '../contexts/AppContext';

// 탭 네비게이션 표시 여부를 제어하는 컴포넌트
export const TabVisibilityController: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    showHistory,
    showExpiredInsurance,
    showQuiz,
    showSeedConversion,
    showEcoMerchants,
    showWalking,
    showEcoChallenge,
    showChallengeHistory,
    showSeedHistory,
    showCarbonGuide,
    showElectronicReceipt,
    showEcoReport,
    ecoReportDetail,
    showProductSignup,
    showGreenSavings,
  } = useApp();

  // 모달 화면이 표시되거나 특정 탭일 때는 탭 네비게이션 숨김
  const shouldHideTab = 
    showHistory || 
    showExpiredInsurance || 
    showQuiz || 
    showSeedConversion || 
    showEcoMerchants || 
    showWalking || 
    showEcoChallenge || 
    showChallengeHistory || 
    showSeedHistory || 
    showCarbonGuide || 
    showElectronicReceipt || 
    showEcoReport || 
    ecoReportDetail || 
    showProductSignup || 
    showGreenSavings || 
    activeTab === 'greenplay' || 
    activeTab === 'mockhome';

  if (shouldHideTab) {
    return null;
  }

  return <TabNavigation activeTab={activeTab} onTabPress={setActiveTab} />;
};
