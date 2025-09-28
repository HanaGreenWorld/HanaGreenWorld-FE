import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import { PieChart } from '../components/PieChart';

export type EcoReport = {
  id: string;
  month: string; // YYYY-MM
  activities: { label: string; value: number; color: string }[];
  seeds: number; // eco seeds
  carbonKg: number;
  topActivity: string;
  recommendations: { id: string; title: string; subtitle: string; image: any }[];
};

interface EcoReportScreenProps {
  onBack?: () => void;
  onHome?: () => void;
  onOpenDetail: (report: EcoReport) => void;
}

const REPORTS: EcoReport[] = [
  {
    id: '2025-08',
    month: '2025-08',
    activities: [
      { label: '걷기', value: 45, color: '#10B981' },
      { label: '전자영수증', value: 30, color: '#3B82F6' },
      { label: '친환경 가맹점', value: 15, color: '#F59E0B' },
      { label: '재활용', value: 10, color: '#8B5CF6' },
    ],
    seeds: 820,
    carbonKg: 9.4,
    topActivity: '걷기',
    recommendations: [
      { id: 'rec1', title: '하나green세상 적금', subtitle: '친환경 활동으로 금리 우대', image: require('../../assets/expert.png') },
      { id: 'rec2', title: '그린 모빌리티 대출', subtitle: '전기차 고객 우대금리', image: require('../../assets/hana_green_card.png') },
    ],
  },
  {
    id: '2025-07',
    month: '2025-07',
    activities: [
      { label: '전자영수증', value: 40, color: '#3B82F6' },
      { label: '걷기', value: 35, color: '#10B981' },
      { label: '친환경 가맹점', value: 15, color: '#F59E0B' },
      { label: '재활용', value: 10, color: '#8B5CF6' },
    ],
    seeds: 760,
    carbonKg: 8.1,
    topActivity: '전자영수증',
    recommendations: [],
  },
  { id: '2025-06', month: '2025-06', activities: [
      { label: '걷기', value: 42, color: '#10B981' },
      { label: '전자영수증', value: 28, color: '#3B82F6' },
      { label: '친환경 가맹점', value: 20, color: '#F59E0B' },
      { label: '재활용', value: 10, color: '#8B5CF6' },
    ], seeds: 690, carbonKg: 7.3, topActivity: '걷기', recommendations: [] },
  { id: '2025-05', month: '2025-05', activities: [
      { label: '친환경 가맹점', value: 38, color: '#F59E0B' },
      { label: '걷기', value: 32, color: '#10B981' },
      { label: '전자영수증', value: 20, color: '#3B82F6' },
      { label: '재활용', value: 10, color: '#8B5CF6' },
    ], seeds: 610, carbonKg: 6.5, topActivity: '친환경 가맹점', recommendations: [] },
  { id: '2025-04', month: '2025-04', activities: [
      { label: '재활용', value: 35, color: '#8B5CF6' },
      { label: '전자영수증', value: 30, color: '#3B82F6' },
      { label: '걷기', value: 25, color: '#10B981' },
      { label: '친환경 가맹점', value: 10, color: '#F59E0B' },
    ], seeds: 540, carbonKg: 5.1, topActivity: '재활용', recommendations: [] },
  { id: '2025-03', month: '2025-03', activities: [
      { label: '걷기', value: 50, color: '#10B981' },
      { label: '전자영수증', value: 25, color: '#3B82F6' },
      { label: '친환경 가맹점', value: 15, color: '#F59E0B' },
      { label: '재활용', value: 10, color: '#8B5CF6' },
    ], seeds: 720, carbonKg: 8.8, topActivity: '걷기', recommendations: [] },
];

export default function EcoReportScreen({ onBack, onHome, onOpenDetail }: EcoReportScreenProps) {
  const latest = REPORTS[0];
  const rest = REPORTS.slice(1);

  return (
    <View style={styles.container}>
      <TopBar title="친환경 리포트" onBack={onBack} onHome={onHome} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 최신 리포트 상세 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{latest.month} 친환경 리포트</Text>
          <View style={styles.chartRow}>
            <PieChart data={latest.activities} size={140 * SCALE} strokeWidth={36 * SCALE} />
            <View style={styles.chartLegend}>
              {latest.activities.map((a) => (
                <View key={a.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: a.color }]} />
                  <Text style={styles.legendText}>{a.label} {a.value}%</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.kpiRow}>
            <View style={styles.kpiChip}><Image source={require('../../assets/sprout.png')} style={styles.kpiIcon} /><Text style={styles.kpiLabel}>원큐씨앗</Text><Text style={styles.kpiValue}>{latest.seeds.toLocaleString()}개</Text></View>
            <View style={styles.kpiChip}><Image source={require('../../assets/hana3dIcon/hanaIcon3d_47.png')} style={styles.kpiIcon} /><Text style={styles.kpiLabel}>탄소절감</Text><Text style={styles.kpiValue}>{latest.carbonKg}kg</Text></View>
          </View>
          <Text style={styles.topActivity}>가장 많이 한 활동: {latest.topActivity}</Text>

          {/* 추천 */}
          {latest.recommendations.length > 0 && (
            <View style={{ marginTop: 12 * SCALE }}>
              <Text style={styles.sectionTitle}>추천 상품</Text>
              <View style={styles.recoRow}>
                {latest.recommendations.map((r) => (
                  <View key={r.id} style={styles.recoCard}>
                    <Image source={r.image} style={styles.recoImg} resizeMode="contain" />
                    <Text style={styles.recoTitle}>{r.title}</Text>
                    <Text style={styles.recoSubtitle}>{r.subtitle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 지난 리포트 리스트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>지난 리포트</Text>
          <View style={styles.menuList}>
            {rest.map((r, idx) => (
              <Pressable key={r.id} style={[styles.menuItem, idx === rest.length - 1 && styles.lastMenuItem]} onPress={() => onOpenDetail(r)}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}><Text style={styles.menuIconText}>{r.month.slice(5)}월</Text></View>
                  <View>
                    <Text style={styles.menuTitle}>{r.month} 리포트</Text>
                    <Text style={styles.menuSubtitle}>씨앗 {r.seeds.toLocaleString()}개 · 탄소 {r.carbonKg}kg 절감</Text>
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
  sectionTitle: { fontSize: 14 * SCALE, fontWeight: '800', color: '#111827', marginBottom: 8 * SCALE },
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
});


