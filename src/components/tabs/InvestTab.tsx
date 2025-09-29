import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SCALE } from '../../utils/constants';

export const InvestTab: React.FC = () => {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>투자 한눈에</Text>
        <Text style={styles.sectionSubtitle}>친환경 포트폴리오로 모으고 불리기</Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ESG 펀드 예상 수익(연)</Text>
          <Text style={styles.kpiValue}>+5.2%</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>그린본드 수익률(평균)</Text>
          <Text style={styles.kpiValue}>3.1%</Text>
        </View>
      </View>

      <View style={styles.cardList}>
        <View style={styles.dataCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardName}>ESG 포커스 펀드</Text>
            <Text style={styles.badge}>중위험</Text>
          </View>
          <Text style={styles.cardDesc}>친환경/지속가능 기업 중심 분산투자</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>최소 납입</Text>
            <Text style={styles.infoValue}>10,000원</Text>
          </View>
          <Pressable style={styles.detailButton}>
            <Text style={styles.detailButtonText}>자세히 보기</Text>
          </Pressable>
        </View>

        <View style={styles.dataCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardName}>그린본드 패시브</Text>
            <Text style={styles.badge}>저위험</Text>
          </View>
          <Text style={styles.cardDesc}>친환경 프로젝트 채권에 분산 투자</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>최소 납입</Text>
            <Text style={styles.infoValue}>50,000원</Text>
          </View>
          <Pressable style={styles.detailButton}>
            <Text style={styles.detailButtonText}>자세히 보기</Text>
          </Pressable>
        </View>
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
  
  // KPI 섹션
  kpiRow: {
    flexDirection: 'row',
    gap: 12 * SCALE,
    marginBottom: 12 * SCALE,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  kpiLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 6 * SCALE,
  },
  kpiValue: {
    fontSize: 18 * SCALE,
    fontWeight: '800',
    color: '#111827',
  },
  
  // 카드 리스트
  cardList: { 
    gap: 12 * SCALE 
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8 * SCALE,
  },
  cardName: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    fontSize: 10 * SCALE,
    color: '#065F46',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 999,
  },
  cardDesc: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 8 * SCALE,
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
});
