import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SCALE, COLORS, ECO_LEVELS } from '../utils/constants';
import { UserStats, EcoLevel } from '../types';

interface ActivityTrackerProps {
  onPointsEarned: (points: number) => void;
  userStats: UserStats;
}

export function ActivityTracker({ onPointsEarned, userStats }: ActivityTrackerProps) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'total'>('monthly');

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
              <Text style={styles.levelBadgeText}>LV.{getLevelNumber(userStats.currentLevel.id)}</Text>
            </View>
            <View style={styles.levelTitleContainer}>
              <Text style={styles.levelTitle}>{userStats.currentLevel.name}</Text>
              {/* <Text style={styles.levelSubtitle}>{userStats.currentLevel.description}</Text> */}
            </View>
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

}); 