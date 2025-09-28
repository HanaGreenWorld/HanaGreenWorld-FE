import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';
import { challengeApi, ChallengeRecord } from '../utils/challengeApi';
import { useEcoSeeds } from '../hooks/useEcoSeeds';

interface SeedHistoryScreenProps {
  onBack: () => void;
}

export default function SeedHistoryScreen({ onBack }: SeedHistoryScreenProps) {
  const { refreshProfile } = useEcoSeeds();
  const [challengeRecords, setChallengeRecords] = useState<ChallengeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 완료된 챌린지 내역 조회
  const fetchCompletedChallenges = async () => {
    try {
      setLoading(true);
      console.log('씨앗 내역 조회 시작...');
      const records = await challengeApi.getMyChallengeParticipations();
      console.log('참여 내역 조회 결과:', records);
      
      // 인증 완료된 챌린지만 필터링
      const completedRecords = records.filter(record => record.verificationStatus === 'VERIFIED');
      console.log('완료된 챌린지:', completedRecords);
      
      setChallengeRecords(completedRecords);
    } catch (error) {
      console.error('완료된 챌린지 내역 조회 실패:', error);
      // 에러가 발생해도 빈 배열로 설정하여 앱이 크래시되지 않도록 함
      setChallengeRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile(); // 원큐씨앗 정보 새로고침
    await fetchCompletedChallenges();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCompletedChallenges();
  }, []);

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshProfile();
      fetchCompletedChallenges();
    };

    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();
  }, [refreshProfile]);

  // 날짜 포맷팅 (월.일 형식)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day}`;
  };

  // 날짜별로 그룹화
  const groupByDate = (records: ChallengeRecord[]) => {
    const grouped: { [key: string]: ChallengeRecord[] } = {};
    
    records.forEach(record => {
      const dateKey = formatDate(record.activityDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });

    // 날짜 순으로 정렬
    return Object.keys(grouped)
      .sort((a, b) => {
        const [monthA, dayA] = a.split('.').map(Number);
        const [monthB, dayB] = b.split('.').map(Number);
        if (monthA !== monthB) return monthB - monthA;
        return dayB - dayA;
      })
      .map(date => ({ date, records: grouped[date] }));
  };

  const groupedRecords = groupByDate(challengeRecords);
  const totalSeeds = challengeRecords.reduce((sum, record) => sum + (record.pointsAwarded || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20 * SCALE} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>받은 챌린지 씨앗</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingIcon}>🌱</Text>
            <Text style={styles.loadingText}>씨앗 내역을 불러오는 중...</Text>
          </View>
        ) : challengeRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyTitle}>아직 받은 씨앗이 없어요</Text>
            <Text style={styles.emptyText}>에코 챌린지에 참여해서 씨앗을 모아보세요! 🌱</Text>
          </View>
        ) : (
          <>
            {/* 헤더 섹션 */}
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>받은 챌린지 씨앗</Text>
              <Text style={styles.headerPoints}>{totalSeeds} 씨앗</Text>
              <View style={styles.headerSubtitle}>
                <View style={styles.pointIcon}>
                  <Text style={styles.pointIconText}>P</Text>
                </View>
                <Text style={styles.headerSubtitleText}>챌린지 달성하고 받은 씨앗 내역</Text>
              </View>
            </View>

            {/* 씨앗 내역 리스트 */}
            {groupedRecords.map(({ date, records }) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateLabel}>{date}</Text>
                {records.map((record) => (
                  <View key={record.id} style={styles.seedItem}>
                    <View style={styles.seedInfo}>
                      <Text style={styles.seedTitle}>{record.challenge.title}</Text>
                      <Text style={styles.seedSubtitle}>챌린지 완료</Text>
                      {record.imageUrl && (
                        <View style={styles.imageBadge}>
                          <Ionicons name="camera" size={12 * SCALE} color="white" />
                          <Text style={styles.imageBadgeText}>인증 사진</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.seedReward}>
                      <Text style={styles.seedRewardText}>+{record.pointsAwarded || 0} 씨앗</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
        
        <View style={{ height: 80 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
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
  headerBtn: { 
    padding: 6 * SCALE 
  },
  headerTitle: { 
    fontSize: 16 * SCALE, 
    fontWeight: '700', 
    color: '#111827' 
  },
  content: { 
    flex: 1, 
    padding: 20 * SCALE 
  },

  // 헤더 섹션 스타일
  headerSection: {
    marginBottom: 32 * SCALE,
    paddingHorizontal: 4 * SCALE,
  },
  headerPoints: {
    fontSize: 32 * SCALE,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16 * SCALE,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointIcon: {
    width: 24 * SCALE,
    height: 24 * SCALE,
    borderRadius: 12 * SCALE,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8 * SCALE,
  },
  pointIconText: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitleText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 날짜 그룹 스타일
  dateGroup: {
    marginBottom: 24 * SCALE,
  },
  dateLabel: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12 * SCALE,
    paddingHorizontal: 4 * SCALE,
  },

  // 씨앗 아이템 스타일
  seedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 4 * SCALE,
    marginBottom: 8 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  seedInfo: {
    flex: 1,
  },
  seedTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  seedSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 18 * SCALE,
  },
  seedReward: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80 * SCALE,
  },
  seedRewardText: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'right',
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
    color: '#374151',
    marginBottom: 8 * SCALE,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },

  // 이미지 뱃지 스타일
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8 * SCALE,
    padding: 4 * SCALE,
    marginTop: 8 * SCALE,
    alignSelf: 'flex-start',
  },
  imageBadgeText: {
    color: 'white',
    fontSize: 10 * SCALE,
    fontWeight: '600',
    marginLeft: 4 * SCALE,
  },
});
