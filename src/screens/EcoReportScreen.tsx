import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import { PieChart } from '../components/PieChart';
import { fetchEcoReports, fetchCurrentMonthReport, EcoReport as ApiEcoReport } from '../utils/ecoReportApi';

// API EcoReport 타입을 직접 사용
export type EcoReport = ApiEcoReport;

interface EcoReportScreenProps {
  onBack?: () => void;
  onHome?: () => void;
  onOpenDetail: (report: EcoReport) => void;
}

export default function EcoReportScreen({ onBack, onHome, onOpenDetail }: EcoReportScreenProps) {
  const [reports, setReports] = useState<EcoReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiReports = await fetchEcoReports();
      setReports(apiReports);
    } catch (err) {
      console.error('리포트 로딩 실패:', err);
      setError('리포트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // API 데이터를 직접 사용하므로 변환 함수 제거
  const safeNumber = (value: number | undefined | null, fallback = 0): number => {
    return isNaN(value as number) || value == null ? fallback : (value as number);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="친환경 리포트" onBack={onBack} onHome={onHome} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>리포트를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopBar title="친환경 리포트" onBack={onBack} onHome={onHome} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadReports}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar title="친환경 리포트" onBack={onBack} onHome={onHome} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 생성된 리포트가 없습니다.</Text>
          <Text style={styles.emptySubText}>친환경 활동을 시작해보세요!</Text>
        </View>
      </View>
    );
  }

  const latest = reports[0];
  const rest = reports.slice(1);

  return (
    <View style={styles.container}>
      <TopBar title="친환경 리포트" onBack={onBack} onHome={onHome} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 최신 리포트 상세 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{latest.reportMonth} 친환경 리포트</Text>
          
          {/* 레벨 정보 */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>현재 레벨: {latest.summary.currentLevel}</Text>
            <Text style={styles.progressText}>진행률: {safeNumber(latest.summary.levelProgress)}%</Text>
            <Text style={styles.pointsText}>다음 레벨까지 {safeNumber(latest.summary.pointsToNextLevel)} 포인트</Text>
          </View>

          {/* 요약 통계 */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>원큐씨앗</Text>
              <Text style={styles.summaryValue}>{safeNumber(latest.statistics.totalSeeds).toLocaleString()}개</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>탄소절감</Text>
              <Text style={styles.summaryValue}>{safeNumber(latest.statistics.totalCarbonKg)}kg</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>활동 횟수</Text>
              <Text style={styles.summaryValue}>{safeNumber(latest.statistics.totalActivities)}회</Text>
            </View>
          </View>
          <Text style={styles.topActivityMessage}>
            {latest.summary.topActivityMessage || `가장 많이 한 활동: ${latest.summary.topActivity}`} 🌱
          </Text>

          {/* 활동 분석 차트 */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>활동 분석</Text>
            <View style={styles.chartRow}>
              <PieChart 
                data={latest.activities.map(activity => ({
                  label: activity.label,
                  value: safeNumber(activity.countPercentage),
                  color: activity.color,
                }))} 
                size={160 * SCALE} 
                strokeWidth={40 * SCALE} 
              />
              <View style={styles.chartLegend}>
                {latest.activities.map((a) => (
                  <View key={a.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: a.color }]} />
                    <Text style={styles.legendText}>{a.label}: {safeNumber(a.countPercentage)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 금융 혜택 */}
          <View style={styles.benefitSection}>
            <Text style={styles.sectionTitle}>금융 혜택</Text>
            <View style={styles.benefitRow}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitLabel}>적금 우대금리</Text>
                <Text style={styles.benefitValue}>+{safeNumber(latest.financialBenefit.savingsInterest).toLocaleString()}원</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitLabel}>카드 할인</Text>
                <Text style={styles.benefitValue}>+{safeNumber(latest.financialBenefit.cardDiscount).toLocaleString()}원</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitLabel}>대출 혜택</Text>
                <Text style={styles.benefitValue}>+{safeNumber(latest.financialBenefit.loanBenefit).toLocaleString()}원</Text>
              </View>
            </View>
            <Text style={styles.benefitTotal}>총 혜택: {safeNumber(latest.financialBenefit.total).toLocaleString()}원</Text>
          </View>

          {/* 커뮤니티 랭킹 */}
          <View style={styles.rankingSection}>
            <Text style={styles.sectionTitle}>커뮤니티 랭킹</Text>
            <View style={styles.rankingContainer}>
              <View style={styles.rankingItem}>
                <Text style={styles.rankingLabel}>전국 상위</Text>
                <Text style={styles.rankingValue}>{safeNumber(latest.ranking.percentile)}%</Text>
              </View>
              <View style={styles.rankingItem}>
                <Text style={styles.rankingLabel}>랭킹</Text>
                <Text style={styles.rankingValue}>{safeNumber(latest.ranking.rank).toLocaleString()}위</Text>
              </View>
              <View style={styles.rankingItem}>
                <Text style={styles.rankingLabel}>전체 사용자</Text>
                <Text style={styles.rankingValue}>{safeNumber(latest.ranking.totalUsers).toLocaleString()}명</Text>
              </View>
            </View>
          </View>

          {/* 환경 가치 환산 */}
          <View style={styles.environmentalSection}>
            <Text style={styles.sectionTitle}>환경 가치 환산</Text>
            <View style={styles.environmentalGrid}>
              <View style={styles.environmentalItem}>
                <Text style={styles.environmentalIcon}>🌳</Text>
                <Text style={styles.environmentalValue}>{safeNumber(latest.environmentalImpact.trees).toFixed(1)}그루</Text>
                <Text style={styles.environmentalLabel}>나무 심기</Text>
              </View>
              <View style={styles.environmentalItem}>
                <Text style={styles.environmentalIcon}>💧</Text>
                <Text style={styles.environmentalValue}>{safeNumber(latest.environmentalImpact.waterLiters).toFixed(1)}L</Text>
                <Text style={styles.environmentalLabel}>물 절약</Text>
              </View>
              <View style={styles.environmentalItem}>
                <Text style={styles.environmentalIcon}>🛍️</Text>
                <Text style={styles.environmentalValue}>{safeNumber(latest.environmentalImpact.plasticBags).toFixed(0)}개</Text>
                <Text style={styles.environmentalLabel}>비닐봉지</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 지난 리포트 리스트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>지난 리포트</Text>
          <View style={styles.menuList}>
            {rest.map((r, idx) => (
              <Pressable key={r.reportId} style={[styles.menuItem, idx === rest.length - 1 && styles.lastMenuItem]} onPress={() => onOpenDetail(r)}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}><Text style={styles.menuIconText}>{r.reportMonth.slice(5)}월</Text></View>
                  <View>
                    <Text style={styles.menuTitle}>{r.reportMonth} 리포트</Text>
                    <Text style={styles.menuSubtitle}>씨앗 {safeNumber(r.statistics.totalSeeds).toLocaleString()}개 · 탄소 {safeNumber(r.statistics.totalCarbonKg)}kg 절감</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 60 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 20 * SCALE },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 * SCALE },
  cardTitle: { fontSize: 16 * SCALE, fontWeight: '800', color: '#111827', marginBottom: 12 * SCALE },
  chartRow: { flexDirection: 'row', alignItems: 'center' },
  chartLegend: { flex: 1, marginLeft: 12 * SCALE },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 * SCALE },
  legendDot: { width: 12 * SCALE, height: 12 * SCALE, borderRadius: 6 * SCALE, marginRight: 8 * SCALE },
  legendText: { fontSize: 12 * SCALE, color: '#374151' },
  kpiRow: { flexDirection: 'row', gap: 12 * SCALE, marginTop: 12 * SCALE },
  kpiChip: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12 * SCALE, paddingVertical: 12 * SCALE, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  kpiIcon: { width: 20 * SCALE, height: 20 * SCALE, marginBottom: 6 * SCALE },
  kpiLabel: { fontSize: 12 * SCALE, color: '#6B7280' },
  kpiValue: { fontSize: 14 * SCALE, color: '#111827', fontWeight: '800', marginTop: 2 * SCALE },
  topActivity: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 8 * SCALE },
  recoRow: { flexDirection: 'row', gap: 12 * SCALE },
  recoCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, padding: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  recoImg: { width: 80 * SCALE, height: 60 * SCALE, marginBottom: 6 * SCALE },
  recoTitle: { fontSize: 12 * SCALE, color: '#111827', fontWeight: '700' },
  recoSubtitle: { fontSize: 11 * SCALE, color: '#6B7280' },

  menuList: { backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 * SCALE, paddingVertical: 14 * SCALE, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  lastMenuItem: { borderBottomWidth: 0 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE },
  menuIcon: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 8 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  menuIconText: { fontSize: 12 * SCALE, color: '#374151', fontWeight: '800' },
  menuTitle: { fontSize: 14 * SCALE, color: '#111827', fontWeight: '700' },
  menuSubtitle: { fontSize: 12 * SCALE, color: '#6B7280' },
  chevron: { fontSize: 22 * SCALE, color: '#D1D5DB' },
  
  // 새로운 스타일들
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 * SCALE 
  },
  loadingText: { 
    fontSize: 16 * SCALE, 
    color: '#6B7280', 
    marginTop: 16 * SCALE 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 * SCALE 
  },
  errorText: { 
    fontSize: 16 * SCALE, 
    color: '#EF4444', 
    textAlign: 'center', 
    marginBottom: 20 * SCALE 
  },
  retryButton: { 
    backgroundColor: '#10B981', 
    paddingHorizontal: 24 * SCALE, 
    paddingVertical: 12 * SCALE, 
    borderRadius: 8 * SCALE 
  },
  retryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16 * SCALE, 
    fontWeight: '600' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 * SCALE 
  },
  emptyText: { 
    fontSize: 18 * SCALE, 
    color: '#374151', 
    fontWeight: '600', 
    marginBottom: 8 * SCALE 
  },
  emptySubText: { 
    fontSize: 14 * SCALE, 
    color: '#6B7280' 
  },
  levelInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    marginBottom: 16 * SCALE,
  },
  levelText: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4 * SCALE,
  },
  progressText: {
    fontSize: 12 * SCALE,
    color: '#059669',
    marginBottom: 2 * SCALE,
  },
  pointsText: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
  
  // 새로운 스타일들
  sectionTitle: { 
    fontSize: 14 * SCALE, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 12 * SCALE 
  },
  
  // 요약 섹션
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 * SCALE 
  },
  summaryItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  summaryLabel: { 
    fontSize: 12 * SCALE, 
    color: '#6B7280', 
    marginBottom: 4 * SCALE 
  },
  summaryValue: { 
    fontSize: 16 * SCALE, 
    fontWeight: '800', 
    color: '#111827' 
  },
  topActivityMessage: { 
    fontSize: 14 * SCALE, 
    color: '#10B981', 
    fontWeight: '600',
    marginBottom: 16 * SCALE
  },
  
  // 차트 섹션
  chartSection: {
    marginTop: 16 * SCALE,
    paddingTop: 16 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
  // 금융 혜택
  benefitSection: {
    marginTop: 16 * SCALE,
    paddingTop: 16 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  benefitRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 * SCALE 
  },
  benefitItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  benefitLabel: { 
    fontSize: 12 * SCALE, 
    color: '#6B7280', 
    marginBottom: 4 * SCALE 
  },
  benefitValue: { 
    fontSize: 16 * SCALE, 
    fontWeight: '800', 
    color: '#10B981' 
  },
  benefitTotal: { 
    fontSize: 14 * SCALE, 
    fontWeight: '700', 
    color: '#111827', 
    textAlign: 'center' 
  },
  
  // 랭킹
  rankingSection: {
    marginTop: 16 * SCALE,
    paddingTop: 16 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rankingContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  rankingItem: { 
    alignItems: 'center' 
  },
  rankingLabel: { 
    fontSize: 12 * SCALE, 
    color: '#6B7280', 
    marginBottom: 4 * SCALE 
  },
  rankingValue: { 
    fontSize: 18 * SCALE, 
    fontWeight: '800', 
    color: '#10B981' 
  },
  
  // 환경 가치 환산
  environmentalSection: {
    marginTop: 16 * SCALE,
    paddingTop: 16 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  environmentalGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  environmentalItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  environmentalIcon: { 
    fontSize: 24 * SCALE, 
    marginBottom: 4 * SCALE 
  },
  environmentalValue: { 
    fontSize: 16 * SCALE, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 2 * SCALE 
  },
  environmentalLabel: { 
    fontSize: 10 * SCALE, 
    color: '#6B7280' 
  },
});


