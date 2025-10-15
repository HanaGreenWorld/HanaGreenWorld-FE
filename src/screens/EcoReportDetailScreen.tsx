import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import { EcoReport } from '../utils/ecoReportApi';
import { PieChart } from '../components/PieChart';

interface Props {
  report: EcoReport;
  onBack?: () => void;
  onHome?: () => void;
}

export default function EcoReportDetailScreen({ report, onBack, onHome }: Props) {
  const [viewType, setViewType] = useState<'count' | 'points'>('count');

  // 데이터 검증 함수
  const safeNumber = (value: number | undefined | null, fallback = 0): number => {
    return isNaN(value as number) || value == null ? fallback : value;
  };

  // 레벨별 캐릭터 이미지 반환
  const getCharacterImage = (levelText: string) => {
    if (levelText.includes('새내기')) {
      return require('../../assets/beginner.png');
    }
    if (levelText.includes('실천가')) {
      return require('../../assets/intermediate.png');
    }
    if (levelText.includes('전문가')) {
      return require('../../assets/expert.png');
    }
    return require('../../assets/beginner.png'); // 기본값
  };

  // 활동 데이터를 뷰 타입에 따라 변환
  const getActivitiesData = () => {
    console.log('🔍 EcoReportDetailScreen - 활동 데이터 분석:');
    console.log('  - 전체 활동 수:', report.activities.length);
    report.activities.forEach((activity, index) => {
      console.log(`  - 활동 #${index + 1}:`, {
        label: activity.label,
        count: activity.count,
        points: activity.points,
        countPercentage: activity.countPercentage,
        pointsPercentage: activity.pointsPercentage,
        color: activity.color
      });
    });
    
    return report.activities.map(activity => ({
      label: activity.label,
      value: viewType === 'count' 
        ? safeNumber(activity.countPercentage)
        : safeNumber(activity.pointsPercentage),
      color: activity.color,
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <TopBar title={`${report.reportMonth} 리포트`} onBack={onBack} onHome={onHome} />
      <ScrollView style={{ padding: 20 * SCALE }} showsVerticalScrollIndicator={false}>
        
        {/* 1. 요약 및 하이라이트 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>이번 달 친환경 리포트</Text>
          
          {/* 레벨 정보 */}
          <View style={styles.levelInfo}>
            <View style={styles.characterContainer}>
              <Image 
                source={getCharacterImage(report.summary.currentLevel)}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.levelDetails}>
              <Text style={styles.levelText}>{report.summary.currentLevel}</Text>
              <Text style={styles.progressText}>달성률: {safeNumber(report.summary.levelProgress)}%</Text>
              <Text style={styles.pointsText}>다음 레벨까지 {safeNumber(report.summary.pointsToNextLevel)} 씨앗</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>원큐씨앗</Text>
              <Text style={styles.summaryValue}>{safeNumber(report.statistics.totalSeeds).toLocaleString()}개</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>탄소절감</Text>
              <Text style={styles.summaryValue}>{safeNumber(report.statistics.totalCarbonKg)}kg</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>활동 횟수</Text>
              <Text style={styles.summaryValue}>{safeNumber(report.statistics.totalActivities)}회</Text>
            </View>
          </View>
        </View>

        {/* 2. 활동 분석 */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>활동 분석</Text>
            <View style={styles.toggleContainer}>
              <Pressable 
                style={[styles.toggleButton, viewType === 'count' && styles.toggleButtonActive]}
                onPress={() => setViewType('count')}
              >
                <Text style={[styles.toggleButtonText, viewType === 'count' && styles.toggleButtonTextActive]}>
                  횟수
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.toggleButton, viewType === 'points' && styles.toggleButtonActive]}
                onPress={() => setViewType('points')}
              >
                <Text style={[styles.toggleButtonText, viewType === 'points' && styles.toggleButtonTextActive]}>
                  씨앗
                </Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <PieChart 
              data={getActivitiesData()} 
              size={160 * SCALE} 
              strokeWidth={40 * SCALE}
              showCenterText={true}
              centerText={viewType === 'count' ? '활동' : '씨앗'}
              animated={true}
            />
            <View style={styles.activitiesLegend}>
              {report.activities.map((activity, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: activity.color }]} />
                  <View style={styles.legendContent}>
                    <Text style={styles.legendText}>
                      {activity.label}: {viewType === 'count' 
                        ? safeNumber(activity.countPercentage) 
                        : safeNumber(activity.pointsPercentage)}%
                    </Text>
                    <Text style={styles.legendDetail}>
                      {viewType === 'count' 
                        ? `${safeNumber(activity.count)}회`
                        : `${safeNumber(activity.points).toLocaleString()}개`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          <Text style={styles.topActivityMessage}>
            {report.summary.topActivityMessage || `가장 많이 한 활동: ${report.summary.topActivity}`}
          </Text>
        </View>

        {/* 3. 금융 혜택 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>금융 혜택</Text>
          <View style={styles.benefitRow}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitLabel}>적금 우대금리</Text>
              <Text style={styles.benefitValue}>+{safeNumber(report.financialBenefit.savingsInterest).toLocaleString()}원</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitLabel}>카드 캐시백</Text>
              <Text style={styles.benefitValue}>+{safeNumber(report.financialBenefit.cardDiscount).toLocaleString()}원</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitLabel}>대출 혜택</Text>
              <Text style={styles.benefitValue}>+{safeNumber(report.financialBenefit.loanBenefit).toLocaleString()}원</Text>
            </View>
          </View>
          <Text style={styles.benefitTotal}>총 혜택: {safeNumber(report.financialBenefit.total).toLocaleString()}원</Text>
          {report.financialBenefit.nextLevelBenefit && (
            <Text style={styles.nextLevelBenefit}>
              다음 레벨 달성 시 추가 혜택: {safeNumber(report.financialBenefit.nextLevelBenefit).toLocaleString()}원
            </Text>
          )}
        </View>

        {/* 4. 커뮤니티 랭킹 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>사용자 랭킹</Text>
          <View style={styles.rankingContainer}>
            <View style={styles.rankingItem}>
              <Text style={styles.rankingLabel}>상위</Text>
              <Text style={styles.rankingValue}>{safeNumber(report.ranking.percentile)}%</Text>
            </View>
            <View style={styles.rankingItem}>
              <Text style={styles.rankingLabel}>랭킹</Text>
              <Text style={styles.rankingValue}>{safeNumber(report.ranking.rank).toLocaleString()}위</Text>
            </View>
            <View style={styles.rankingItem}>
              <Text style={styles.rankingLabel}>전체 사용자</Text>
              <Text style={styles.rankingValue}>{safeNumber(report.ranking.totalUsers).toLocaleString()}명</Text>
            </View>
          </View>
          {report.ranking.userPoints && (
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsInfoText}>내 씨앗: {safeNumber(report.ranking.userPoints).toLocaleString()}점</Text>
              {report.ranking.averagePoints && (
                <Text style={styles.pointsInfoText}>평균 씨앗: {safeNumber(report.ranking.averagePoints).toLocaleString()}점</Text>
              )}
            </View>
          )}
        </View>

        {/* 5. 환경 가치 환산 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>환경 가치 환산</Text>
          <View style={styles.environmentalGrid}>
            <View style={styles.environmentalItem}>
              <Image 
                source={require('../../assets/tree.png')} 
                style={styles.environmentalImage}
                resizeMode="contain"
              />
              <Text style={styles.environmentalValue}>{safeNumber(report.environmentalImpact.trees).toFixed(1)}그루</Text>
              <Text style={styles.environmentalLabel}>나무 심기</Text>
            </View>
            <View style={styles.environmentalItem}>
              <Image 
                source={require('../../assets/water.png')} 
                style={styles.environmentalImage}
                resizeMode="contain"
              />
              <Text style={styles.environmentalValue}>{safeNumber(report.environmentalImpact.waterLiters).toFixed(1)}L</Text>
              <Text style={styles.environmentalLabel}>물 절약</Text>
            </View>
            <View style={styles.environmentalItem}>
              <Image 
                source={require('../../assets/light.png')} 
                style={styles.environmentalImage}
                resizeMode="contain"
              />
              <Text style={styles.environmentalValue}>{safeNumber(report.environmentalImpact.energyKwh).toFixed(1)}kWh</Text>
              <Text style={styles.environmentalLabel}>전기 절약</Text>
            </View>
          </View>
        </View>


        <View style={{ height: 60 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16 * SCALE, 
    padding: 20 * SCALE, 
    marginBottom: 16 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { 
    fontSize: 16 * SCALE, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 12 * SCALE 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
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
    color: '#0F8073', 
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20 * SCALE
  },
  
  // 토글 버튼
  toggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8 * SCALE, 
    padding: 2 * SCALE 
  },
  toggleButton: { 
    paddingHorizontal: 12 * SCALE, 
    paddingVertical: 6 * SCALE, 
    borderRadius: 6 * SCALE 
  },
  toggleButtonActive: { 
    backgroundColor: '#0F8073' 
  },
  toggleButtonText: { 
    fontSize: 12 * SCALE, 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  toggleButtonTextActive: { 
    color: '#FFFFFF' 
  },
  
  // 차트 컨테이너
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8 * SCALE
  },
  
  // 활동 범례
  activitiesLegend: { 
    flex: 1,
    marginLeft: 8 * SCALE,
    paddingLeft: 16 * SCALE,
    borderLeftColor: '#E5E7EB'
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 8 * SCALE 
  },
  legendDot: { 
    width: 12 * SCALE, 
    height: 12 * SCALE, 
    borderRadius: 6 * SCALE, 
    marginRight: 8 * SCALE,
    marginTop: 2 * SCALE
  },
  legendContent: {
    flex: 1
  },
  legendText: { 
    fontSize: 13 * SCALE, 
    color: '#374151',
    fontWeight: '600'
  },
  legendDetail: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginTop: 2 * SCALE
  },
  
  // 금융 혜택
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
    color: '#108074' 
  },
  benefitTotal: { 
    fontSize: 14 * SCALE, 
    fontWeight: '700', 
    color: '#111827', 
    textAlign: 'center',
    marginTop: 8 * SCALE
  },
  
  // 랭킹
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
    color: '#108074' 
  },
  
  // 환경 가치 환산
  environmentalGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  environmentalItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  environmentalImage: { 
    width: 32 * SCALE, 
    height: 32 * SCALE, 
    marginBottom: 8 * SCALE 
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
  
  // 추천 상품
  recommendationsContainer: { 
    gap: 12 * SCALE 
  },
  recommendationCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12 * SCALE, 
    padding: 12 * SCALE 
  },
  recommendationImage: { 
    width: 40 * SCALE, 
    height: 40 * SCALE, 
    marginRight: 12 * SCALE 
  },
  recommendationContent: { 
    flex: 1 
  },
  recommendationTitle: { 
    fontSize: 14 * SCALE, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 2 * SCALE 
  },
  recommendationSubtitle: { 
    fontSize: 12 * SCALE, 
    color: '#6B7280' 
  },
  
  // 레벨 정보
  levelInfo: {
    marginBottom: 16 * SCALE,
    flexDirection: 'row',
    alignItems: 'center'
  },
  characterContainer: {
    marginRight: 24 * SCALE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  characterImage: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    marginLeft: 12 * SCALE,
  },
  levelDetails: {
    flex: 1
  },
  levelText: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#0F8073',
    marginBottom: 4 * SCALE,
  },
  progressText: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 2 * SCALE,
  },
  pointsText: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
  
  // 금융 혜택 추가 스타일
  nextLevelBenefit: {
    fontSize: 12 * SCALE,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8 * SCALE,
  },
  
  // 랭킹 추가 스타일
  pointsInfo: {
    marginTop: 12 * SCALE,
    paddingTop: 12 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pointsInfoText: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4 * SCALE,
  },
  
  // 환경 가치 환산 추가 스타일
  additionalEnvironmental: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12 * SCALE,
    paddingTop: 12 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});


