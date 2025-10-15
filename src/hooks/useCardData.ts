import { useState, useEffect, useCallback } from 'react';
import { 
  fetchUserCards, 
  fetchCardTransactions, 
  fetchMonthlyConsumptionSummary,
  fetchCardBenefits,
  changeCardBenefit,
  fetchUserCardBenefits,
  fetchEcoConsumptionAnalysis,
  fetchEcoBenefits,
  fetchCardBenefitPackages,
  updateUserBenefitPackage,
  fetchTransactionsByTag,
  fetchBenefitRecommendation,
  fetchRecommendationAnalysis,
  compareBenefitPackages,
  fetchCardIntegratedInfo,
  UserCardResponse,
  CardTransactionResponse,
  CardConsumptionSummaryResponse,
  CardBenefitResponse,
  EcoConsumptionAnalysis,
  CardIntegratedInfoResponse
} from '../utils/cardApi';
import { integrationApi } from '../services/integrationApi';

export const useCardData = (userId: number) => {
  
  const [userCards, setUserCards] = useState<UserCardResponse[]>([]);
  const [transactions, setTransactions] = useState<CardTransactionResponse[]>([]);
  const [consumptionSummary, setConsumptionSummary] = useState<CardConsumptionSummaryResponse | null>(null);
  const [cardBenefits, setCardBenefits] = useState<CardBenefitResponse[]>([]);
  const [ecoConsumptionAnalysis, setEcoConsumptionAnalysis] = useState<EcoConsumptionAnalysis | null>(null);
  const [ecoBenefits, setEcoBenefits] = useState<any>(null);
  const [benefitPackages, setBenefitPackages] = useState<any>(null);
  const [currentBenefitPackage, setCurrentBenefitPackage] = useState<string>('');
  const [taggedTransactions, setTaggedTransactions] = useState<CardTransactionResponse[]>([]);
  const [benefitRecommendation, setBenefitRecommendation] = useState<any>(null);
  const [recommendationAnalysis, setRecommendationAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [error, setError] = useState<string | null>(null);

  // userId가 변경될 때 자동으로 데이터 로드
  useEffect(() => {
    if (userId > 0) {
      setLoading(true); // 로딩 시작
      getIntegratedCardInfo();
    } else {
      setLoading(false);
      setUserCards([]); // 빈 배열로 초기화
      setEcoBenefits(null); // 친환경 혜택도 초기화
      setError(null); // 에러 초기화
    }
  }, [userId]); // getIntegratedCardInfo 의존성 제거

  const getIntegratedCardInfo = useCallback(async (targetUserId?: number) => {
    const currentUserId = targetUserId || userId;
    try {
      setError(null);
      
      // 통합 API를 통해 모든 카드 정보를 한 번에 조회
      const integratedInfo = await fetchCardIntegratedInfo(currentUserId);
      
      try {
        const ecoBenefits = await fetchEcoBenefits(currentUserId);
        setEcoBenefits(ecoBenefits);
      } catch (ecoError) {
        console.warn('친환경 가맹점 혜택 조회 실패:', ecoError);
        setEcoBenefits(null);
      }
      
      
      if (integratedInfo.cardList && Array.isArray(integratedInfo.cardList.cards) && integratedInfo.cardList.cards.length > 0) {
        // CardDetail을 UserCardResponse로 변환
        const userCards = integratedInfo.cardList.cards.map((card, index) => ({
          id: index + 1,
          userId: currentUserId,
          userName: `사용자${currentUserId}`,
          cardId: parseInt(card.cardNumber),
          cardName: card.cardName,
          cardType: card.cardType,
          cardStatus: card.cardStatus,
          creditLimit: card.creditLimit,
          availableLimit: card.availableLimit,
          monthlyUsage: card.monthlyUsage,
          issueDate: card.issueDate,
          expiryDate: card.expiryDate,
          cardNumber: card.cardNumber,
          cardNumberMasked: card.cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4'),
          cardImageUrl: '', // 카드 이미지 URL (기본값)
          currentBenefitType: '기본',
          isActive: card.cardStatus === '활성',
          createdAt: card.issueDate,
          updatedAt: new Date().toISOString()
        }));
        setUserCards(userCards);
      } else {
        setUserCards([]);
      }
      
      if (integratedInfo.transactions && Array.isArray(integratedInfo.transactions)) {
        setTransactions(integratedInfo.transactions);
      } else {
        setTransactions([]);
      }
      
      if (integratedInfo.consumptionSummary) {
        setConsumptionSummary({
          totalAmount: integratedInfo.consumptionSummary.totalAmount || 0,
          totalCashback: integratedInfo.consumptionSummary.totalCashback || 0,
          categoryAmounts: integratedInfo.consumptionSummary.categoryAmounts || {},
          recentTransactions: [] // Default empty array since not provided in integratedInfo
        });
      } else {
        setConsumptionSummary(null);
      }
      
      if (integratedInfo.ecoBenefits) {
        setEcoConsumptionAnalysis({
          totalAmount: integratedInfo.ecoBenefits.totalEcoAmount,
          totalCashback: integratedInfo.ecoBenefits.totalEcoCashback,
          ecoAmount: integratedInfo.ecoBenefits.totalEcoAmount,
          ecoCashback: integratedInfo.ecoBenefits.totalEcoCashback,
          ecoRatio: 0, // Default value since not provided in integratedInfo
          categoryAmounts: {},
          ecoCategoryAmounts: integratedInfo.ecoBenefits.ecoCategories || {}
        });
        
      }
      
      
    } catch (error) {
      console.error('통합 카드 정보 조회 실패:', error);
      setError('카드 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // getUserCards 함수 제거됨 - getIntegratedCardInfo로 통합

  // 카드 거래내역 조회
  const getCardTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const transactionData = await fetchCardTransactions(userId);
      setTransactions(transactionData);
      return transactionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '거래내역 조회에 실패했습니다.';
      console.error('거래내역 조회 실패:', err);
      setError(errorMessage);
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 월간 소비현황 조회
  const getMonthlyConsumptionSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await fetchMonthlyConsumptionSummary(userId);
      setConsumptionSummary(summary);
      return summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '소비현황 조회에 실패했습니다.';
      console.error('소비현황 조회 실패:', err);
      setError(errorMessage);
      setConsumptionSummary(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 카드 혜택 조회
  const getCardBenefits = useCallback(async (cardId: number) => {
    try {
      // cardId가 유효하지 않으면 빈 배열 반환
      if (!cardId || cardId === undefined || cardId === null) {
        setCardBenefits([]);
        return [];
      }
      
      setLoading(true);
      setError(null);
      const benefits = await fetchCardBenefits(cardId);
      setCardBenefits(benefits);
      return benefits;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '카드 혜택 조회에 실패했습니다.';
      console.error('카드 혜택 조회 실패:', err);
      setError(errorMessage);
      setCardBenefits([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 모든 데이터 새로고침 (함수들이 모두 선언된 후에 정의)
  const refreshAllData = useCallback(async () => {
    try {
      await getIntegratedCardInfo();
    } catch (err) {
      console.error('데이터 새로고침 실패:', err);
    }
  }, [getIntegratedCardInfo]);

  // 카드 혜택 변경
  const updateCardBenefit = useCallback(async (cardNumber: string, benefitType: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCard = await changeCardBenefit(userId, cardNumber, benefitType);
      
      // 사용자 카드 목록 업데이트
      setUserCards(prevCards => 
        prevCards.map(card => 
          card.cardNumber === cardNumber ? updatedCard : card
        )
      );
      
      return updatedCard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '카드 혜택 변경에 실패했습니다.';
      console.error('카드 혜택 변경 실패:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 사용자 카드 혜택 조회 (완전히 비활성화)
  const getUserCardBenefits = useCallback(async () => {
    setCardBenefits([]);
    return [];
  }, [userId]);

  // 친환경 소비현황 분석
  const getEcoConsumptionAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analysis = await fetchEcoConsumptionAnalysis(userId);
      setEcoConsumptionAnalysis(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '친환경 소비현황 분석에 실패했습니다.';
      console.error('친환경 소비현황 분석 실패:', err);
      setError(errorMessage);
      setEcoConsumptionAnalysis(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 친환경 가맹점 혜택 조회
  const getEcoBenefits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const benefits = await fetchEcoBenefits(userId);
      setEcoBenefits(benefits);
      return benefits;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '친환경 가맹점 혜택 조회에 실패했습니다.';
      console.error('친환경 가맹점 혜택 조회 실패:', err);
      setError(errorMessage);
      setEcoBenefits(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 카드 혜택 패키지 조회
  const getCardBenefitPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await fetchCardBenefitPackages(userId);
      setBenefitPackages(packages);
      setCurrentBenefitPackage(packages.currentPackage || '');
      return packages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '카드 혜택 패키지 조회에 실패했습니다.';
      console.error('카드 혜택 패키지 조회 실패:', err);
      setError(errorMessage);
      setBenefitPackages(null);
      setCurrentBenefitPackage('');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 혜택 패키지 변경
  const changeBenefitPackage = useCallback(async (packageName: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateUserBenefitPackage(userId, packageName);
      setCurrentBenefitPackage(packageName);
      // 패키지 목록도 다시 조회하여 isActive 상태 업데이트
      await getCardBenefitPackages();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '혜택 패키지 변경에 실패했습니다.';
      console.error('혜택 패키지 변경 실패:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, getCardBenefitPackages]);

  // 태그별 거래내역 조회
  const getTransactionsByTag = useCallback(async (tag: string) => {
    try {
      setLoading(true);
      setError(null);
      const transactions = await fetchTransactionsByTag(userId, tag);
      setTaggedTransactions(transactions);
      return transactions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '태그별 거래내역 조회에 실패했습니다.';
      console.error('태그별 거래내역 조회 실패:', err);
      setError(errorMessage);
      setTaggedTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    if (userId) {
      refreshAllData().catch(err => {
        console.error('초기 데이터 조회 실패:', err);
      });
    }
  }, [userId, refreshAllData]);

  // AI 기반 혜택 추천 (일시적으로 비활성화)
  const getBenefitRecommendation = useCallback(async () => {
    setBenefitRecommendation(null);
    return null;
  }, [userId]);

  // 혜택 추천 상세 분석 (일시적으로 비활성화)
  const getRecommendationAnalysis = useCallback(async (packageCode?: string) => {
    setRecommendationAnalysis(null);
    return null;
  }, [userId]);

  // 혜택 패키지 비교 (일시적으로 비활성화)
  const compareBenefitPackagesData = useCallback(async (packageCodes: string[]) => {
    return null;
  }, [userId]);

  // 컴포넌트 마운트 시 자동으로 카드 데이터 로드 (userId가 0이 아닐 때만)
  useEffect(() => {
    if (userId && userId > 0) {
      getIntegratedCardInfo();
    } else if (userId === 0) {
    } else {
    }
  }, [userId, getIntegratedCardInfo]);

  return {
    userCards,
    transactions,
    consumptionSummary,
    cardBenefits,
    ecoConsumptionAnalysis,
    ecoBenefits,
    benefitPackages,
    currentBenefitPackage,
    taggedTransactions,
    benefitRecommendation,
    recommendationAnalysis,
    loading,
    error,
    getCardTransactions,
    getMonthlyConsumptionSummary,
    getCardBenefits,
    getUserCardBenefits,
    getEcoConsumptionAnalysis,
    getEcoBenefits,
    getCardBenefitPackages,
    changeBenefitPackage,
    getTransactionsByTag,
    updateCardBenefit,
    getBenefitRecommendation,
    getRecommendationAnalysis,
    compareBenefitPackagesData,
    refreshAllData,
    clearError
  };
};

