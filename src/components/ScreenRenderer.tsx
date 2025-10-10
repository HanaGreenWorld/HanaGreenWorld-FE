import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
// 순환 참조 방지를 위해 직접 import
import { DashboardScreen } from '../screens/DashboardScreen';
import SplashScreen from './SplashScreen';
import PointsHistoryScreen from '../screens/PointsHistoryScreen';
import { MyScreen } from '../screens/MyScreen';
import { BenefitsScreen } from '../screens/BenefitsScreen';
import { ExpiredInsuranceScreen } from '../screens/ExpiredInsuranceScreen';
import { GreenPlayScreen } from '../screens/GreenPlayScreen';
import { GreenSavingsScreen } from '../screens/GreenSavingsScreen';
import { ProductSignupScreen } from '../screens/ProductSignupScreen';
import SeedConversionScreen from '../screens/SeedConversionScreen';
import EcoMerchantsScreen from '../screens/EcoMerchantsScreen';
import QuizScreen from '../screens/QuizScreen';
import WalkingScreen from '../screens/WalkingScreen';
import EcoChallengeScreen from '../screens/EcoChallengeScreen';
import ChallengeHistoryScreen from '../screens/ChallengeHistoryScreen';
import SeedHistoryScreen from '../screens/SeedHistoryScreen';
import BankHomeMockScreen from '../screens/BankHomeMockScreen';
import MyTeamsScreen from '../screens/MyTeamsScreen';
import EcoReportScreen from '../screens/EcoReportScreen';
import EcoReportDetailScreen from '../screens/EcoReportDetailScreen';
import ElectronicReceiptScreen from '../screens/ElectronicReceiptScreen';
import CarbonPointGuideScreen from '../screens/CarbonPointGuideScreen';
import LoginScreen from '../screens/LoginScreen';
import { useApp } from '../contexts/AppContext';
import { useEcoSeeds } from '../hooks';

// 화면 렌더링 로직을 분리한 컴포넌트
export const ScreenRenderer: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  const {
    isLoggedIn,
    isInitialized,
    activeTab,
    showHistory,
    showExpiredInsurance,
    showSeedConversion,
    showQuiz,
    showGreenSavings,
    showEcoMerchants,
    showProductSignup,
    showWalking,
    showEcoChallenge,
    showChallengeHistory,
    showSeedHistory,
    showElectronicReceipt,
    showCarbonGuide,
    showEcoReport,
    ecoReportDetail,
    quizCompleted,
    selectedQuizAnswer,
    expiredInsuranceFromTab,
    expiredInsuranceSubTab,
    setLoggedIn,
    setActiveTab,
    setShowHistory,
    setShowExpiredInsurance,
    setShowSeedConversion,
    setShowQuiz,
    setShowGreenSavings,
    setShowEcoMerchants,
    setShowProductSignup,
    setShowWalking,
    setShowEcoChallenge,
    setShowChallengeHistory,
    setShowSeedHistory,
    setShowElectronicReceipt,
    setShowCarbonGuide,
    setShowEcoReport,
    setEcoReportDetail,
    setQuizCompleted,
    setSelectedQuizAnswer,
    setExpiredInsuranceFromTab,
    setExpiredInsuranceSubTab,
  } = useApp();

  const { ecoSeedInfo, refreshProfile } = useEcoSeeds();
  const ecoSeeds = ecoSeedInfo.currentSeeds;

  // 스플래시 화면 표시
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 초기화가 완료되지 않은 경우 로딩 표시
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 18, color: '#2c3e50' }}>로딩 중...</Text>
      </View>
    );
  }

  // 로그인하지 않은 경우 - 항상 로그인 화면을 먼저 표시
  if (!isLoggedIn) {
    console.log('ScreenRenderer: 로그인되지 않음 - LoginScreen 표시');
    return (
      <LoginScreen 
        navigation={{
          navigate: (screen: string) => {
            console.log('LoginScreen navigation called with screen:', screen);
            if (screen === 'Dashboard') {
              console.log('Setting logged in to true and switching to mockhome tab');
              setLoggedIn(true);
              setActiveTab('mockhome');
            }
          }
        }}
      />
    );
  }

  // 모달 화면들 (우선순위 순서대로)
  if (showQuiz) {
    return (
      <QuizScreen 
        onBack={() => setShowQuiz(false)}
        onQuizCompleted={async (selectedAnswer: number) => {
          setQuizCompleted(true);
          setSelectedQuizAnswer(selectedAnswer);
          await refreshProfile();
        }}
        quizCompleted={quizCompleted}
        selectedAnswer={selectedQuizAnswer}
      />
    );
  }

  if (showSeedConversion) {
    return (
      <SeedConversionScreen 
        onBack={() => setShowSeedConversion(false)}
      />
    );
  }

  if (showEcoMerchants) {
    return (
      <EcoMerchantsScreen 
        onBack={() => setShowEcoMerchants(false)} 
      />
    );
  }

  if (showWalking) {
    return (
      <WalkingScreen 
        onBack={() => setShowWalking(false)}
        onAwardSeeds={async (amount: number) => {
          // 걷기 화면에서 이미 API 호출로 처리
        }}
      />
    );
  }

  if (showEcoChallenge) {
    return (
      <EcoChallengeScreen 
        onBack={() => setShowEcoChallenge(false)}
        onShowHistory={() => {
          setShowEcoChallenge(false);
          setShowChallengeHistory(true);
        }}
        onShowSeedHistory={() => {
          setShowEcoChallenge(false);
          setShowSeedHistory(true);
        }}
      />
    );
  }

  if (showChallengeHistory) {
    return (
      <ChallengeHistoryScreen 
        onBack={() => {
          setShowChallengeHistory(false);
          setShowEcoChallenge(true);
        }}
      />
    );
  }

  if (showSeedHistory) {
    return (
      <SeedHistoryScreen 
        onBack={() => {
          setShowSeedHistory(false);
          setShowEcoChallenge(true);
        }}
      />
    );
  }

  if (showCarbonGuide) {
    return (
      <CarbonPointGuideScreen 
        onBack={() => setShowCarbonGuide(false)} 
        onHome={() => setActiveTab('mockhome')} 
        onOpenReceipt={() => { 
          setShowCarbonGuide(false); 
          setShowElectronicReceipt(true); 
        }} 
      />
    );
  }

  if (showElectronicReceipt) {
    return (
      <ElectronicReceiptScreen 
        onBack={() => setShowElectronicReceipt(false)} 
        onHome={() => setActiveTab('mockhome')} 
        onOpenCarbonGuide={() => { 
          setShowElectronicReceipt(false); 
          setShowCarbonGuide(true); 
        }} 
      />
    );
  }

  if (ecoReportDetail) {
    return (
      <EcoReportDetailScreen 
        report={ecoReportDetail} 
        onBack={() => setEcoReportDetail(null)} 
        onHome={() => { 
          setEcoReportDetail(null); 
          setActiveTab('mockhome'); 
        }} 
      />
    );
  }

  if (showEcoReport) {
    return (
      <EcoReportScreen 
        onBack={() => setShowEcoReport(false)} 
        onOpenDetail={(r: any) => setEcoReportDetail(r)} 
      />
    );
  }

  if (showHistory) {
    return (
      <PointsHistoryScreen 
        onBack={() => setShowHistory(false)}
        onNavigateToSeedConversion={() => setShowSeedConversion(true)}
      />
    );
  }

  if (showProductSignup) {
    return (
      <ProductSignupScreen 
        onNavigateBack={() => setShowProductSignup(false)}
      />
    );
  }

  if (showGreenSavings) {
    return (
      <GreenSavingsScreen 
        onNavigateBack={() => setShowGreenSavings(false)}
        onNavigateToSignup={() => setShowProductSignup(true)}
      />
    );
  }

  if (showExpiredInsurance) {
    return (
      <ExpiredInsuranceScreen 
        expiredInsuranceData={[]}
        onBack={() => {
          setShowExpiredInsurance(false);
          setActiveTab(expiredInsuranceFromTab);
        }}
      />
    );
  }

  // 탭 기반 화면들
  if (activeTab === 'mockhome') {
    return (
      <BankHomeMockScreen 
        onGoGreenPlay={() => setActiveTab('greenplay')}
      />
    );
  }

  switch (activeTab) {
    case 'greenplay':
      return (
        <GreenPlayScreen 
          onBack={() => setActiveTab('mockhome')}
          onEnterGreenZone={() => setActiveTab('home')}
          onNavigateToHistory={() => setShowHistory(true)}
          onNavigateToQuiz={() => setShowQuiz(true)}
          onNavigateToSavings={() => setShowGreenSavings(true)}
          onNavigateToEcoMerchants={() => setShowEcoMerchants(true)}
          onNavigateToEcoChallenge={() => setShowEcoChallenge(true)}
          onNavigateToTeams={() => setActiveTab('benefits')}
          quizCompleted={quizCompleted}
          ecoSeeds={ecoSeeds}
          onHome={() => setActiveTab('mockhome')}
        />
      );
    case 'home':
      return (
        <DashboardScreen 
          onNavigateToHistory={() => setShowHistory(true)}
          onBack={() => setActiveTab('greenplay')}
          onHome={() => setActiveTab('mockhome')}
          ecoSeeds={ecoSeeds}
        />
      );
    case 'my':
      return (
        <MyScreen 
          onNavigateToHistory={() => setShowHistory(true)}
          onNavigateToExpiredInsurance={(fromTab, subTab) => {
            setExpiredInsuranceFromTab(fromTab);
            setExpiredInsuranceSubTab(subTab);
            setShowExpiredInsurance(true);
          }}
          onNavigateToProducts={() => setActiveTab('collect')}
          initialSubTab={expiredInsuranceSubTab}
          onNavigateToSavings={() => setShowGreenSavings(true)}
          onBackToGreenPlay={() => setActiveTab('greenplay')}
          onHome={() => setActiveTab('mockhome')}
        />
      );
    case 'collect':
      return (
        <BenefitsScreen 
          onBack={() => setActiveTab('greenplay')}
          onHome={() => setActiveTab('mockhome')}
          onNavigateToQuiz={() => setShowQuiz(true)}
          onNavigateToWalking={() => setShowWalking(true)}
          onNavigateToEcoMerchants={() => setShowEcoMerchants(true)}
          onNavigateToEcoChallenge={() => setShowEcoChallenge(true)}
          onNavigateToElectronicReceipt={() => setShowElectronicReceipt(true)}
        />
      );
    case 'benefits':
      return (
        <MyTeamsScreen 
          onBack={() => setActiveTab('greenplay')} 
          onHome={() => setActiveTab('mockhome')} 
        />
      );
    case 'report':
      return (
        <EcoReportScreen 
          onBack={() => setActiveTab('greenplay')}
          onHome={() => setActiveTab('mockhome')}
          onOpenDetail={(r: any) => setEcoReportDetail(r)}
        />
      );
    default:
      return (
        <GreenPlayScreen 
          onEnterGreenZone={() => setActiveTab('home')} 
          onHome={() => setActiveTab('mockhome')}
        />
      );
  }
};
