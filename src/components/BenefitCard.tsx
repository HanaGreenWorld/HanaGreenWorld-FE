import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../utils/constants';

interface BenefitCardProps {
  currentBenefitPackage?: string;
  scheduledBenefitId?: string | null;
  onShowBenefitChange?: () => void;
  onCancelScheduledBenefit?: () => void;
  onBenefitItemPress?: (benefitType: string) => void;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  currentBenefitPackage,
  scheduledBenefitId,
  onShowBenefitChange,
  onCancelScheduledBenefit,
  onBenefitItemPress
}) => {
  const benefitTitles: Record<string, string> = {
    all_green_life: '올인원 그린라이프 캐시백',
    green_mobility: '그린 모빌리티 캐시백',
    zero_waste_life: '제로웨이스트 라이프 캐시백',
  };

  const getBenefitTitle = (benefitId: string) => {
    return benefitTitles[benefitId] || '선택한 혜택';
  };

  const benefitItems = [
    { emoji: '🚗', text: '전기차', rate: '3%' },
    { emoji: '🚇', text: '대중교통', rate: '2%' },
    { emoji: '🚲', text: '공유킥보드', rate: '4%' },
    { emoji: '♻️', text: '리필샵', rate: '4%' },
    { emoji: '✅', text: '친환경브랜드', rate: '2%' },
    { emoji: '🔄', text: '중고거래', rate: '1.5%' },
    { emoji: '🥗', text: '유기농식품', rate: '3%' },
  ];

  return (
    <View style={styles.currentBenefitCard}>
      <View style={styles.currentBenefitHeader}>
        <View style={styles.currentBenefitTitleContainer}>
          <Text style={styles.currentBenefitLabel}>적용 혜택</Text>
          <Text style={styles.currentBenefitTitle}>
            {currentBenefitPackage ? `${currentBenefitPackage} 캐시백` : '친환경 생활 종합 혜택'}
          </Text>
        </View>
        <Pressable style={styles.changeBenefitButton} onPress={onShowBenefitChange}>
          <Text style={styles.changeBenefitText}>혜택 변경</Text>
        </Pressable>
      </View>
      
      {scheduledBenefitId && (
        <View style={styles.scheduledBanner}>
          <Text style={styles.scheduledBannerText}>
            다음달 적용 예정 혜택: {getBenefitTitle(scheduledBenefitId)}
          </Text>
          <Pressable style={styles.scheduledCancelButton} onPress={onCancelScheduledBenefit}>
            <Ionicons name="return-up-back-outline" size={18} color="#138072" />
          </Pressable>
        </View>
      )}
      
      <View style={styles.benefitScrollView}>
        <View style={styles.benefitScrollContent}>
          {benefitItems.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.benefitItem,
                index === 0 && styles.benefitItemFirst,
                index === benefitItems.length - 1 && styles.benefitItemLast
              ]}
              onPress={() => onBenefitItemPress && onBenefitItemPress(item.text)}
            >
              <Text style={styles.benefitEmoji}>{item.emoji}</Text>
              <Text style={styles.benefitItemText}>{item.text}</Text>
              <Text style={styles.benefitItemRate}>{item.rate}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  currentBenefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 24 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentBenefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentBenefitTitleContainer: {
    flex: 1,
  },
  currentBenefitLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 4 * SCALE,
  },
  currentBenefitTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeBenefitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    backgroundColor: '#F0FDF4',
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  changeBenefitText: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: 'rgb(28, 161, 68)',
  },
  scheduledBanner: {
    marginTop: 8 * SCALE,
    backgroundColor: 'rgba(19, 128, 114, 0.08)',
    borderColor: '#138072',
    borderWidth: 1,
    borderRadius: 10 * SCALE,
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduledBannerText: {
    fontSize: 12 * SCALE,
    color: '#138072',
    fontWeight: '600',
  },
  scheduledCancelButton: {
    padding: 6 * SCALE,
    marginLeft: 8 * SCALE,
  },
  benefitScrollView: {
    marginTop: 16 * SCALE,
  },
  benefitScrollContent: {
    flexDirection: 'row',
    paddingLeft: 0,
    paddingRight: 4 * SCALE,
  },
  benefitItem: {
    alignItems: 'center',
    marginHorizontal: 4 * SCALE,
    minWidth: 80 * SCALE,
  },
  benefitEmoji: {
    fontSize: 32 * SCALE,
    marginBottom: 8 * SCALE,
  },
  benefitItemText: {
    fontSize: 12 * SCALE,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4 * SCALE,
  },
  benefitItemRate: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#10B981',
  },
  benefitItemFirst: {
    marginLeft: 0,
  },
  benefitItemLast: {
    marginRight: 0,
  },
});
