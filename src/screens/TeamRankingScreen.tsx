import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import { teamApi, type TeamRankingResponse, type TopTeamResponse } from '../utils/teamApi';

interface TeamRankingScreenProps {
  onBack: () => void;
}

export default function TeamRankingScreen({ onBack }: TeamRankingScreenProps) {
  const [rankingData, setRankingData] = useState<TeamRankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeamRanking();
  }, []);

  const loadTeamRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamApi.getTeamRanking();
      console.log('🏆 팀 랭킹 데이터:', JSON.stringify(data, null, 2));
      setRankingData(data);
    } catch (err: any) {
      console.error('팀 랭킹 로드 실패:', err);
      setError(err.message || '팀 랭킹을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };


  const getRewardSeeds = (rank: number) => {
    switch (rank) {
      case 1:
        return '5,000';
      case 2:
        return '3,000';
      case 3:
        return '1,000';
      default:
        return '0';
    }
  };

  const renderTopTeam = (team: TopTeamResponse, index: number) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;
    
    console.log(`🏆 팀 ${rank}위 데이터:`, {
      teamId: team.teamId,
      teamName: team.teamName,
      leaderName: team.leaderName,
      totalPoints: team.totalPoints,
      members: team.members
    });
    
    return (
      <View key={team.teamId} style={styles.teamCard}>
        <View style={styles.rankSection}>
          {isTopThree ? (
            <Image 
              source={
                rank === 1 ? require('../../assets/hana3dIcon/hanaIcon3d_51.png') :
                rank === 2 ? require('../../assets/silver.png') :
                require('../../assets/bronze.png')
              } 
              style={styles.rankIcon}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.rankNumberContainer}>
              <Text style={styles.rankNumber}>{rank}</Text>
            </View>
          )}
        </View>
        <View style={styles.teamInfo}>
          <View style={styles.teamStats}>
            <View style={styles.statItem}>
              <Text style={styles.teamName}>{team.teamName}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.monthlyPoints?.toLocaleString() || '0'}P</Text>
              <Text style={styles.statLabel}>월간 포인트</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.members}명</Text>
              <Text style={styles.statLabel}>팀원 수</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="팀 랭킹" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008986" />
          <Text style={styles.loadingText}>팀 랭킹을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopBar title="팀 랭킹" onBack={onBack} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTeamRanking}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="팀 랭킹" onBack={onBack} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 상단 안내 섹션 */}
        <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Image source={require('../../assets/green_team.png')} style={styles.infoIcon} />
              <Text style={styles.infoTitle}>팀원들과 환경을 지키고{'\n'}지갑도 두둑히 채우자!</Text>
            </View>
            <Text style={styles.infoDescription}>
              매달 상위 3팀의 팀원들에게는 
              <Text style={styles.highlightText}> 원큐씨앗</Text> 지급의 행운이
            </Text>
            <View style={styles.rewardList}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardRank}>🥇 1위</Text>
                <Text style={styles.rewardAmount}>각 5,000씨앗</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardRank}>🥈 2위</Text>
                <Text style={styles.rewardAmount}>각 3,000씨앗</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardRank}>🥉 3위</Text>
                <Text style={styles.rewardAmount}>각 1,000씨앗</Text>
              </View>
            </View>
        </View>

        {/* 랭킹 섹션 */}
        <View style={styles.rankingSection}>
          <View style={styles.rankingCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.sectionTitle}>이번달 팀 랭킹</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('ko-KR', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 기준
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                총 {rankingData?.totalTeams || 0}개 팀 중 순위
              </Text>
            </View>

            {rankingData?.topTeams && rankingData.topTeams.length > 0 ? (
              <View style={styles.rankingList}>
                {rankingData.topTeams.slice(0, 5).map((team, index) => renderTopTeam(team, index))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>랭킹 데이터가 없습니다</Text>
              </View>
            )}
          </View>
        </View>

        {/* 내 팀 정보 (있는 경우) */}
        {rankingData?.myTeam && (
          <View style={styles.myTeamSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>내 팀 순위</Text>
            </View>
            <View style={styles.myTeamCard}>
              <View style={styles.myTeamStats}>
                <View style={styles.myTeamStatItem}>
                  <Text style={styles.myTeamRankValue}>{rankingData.myTeam.currentRank}위</Text>
                </View>
                <Text style={styles.separator}>|</Text>
                <View style={styles.myTeamStatItem}>
                  <Text style={styles.myTeamName}>{rankingData.myTeam.teamName}</Text>
                  <Text style={styles.myTeamStatLabel}>팀명</Text>
                </View>
                <View style={styles.myTeamStatItem}>
                  <Text style={styles.myTeamStatValue}>{rankingData.myTeam.monthlyPoints.toLocaleString()}P</Text>
                  <Text style={styles.myTeamStatLabel}>월간 포인트</Text>
                </View>
                <View style={styles.myTeamStatItem}>
                  <Text style={styles.myTeamStatValue}>{rankingData.myTeam.members}명</Text>
                  <Text style={styles.myTeamStatLabel}>팀원 수</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40 * SCALE,
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    marginTop: 16 * SCALE,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40 * SCALE,
  },
  errorText: {
    fontSize: 16 * SCALE,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16 * SCALE,
    marginBottom: 24 * SCALE,
  },
  retryButton: {
    backgroundColor: '#008986',
    paddingHorizontal: 24 * SCALE,
    paddingVertical: 12 * SCALE,
    borderRadius: 8 * SCALE,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14 * SCALE,
    fontWeight: '600',
  },
  
  // 안내 섹션
  infoSection: {
    padding: 20 * SCALE,
    marginBottom: 12 * SCALE,
  },
  infoHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 12 * SCALE,
  },
  infoIcon: {
    width: 120 * SCALE,
    height: 120 * SCALE,
    marginBottom: 12 * SCALE,
  },
  infoTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 16 * SCALE,
    textAlign: 'center',
  },
  highlightText: {
    color: '#008986',
    fontWeight: '700',
  },
  rewardList: {
    gap: 4 * SCALE,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12 * SCALE,
    marginHorizontal: 8 * SCALE,
  },
  rewardRank: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#065F46',
  },
  rewardAmount: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#008986',
  },
  
  // 랭킹 섹션
  rankingSection: {
    paddingHorizontal: 20 * SCALE,
    marginBottom: 20 * SCALE,
  },
  rankingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 8 * SCALE,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4 * SCALE,
  },
  sectionTitle: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  rankingList: {
    gap: 12 * SCALE,
  },
  teamCard: {
    borderRadius: 12 * SCALE,
    padding: 8 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastTeamCard: {
    marginBottom: 0,
  },
  rankSection: {
    alignItems: 'center',
    marginRight: 8 * SCALE,
  },
  rankIcon: {
    width: 50 * SCALE,
    height: 50 * SCALE,
  },
  rankNumberContainer: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 25 * SCALE,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginLeft: 4 * SCALE,
    marginRight: 8 * SCALE,
  },
  rankNumber: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#6B7280',
  },
  rewardText: {
    fontSize: 12 * SCALE,
    fontWeight: '700',
    color: '#92400E',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginLeft: -16 * SCALE,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginTop: 2 * SCALE,
  },
  
  // 빈 상태
  emptyContainer: {
    alignItems: 'center',
    padding: 40 * SCALE,
  },
  emptyText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    marginTop: 16 * SCALE,
  },
  
  // 내 팀 섹션
  myTeamSection: {
    paddingHorizontal: 20 * SCALE,
    marginBottom: 10 * SCALE,
  },
  myTeamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  myTeamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myTeamStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  myTeamName: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  myTeamRankValue: {
    fontSize: 20 * SCALE,
    fontWeight: '800',
    color: '#088C8A',
  },
  myTeamStatValue: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  myTeamStatLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginTop: 2 * SCALE,
  },
  separator: {
    fontSize: 24 * SCALE,
    color: '#D1D5DB',
    fontWeight: '300',
    alignSelf: 'center',
    marginHorizontal: 8 * SCALE,
  },
});
