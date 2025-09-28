import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';
import { challengeApi, ChallengeRecord } from '../utils/challengeApi';
import { API_BASE_URL } from '../utils/constants';

interface ChallengeHistoryScreenProps {
  onBack: () => void;
}

export default function ChallengeHistoryScreen({ onBack }: ChallengeHistoryScreenProps) {
  const [challengeRecords, setChallengeRecords] = useState<ChallengeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 참여 내역 조회
  const fetchChallengeHistory = async () => {
    try {
      setLoading(true);
      const records = await challengeApi.getMyChallengeParticipations();
      setChallengeRecords(records);
    } catch (error) {
      console.error('참여 내역 조회 실패:', error);
      Alert.alert('오류', '참여 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChallengeHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchChallengeHistory();
  }, []);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 인증 상태에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // 인증 상태에 따른 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '인증 완료';
      case 'PENDING':
        return '검토 중';
      case 'REJECTED':
        return '인증 실패';
      default:
        return '알 수 없음';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20 * SCALE} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>참여 내역</Text>
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
            <Text style={styles.loadingText}>참여 내역을 불러오는 중...</Text>
          </View>
        ) : challengeRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="trophy-outline" size={48 * SCALE} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyTitle}>아직 참여한 챌린지가 없어요</Text>
            <Text style={styles.emptySubtitle}>에코 챌린지에 참여해서 씨앗을 모아보세요! 🌱</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="stats-chart" size={24 * SCALE} color={COLORS.primary} />
                </View>
                <Text style={styles.summaryTitle}>나의 챌린지 현황</Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{challengeRecords.length}</Text>
                  <Text style={styles.statLabel}>총 참여</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {challengeRecords.filter(r => r.verificationStatus === 'VERIFIED').length}
                  </Text>
                  <Text style={styles.statLabel}>인증 완료</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {challengeRecords.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>획득 씨앗</Text>
                </View>
              </View>
            </View>

            {challengeRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{record.challenge.title}</Text>
                    <Text style={styles.challengeDesc}>{record.challenge.description}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(record.verificationStatus)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(record.verificationStatus) }]}>
                      {getStatusText(record.verificationStatus)}
                    </Text>
                  </View>
                </View>

                {record.imageUrl && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: record.imageUrl }} 
                      style={styles.recordImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="camera" size={20 * SCALE} color="white" />
                      <Text style={styles.imageOverlayText}>인증 사진</Text>
                    </View>
                  </View>
                )}

                <View style={styles.recordFooter}>
                  <View style={styles.recordInfo}>
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={16 * SCALE} color={COLORS.textLight} />
                      <Text style={styles.infoText}>{formatDate(record.activityDate)}</Text>
                    </View>
                    {record.pointsAwarded && (
                      <View style={styles.infoItem}>
                        <Ionicons name="leaf-outline" size={16 * SCALE} color={COLORS.primary} />
                        <Text style={[styles.infoText, { color: COLORS.primary, fontWeight: '600' }]}>
                          +{record.pointsAwarded} 씨앗
                        </Text>
                      </View>
                    )}
                  </View>
                  {record.verifiedAt && (
                    <Text style={styles.verifiedText}>
                      인증일: {formatDate(record.verifiedAt)}
                    </Text>
                  )}
                </View>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE, paddingTop: 18 * SCALE, paddingBottom: 8 * SCALE,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerBtn: { padding: 6 * SCALE },
  headerTitle: { fontSize: 16 * SCALE, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 20 * SCALE },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60 * SCALE,
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60 * SCALE,
  },
  emptyIcon: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    borderRadius: 40 * SCALE,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20 * SCALE,
  },
  emptyTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8 * SCALE,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14 * SCALE,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 * SCALE,
  },
  summaryIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  summaryTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24 * SCALE,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4 * SCALE,
  },
  statLabel: {
    fontSize: 12 * SCALE,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12 * SCALE,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12 * SCALE,
  },
  challengeTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4 * SCALE,
  },
  challengeDesc: {
    fontSize: 14 * SCALE,
    color: COLORS.textLight,
    lineHeight: 20 * SCALE,
  },
  statusBadge: {
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 6 * SCALE,
    borderRadius: 12 * SCALE,
  },
  statusText: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200 * SCALE,
    borderRadius: 12 * SCALE,
    overflow: 'hidden',
    marginBottom: 12 * SCALE,
  },
  recordImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8 * SCALE,
    right: 8 * SCALE,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16 * SCALE,
    padding: 8 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4 * SCALE,
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },

  recordFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12 * SCALE,
  },
  recordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * SCALE,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14 * SCALE,
    color: COLORS.textLight,
    marginLeft: 6 * SCALE,
  },
  verifiedText: {
    fontSize: 12 * SCALE,
    color: COLORS.textLight,
    textAlign: 'right',
  },
});
