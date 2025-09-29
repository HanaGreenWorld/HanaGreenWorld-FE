import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../../utils/constants';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { NoDataState } from '../NoDataState';

interface LoanAccount {
  accountNumber: string;
  productName: string;
  loanAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  baseRate?: number;
  preferentialRate?: number;
  loanType: string;
}

interface BondsTabProps {
  loanAccounts: LoanAccount[];
  loading: boolean;
  error: string | null;
}

export const BondsTab: React.FC<BondsTabProps> = ({
  loanAccounts,
  loading,
  error
}) => {
  // 디버깅 로그 추가
  console.log('🏦 BondsTab 렌더링:', {
    loanAccounts,
    loading,
    error,
    accountsLength: loanAccounts?.length || 0,
    hasLoanAccounts: loanAccounts && loanAccounts.length > 0
  });

  if (loading) {
    return <LoadingState message="대출 계좌 정보를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const hasLoanAccounts = Array.isArray(loanAccounts) && loanAccounts.length > 0;

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>하나그린대출</Text>
        <Text style={styles.sectionSubtitle}>친환경 라이프를 위한 특별한 금리 혜택</Text>
      </View>

      {hasLoanAccounts ? (
        loanAccounts.slice(0, 1).map((loan, index) => (
          <View key={`loan_${index}`} style={styles.earthCard}>
            <View style={styles.earthCardHeaderRow}>
              <Text style={styles.earthCardTitle}>{loan.productName}</Text>
              <Text style={styles.earthCardAccount}>{loan.accountNumber}</Text>
            </View>
            <View style={styles.earthCardDivider} />
            <View style={styles.earthInfoRow}>
              <Text style={styles.earthInfoLabel}>대출금액</Text>
              <Text style={styles.earthInfoValue}>{(loan.loanAmount || 0).toLocaleString()}원</Text>
            </View>
            <View style={styles.earthInfoRow}>
              <Text style={styles.earthInfoLabel}>잔여원금</Text>
              <Text style={styles.earthInfoValue}>{(loan.remainingAmount || 0).toLocaleString()}원</Text>
            </View>
            <View style={styles.earthInfoRow}>
              <Text style={styles.earthInfoLabel}>월 상환금</Text>
              <Text style={styles.earthInfoValue}>{(loan.monthlyPayment || 0).toLocaleString()}원</Text>
            </View>
            
            {/* 금리 정보 */}
            <View style={styles.earthRateGroup}>
              <Text style={styles.earthRateHeader}>대출 금리</Text>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>기본금리</Text>
                <Text style={styles.earthRateValue}>
                  <Text style={styles.earthRateValueNum}>{(loan.baseRate || 4.00).toFixed(2)}</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>우대금리</Text>
                <Text style={styles.earthRateValue}>
                  <Text style={[styles.earthRateValueNum, { color: '#10B981' }]}>{(loan.preferentialRate || -0.50).toFixed(2)}</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
              <View style={styles.earthRateRow}>
                <Text style={styles.earthRateLabel}>적용금리</Text>
                <Text style={styles.earthRateValue}>
                  <Text style={styles.earthRateValueNum}>{(loan.interestRate || 0).toFixed(2)}</Text>
                  <Text style={styles.earthRateValueUnit}>%</Text>
                </Text>
              </View>
            </View>
            
            {/* 상환 진행률 */}
            <View style={[styles.savingsProgressSection, { marginTop: 8 * SCALE }]}>
              <View style={styles.savingsProgressBar}>
                <View style={[styles.savingsProgressFill, { width: `${((((loan.loanAmount || 0) - (loan.remainingAmount || 0)) / (loan.loanAmount || 1)) * 100)}%` }]} />
              </View>
              <View style={styles.savingsProgressInfo}>
                <Text style={styles.savingsProgressText}>상환 진행률 {((((loan.loanAmount || 0) - (loan.remainingAmount || 0)) / (loan.loanAmount || 1)) * 100).toFixed(0)}%</Text>
              </View>
            </View>
            
            <Pressable style={styles.earthDetailBtn} onPress={() => {}}>
              <Text style={styles.earthDetailBtnText}>자세히 보기</Text>
            </Pressable>
          </View>
        ))
      )  : (
        <NoDataState 
          title="보유하신 대출 상품이 없습니다"
          subtitle="하나은행의 다양한 친환경 대출 상품을 확인해보세요!"
        />
      )}

      {/* 하나솔라론 추천 섹션 - 항상 표시 */}
      <View style={styles.recommendSection}> 
        <Text style={styles.recommendTitle}>태양광 발전소를 건설하는{'\n'}발전사업자라면?</Text>
      </View>
      <View style={styles.recommendList}>
        <Pressable style={styles.recommendCard} onPress={() => {
          // 하나솔라론 페이지로 이동 (실제 태양광 대출 상품 페이지)
          Linking.openURL('https://www.kebhana.com/');
        }}>
          <View style={styles.recommendTextBox}>
            <Text style={styles.recommendCardTitle}>하나솔라론</Text>
            <Text style={styles.recommendCardSubtitle}>친환경 에너지 사업을 위한 특별한 금리</Text>
            <View style={styles.recommendCta}>
              <Text style={styles.recommendCtaText}>→</Text>
            </View>
          </View>
          <Image source={require('../../../assets/solar_panel.png')} style={styles.recommendImage} resizeMode="contain" />
        </Pressable>
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
  
  // 지구 카드 스타일 (원래 디자인)
  earthCard: {
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
  
  // 정보 행
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
  
  // 금리 정보
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
  
  // 상환 진행률
  savingsProgressSection: {
    marginTop: 8 * SCALE,
    marginBottom: 16 * SCALE,
  },
  savingsProgressBar: {
    height: 4 * SCALE,
    backgroundColor: '#E5E7EB',
    borderRadius: 2 * SCALE,
    marginBottom: 8 * SCALE,
  },
  savingsProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2 * SCALE,
  },
  savingsProgressInfo: {
    alignItems: 'flex-end',
  },
  savingsProgressText: {
    fontSize: 12 * SCALE,
    color: '#10B981',
    fontWeight: '600',
  },
  
  // 버튼
  earthDetailBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    borderRadius: 10 * SCALE,
  },
  earthDetailBtnText: {
    fontSize: 12 * SCALE,
    color: '#374151',
    fontWeight: '600',
  },
  
  // 추천 섹션 (적금 탭 스타일)
  recommendSection: {
    marginTop: 20 * SCALE,
  },
  recommendTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 17 * SCALE,
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
  },
  recommendImage: {
    width: 100 * SCALE,
    height: 120 * SCALE,
    marginTop: -20 * SCALE,
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
});
