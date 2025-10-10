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
  // 디버깅 로그 추가
  console.log('💳 useCardData 훅 시작:', { userId, timestamp: new Date().toISOString() });
  
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 통합 카드 정보 조회 🎯
  const getIntegratedCardInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎯 통합 카드 정보 조회 시작:', userId);
      
      // 통합 API를 통해 모든 카드 정보를 한 번에 조회
      const integratedInfo = await fetchCardIntegratedInfo(userId);
      
      // 카드 목록 정보 설정 - API 응답에서 실제 카드 데이터 사용
      if (integratedInfo.cardList && Array.isArray(integratedInfo.cardList.cards) && integratedInfo.cardList.cards.length > 0) {
        console.log('🎯 실제 카드 데이터 존재:', integratedInfo.cardList.cards);
        // CardDetail을 UserCardResponse로 변환
        const userCards = integratedInfo.cardList.cards.map((card, index) => ({
          id: index + 1,
          userId: userId,
          userName: `사용자${userId}`,
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
        console.log('🎯 카드 데이터 없음, 빈 카드 목록 설정');
        setUserCards([]);
      }
      
      // 거래내역 설정 - 데이터가 있을 때만
      if (integratedInfo.transactions && Array.isArray(integratedInfo.transactions)) {
        setTransactions(integratedInfo.transactions);
      } else {
        setTransactions([]);
      }
      
      // 소비현황 설정 - 데이터가 있을 때만
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
      
      // 친환경 혜택 정보 설정
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
      
      console.log('🎯 통합 카드 정보 조회 성공:', integratedInfo);
      
    } catch (error) {
      console.error('🎯 통합 카드 정보 조회 실패:', error);
      setError('카드 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 사용자 카드 조회 (기존 방식)
  const getUserCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💳 카드 조회 시작:', userId);
      
      // 통합 API를 통해 카드 정보 조회
      const cardList = await integrationApi.getCardList(userId);
      console.log('💳 카드 목록 응답:', cardList);
      
      const cards = cardList.cards || [];
      // CardInfo를 UserCardResponse로 변환
      const userCards = cards.map((card, index) => ({
        id: index + 1,
        userId: userId,
        userName: `사용자${userId}`,
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
      console.log('✅ 카드 조회 성공:', userCards);
      return userCards;
    } catch (err) {
      console.error('❌ 카드 정보 조회 실패:', err);
      
      // API 실패 시 빈 배열 반환 (하드코딩된 데이터 제거)
      setUserCards([]);
      setError('카드 정보를 불러올 수 없습니다');
      console.log('❌ 카드 데이터 없음');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
        console.log('💳 cardId가 유효하지 않음:', cardId);
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
      const cards = await getUserCards();
      // 다른 함수들은 필요에 따라 호출
      console.log('💳 모든 데이터 새로고침 완료');
    } catch (err) {
      console.error('데이터 새로고침 실패:', err);
    }
  }, [getUserCards]);

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
    console.log('💳 카드 혜택 조회 비활성화됨 - 빈 배열 반환');
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
    console.log('🚫 AI 혜택 추천 기능이 비활성화되었습니다.');
    setBenefitRecommendation(null);
    return null;
  }, [userId]);

  // 혜택 추천 상세 분석 (일시적으로 비활성화)
  const getRecommendationAnalysis = useCallback(async (packageCode?: string) => {
    console.log('🚫 AI 혜택 추천 분석 기능이 비활성화되었습니다.');
    setRecommendationAnalysis(null);
    return null;
  }, [userId]);

  // 혜택 패키지 비교 (일시적으로 비활성화)
  const compareBenefitPackagesData = useCallback(async (packageCodes: string[]) => {
    console.log('🚫 AI 혜택 패키지 비교 기능이 비활성화되었습니다.');
    return null;
  }, [userId]);

  // 컴포넌트 마운트 시 자동으로 카드 데이터 로드 (userId가 0이 아닐 때만)
  useEffect(() => {
    if (userId && userId > 0) {
      console.log('🎯 통합 카드 데이터 로드 시작:', userId);
      getIntegratedCardInfo();
    } else if (userId === 0) {
      console.log('💳 useCardData: userId가 0이므로 데이터 로드 건너뜀');
    } else {
      console.log('💳 useCardData: userId가 유효하지 않음:', userId);
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
    getUserCards,
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

