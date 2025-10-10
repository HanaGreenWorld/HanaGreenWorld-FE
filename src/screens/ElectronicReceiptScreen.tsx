import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import TopBar from '../components/TopBar';
import { SCALE, COLORS } from '../utils/constants';
import * as Ionicons from '@expo/vector-icons';
import { useElectronicReceipts } from '../hooks/useElectronicReceipts';

interface Props {
  onBack?: () => void;
  onHome?: () => void;
  onOpenCarbonGuide?: () => void;
}

export default function ElectronicReceiptScreen({ onBack, onHome, onOpenCarbonGuide }: Props) {
  const { records, stats, loading, error } = useElectronicReceipts();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '입금 확인증';
      case 'PAYMENT':
        return '지급 확인증';
      case 'MATURITY_RENEWAL':
        return '만기갱신 확인증';
      case 'CANCELLATION':
        return '해지 확인증';
      default:
        return '영업점 거래 확인증';
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="전자확인증" onBack={onBack} onHome={onHome} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 문구 */}
        <View style={styles.noticeBox}>
          <Text style={styles.bullet}>{'• '}
            <Text style={styles.noticeText}>영업점 거래 확인증, 계산서 등을 전자확인증으로 제공해드립니다.</Text>
          </Text>
          <Text style={styles.bullet}>{'• '}
            <Text style={styles.noticeText}>제 3자 앞 거래 증빙용으로 제공 및 사용 불가</Text>
          </Text>
          <Text style={styles.bullet}>{'• '}
            <Text style={styles.noticeText}>전자확인증은 정상거래 완료 후 6개월간 확인 가능합니다. (취소, 정정거래 제외)</Text>
          </Text>
        </View>

        {/* 로딩 상태 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>전자확인증 데이터를 불러오는 중...</Text>
          </View>
        )}

        {/* 에러 상태 */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons.Ionicons name="alert-circle-outline" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 필터 (목업) */}
        <View style={styles.filters}>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>전체</Text>
            <Ionicons.Ionicons name="chevron-down" size={16 * SCALE} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>1주일</Text>
            <Ionicons.Ionicons name="chevron-down" size={16 * SCALE} color="#6B7280" />
          </Pressable>
        </View>

        {/* 전자확인증 목록 */}
        {!loading && !error && records.length > 0 && (
          <View style={styles.receiptsContainer}>
            {records.map((record) => (
              <View key={record.recordId} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconWrap}>
                    <Image source={require('../../assets/hana3dIcon/hanaIcon3d_85.png')} style={styles.icon} resizeMode="contain" />
                  </View>
                </View>
                <View style={styles.cardCenter}>
                  <Text style={styles.cardTitle}>{getTransactionTypeText(record.transactionType)}</Text>
                  <Text style={styles.cardMeta}>하나은행 · {record.branchName || '영업점'}</Text>
                  <Text style={styles.cardDate}>{formatDate(record.receiptDate)}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.seedPlus}>+{record.pointsEarned || 3}</Text>
                  <Text style={styles.seedUnit}>씨앗</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 데이터가 없는 경우 */}
        {!loading && !error && records.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons.Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>아직 발급된 전자확인증이 없습니다.</Text>
            <Text style={styles.emptySubText}>하나은행에서 전자확인증을 발급받으면 자동으로 적립됩니다.</Text>
          </View>
        )}

        {/* 탄소중립포인트 배너 */}
        {onOpenCarbonGuide && (
          <Pressable style={styles.cpBanner} onPress={onOpenCarbonGuide}>
            <View style={styles.cpBannerLeft}>
              <Image source={require('../../assets/hana3dIcon/zero_waste.png')} style={styles.cpIcon} resizeMode="contain" />
              <View style={styles.cpCoinWrap}>
                <Text style={styles.cpCoinText}>P</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cpHash}>#탄소중립포인트</Text>
              <Text style={styles.cpTitle}>포인트를 적립해 보세요!</Text>
            </View>
          </Pressable>
        )}

        <View style={{ height: 60 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20 * SCALE },
  noticeBox: { backgroundColor: '#F9FAFB', borderRadius: 12 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 * SCALE },
  bullet: { fontSize: 12 * SCALE, color: '#6B7280', marginBottom: 6 * SCALE },
  noticeText: { fontSize: 12 * SCALE, color: '#6B7280' },
  
  // 통계 정보
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 16 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4 * SCALE,
  },
  statLabel: {
    fontSize: 12 * SCALE,
    color: '#666666',
  },
  
  // 로딩/에러 상태
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40 * SCALE,
  },
  loadingText: {
    marginTop: 12 * SCALE,
    fontSize: 14 * SCALE,
    color: '#666666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16 * SCALE,
    borderRadius: 8 * SCALE,
    marginVertical: 16 * SCALE,
  },
  errorText: {
    marginLeft: 8 * SCALE,
    fontSize: 14 * SCALE,
    color: '#D32F2F',
    flex: 1,
  },
  
  // 빈 상태
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60 * SCALE,
  },
  emptyText: {
    fontSize: 16 * SCALE,
    color: '#666666',
    marginTop: 16 * SCALE,
    marginBottom: 8 * SCALE,
  },
  emptySubText: {
    fontSize: 14 * SCALE,
    color: '#999999',
    textAlign: 'center',
  },
  
  filters: { flexDirection: 'row', gap: 12 * SCALE, marginBottom: 16 * SCALE },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, paddingHorizontal: 14 * SCALE, paddingVertical: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  dropdownText: { fontSize: 14 * SCALE, color: '#111827' },

  receiptsContainer: {
    marginBottom: 20 * SCALE,
  },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 * SCALE, marginBottom: 12 * SCALE },
  cardLeft: { marginRight: 12 * SCALE },
  iconWrap: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 20 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  icon: { width: 24 * SCALE, height: 24 * SCALE },
  cardCenter: { flex: 1 },
  cardTitle: { fontSize: 14 * SCALE, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 2 * SCALE },
  cardDate: { fontSize: 11 * SCALE, color: '#9CA3AF', marginTop: 2 * SCALE },
  cardRight: { alignItems: 'flex-end', minWidth: 50 * SCALE },
  seedPlus: { fontSize: 16 * SCALE, color: '#10B981', fontWeight: '800' },
  seedUnit: { fontSize: 11 * SCALE, color: '#10B981', marginTop: 2 * SCALE },

  // Carbon-neutral point banner
  cpBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 18 * SCALE, padding: 16 * SCALE, marginTop: 32 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  cpBannerLeft: { flexDirection: 'row', alignItems: 'center', marginRight: 12 * SCALE },
  cpIcon: { width: 32 * SCALE, height: 32 * SCALE },
  cpCoinWrap: { width: 22 * SCALE, height: 22 * SCALE, borderRadius: 11 * SCALE, backgroundColor: '#FCD34D', alignItems: 'center', justifyContent: 'center', marginLeft: -8 * SCALE, borderWidth: 2, borderColor: '#FFF' },
  cpCoinText: { fontSize: 12 * SCALE, fontWeight: '800', color: '#111827' },
  cpHash: { fontSize: 12 * SCALE, color: '#6B7280', marginBottom: 2 * SCALE },
  cpTitle: { fontSize: 16 * SCALE, color: '#111827', fontWeight: '800' },
});