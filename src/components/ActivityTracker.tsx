import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SCALE, COLORS, ECO_LEVELS } from '../utils/constants';
import { UserStats, EcoLevel } from '../types';

interface ActivityTrackerProps {
  onPointsEarned: (points: number) => void;
  userStats: UserStats;
}

export function ActivityTracker({ onPointsEarned, userStats }: ActivityTrackerProps) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'total'>('monthly');
  const [showLevelModal, setShowLevelModal] = useState(false);

  // 등급에 따른 캐릭터 이미지 반환 함수
  const getCharacterImage = (levelId: string) => {
    switch (levelId) {
      case 'beginner':
        return require('../../assets/beginner.png');
      case 'intermediate':
        return require('../../assets/intermediate.png');
      case 'expert':
        return require('../../assets/expert.png');
      default:
        return require('../../assets/beginner.png'); // 기본값
    }
  };


  // 레벨에 따른 색상 반환 함수
  const getLevelColor = (levelId: string) => {
    switch (levelId) {
      case 'beginner':
        return '#10B981'; // 초록색
      case 'intermediate':
        return '#059669'; // 진한 초록색
      case 'expert':
        return '#047857'; // 더 진한 초록색
      default:
        return '#10B981';
    }
  };

  // 레벨에 따른 레벨 번호 반환 함수
  const getLevelNumber = (levelId: string) => {
    switch (levelId) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'expert':
        return 3;
      default:
        return 1;
    }
  };

  // 레벨 설명 데이터
  const getLevelDescription = (levelId: string) => {
    switch (levelId) {
      case 'beginner':
        return {
          title: '친환경 입문자',
          description: '친환경 활동을 시작하는 단계입니다. 작은 실천부터 시작해보세요!',
          requirements: '0-5,000 원큐씨앗',
          financialBenefits: {
            savingsRate: '0.5%',
            loanRate: '0.5%',
            cardRate: '1%'
          }
        };
      case 'intermediate':
        return {
          title: '친환경 실천가',
          description: '꾸준한 친환경 활동을 실천하고 있는 단계입니다. 더 많은 활동에 도전해보세요!',
          requirements: '5,000-9,999 원큐씨앗',
          financialBenefits: {
            savingsRate: '1.0%',
            loanRate: '1.0%',
            cardRate: '3%'
          }
        };
      case 'expert':
        return {
          title: '친환경 전문가',
          description: '친환경 활동의 전문가 단계입니다. 다른 사람들에게 좋은 영향을 주고 있어요!',
          requirements: '9,999+ 원큐씨앗',
          financialBenefits: {
            savingsRate: '2.0%',
            loanRate: '2.0%',
            cardRate: '5%'
          }
        };
      default:
        return {
          title: '친환경 입문자',
          description: '친환경 활동을 시작하는 단계입니다.',
          requirements: '0~999 원큐씨앗',
          benefits: ['기본 친환경 활동 인정'],
          financialBenefits: {
            savingsRate: '0.5%',
            loanRate: '0.5%',
            cardRate: '1%'
          }
        };
    }
  };

  return (
    <View>
      {/* 캐릭터 및 등급 섹션 */}
      <View style={styles.characterContainer}>
        <Image 
          source={getCharacterImage(userStats.currentLevel.id)} 
          style={styles.characterImage}
          resizeMode="contain"
        />

        {/* 등급 정보 */}
        <View style={styles.levelCard}>
          {/* 상단 헤더 */}
          <View style={styles.levelCardHeader}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(userStats.currentLevel.id) }]}>
              <Text style={styles.levelBadgeText}>Lv{getLevelNumber(userStats.currentLevel.id)}</Text>
            </View>
            <View style={styles.levelTitleContainer}>
              <Text style={styles.levelTitle}>{userStats.currentLevel.name}</Text>
              {/* <Text style={styles.levelSubtitle}>{userStats.currentLevel.description}</Text> */}
            </View>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => setShowLevelModal(true)}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* 진행도 섹션 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>다음 레벨까지</Text>
              <Text style={styles.progressPercentage}>{Math.round(userStats.progressToNextLevel * 100)}%</Text>
            </View>
            
            {/* 모던한 진행바 */}
            <View style={styles.modernProgressBar}>
              <View style={[styles.modernProgressFill, { width: `${userStats.progressToNextLevel * 100}%` }]}>
                <View style={styles.progressGlow} />
              </View>
            </View>
            
            <View style={styles.progressFooter}>
              <Text style={styles.progressPoints}>{userStats.totalPoints.toLocaleString()} 개</Text>
              <Text style={styles.progressTarget}>{userStats.nextLevel.requiredPoints.toLocaleString()} 개</Text>
            </View>
          </View>

          {/* 다음 레벨 미리보기 */}
          {/* <View style={styles.nextLevelPreview}>
            <Text style={styles.nextLevelText}>다음: {userStats.nextLevel.name} 🌿</Text>
            <Text style={styles.remainingPoints}>{userStats.pointsToNextLevel.toLocaleString()} 개 남음</Text>
          </View> */}
        </View>
      </View>

      {/* 레벨 설명 모달 */}
      <Modal
        visible={showLevelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>레벨 시스템 안내</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowLevelModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* 씨앗 적립 안내 */}
              <Text style={styles.seedInfoTitle}>원큐씨앗 적립 안내</Text>
              <Text style={styles.seedInfoDescription}>
                친환경 활동을 통해 원큐씨앗을 적립할 수 있습니다.
              </Text>
              <View style={styles.seedInfoList}>
                <Text style={styles.seedInfoItem}>• 환경퀴즈, 걷기, 하나은행 전자확인증 발급, 에코챌린지 등</Text>
                <Text style={styles.seedInfoItem}>• 하나카드 친환경 카드 발급 및 사용</Text>
                <Text style={styles.seedInfoItem}>• 적립된 씨앗은 최대 3년간 유효 (적립일 기준)</Text>
              </View>

              {/* 레벨별 혜택 안내 */}
              <Text style={styles.sectionTitle}>레벨별 혜택</Text>
              {['beginner', 'intermediate', 'expert'].map((levelId) => {
                const levelInfo = getLevelDescription(levelId);
                const isCurrentLevel = levelId === userStats.currentLevel.id;
                
                return (
                  <View key={levelId} style={[
                    styles.levelInfoCard,
                    isCurrentLevel && styles.currentLevelCard
                  ]}>
                    <View style={styles.levelInfoHeader}>
                      <Text style={[
                        styles.levelInfoTitle,
                        isCurrentLevel && styles.currentLevelTitle
                      ]}>
                        Lv{getLevelNumber(levelId)}. {levelInfo.title}
                      </Text>
                      {isCurrentLevel && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>현재 레벨</Text>
                        </View>
                      )}
                    </View>

                    
                    <View style={styles.requirementsContainer}>
                      <Text style={styles.requirementsLabel}>필요 원큐씨앗:</Text>
                      <Text style={styles.requirementsText}>{levelInfo.requirements}</Text>
                    </View>

                    <View style={styles.financialBenefitsContainer}>
                      <Text style={styles.financialBenefitsLabel}>친환경 금융 혜택:</Text>
                      <View style={styles.financialBenefitsGrid}>
                        <View style={styles.financialBenefitItem}>
                          <Text style={styles.financialBenefitType}>적금 우대금리</Text>
                          <Text style={styles.financialBenefitValue}>{levelInfo.financialBenefits.savingsRate}</Text>
                        </View>
                        <View style={styles.financialBenefitItem}>
                          <Text style={styles.financialBenefitType}>대출 우대금리</Text>
                          <Text style={styles.financialBenefitValue}>{levelInfo.financialBenefits.loanRate}</Text>
                        </View>
                        <View style={styles.financialBenefitItem}>
                          <Text style={styles.financialBenefitType}>카드 캐시백</Text>
                          <Text style={styles.financialBenefitValue}>{levelInfo.financialBenefits.cardRate}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8 * SCALE,
    paddingBottom: 20 * SCALE,
    paddingHorizontal: 20 * SCALE,
    marginBottom: 8 * SCALE,
  },
  characterImage: {
    width: 280 * SCALE,
    height: 280 * SCALE,
    marginBottom: 16 * SCALE,
  },
  levelCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20 * SCALE,
    padding: 24 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F9FF',
  },

  levelCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20 * SCALE,
  },

  levelBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 6 * SCALE,
    borderRadius: 20 * SCALE,
    marginRight: 12 * SCALE,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  levelBadgeText: {
    fontSize: 12 * SCALE,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },

  levelTitleContainer: {
    flex: 1,
  },

  levelTitle: {
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4 * SCALE,
  },

  levelSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
  },

  progressContainer: {
    marginBottom: 16 * SCALE,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12 * SCALE,
  },

  progressLabel: {
    fontSize: 14 * SCALE,
    color: '#374151',
    fontWeight: '600',
  },

  progressPercentage: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
  },

  modernProgressBar: {
    width: '100%',
    height: 12 * SCALE,
    backgroundColor: '#F3F4F6',
    borderRadius: 20 * SCALE,
    overflow: 'hidden',
    marginBottom: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  modernProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 20 * SCALE,
    position: 'relative',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },

  progressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20 * SCALE,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20 * SCALE,
  },

  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressPoints: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#10B981',
  },

  progressTarget: {
    fontSize: 12 * SCALE,
    color: '#9CA3AF',
  },

  nextLevelPreview: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    borderStyle: 'dashed',
  },

  nextLevelText: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4 * SCALE,
  },

  remainingPoints: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },

  // 다음 레벨까지 필요한 원큐씨앗 표시 스타일
  remainingSeedsContainer: {
    marginTop: 16 * SCALE,
    padding: 16 * SCALE,
    backgroundColor: '#F0FDF4',
    borderRadius: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },

  remainingSeedsText: {
    fontSize: 14 * SCALE,
    color: '#065F46',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },

  remainingSeedsNumber: {
    fontSize: 16 * SCALE,
    fontWeight: '800',
    color: '#10B981',
  },

  // 도움말 버튼 스타일
  helpButton: {
    width: 24 * SCALE,
    height: 24 * SCALE,
    borderRadius: 12 * SCALE,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8 * SCALE,
  },

  helpButtonText: {
    fontSize: 14 * SCALE,
    fontWeight: 'bold',
    color: '#6B7280',
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 * SCALE,
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8 * SCALE,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  closeButton: {
    width: 30 * SCALE,
    height: 30 * SCALE,
    borderRadius: 15 * SCALE,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  modalBody: {
    padding: 20 * SCALE,
  },

  // 레벨 정보 카드 스타일
  levelInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  currentLevelCard: {
    borderColor: '#138072',
    borderWidth: 2,
  },

  levelInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12 * SCALE,
  },

  levelInfoTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },

  currentLevelTitle: {
    color: '#1F2937',
  },

  currentBadge: {
    backgroundColor: '#138072',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 4 * SCALE,
    borderRadius: 12 * SCALE,
  },

  currentBadgeText: {
    fontSize: 10 * SCALE,
    fontWeight: 'bold',
    color: 'white',
  },

  levelInfoDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 12 * SCALE,
  },

  requirementsContainer: {
    marginBottom: 12 * SCALE,
  },

  requirementsLabel: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4 * SCALE,
  },

  requirementsText: {
    fontSize: 14 * SCALE,
    fontWeight: 'bold',
    color: '#138072',
  },

  benefitsContainer: {
    marginBottom: 8 * SCALE,
  },

  benefitsLabel: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4 * SCALE,
  },

  benefitItem: {
    fontSize: 13 * SCALE,
    color: '#6B7280',
    lineHeight: 18 * SCALE,
    marginBottom: 2 * SCALE,
  },

  seedInfoTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#2F3845',
    marginBottom: 4 * SCALE,
  },

  seedInfoDescription: {
    fontSize: 14 * SCALE,
    color: '#454E5D',
    marginBottom: 8 * SCALE,
    lineHeight: 20 * SCALE,
  },

  seedInfoList: {
    marginLeft: 4 * SCALE,
    marginBottom: 16 * SCALE,
  },

  seedInfoItem: {
    fontSize: 13 * SCALE,
    color: '#7B828E',
    lineHeight: 18 * SCALE,
    marginBottom: 4 * SCALE,
  },

  // 섹션 제목 스타일
  sectionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16 * SCALE,
    marginTop: 8 * SCALE,
  },

  // 금융 혜택 스타일
  financialBenefitsContainer: {
    paddingTop: 12 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  financialBenefitsLabel: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8 * SCALE,
  },

  financialBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  financialBenefitItem: {
    width: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8 * SCALE,
    padding: 8 * SCALE,
    alignItems: 'center',
    marginBottom: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  financialBenefitType: {
    fontSize: 10 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4 * SCALE,
    lineHeight: 14 * SCALE,
  },

  financialBenefitValue: {
    fontSize: 14 * SCALE,
    fontWeight: 'bold',
    color: '#138072',
    textAlign: 'center',
  },

}); 