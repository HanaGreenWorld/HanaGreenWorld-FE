import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Dimensions, Modal, Animated, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PointTransaction, FilterType, PeriodType, SortType } from '../types';
import { SCALE, IPHONE_WIDTH, COLORS } from '../utils/constants';
import { useEcoSeeds } from '../hooks/useEcoSeeds';

interface PointsHistoryScreenProps {
  onBack: () => void;
  onNavigateToSeedConversion?: () => void;
}

export default function PointsHistoryScreen({ onBack, onNavigateToSeedConversion }: PointsHistoryScreenProps) {
  const { ecoSeedInfo, getTransactionHistory, refreshProfile } = useEcoSeeds();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // 거래 내역 조회 - API에서 데이터 가져오기
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactionHistory(0, 50); // 최근 50건 조회
      
      // API 응답을 PointTransaction 형식으로 변환
      const convertedTransactions: PointTransaction[] = response.content.map((tx) => ({
        id: tx.transactionId.toString(),
        date: new Date(tx.occurredAt).toLocaleDateString('ko-KR'),
        time: new Date(tx.occurredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        description: tx.description,
        category: tx.categoryDisplayName, // 백엔드에서 받은 한글 카테고리명 사용
        points: tx.transactionType === 'EARN' ? tx.pointsAmount : -tx.pointsAmount,
        type: tx.transactionType === 'EARN' ? 'earn' : 'use',
        image: tx.categoryImageUrl ? { uri: tx.categoryImageUrl } : require('../../assets/hana3dIcon/hanaIcon3d_123.png'), // 백엔드에서 받은 이미지 URL 사용
        timestamp: new Date(tx.occurredAt).getTime(),
        balanceAfter: tx.balanceAfter, // 잔액 정보 추가
      }));
      
      setTransactions(convertedTransactions);
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
      // 에러 시 빈 배열로 설정
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 거래 내역 조회
  useEffect(() => {
    fetchTransactions();
  }, []);

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshProfile();
      fetchTransactions();
    };

    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();
  }, [refreshProfile]);

  // 새로고침 함수
  const handleRefresh = () => {
    fetchTransactions();
  };

  const filterByPeriod = (transactions: PointTransaction[]) => {
    if (periodType === 'all') return transactions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (periodType) {
      case 'today':
        return transactions.filter((t) => t.timestamp >= today.getTime());
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactions.filter((t) => t.timestamp >= weekAgo.getTime());
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactions.filter((t) => t.timestamp >= monthAgo.getTime());
      case '3months':
        const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        return transactions.filter((t) => t.timestamp >= threeMonthsAgo.getTime());
      default:
        return transactions;
    }
  };

  const sortTransactions = (transactions: PointTransaction[], sortType: SortType) => {
    switch (sortType) {
      case 'newest':
        return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return [...transactions].sort((a, b) => a.timestamp - b.timestamp);
      case 'highest':
        return [...transactions].sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
      case 'lowest':
        return [...transactions].sort((a, b) => Math.abs(a.points) - Math.abs(b.points));
      default:
        return transactions;
    }
  };

  const filteredTransactions = sortTransactions(
    filterByPeriod(transactions).filter((transaction) => {
      if (filterType === 'all') return true;
      return transaction.type === filterType;
    }),
    sortType,
  );

  // 실제 데이터베이스에서 가져온 값 사용
  const totalEarned = ecoSeedInfo.totalSeeds;
  const totalUsed = ecoSeedInfo.usedSeeds;

  const renderTransaction = ({ item, index }: { item: PointTransaction; index: number }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIconContainer}>
          {item.image ? (
            <Image source={item.image} style={styles.transactionImage} resizeMode="contain" />
          ) : (
            <Text style={styles.transactionIcon}>{item.icon}</Text>
          )}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionTime}>
            {item.date} {item.time}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionPoints,
            { color: item.type === 'earn' ? '#00A651' : '#FF6B6B' },
          ]}
        >
          {item.type === 'earn' ? '+' : '-'}
          {item.points.toLocaleString()}개
        </Text>
        {/* 잔액 정보 표시 */}
        {item.balanceAfter !== undefined && (
          <Text style={styles.transactionBalance}>
            {item.balanceAfter.toLocaleString()}개
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>해당 조건의 내역이 없습니다</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.primary, '#0D5F5A']}
          style={styles.headerBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>
            <Text style={styles.headerTitle}>원큐씨앗 내역</Text>
            <View style={styles.headerButtons}>
              <Pressable style={styles.headerButton} onPress={() => setShowPeriodModal(true)}>
                <Ionicons name="calendar" size={20} color="white" />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={() => setShowSortModal(true)}>
                <Ionicons name="filter" size={20} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="trending-up" size={16} color="#4ADE80" />
                <Text style={styles.summaryLabel}>총 적립</Text>
              </View>
              <Text style={styles.summaryValue}>+{totalEarned.toLocaleString()} 개</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="trending-down" size={16} color="#F87171" />
                <Text style={styles.summaryLabel}>총 사용</Text>
              </View>
              <Text style={styles.summaryValue}>-{totalUsed.toLocaleString()} 개</Text>
            </View>
          </View>

          {/* 현재 원큐씨앗 정보 */}
          <View style={styles.currentEcoSeedCard}>
            <View style={styles.currentEcoSeedHeader}>
              <View style={styles.currentEcoSeedLeft}>
                <Ionicons name="leaf" size={16} color="#10B981" />
                <Text style={styles.currentEcoSeedLabel}>현재 원큐씨앗</Text>
              </View>
              <Text style={styles.currentEcoSeedValue}>{ecoSeedInfo.currentSeeds.toLocaleString()} 개</Text>
            </View>
          </View>

          {/* 하나머니로 전환하기 버튼 */}
          <TouchableOpacity style={styles.hanaMoneyButton} onPress={onNavigateToSeedConversion}>
            <Image source={require('../../assets/hanamoney_logo.png')} style={styles.hanaMoneyLogo} />
            <Text style={styles.hanaMoneyText}>하나머니로 전환하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Info */}
      <View style={styles.filterInfo}>
        <View style={styles.filterInfoItem}>
          <Text style={styles.filterInfoLabel}>조회기간:</Text>
          <Text style={styles.filterInfoValue}>
            {periodOptions.find((p) => p.key === periodType)?.label}
          </Text>
        </View>
        <View style={styles.filterInfoItem}>
          <Text style={styles.filterInfoLabel}>정렬:</Text>
          <Text style={styles.filterInfoValue}>
            {sortOptions.find((s) => s.key === sortType)?.label}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: '전체' },
          { key: 'earn', label: '적립' },
          { key: 'use', label: '사용' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.filterTab, filterType === tab.key && styles.filterTabActive]}
            onPress={() => setFilterType(tab.key as FilterType)}
          >
            <Text style={[styles.filterTabText, filterType === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Transaction List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listCount}>총 {filteredTransactions.length}건</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>거래 내역을 불러오는 중입니다...</Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            style={styles.transactionsList}
            showsVerticalScrollIndicator={false}
            onRefresh={handleRefresh}
            refreshing={loading}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPeriodModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>조회기간 선택</Text>
            <View style={styles.modalOptions}>
              {periodOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.modalOption,
                    periodType === option.key && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setPeriodType(option.key as PeriodType);
                    setShowPeriodModal(false);
                  }}
                >
                  <Text style={styles.modalOptionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.modalOptionText,
                      periodType === option.key && styles.modalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Sort Selection Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>정렬 방식 선택</Text>
            <View style={styles.modalOptions}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.modalOption,
                    sortType === option.key && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setSortType(option.key as SortType);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={styles.modalOptionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.modalOptionText,
                      sortType === option.key && styles.modalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const periodOptions = [
  { key: 'today', label: '오늘', icon: '📅' },
  { key: 'week', label: '1주일', icon: '📆' },
  { key: 'month', label: '1개월', icon: '🗓️' },
  { key: '3months', label: '3개월', icon: '📊' },
  { key: 'all', label: '전체', icon: '🔍' },
];

const sortOptions = [
  { key: 'newest', label: '최신순', icon: '⬇️' },
  { key: 'oldest', label: '오래된순', icon: '⬆️' },
  { key: 'highest', label: '포인트 높은순', icon: '📈' },
  { key: 'lowest', label: '포인트 낮은순', icon: '📉' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    position: 'relative',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  currentEcoSeedCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: 16,
  },
  currentEcoSeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentEcoSeedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentEcoSeedLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  currentEcoSeedValue: {
    fontSize: 20, // 24 * 1.2
    fontWeight: 'bold',
    color: 'white',
  },
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  filterInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterInfoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterTabs: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabIcon: {
    fontSize: 13,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  listCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionsList: {
    flex: 1,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  transactionIconContainer: {
    // width: 48,
    // height: 48,
    // backgroundColor: '#F9FAFB',
    // borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionImage: {
    width: 42,
    height: 42,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionBalance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
  },
  modalHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  modalOptions: {
    gap: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalOptionIcon: {
    fontSize: 16,
  },
  modalOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  modalOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  hanaMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hanaMoneyLogo: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  hanaMoneyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
}); 