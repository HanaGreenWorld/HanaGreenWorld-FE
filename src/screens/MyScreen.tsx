import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCALE, IPHONE_WIDTH, IPHONE_HEIGHT } from '../utils/constants';
import TopBar from '../components/TopBar';
import { SavingsTab } from '../components/tabs/SavingsTab';
import { BondsTab } from '../components/tabs/BondsTab';
import { InvestTab } from '../components/tabs/InvestTab';
import { CardsTab } from '../components/tabs/CardsTab';
import { BenefitChangeScreen } from './BenefitChangeScreen';
import { useCardData } from '../hooks/useCardData';
import { useSavingsAccountData } from '../hooks/useSavingsAccountData';
import { useLoanAccountData } from '../hooks/useLoanAccountData';
import { useUser } from '../hooks/useUser';

const { width } = Dimensions.get('window');

interface MyScreenProps {
  onNavigateToHistory?: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToExpiredInsurance?: (fromTab: string, subTab: string) => void;
  initialSubTab?: string;
  onNavigateToSavings?: () => void;
  onBackToGreenPlay?: () => void;
  onHome?: () => void;
}

export function MyScreen({ 
  onNavigateToHistory, 
  onNavigateToExpiredInsurance, 
  onNavigateToProducts, 
  initialSubTab, 
  onNavigateToSavings, 
  onBackToGreenPlay, 
  onHome 
}: MyScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(
    initialSubTab === '적금' || initialSubTab === '채권' || initialSubTab === '카드'
      ? (initialSubTab as string)
      : '적금'
  );
  const [showBenefitChange, setShowBenefitChange] = useState(false);
  const [scheduledBenefitId, setScheduledBenefitId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEarthSavingsDetail, setShowEarthSavingsDetail] = useState(false);
  const [showEcoBenefitsDetail, setShowEcoBenefitsDetail] = useState(false);

  // 사용자 정보 가져오기
  const { userInfo } = useUser();
  
  
  // 초기 탭 데이터 로드
  useEffect(() => {
    if (userInfo?.id) {
    }
  }, [userInfo?.id, activeTab]);
  
  const { 
    userCards, 
    currentBenefitPackage,
    updateCardBenefit, 
    changeBenefitPackage,
    ecoBenefits,
    ecoConsumptionAnalysis,
    consumptionSummary,
    transactions,
    loading: cardLoading, 
    error: cardError 
  } = useCardData(activeTab === '카드' ? (userInfo?.id || 0) : 0);


  // 카드 탭에서만 로딩 상태 표시
  const isCardTabLoading = activeTab === '카드' && cardLoading;
  
  // 적금 데이터 훅 사용 (적금 탭에서만)
  // 고객 적금 계좌 데이터 훅 사용 (적금 탭에서만) - 실제 필요한 데이터만
  const { savingsAccounts, loading: accountLoading, error: accountError } = useSavingsAccountData(activeTab === '적금' ? (userInfo?.id || 0) : 0);
  
  // 고객 대출 계좌 데이터 훅 사용 (대출 탭에서만) - 실제 필요한 데이터만
  const { loanAccounts, loading: loanAccountLoading, error: loanAccountError } = useLoanAccountData(activeTab === '대출' ? (userInfo?.id || 0) : 0);

  // 친환경 혜택 카테고리 아이콘 매핑 (실제 데이터베이스에서 가져온 정보 사용)
  const getCategoryIcon = (type: string, iconUrl?: string) => {
    switch (type) {
      case 'ECO_FOOD':
        return require('../../assets/hana3dIcon/hanaIcon3d_105.png');
      case 'GREEN_MOBILITY':
        return require('../../assets/hana3dIcon/hanaIcon3d_29.png');
      case 'ZERO_WASTE':
        return require('../../assets/hana3dIcon/zero_waste.png');
      case 'ECO_BRAND':
        return require('../../assets/hana3dIcon/hanaIcon3d_85.png');
      case 'SECOND_HAND':
        return require('../../assets/hana3dIcon/hanaIcon3d_107.png');
      case 'ORGANIC_FOOD':
        return require('../../assets/hana3dIcon/hanaIcon3d_105.png');
      default:
        return require('../../assets/hana3dIcon/hanaIcon3d_33.png');
    }
  };

  // 카테고리를 타입으로 변환
  const getCategoryType = (category: string) => {
    switch (category) {
      case '유기농식품':
        return 'ECO_FOOD';
      case '공유킥보드':
      case '대중교통':
        return 'GREEN_MOBILITY';
      case '리필샵':
        return 'ZERO_WASTE';
      case '친환경브랜드':
        return 'ECO_BRAND';
      case '중고거래':
        return 'SECOND_HAND';
      case '전기차':
        return 'GREEN_MOBILITY';
      default:
        return 'ECO_FOOD';
    }
  };

  // 거래일자를 포맷팅
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 카테고리별 혜택명 생성
  const getBenefitName = (category: string) => {
    switch (category) {
      case '유기농식품':
        return '3% 캐시백';
      case '공유킥보드':
        return '4% 캐시백';
      case '전기차':
        return '5% 캐시백';
      case '친환경브랜드':
        return '2% 캐시백';
      case '중고거래':
        return '1.5% 캐시백';
      case '리필샵':
        return '4% 캐시백';
      case '대중교통':
        return '2% 캐시백';
      default:
        return '3% 캐시백';
    }
  };

  // 친환경 혜택 데이터 (실제 거래내역 기반)
  const allEcoBenefits = transactions && transactions.length > 0 ? 
    transactions
      .filter(transaction => {
        // 친환경 관련 카테고리만 필터링
        const ecoCategories = ['유기농식품', '공유킥보드', '전기차', '친환경브랜드', '중고거래', '리필샵', '대중교통'];
        return ecoCategories.includes(transaction.category);
      })
      .map((transaction, index) => ({
        id: `eco-${transaction.id}-${index}`,
        storeName: transaction.merchantName,
        type: getCategoryType(transaction.category),
        amount: `+${transaction.cashbackAmount.toLocaleString()}원`,
        date: formatTransactionDate(transaction.transactionDate),
        cardNumber: '****3524', // 마스킹된 카드번호
        // 실제 데이터베이스에서 가져온 아이콘 정보 사용
        icon: getCategoryIcon(
          getCategoryType(transaction.category)
        ),
        benefitName: getBenefitName(transaction.category),
        spentAmount: transaction.amount.toLocaleString()
      })) : [
      {
        id: '1',
        storeName: '그린마트 강남점',
        type: 'ECO_FOOD',
        amount: '+2,500원',
        date: '7월 15일',
        cardNumber: '3524',
        icon: getCategoryIcon('ECO_FOOD')
      },
    ];

  // 화면에 표시할 친환경 혜택 (최대 5개)
  const ecoBenefitsData = allEcoBenefits.slice(0, 5);

  // 유틸리티 함수들
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  };

  const handleBenefitSelect = (benefitType: string) => {
    setScheduledBenefitId(benefitType);
    setShowBenefitChange(false);
    const benefitTitles: Record<string, string> = {
      all_green_life: '올인원 그린라이프 캐시백',
      green_mobility: '그린 모빌리티 캐시백',
      zero_waste_life: '제로웨이스트 라이프 캐시백',
    };
    const title = benefitTitles[benefitType] || '선택한 혜택';
    showToast(`다음달 혜택이 '${title}'으로 변경되었어요`);
  };

  const handleCancelScheduledBenefit = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelScheduledBenefit = () => {
    setShowCancelConfirm(false);
    if (!scheduledBenefitId) return;
    setScheduledBenefitId(null);
    showToast('다음달 혜택 변경이 취소되었어요');
  };

  const keepScheduledBenefit = () => setShowCancelConfirm(false);

  const handleChangeBenefit = () => {
    setShowBenefitChange(true);
  };

  const handleChangeToBenefit = (benefitType: string) => {
    // 혜택 변경 로직
    if (changeBenefitPackage) {
      changeBenefitPackage(benefitType);
    }
  };

  const handleNavigateToBenefits = () => {
    if (onNavigateToProducts) {
      onNavigateToProducts();
    }
  };

  // 탭 변경 시 데이터 로드
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case '적금':
        return (
          <SavingsTab
            savingsAccounts={savingsAccounts}
            loading={accountLoading}
            error={accountError}
            onNavigateToSavings={onNavigateToSavings}
            onShowEarthSavingsDetail={() => setShowEarthSavingsDetail(true)}
          />
        );
      case '투자':
        return <InvestTab />;
      case '대출':
        return (
          <BondsTab
            loanAccounts={loanAccounts}
            loading={loanAccountLoading}
            error={loanAccountError}
          />
        );
      case '카드':
        return (
          <CardsTab
            userCards={userCards}
            loading={isCardTabLoading}
            error={cardError}
            currentBenefitPackage={currentBenefitPackage}
            scheduledBenefitId={scheduledBenefitId}
            ecoBenefitsData={ecoBenefits}
            allEcoBenefits={allEcoBenefits}
            ecoConsumptionAnalysis={ecoConsumptionAnalysis}
            consumptionSummary={consumptionSummary}
            onNavigateToProducts={onNavigateToProducts}
            onShowBenefitChange={handleChangeBenefit}
            onCancelScheduledBenefit={handleCancelScheduledBenefit}
            onShowEcoBenefitsDetail={() => setShowEcoBenefitsDetail(true)}
            onBenefitChange={handleChangeToBenefit}
          />
        );
      default:
        return (
          <SavingsTab
            savingsAccounts={savingsAccounts}
            loading={accountLoading}
            error={accountError}
            onNavigateToSavings={onNavigateToSavings}
            onShowEarthSavingsDetail={() => setShowEarthSavingsDetail(true)}
          />
        );
    }
  };

  const baseTabs = ['적금', '대출', '카드'];
  const activeTabs = ['그린적금', '그린대출', '그린카드'];
  
  const tabs = baseTabs.map((tab, index) => {
    if (activeTab === baseTabs[index]) {
      return activeTabs[index];
    }
    return baseTabs[index];
  });

  return (
    <>
      <BenefitChangeScreen 
        visible={showBenefitChange} 
        onClose={() => setShowBenefitChange(false)} 
        onBenefitSelect={handleBenefitSelect} 
      />
      
      {/* 지구사랑 적금 상세 모달 */}
      <Modal visible={showEarthSavingsDetail} transparent animationType="none" onRequestClose={() => setShowEarthSavingsDetail(false)}>
        <View style={styles.cancelOverlay}>
          <View style={[styles.earthModal, { width: IPHONE_WIDTH * SCALE, height: IPHONE_HEIGHT * SCALE }]}>
            {/* Safe Area 상단 여백 추가 */}
            <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />
            <View style={styles.earthModalHeader}>
              <Pressable onPress={() => setShowEarthSavingsDetail(false)} style={styles.modalBackBtn}>
                <Ionicons name="chevron-back" size={22} color="#111827" />
              </Pressable>
              <Text style={styles.earthModalTitle}>계좌관리</Text>
              <View style={{ width: 28 }} />
        </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.earthDetailCard}>
                {savingsAccounts.length > 0 ? (
                  <>
        <View style={styles.earthCardHeaderRow}>
                      <Text style={styles.earthCardTitle}>{savingsAccounts[0].productName}</Text>
                      <Text style={styles.earthCardAccount}>{savingsAccounts[0].accountNumber}</Text>
        </View>
        <View style={styles.earthCardDivider} />
        <View style={styles.earthInfoRow}>
          <Text style={styles.earthInfoLabel}>잔액</Text>
                      <Text style={styles.earthInfoValue}>{savingsAccounts[0].balance ? savingsAccounts[0].balance.toLocaleString() : '0'}원</Text>
        </View>
        <View style={styles.earthInfoRow}>
          <Text style={styles.earthInfoLabel}>만기일</Text>
          <Text style={styles.earthInfoValue}>
                        {savingsAccounts[0].maturityDate ? 
                          new Date(savingsAccounts[0].maturityDate).toLocaleDateString('ko-KR') : 
                          '정보 없음'
            }
          </Text>
        </View>
        <View style={styles.earthRateGroup}>
          <Text style={styles.earthRateHeader}>적용이율(연)</Text>
          <View style={styles.earthRateRow}>
            <Text style={styles.earthRateLabel}>기본금리</Text>
            <Text style={styles.earthRateValue}>
                          <Text style={styles.earthRateValueNum}>{(savingsAccounts[0].baseRate || 0).toFixed(2)}</Text>
              <Text style={styles.earthRateValueUnit}>%</Text>
            </Text>
          </View>
          <View style={styles.earthRateRow}>
            <Text style={styles.earthRateLabel}>우대금리</Text>
            <Text style={styles.earthRateValue}>
                          <Text style={styles.earthRateValueNum}>{(savingsAccounts[0].preferentialRate || 0).toFixed(2)}</Text>
              <Text style={styles.earthRateValueUnit}>%</Text>
            </Text>
          </View>
          <View style={styles.earthRateRow}>
            <Text style={styles.earthRateLabel}>적용금리</Text>
            <Text style={styles.earthRateValue}>
                          <Text style={styles.earthRateValueNum}>{(savingsAccounts[0].interestRate || 0).toFixed(2)}</Text>
              <Text style={styles.earthRateValueUnit}>%</Text>
            </Text>
          </View>
        </View>
                  </>
                ) : (
                  <>
            <View style={styles.earthCardHeaderRow}>
                      <Text style={styles.earthCardTitle}>하나그린적금</Text>
                      <Text style={styles.earthCardAccount}>123-456-789012</Text>
            </View>
            <View style={styles.earthCardDivider} />
            <View style={styles.earthInfoRow}>
                      <Text style={styles.earthInfoLabel}>잔액</Text>
                      <Text style={styles.earthInfoValue}>1,500,000원</Text>
            </View>
            <View style={styles.earthInfoRow}>
                      <Text style={styles.earthInfoLabel}>만기일</Text>
                      <Text style={styles.earthInfoValue}>2026-03-01</Text>
            </View>
            <View style={styles.earthRateGroup}>
                      <Text style={styles.earthRateHeader}>적용이율(연)</Text>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>기본금리</Text>
                <Text style={styles.earthRateValue}>
                          <Text style={styles.earthRateValueNum}>1.80</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>우대금리</Text>
                <Text style={styles.earthRateValue}>
                          <Text style={styles.earthRateValueNum}>0.50</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>적용금리</Text>
                <Text style={styles.earthRateValue}>
                          <Text style={styles.earthRateValueNum}>2.30</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              </View>
            </>
          )}
      </View>

              {/* 섹션 리스트 더미 */}
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>계좌정보</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
              <View style={styles.earthSectionSpacer} />
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>추가입금</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </View>
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>자동이체</Text>
                <Text style={styles.earthListItemMeta}>0 건</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
              <View style={styles.earthSectionSpacer} />
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>해지/해지예상조회</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>내통장혜택알리미 등록/해지</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>예/적금 만기 안내 신청/해제</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
              <View style={styles.earthListSection}>
                <Text style={styles.earthListItemTitle}>만기해지방법변경</Text>
                <Text style={styles.earthListItemMeta}>만기자동해지</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
              <View style={[styles.earthListSection, { marginBottom: 20 * SCALE }]}>
                <Text style={styles.earthListItemTitle}>계약서/설명서/약관 보기</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
    <View style={styles.container}>
      <TopBar title="마이" onBack={onBackToGreenPlay} onHome={onHome} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab, index) => (
            <Pressable
                key={tab}
              style={[styles.tab, activeTab === baseTabs[index] && styles.activeTab]}
                onPress={() => handleTabChange(baseTabs[index])}
            >
              <Text style={[styles.tabText, activeTab === baseTabs[index] && styles.activeTabText]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
    </>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // 탭 스타일
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  tab: {
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 16 * SCALE,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
  
  // 모달 스타일
  cancelOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earthModal: {
    backgroundColor: '#F5F6F7',
    borderRadius: 20 * SCALE,
    overflow: 'hidden',
  },
  earthModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE,
    paddingTop: 20 * SCALE,
    paddingBottom: 8 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBackBtn: {
    padding: 6 * SCALE,
  },
  earthModalTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  earthDetailCard: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    marginHorizontal: 20 * SCALE,
    marginVertical: 28 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  earthListSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 16 * SCALE,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  earthListItemTitle: {
    fontSize: 16 * SCALE,
    color: '#111827',
    fontWeight: '600',
  },
  
  // earth 카드 스타일들
  earthCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earthCardTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  earthCardAccount: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  earthCardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8 * SCALE,
  },
  earthInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6 * SCALE,
  },
  earthInfoLabel: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  earthInfoValue: {
    fontSize: 14 * SCALE,
    color: '#111827',
    fontWeight: '600',
  },
  earthRateGroup: {
    marginTop: 6 * SCALE,
    gap: 6 * SCALE,
  },
  earthRateHeader: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  earthRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earthRateLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginLeft: 4 * SCALE,
  },
  earthRateValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  earthRateValueNum: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#111827',
  },
  earthRateValueUnit: {
    fontSize: 12 * SCALE,
    color: '#111827',
    marginLeft: 2 * SCALE,
  },
  
  // 추가 스타일들
  earthSectionSpacer: {
    height: 8 * SCALE,
    backgroundColor: '#F9FAFB',
  },
  earthListItemMeta: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    marginRight: 8 * SCALE,
  },
}); 
