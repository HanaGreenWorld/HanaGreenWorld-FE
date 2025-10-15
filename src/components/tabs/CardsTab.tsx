import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, getCardImageSource, getEcoMerchantIconSource } from '../../utils/constants';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { NoDataState } from '../NoDataState';
import { PieChart } from '../PieChart';
import { EcoStoreButton } from '../EcoStoreButton';

interface UserCard {
  id: number;
  cardName: string;
  cardNumber: string;
  cardImageUrl?: string;
}

interface CardsTabProps {
  userCards: UserCard[];
  loading: boolean;
  error: string | null;
  currentBenefitPackage?: string;
  scheduledBenefitId?: string | null;
  ecoBenefitsData?: any;
  allEcoBenefits?: any[];
  ecoConsumptionAnalysis?: any;
  consumptionSummary?: any;
  onNavigateToProducts?: () => void;
  onShowBenefitChange?: () => void;
  onCancelScheduledBenefit?: () => void;
  onShowEcoBenefitsDetail?: () => void;
  onBenefitChange?: (benefitType: string) => void;
}

export const CardsTab: React.FC<CardsTabProps> = ({
  userCards,
  loading,
  error,
  currentBenefitPackage,
  scheduledBenefitId,
  ecoBenefitsData,
  allEcoBenefits,
  ecoConsumptionAnalysis,
  consumptionSummary,
  onNavigateToProducts,
  onShowBenefitChange,
  onCancelScheduledBenefit,
  onShowEcoBenefitsDetail,
  onBenefitChange
}) => {
  
  const hasCards = userCards.length > 0;
  const hasEcoData = ecoBenefitsData && ecoBenefitsData.benefits && ecoBenefitsData.benefits.length > 0;
  
  const benefitTitles: Record<string, string> = {
    all_green_life: '올인원 그린라이프 캐시백',
    green_mobility: '그린 모빌리티 캐시백',
    zero_waste_life: '제로웨이스트 라이프 캐시백',
  };

  const getBenefitTitle = (benefitId: string) => {
    return benefitTitles[benefitId] || '선택한 혜택';
  };

  // API 데이터 기반 차트 데이터 (0%인 카테고리 제외)
  const pieChartData = consumptionSummary && consumptionSummary.categoryAmounts ? 
    Object.entries(consumptionSummary.categoryAmounts)
      .map(([category, amount], index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        const labels = {
          '공유킥보드': '공유킥보드',
          '유기농식품': '유기농식품', 
          '대중교통': '대중교통',
          '중고거래': '중고거래',
          '전기차': '전기차',
          '친환경브랜드': '친환경브랜드',
          '리필샵': '리필샵'
        };
        const totalAmount = Object.values(consumptionSummary.categoryAmounts).reduce((sum: number, val: any) => sum + val, 0);
        const percentage = totalAmount > 0 ? Math.round((amount as number) / totalAmount * 100) : 0;
        
        return {
          value: percentage,
          color: colors[index % colors.length],
          label: labels[category as keyof typeof labels] || category,
          amount: amount as number
        };
      })
      .filter(item => item.value > 0) // 0%인 카테고리 제외
      .map((item, index) => ({
        value: item.value,
        color: item.color,
        label: item.label
      })) : [
      { value: 65, color: '#3B82F6', label: '그린모빌리티' },
      { value: 25, color: '#10B981', label: '제로웨이스트' },
      { value: 10, color: '#F59E0B', label: '기타' },
    ];

  // 총 소비 금액
  const totalConsumptionAmount = consumptionSummary?.totalAmount || ecoConsumptionAnalysis?.totalAmount || 0;

  if (loading) {
    return <LoadingState message="카드 정보를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={`카드 정보를 불러올 수 없습니다: ${error}`} />;
  }

  return (
    <ScrollView 
      style={styles.cardsContent} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContentContainer}
    >
      {/* 사용자 카드 목록 */}
      {userCards.length > 0 ? (
        userCards.map((card, index) => {
          // 현재 월 표시
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const currentMonthText = `${currentYear}년 ${currentMonth.toString().padStart(2, '0')}월`;
          
          return (
            <View key={`card-${card.id || index}`} style={styles.cardSection}>
              <View style={styles.cardInfoContainer}>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardName}>{card.cardName}</Text>
                  <Text style={styles.cardNumber}>{card.cardNumber}</Text>
                  <View style={styles.currentMonthContainer}>
                    <Text style={styles.currentMonthText}>{currentMonthText}</Text>
                  </View>
                </View>
                <View style={styles.cardImageContainer}>
                  <Image
                    source={getCardImageSource(card.cardImageUrl)}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <NoDataState 
          title="가입한 상품이 없습니다"
          subtitle="친환경 라이프스타일에 맞는 카드를 추천해드려요"
        />
      )}

      {/* 카드가 없을 때만 추천 카드 표시 - 적금 스타일과 동일 */}
      {userCards.length === 0 && (
        <>
          {/* 추천 카드 섹션 */}
          <View style={styles.recommendSection}> 
            <Text style={styles.recommendTitle}>추천 카드</Text>
            <Text style={styles.recommendSubtitle}>친환경 라이프스타일에 맞는 특별한 혜택</Text>
          </View>
          <View style={styles.recommendList}>
            <Pressable style={styles.recommendCard} onPress={onNavigateToProducts}>
              <View style={styles.recommendTextBox}>
                <Text style={styles.recommendCardTitle}>하나 그린라이프 카드</Text>
                <Text style={styles.recommendCardSubtitle}>친환경 소비에{'\n'}최적화된 맞춤 혜택!</Text>
                <View style={styles.recommendCta}>
                  <Text style={styles.recommendCtaText}>→</Text>
                </View>
              </View>
              <Image source={getCardImageSource('hana_greenlife_card.png')} style={styles.recommendImage} resizeMode="contain" />
            </Pressable>
          </View>
        </>
      )}

      {/* 카드가 있을 때만 현재 선택된 혜택 표시 */}
      {/* {userCards.length > 0 && (
        <View style={styles.currentBenefitCard}>
          <View style={styles.currentBenefitHeader}>
            <View style={styles.currentBenefitTitleContainer}>
              <Text style={styles.currentBenefitLabel}>적용 혜택</Text>
              <Text style={styles.currentBenefitTitle}>
                {currentBenefitPackage ? `${currentBenefitPackage} 캐시백` : '친환경 생활 종합 혜택'}
              </Text>
            </View>
            <Pressable style={styles.changeBenefitButton} onPress={onShowBenefitChange}>
              <Text style={styles.changeBenefitText}>혜택 변경</Text>
            </Pressable>
          </View>
          {scheduledBenefitId && (
            <View style={styles.scheduledBanner}>
              <Text style={styles.scheduledBannerText}>
                다음달 적용 예정 혜택: {getBenefitTitle(scheduledBenefitId)}
              </Text>
              <Pressable style={styles.scheduledCancelButton} onPress={onCancelScheduledBenefit}>
                <Ionicons name="return-up-back-outline" size={18} color="#138072" />
              </Pressable>
            </View>
          )}
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.benefitScrollView}
            contentContainerStyle={styles.benefitScrollContent}
          >
            <View style={[styles.benefitItem, styles.benefitItemFirst]}>
              <Text style={styles.benefitEmoji}>🚗</Text>
              <Text style={styles.benefitItemText}>전기차</Text>
              <Text style={styles.benefitItemRate}>3%</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🚇</Text>
              <Text style={styles.benefitItemText}>대중교통</Text>
              <Text style={styles.benefitItemRate}>2%</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🚲</Text>
              <Text style={styles.benefitItemText}>공유킥보드</Text>
              <Text style={styles.benefitItemRate}>4%</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>♻️</Text>
              <Text style={styles.benefitItemText}>리필샵</Text>
              <Text style={styles.benefitItemRate}>4%</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>✅</Text>
              <Text style={styles.benefitItemText}>친환경브랜드</Text>
              <Text style={styles.benefitItemRate}>2%</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🔄</Text>
              <Text style={styles.benefitItemText}>중고거래</Text>
              <Text style={styles.benefitItemRate}>1.5%</Text>
            </View>
            
            <View style={[styles.benefitItem, styles.benefitItemLast]}>
              <Text style={styles.benefitEmoji}>🥗</Text>
              <Text style={styles.benefitItemText}>유기농식품</Text>
              <Text style={styles.benefitItemRate}>3%</Text>
            </View>
          </ScrollView>
        </View>
      )} */}

      {/* 카드가 있을 때만 이번달 친환경 소비 현황 표시 */}
      {userCards.length > 0 && (
        <View style={styles.consumptionChartSection}>
          <Text style={styles.consumptionChartTitle}>이번달 친환경 소비 현황</Text>
          <View style={styles.pieChartContainer}>
            <PieChart 
              data={pieChartData} 
              size={160 * SCALE} 
              strokeWidth={40 * SCALE}
              showCenterText={true}
              centerText={`${totalConsumptionAmount.toLocaleString()}원`}
              animated={true}
            />
            <View style={styles.chartLegend}>
              <Text style={styles.totalAmount}>{totalConsumptionAmount.toLocaleString()}원</Text>
              {pieChartData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label} {item.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 카드가 있을 때만 이번달 친환경 혜택 표시 */}
      {userCards.length > 0 && ecoBenefitsData && ecoBenefitsData.benefits && ecoBenefitsData.benefits.length > 0 && (
        <View style={styles.ecoBenefitsSection}>
          <View style={styles.ecoBenefitsHeader}>
            <Text style={styles.ecoBenefitsTitle}>이번달 친환경 가맹점 혜택</Text>
            <Pressable 
              style={styles.ecoBenefitsMoreButton}
              onPress={() => onShowEcoBenefitsDetail && onShowEcoBenefitsDetail()}
            >
              <Ionicons name="chevron-forward" size={24} color="#101827" />
            </Pressable>
          </View>
          <View style={styles.ecoBenefitsList}>
            {ecoBenefitsData.benefits.map((benefit: any, index: number) => (
              <View key={`eco-benefit-${index}`} style={styles.ecoBenefitItem}>
                <View style={styles.ecoBenefitIcon}>
                  <Image source={getEcoMerchantIconSource(benefit.icon)} style={styles.ecoBenefitIconImage} resizeMode="contain" />
                </View>
                <View style={styles.ecoBenefitInfo}>
                  <Text style={styles.ecoBenefitName}>{benefit.storeName}</Text>
                  <Text style={styles.ecoBenefitBenefitName}>{benefit.amount}</Text>
                </View>
                <View style={styles.ecoBenefitRight}>
                  <Text style={styles.ecoBenefitAmount}>+{benefit.additionalSeeds} 씨앗</Text>
                  <Text style={styles.ecoBenefitDate}>{benefit.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 카드가 있을 때만 친환경 가맹점 확인하기 버튼 표시 */}
      {userCards.length > 0 && (
        <EcoStoreButton onPress={() => {
          if ((global as any).openEcoMerchants) {
            (global as any).openEcoMerchants();
          }
        }} />
      )}

      {/* 카드가 있을 때만 이달의 추천 혜택 표시 */}
      {/* {userCards.length > 0 && (
        <View style={styles.recommendedBenefitSection}>
        <View style={styles.modernBenefitCard}>
          <View style={styles.modernBenefitHeader}>
            <Text style={styles.recommendedBenefitTitle}>이달의 추천 혜택</Text>
            <View style={styles.benefitIconCircle}>
              <Text style={styles.benefitMainEmoji}>🚲</Text>
            </View>
          </View> */}

          {/* 메인 콘텐츠 */}
          {/* <View style={styles.modernBenefitContent}>
            <View style={styles.titleWithBadgeRow}>
              <Text style={styles.modernBenefitName}>그린 모빌리티 캐시백</Text>
              <View style={styles.inlineBadge}>
                <Text style={styles.benefitBadgeText}>HOT</Text>
              </View>
            </View>
            <Text style={styles.modernBenefitDesc}>친환경 교통수단 이용시 최대 10% 캐시백</Text>
             */}
            {/* 통계 정보 */}
            {/* <View style={styles.benefitStatsContainer}>
              <View style={styles.benefitStatItem}>
                <Text style={styles.benefitStatValue}>326,000원</Text>
                <Text style={styles.benefitStatLabel}>지난달 그린 모빌리티 사용액</Text>
              </View>
              <View style={styles.benefitStatDivider} />
              <View style={styles.benefitStatItem}>
                <Text style={[styles.benefitStatValue, { color: '#10B981' }]}>+25,200원</Text>
                <Text style={styles.benefitStatLabel}>예상 추가 캐시백</Text>
              </View>
            </View>
          </View> */}

          {/* CTA 버튼 */}
          {/* <Pressable 
            style={styles.modernBenefitCTA} 
            onPress={() => onBenefitChange && onBenefitChange('green_mobility')}
          >
            <Text style={styles.modernBenefitCTAText}>이 혜택으로 변경하기</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
        </View>
      )} */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardsContent: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
  },
  scrollContentContainer: {
    paddingBottom: 100 * SCALE, // 하단 여백 추가
  },
  
  // 추천 섹션 스타일 (적금 탭과 동일)
  recommendSection: {
    marginTop: 20 * SCALE,
  },
  recommendTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8 * SCALE,
  },
  recommendSubtitle: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginTop: 2 * SCALE,
    marginLeft: 8 * SCALE,
  },
  recommendList: {
    gap: 12 * SCALE,
    marginTop: 8 * SCALE,
    marginBottom: 20 * SCALE,
  },
  recommendCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    padding: 20 * SCALE,
    minHeight: 140 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recommendTextBox: {
    maxWidth: '60%',
  },
  recommendCardTitle: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    marginBottom: 6 * SCALE,
  },
  recommendCardSubtitle: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24 * SCALE,
  },
  recommendCta: {
    marginTop: 12 * SCALE,
    width: 28 * SCALE,
    height: 28 * SCALE,
    borderRadius: 18 * SCALE,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendCtaText: {
    fontSize: 16 * SCALE,
    color: '#111827',
    fontWeight: '600',
  },
  recommendImage: {
    position: 'absolute',
    right: 2 * SCALE,
    bottom: 16 * SCALE,
    top: 12 * SCALE, // 이미지를 위로 올리기
    width: 120 * SCALE,
    height: 120 * SCALE,
    opacity: 0.9,
  },
  
  // 카드 섹션
  cardSection: {
    marginTop: 30 * SCALE,
    marginBottom: 20 * SCALE,
    paddingVertical: 8 * SCALE,
  },
  cardInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8 * SCALE,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardName: {
    fontSize: 24 * SCALE,
    fontWeight: '800',
    color: '#111827',
  },
  currentMonthContainer: {
    marginTop: 24 * SCALE,
    alignSelf: 'flex-start',
  },
  currentMonthText: {
    fontSize: 22 * SCALE,
    fontWeight: '600',
    color: '#0A594E',
  },
  cardNumber: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    marginTop: 4 * SCALE,
  },
  cardImageContainer: {
    width: 80 * SCALE,
    height: 50 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: 280 * SCALE,
    height: 150 * SCALE,
    borderRadius: 12 * SCALE,
    marginRight: 12 * SCALE,
    marginBottom: 8 * SCALE,
    // 카드 이미지 그림자 효과
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 추천 카드 섹션
  recommendedCardSection: {
    marginVertical: 24 * SCALE,
  },
  recommendedCardHeader: {
    marginBottom: 16 * SCALE,
  },
  recommendedCardTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  recommendedCardSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  recommendedCardItem: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recommendedCardImageContainer: {
    marginRight: 16 * SCALE,
  },
  recommendedCardImage: {
    width: 60 * SCALE,
    height: 40 * SCALE,
  },
  recommendedCardInfo: {
    flex: 1,
  },
  recommendedCardName: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  recommendedCardDescription: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 8 * SCALE,
  },
  recommendedCardTags: {
    flexDirection: 'row',
    gap: 4 * SCALE,
  },
  recommendedCardTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 4 * SCALE,
  },
  recommendedCardTagText: {
    fontSize: 10 * SCALE,
    color: '#065F46',
  },
  recommendedCardButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    borderRadius: 8 * SCALE,
  },
  recommendedCardButtonText: {
    color: 'white',
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },
  
  // 현재 혜택 카드
  currentBenefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 24 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentBenefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentBenefitTitleContainer: {
    flex: 1,
  },
  currentBenefitLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 4 * SCALE,
  },
  currentBenefitTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeBenefitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    backgroundColor: '#F0FDF4',
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  changeBenefitText: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: 'rgb(28, 161, 68)',
  },
  scheduledBanner: {
    marginTop: 8 * SCALE,
    backgroundColor: 'rgba(19, 128, 114, 0.08)',
    borderColor: '#138072',
    borderWidth: 1,
    borderRadius: 10 * SCALE,
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduledBannerText: {
    fontSize: 12 * SCALE,
    color: '#138072',
    fontWeight: '600',
  },
  scheduledCancelButton: {
    padding: 6 * SCALE,
    marginLeft: 8 * SCALE,
  },
  
  // 혜택 스크롤
  benefitScrollView: {
    marginTop: 16 * SCALE,
  },
  benefitScrollContent: {
    paddingLeft: 0,
    paddingRight: 4 * SCALE,
  },
  benefitItem: {
    alignItems: 'center',
    marginHorizontal: 4 * SCALE,
    minWidth: 80 * SCALE,
  },
  benefitEmoji: {
    fontSize: 32 * SCALE,
    marginBottom: 8 * SCALE,
  },
  benefitItemText: {
    fontSize: 12 * SCALE,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4 * SCALE,
  },
  benefitItemRate: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#10B981',
  },
  benefitItemFirst: {
    marginLeft: 0,
  },
  benefitItemLast: {
    marginRight: 0,
  },
  
  // 소비 현황 차트
  consumptionChartSection: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20 * SCALE,
  },
  consumptionChartTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 30 * SCALE,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: -20 * SCALE,
  },
  chartLegend: {
    flex: 1,
    marginLeft: 10 * SCALE,
  },
  totalAmount: {
    fontSize: 24 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12 * SCALE,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8 * SCALE,
  },
  legendColor: {
    width: 12 * SCALE,
    height: 12 * SCALE,
    borderRadius: 8 * SCALE,
    marginRight: 8 * SCALE,
  },
  legendText: {
    fontSize: 14 * SCALE,
    color: '#374151',
  },
  
  // 추천 혜택 섹션
  recommendedBenefitSection: {
    marginVertical: 24 * SCALE,
  },
  recommendedBenefitTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16 * SCALE,
  },
  modernBenefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 16 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  modernBenefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  benefitIconCircle: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    backgroundColor: '#F0FDF4',
    borderRadius: 28 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  benefitMainEmoji: {
    fontSize: 28 * SCALE,
  },
  modernBenefitContent: {
    marginBottom: 20 * SCALE,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * SCALE,
    marginBottom: 8 * SCALE,
  },
  modernBenefitName: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  inlineBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 4 * SCALE,
    borderRadius: 10 * SCALE,
  },
  benefitBadgeText: {
    color: '#FFFFFF',
    fontSize: 12 * SCALE,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modernBenefitDesc: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 20 * SCALE,
  },
  benefitStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    alignItems: 'center',
  },
  benefitStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  benefitStatValue: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  benefitStatLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  benefitStatDivider: {
    width: 1,
    height: 32 * SCALE,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16 * SCALE,
  },
  modernBenefitCTA: {
    backgroundColor: '#111827',
    borderRadius: 16 * SCALE,
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 24 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernBenefitCTAText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '700',
    marginRight: 8 * SCALE,
    letterSpacing: -0.2,
  },

  // 친환경 혜택 섹션
  ecoBenefitsSection: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20 * SCALE,
  },
  ecoBenefitsTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16 * SCALE,
  },
  ecoBenefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16 * SCALE,
  },
  ecoBenefitsMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6 * SCALE,
    borderRadius: 8 * SCALE,
  },
  ecoBenefitsList: {
    gap: 12 * SCALE,
  },
  ecoBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ecoBenefitIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  ecoBenefitIconImage: {
    width: 44 * SCALE,
    height: 44 * SCALE,
  },
  ecoBenefitInfo: {
    flex: 1,
  },
  ecoBenefitName: {
    fontSize: 16 * SCALE,
    color: '#111827',
    marginBottom: 2 * SCALE,
    fontWeight: '600',
  },
  ecoBenefitBenefitName: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 4 * SCALE,
  },
  ecoBenefitAmount: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2 * SCALE,
  },
  ecoBenefitRight: {
    alignItems: 'flex-end',
  },
  ecoBenefitDate: {
    fontSize: 12 * SCALE,
    color: '#9CA3AF',
  },
});
