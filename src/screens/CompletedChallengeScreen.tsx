import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';
import { challengeApi, Challenge as ApiChallenge } from '../utils/challengeApi';

interface CompletedChallengeScreenProps {
  onBack: () => void;
}

type LocalChallenge = ApiChallenge & {
  challengeType: 'image' | 'steps' | 'simple';
  icon: any;
  completedAt?: string;
  pointsEarned?: number;
};

// 아이콘 매핑
const CHALLENGE_ICONS: Record<string, any> = {
  'REUSABLE_BAG': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
  'REUSABLE_BAG_EXTENDED': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
  'PLUGGING': require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
  'PLUGGING_MARATHON': require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
  'TEAM_PLUGGING': require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
  'WEEKLY_STEPS': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'DAILY_STEPS': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'TEAM_WALKING': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'NO_PLASTIC': require('../../assets/hana3dIcon/hanaIcon3d_4_31.png'),
  'TUMBLER_CHALLENGE': require('../../assets/hana3dIcon/hanaIcon3d_4_31.png'),
  'RECYCLE': require('../../assets/hana3dIcon/hanaIcon3d_4_35.png'),
  'default': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
};

export default function CompletedChallengeScreen({ onBack }: CompletedChallengeScreenProps) {
  const [completedChallenges, setCompletedChallenges] = useState<LocalChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    fetchCompletedChallenges();
  }, []);

  const fetchCompletedChallenges = async () => {
    try {
      setIsLoading(true);
      const participations = await challengeApi.getMyChallengeParticipations();
      
      // 완료된 챌린지만 필터링
      const completed = participations
        .filter(participation => 
          participation.verificationStatus === 'VERIFIED' || 
          participation.verificationStatus === 'APPROVED'
        )
        .map(participation => {
          const challenge = participation.challenge;
          return {
            ...challenge,
            challengeType: 'image' as const,
            icon: CHALLENGE_ICONS[challenge.code] || CHALLENGE_ICONS.default,
            completedAt: participation.activityDate,
            pointsEarned: participation.pointsAwarded || challenge.points || 0,
          };
        });

      setCompletedChallenges(completed);
      setTotalEarned(completed.reduce((sum, c) => sum + (c.pointsEarned || 0), 0));
    } catch (error) {
      console.error('완료된 챌린지 조회 실패:', error);
      Alert.alert('오류', '완료된 챌린지를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20 * SCALE} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>완료된 챌린지</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingIcon}>🌱</Text>
            <Text style={styles.loadingText}>완료된 챌린지를 불러오는 중...</Text>
          </View>
        ) : completedChallenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyTitle}>완료된 챌린지가 없어요</Text>
            <Text style={styles.emptyText}>챌린지를 완료하면 여기에 표시됩니다!</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {completedChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.historyItem}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>
                    {formatDateShort(challenge.completedAt || '')}
                  </Text>
                </View>
                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.activityTitle}>{challenge.title}</Text>
                    {challenge.isTeamChallenge && (
                      <View style={styles.teamBadge}>
                        <Text style={styles.teamBadgeText}>팀</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.activitySubtitle}>{challenge.description}</Text>
                </View>
                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardText}>
                    {challenge.isTeamChallenge 
                      ? `+${challenge.teamScore || 0} 포인트` 
                      : `+${challenge.pointsEarned} 씨앗`
                    }
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 80 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE, 
    paddingTop: 18 * SCALE, 
    paddingBottom: 8 * SCALE,
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: { padding: 6 * SCALE },
  headerTitle: { 
    fontSize: 16 * SCALE, 
    fontWeight: '700', 
    color: '#111827' 
  },
  content: { flex: 1, padding: 20 * SCALE },

  // 히스토리 리스트 스타일
  historyList: {
    paddingHorizontal: 4 * SCALE,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateContainer: {
    width: 40 * SCALE,
    alignItems: 'flex-start',
    marginRight: 16 * SCALE,
  },
  dateText: {
    fontSize: 14 * SCALE,
    fontWeight: '500',
    color: '#6B7280',
  },
  contentContainer: {
    flex: 1,
    marginRight: 16 * SCALE,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4 * SCALE,
  },
  activityTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  teamBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 3 * SCALE,
    borderRadius: 8 * SCALE,
    marginLeft: 8 * SCALE,
  },
  teamBadgeText: {
    fontSize: 10 * SCALE,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  activitySubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 18 * SCALE,
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // 로딩 및 빈 상태
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60 * SCALE,
  },
  loadingIcon: {
    fontSize: 48 * SCALE,
    marginBottom: 16 * SCALE,
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60 * SCALE,
    paddingHorizontal: 40 * SCALE,
  },
  emptyIcon: {
    fontSize: 64 * SCALE,
    marginBottom: 20 * SCALE,
  },
  emptyTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8 * SCALE,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },
});
