import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';
import TopBar from '../components/TopBar';
import { useCardData } from '../hooks/useCardData';
import { useUser } from '../hooks/useUser';

const { width } = Dimensions.get('window');

interface EcoBenefitsDetailScreenProps {
  onBack: () => void;
  onHome?: () => void;
}

export function EcoBenefitsDetailScreen({ onBack, onHome }: EcoBenefitsDetailScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  // 사용자 정보 가져오기
  const { userInfo } = useUser();
  
  // 카드 데이터 훅 사용
  const { 
    ecoBenefits,
    getEcoBenefits,
    loading: cardLoading, 
    error: cardError 
  } = useCardData(userInfo?.id || 0);

  // 데이터 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getEcoBenefits();
    } catch (error) {
      console.error('친환경 혜택 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    getEcoBenefits().catch(err => {
      console.error('친환경 혜택 로드 실패:', err);
    });
  }, [getEcoBenefits]);

  // 친환경 혜택 데이터 처리 (카테고리별 아이콘 매핑)
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'ECO_FOOD':
        return require('../../assets/hana3dIcon/hanaIcon3d_105.png');
      case 'PUBLIC_TRANSPORT':
        return require('../../assets/hana3dIcon/hanaIcon3d_107.png');
      case 'ECO_BRAND':
        return require('../../assets/hana3dIcon/hanaIcon3d_101.png');
      case 'SECOND_HAND':
        return require('../../assets/hana3dIcon/hanaIcon3d_103.png');
      case 'ORGANIC_FOOD':
        return require('../../assets/hana3dIcon/hanaIcon3d_11.png');
      default:
        return require('../../assets/hana3dIcon/hanaIcon3d_105.png');
    }
  };

  const ecoBenefitsData = ecoBenefits && ecoBenefits.benefits ? 
    ecoBenefits.benefits.map((benefit: any, index: number) => ({
      id: `${index + 1}`,
      storeName: benefit.storeName,
      type: benefit.type,
      amount: benefit.amount,
      date: benefit.date,
      cardNumber: benefit.cardNumber,
      icon: getCategoryIcon(benefit.type)
    })) : [];

  // 총 혜택 금액 계산
  const totalBenefits = ecoBenefitsData.reduce((sum: number, benefit: any) => sum + (benefit.amount || 0), 0);

  return (
    <View style={styles.container}>
      <TopBar
        title="친환경 가맹점 혜택"
        onBack={onBack}
        onHome={onHome}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <View style={styles.headerCard}>
            <View style={styles.headerIconContainer}>
              <Image 
                source={require('../../assets/hana3dIcon/hanaIcon3d_85.png')} 
                style={styles.headerIcon} 
                resizeMode="contain" 
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>이번달 친환경 혜택</Text>
              <Text style={styles.headerSubtitle}>친환경 가맹점에서 받은 혜택 내역</Text>
            </View>
          </View>
        </View>

        {/* 통계 섹션 */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalBenefits.toLocaleString()}원</Text>
              <Text style={styles.statLabel}>총 혜택 금액</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{ecoBenefitsData.length}건</Text>
              <Text style={styles.statLabel}>혜택 건수</Text>
            </View>
          </View>
        </View>

        {/* 혜택 내역 섹션 */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>혜택 내역</Text>
            <Text style={styles.sectionSubtitle}>친환경 가맹점에서 받은 혜택</Text>
          </View>

          {/* 로딩 상태 */}
          {cardLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>혜택 정보를 불러오는 중...</Text>
            </View>
          )}

          {/* 에러 상태 */}
          {cardError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>혜택 정보를 불러올 수 없습니다: {cardError}</Text>
            </View>
          )}

          {/* 혜택 리스트 */}
          {ecoBenefitsData.length > 0 ? (
            <View style={styles.benefitsList}>
              {ecoBenefitsData.map((benefit: any, index: number) => (
                <View key={benefit.id} style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Image source={benefit.icon} style={styles.benefitIconImage} resizeMode="contain" />
                  </View>
                  <View style={styles.benefitInfo}>
                    <Text style={styles.benefitStoreName}>{benefit.storeName}</Text>
                    <Text style={styles.benefitDate}>{benefit.date}</Text>
                    <Text style={styles.benefitCardNumber}>****{benefit.cardNumber}</Text>
                  </View>
                  <View style={styles.benefitAmountContainer}>
                    <Text style={styles.benefitAmount}>+{benefit.amount.toLocaleString()}원</Text>
                    <View style={styles.benefitTypeBadge}>
                      <Text style={styles.benefitTypeText}>친환경</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={require('../../assets/hana3dIcon/hanaIcon3d_85.png')} 
                style={styles.emptyIcon} 
                resizeMode="contain" 
              />
              <Text style={styles.emptyTitle}>아직 친환경 혜택이 없어요</Text>
              <Text style={styles.emptySubtitle}>친환경 가맹점에서 결제하면 혜택을 받을 수 있어요!</Text>
            </View>
          )}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    padding: 20 * SCALE,
    paddingBottom: 10 * SCALE,
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIconContainer: {
    width: 60 * SCALE,
    height: 60 * SCALE,
    borderRadius: 30 * SCALE,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16 * SCALE,
  },
  headerIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  headerSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  statsSection: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24 * SCALE,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4 * SCALE,
  },
  statLabel: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20 * SCALE,
  },
  benefitsSection: {
    paddingHorizontal: 20 * SCALE,
  },
  sectionHeader: {
    marginBottom: 16 * SCALE,
  },
  sectionTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  sectionSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 40 * SCALE,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14 * SCALE,
    color: '#EF4444',
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12 * SCALE,
  },
  benefitItem: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    borderRadius: 24 * SCALE,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12 * SCALE,
  },
  benefitIconImage: {
    width: 28 * SCALE,
    height: 28 * SCALE,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitStoreName: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  benefitDate: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    marginBottom: 2 * SCALE,
  },
  benefitCardNumber: {
    fontSize: 12 * SCALE,
    color: '#9CA3AF',
  },
  benefitAmountContainer: {
    alignItems: 'flex-end',
  },
  benefitAmount: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4 * SCALE,
  },
  benefitTypeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 6 * SCALE,
  },
  benefitTypeText: {
    fontSize: 10 * SCALE,
    fontWeight: '600',
    color: '#166534',
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 40 * SCALE,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    marginBottom: 16 * SCALE,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8 * SCALE,
  },
  emptySubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },
  bottomSpacer: {
    height: 40 * SCALE,
  },
});
