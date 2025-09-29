import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SCALE, RECOMMENDED_SAVINGS } from '../../utils/constants';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { NoDataState } from '../NoDataState';

interface SavingsAccount {
  accountNumber: string;
  productName: string;
  balance: number;
  maturityDate: string;
  baseRate: number;
  preferentialRate: number;
  interestRate: number;
  openDate: string;
}

interface SavingsTabProps {
  savingsAccounts: SavingsAccount[];
  loading: boolean;
  error: string | null;
  onNavigateToSavings?: () => void;
  onShowEarthSavingsDetail?: () => void;
}

export const SavingsTab: React.FC<SavingsTabProps> = ({
  savingsAccounts,
  loading,
  error,
  onNavigateToSavings,
  onShowEarthSavingsDetail
}) => {
  // 디버깅 로그 추가
  console.log('🏦 SavingsTab 렌더링:', {
    savingsAccounts,
    loading,
    error,
    accountsLength: savingsAccounts?.length || 0,
    hasAccounts: savingsAccounts && savingsAccounts.length > 0
  });

  const getSavingsProgress = (startDate: string, maturityDate: string) => {
    if (!startDate || !maturityDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(maturityDate).getTime();
    const now = Date.now();
    if (isNaN(start) || isNaN(end)) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  if (loading) {
    console.log('🏦 SavingsTab: 로딩 중...');
    return <LoadingState message="적금 계좌 정보를 불러오는 중..." />;
  }

  if (error) {
    console.log('🏦 SavingsTab: 에러 발생:', error);
    return <ErrorState message={error} />;
  }

  console.log('🏦 SavingsTab: 데이터 확인 - accountsLength:', savingsAccounts?.length);

  const hasAccounts = Array.isArray(savingsAccounts) && savingsAccounts.length > 0;

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>하나그린적금</Text>
        <Text style={styles.sectionSubtitle}>지구도 살리고 내 통장도 불려요</Text>
      </View>

      {hasAccounts ? (
        savingsAccounts.map((account, index) => (
          <View key={`savings_${index}`} style={styles.earthCard}>
            <View style={styles.earthCardHeaderRow}>
              <Text style={styles.earthCardTitle}>{account.productName}</Text>
              <Text style={styles.earthCardAccount}>{account.accountNumber}</Text>
            </View>
            <View style={styles.earthCardDivider} />
            <View style={styles.earthInfoRow}>
              <Text style={styles.earthInfoLabel}>잔액</Text>
              <Text style={styles.earthInfoValue}>{(account.balance || 0).toLocaleString()}원</Text>
            </View>
            <View style={styles.earthInfoRow}>
              <Text style={styles.earthInfoLabel}>만기일</Text>
              <Text style={styles.earthInfoValue}>
                {account.maturityDate ? 
                  new Date(account.maturityDate).toLocaleDateString('ko-KR') : 
                  '정보 없음'
                }
              </Text>
            </View>
            <View style={styles.earthRateGroup}>
              <Text style={styles.earthRateHeader}>적용이율(연)</Text>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>기본금리</Text>
                <Text style={styles.earthRateValue}>
                  <Text style={styles.earthRateValueNum}>{(account.baseRate || 0).toFixed(2)}</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>우대금리</Text>
                <Text style={styles.earthRateValue}>
                  <Text style={[styles.earthRateValueNum, { color: '#10B981' }]}>{(account.preferentialRate || 0).toFixed(2)}</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>적용금리</Text>
                <Text style={styles.earthRateValue}>
                  <Text style={styles.earthRateValueNum}>{(account.interestRate || 0).toFixed(2)}</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${getSavingsProgress(account.openDate || account.maturityDate, account.maturityDate)}%` }
                ]} />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  만기까지 {getSavingsProgress(account.openDate || account.maturityDate, account.maturityDate)}% 진행
                </Text>
              </View>
            </View>
            <Pressable style={styles.detailButton} onPress={onShowEarthSavingsDetail}>
              <Text style={styles.detailButtonText}>자세히 보기</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <NoDataState 
          title="보유하신 적금이 없습니다"
          subtitle="하나은행의 친환경 적금으로 친환경 투자를 시작해보세요"
        />
      )}

      {/* 추천 적금 섹션 - 항상 표시 */}
      <View style={styles.recommendSection}> 
        <Text style={styles.recommendTitle}>신규 출시 적금</Text>
        <Text style={styles.recommendSubtitle}>그린 라이프에 맞춘 특별한 금리</Text>
      </View>
      <View style={styles.recommendList}>
        {RECOMMENDED_SAVINGS.map((item: any) => (
          <Pressable key={item.id} style={styles.recommendCard} onPress={onNavigateToSavings}>
            <View style={styles.recommendTextBox}>
              <Text style={styles.recommendCardTitle}>{item.name}</Text>
              <Text style={styles.recommendCardSubtitle}>더 푸르게 더 깨끗하게{"\n"}환경은 하나</Text>
              <View style={styles.recommendCta}>
                <Text style={styles.recommendCtaText}>→</Text>
              </View>
            </View>
            <Image source={require('../../../assets/expert.png')} style={styles.recommendImage} resizeMode="contain" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
    paddingTop: 8 * SCALE,
  },
  
  // 섹션 헤더
  sectionHeader: {
    marginVertical: 16 * SCALE,
  },
  sectionTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  sectionSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  
  // 데이터 카드 공통 스타일
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  cardAccount: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8 * SCALE,
  },
  
  // 정보 행
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6 * SCALE,
  },
  infoLabel: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14 * SCALE,
    color: '#111827',
    fontWeight: '600',
  },
  
  // 금리 정보
  rateGroup: {
    marginTop: 6 * SCALE,
    gap: 6 * SCALE,
  },
  rateHeader: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginLeft: 4 * SCALE,
  },
  rateValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rateValueNum: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#111827',
  },
  rateValueUnit: {
    fontSize: 12 * SCALE,
    color: '#111827',
    marginLeft: 2 * SCALE,
  },
  
  // 진행률 바
  progressSection: {
    marginTop: 8 * SCALE,
    marginBottom: 16 * SCALE,
  },
  progressBar: {
    height: 4 * SCALE,
    backgroundColor: '#E5E7EB',
    borderRadius: 2 * SCALE,
    marginBottom: 8 * SCALE,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2 * SCALE,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 12 * SCALE,
    color: '#10B981',
    fontWeight: '600',
  },
  
  // 버튼
  detailButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    borderRadius: 10 * SCALE,
  },
  detailButtonText: {
    fontSize: 12 * SCALE,
    color: '#374151',
    fontWeight: '600',
  },
  
  // 추천 섹션
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
    right: 16 * SCALE,
    bottom: 16 * SCALE,
    width: 100 * SCALE,
    height: 100 * SCALE,
    opacity: 0.9,
  },
  
  // 원본 스타일 추가
  earthCard: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
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
  
  // 빈 상태 스타일
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40 * SCALE,
    paddingHorizontal: 20 * SCALE,
    backgroundColor: '#F8FAFC',
    borderRadius: 16 * SCALE,
    marginHorizontal: 4 * SCALE,
    marginBottom: 16 * SCALE,
    // 3D 효과
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8 * SCALE,
  },
  emptyStateSubtitle: {
    fontSize: 16 * SCALE,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4 * SCALE,
  },
  emptyStateButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24 * SCALE,
    paddingVertical: 12 * SCALE,
    borderRadius: 8 * SCALE,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14 * SCALE,
    fontWeight: '600',
  },
});
