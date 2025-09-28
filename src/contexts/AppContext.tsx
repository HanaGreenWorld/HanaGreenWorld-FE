import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLoggedIn as checkAuthStatus, logout as logoutUser } from '../utils/authUtils';

// 앱 상태 타입 정의
export interface AppState {
  // 인증 상태
  isLoggedIn: boolean;
  isInitialized: boolean;
  
  // 탭 네비게이션
  activeTab: string;
  
  // 모달 화면 상태
  showHistory: boolean;
  showExpiredInsurance: boolean;
  showSeedConversion: boolean;
  showQuiz: boolean;
  showGreenSavings: boolean;
  showEcoMerchants: boolean;
  showProductSignup: boolean;
  showWalking: boolean;
  showEcoChallenge: boolean;
  showChallengeHistory: boolean;
  showSeedHistory: boolean;
  showElectronicReceipt: boolean;
  showCarbonGuide: boolean;
  showEcoReport: boolean;
  
  // 퀴즈 상태
  quizCompleted: boolean;
  selectedQuizAnswer: number | null;
  
  // 보험 관련 상태
  expiredInsuranceFromTab: string;
  expiredInsuranceSubTab: string;
  
  // 환경 보고서 상세
  ecoReportDetail: any | null;
}

// 앱 액션 타입 정의
export interface AppActions {
  // 인증 관련
  setLoggedIn: (loggedIn: boolean) => void;
  logout: () => Promise<void>;
  
  // 탭 네비게이션
  setActiveTab: (tab: string) => void;
  
  // 모달 화면 제어
  setShowHistory: (show: boolean) => void;
  setShowExpiredInsurance: (show: boolean) => void;
  setShowSeedConversion: (show: boolean) => void;
  setShowQuiz: (show: boolean) => void;
  setShowGreenSavings: (show: boolean) => void;
  setShowEcoMerchants: (show: boolean) => void;
  setShowProductSignup: (show: boolean) => void;
  setShowWalking: (show: boolean) => void;
  setShowEcoChallenge: (show: boolean) => void;
  setShowChallengeHistory: (show: boolean) => void;
  setShowSeedHistory: (show: boolean) => void;
  setShowElectronicReceipt: (show: boolean) => void;
  setShowCarbonGuide: (show: boolean) => void;
  setShowEcoReport: (show: boolean) => void;
  
  // 퀴즈 관련
  setQuizCompleted: (completed: boolean) => void;
  setSelectedQuizAnswer: (answer: number | null) => void;
  
  // 보험 관련
  setExpiredInsuranceFromTab: (tab: string) => void;
  setExpiredInsuranceSubTab: (tab: string) => void;
  
  // 환경 보고서
  setEcoReportDetail: (detail: any | null) => void;
  
  // 전역 액션 (전역 변수 대체)
  openEcoMerchants: () => void;
  openEcoReport: () => void;
}

// Context 타입
type AppContextType = AppState & AppActions;

// Context 생성
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 컴포넌트
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 상태 정의
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('mockhome');
  const [showHistory, setShowHistory] = useState(false);
  const [showExpiredInsurance, setShowExpiredInsurance] = useState(false);
  const [showSeedConversion, setShowSeedConversion] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showGreenSavings, setShowGreenSavings] = useState(false);
  const [showEcoMerchants, setShowEcoMerchants] = useState(false);
  const [showProductSignup, setShowProductSignup] = useState(false);
  const [showWalking, setShowWalking] = useState(false);
  const [showEcoChallenge, setShowEcoChallenge] = useState(false);
  const [showChallengeHistory, setShowChallengeHistory] = useState(false);
  const [showSeedHistory, setShowSeedHistory] = useState(false);
  const [showElectronicReceipt, setShowElectronicReceipt] = useState(false);
  const [showCarbonGuide, setShowCarbonGuide] = useState(false);
  const [showEcoReport, setShowEcoReport] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [expiredInsuranceFromTab, setExpiredInsuranceFromTab] = useState('my');
  const [expiredInsuranceSubTab, setExpiredInsuranceSubTab] = useState('자산');
  const [ecoReportDetail, setEcoReportDetail] = useState<any | null>(null);

  // 초기화: 항상 로그인 화면부터 시작
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 앱 시작 시 항상 로그인 화면을 먼저 표시
        console.log('AppContext: 앱 시작 - 로그인 화면 표시');
        setIsLoggedIn(false);
        
        // 선택적으로 저장된 토큰 확인 (디버깅용)
        const loggedIn = await checkAuthStatus();
        console.log('AppContext: 저장된 토큰 확인 결과:', loggedIn);
        
        // 주석 처리: 자동 로그인 비활성화
        // setIsLoggedIn(loggedIn);
      } catch (error) {
        console.error('AppContext: 로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);

  // 전역 액션 함수들
  const openEcoMerchants = () => setShowEcoMerchants(true);
  const openEcoReport = () => setShowEcoReport(true);
  
  // 로그아웃 함수
  const logout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      setActiveTab('mockhome');
      console.log('AppContext: 로그아웃 완료');
    } catch (error) {
      console.error('AppContext: 로그아웃 실패:', error);
    }
  };

  // Context 값
  const value: AppContextType = {
    // 상태
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
    quizCompleted,
    selectedQuizAnswer,
    expiredInsuranceFromTab,
    expiredInsuranceSubTab,
    ecoReportDetail,
    
    // 액션
    setLoggedIn: setIsLoggedIn,
    logout,
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
    setQuizCompleted,
    setSelectedQuizAnswer,
    setExpiredInsuranceFromTab,
    setExpiredInsuranceSubTab,
    setEcoReportDetail,
    openEcoMerchants,
    openEcoReport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook for using context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
