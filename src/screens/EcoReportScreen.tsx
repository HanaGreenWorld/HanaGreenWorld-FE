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
      
      // 먼저 기존 리포트 조회 시도
      const apiReports = await fetchEcoReports();
      console.log('🔍 EcoReportScreen - API에서 받은 리포트 데이터:');
      console.log('  - 리포트 개수:', apiReports.length);
      
      if (apiReports.length === 0) {
        // 리포트가 없으면 현재 월 리포트 생성 시도
        try {
          const currentReport = await fetchCurrentMonthReport();
          console.log('🔍 EcoReportScreen - 새로 생성된 리포트:', currentReport);
          setReports([currentReport]);
        } catch (generateError) {
          console.error('리포트 생성 실패:', generateError);
          setError('리포트를 생성하는데 실패했습니다.');
        }
      } else {
        apiReports.forEach((report, index) => {
          console.log(`🔍 EcoReportScreen - 리포트 #${index + 1}:`, {
            reportMonth: report.reportMonth,
            activitiesCount: report.activities.length,
            activities: report.activities.map(a => ({ label: a.label, count: a.count, points: a.points }))
          });
        });
        setReports(apiReports);
      }
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
          <Pressable style={styles.generateReportButton} onPress={loadReports}>
            <Text style={styles.generateReportButtonText}>리포트 생성하기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="친환경 리포트" onBack={onBack} onHome={onHome} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 리포트 설명 섹션 */}
        <Text style={styles.descriptionTitle}>월별 친환경 활동 리포트</Text>
        <Text style={styles.descriptionSubtitle}>지난달 나의 작은 실천이 만든 큰 변화를 확인해보세요.{'\n'}지구와 나 모두에게 이로운 혜택이 쌓이고 있어요.</Text>
        <View style={styles.trophyIcon}>
          <Image 
            source={require('../../assets/report.png')} 
            style={styles.trophyImage}
            resizeMode="contain"
          />
        </View>

        {/* 리포트 목록 */}
        <View>
          <View style={styles.menuList}>
            {reports.map((report, idx) => (
              <Pressable 
                key={report.reportId} 
                style={[styles.menuItem, idx === reports.length - 1 && styles.lastMenuItem]} 
                onPress={() => onOpenDetail(report)}
              >
                <View style={styles.menuItemLeft}>
                  <View>
                    <View style={styles.titleContainer}>
                      <Text style={styles.menuTitle}>{report.reportMonth}</Text>
                      {idx === 0 && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.menuSubtitle}>
                      씨앗 {safeNumber(report.statistics.totalSeeds).toLocaleString()}개 · 탄소 {safeNumber(report.statistics.totalCarbonKg)}kg 절감
                    </Text>
                    <Text style={styles.menuLevel}>
                      {report.summary.currentLevel} · 진행률 {safeNumber(report.summary.levelProgress)}%
                    </Text>
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
  // card: { backgroundColor: '#FFFFFF', borderRadius: 16 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 * SCALE },
  cardTitle: { fontSize: 16 * SCALE, fontWeight: '800', color: '#111827', marginBottom: 12 * SCALE },
  
  // 설명 섹션 스타일
  descriptionTitle: { 
    fontSize: 24 * SCALE, 
    fontWeight: '800', 
    color: '#111827', 
    textAlign: 'left',
    marginVertical: 12 * SCALE,
    marginLeft: 8 * SCALE
  },
  descriptionSubtitle: { 
    fontSize: 14 * SCALE, 
    color: '#6B7280', 
    textAlign: 'left',
    lineHeight: 20 * SCALE,
    marginBottom: 16 * SCALE,
    marginLeft: 8 * SCALE
  },
  trophyIcon: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  trophyImage: { 
    width: 250 * SCALE, 
    height: 220 * SCALE, 
  },
  
  menuList: { backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 * SCALE, paddingVertical: 14 * SCALE, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  lastMenuItem: { borderBottomWidth: 0 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE },
  menuIcon: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 8 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  menuIconText: { fontSize: 12 * SCALE, color: '#374151', fontWeight: '800' },
  titleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 * SCALE,
    gap: 8 * SCALE
  },
  menuTitle: { fontSize: 18 * SCALE, color: '#111827', fontWeight: '700' },
  newBadge: { 
    backgroundColor: '#EF4444', 
    paddingHorizontal: 6 * SCALE, 
    paddingVertical: 2 * SCALE, 
    borderRadius: 4 * SCALE 
  },
  newBadgeText: { 
    fontSize: 10 * SCALE, 
    color: '#FFFFFF', 
    fontWeight: '800' 
  },
  menuSubtitle: { fontSize: 14 * SCALE, color: '#6B7280' },
  menuLevel: { fontSize: 12 * SCALE, color: '#198376', fontWeight: '600', marginTop: 4 * SCALE },
  chevron: { fontSize: 22 * SCALE, color: '#D1D5DB' },
  
  // 로딩 및 에러 상태 스타일
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
    color: '#6B7280',
    marginBottom: 20 * SCALE
  },
  generateReportButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24 * SCALE,
    paddingVertical: 12 * SCALE,
    borderRadius: 8 * SCALE,
    marginTop: 8 * SCALE
  },
  generateReportButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    textAlign: 'center'
  },
});


