import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { teamApi, JoinRequestResponse, TeamMemberResponse, TeamResponse } from '../utils/teamApi';
import { useUser } from '../hooks/useUser';

const { width, height } = Dimensions.get('window');
const SCALE = width / 375;

interface TeamManageScreenProps {
  onBack: () => void;
  teamData: TeamResponse;
  onTeamUpdate: (updatedTeam: TeamResponse | null) => void;
}

export default function TeamManageScreen({ onBack, teamData, onTeamUpdate }: TeamManageScreenProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'members'>('requests');
  const [joinRequests, setJoinRequests] = useState<JoinRequestResponse[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const { userInfo } = useUser();
  const isLeader = teamData.owner === userInfo?.name; // 방장인지 확인

  useEffect(() => {
    if (activeTab === 'requests') {
      loadJoinRequests();
    } else {
      loadTeamMembers();
    }
  }, [activeTab]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeTab === 'requests') {
        loadJoinRequests();
      } else {
        loadTeamMembers();
      }
    }, 5000); // 5초마다 새로고침

    return () => clearInterval(intervalId);
  }, [activeTab]);

  const loadJoinRequests = async () => {
    try {
      setLoading(true);
      const requests = await teamApi.getJoinRequests(teamData.id);
      setJoinRequests(requests);
    } catch (error) {
      console.error('가입 신청 목록 로드 실패:', error);
      setJoinRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await teamApi.getTeamMembers(teamData.id);
      setTeamMembers(members.members);
    } catch (error) {
      console.error('팀원 목록 로드 실패:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId: number, approve: boolean) => {
    try {
      setProcessingId(requestId);
      await teamApi.handleJoinRequest(requestId, approve);
      
      Alert.alert(
        '처리 완료', 
        approve ? '가입을 승인했습니다! 🎉' : '가입을 거절했습니다.',
        [{ text: '확인' }]
      );
      
      // 목록 새로고침
      loadJoinRequests();
    } catch (error: any) {
      console.error('가입 신청 처리 실패:', error);
      Alert.alert('오류', error.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleKickMember = async (memberId: number, memberName: string) => {
    Alert.alert(
      '팀원 강퇴',
      `${memberName}님을 팀에서 강퇴하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '강퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(memberId);
              await teamApi.kickMember(teamData.id, memberId);
              Alert.alert('완료', '팀원을 강퇴했습니다.');
              loadTeamMembers();
            } catch (error: any) {
              console.error('팀원 강퇴 실패:', error);
              Alert.alert('오류', error.message || '강퇴 중 오류가 발생했습니다.');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleLeaveTeam = async () => {
    if (isLeader && teamMembers.length > 1) {
      // 방장이고 팀원이 있는 경우 - 권한 이양 선택
      Alert.alert(
        '팀 탈퇴',
        '방장은 팀원이 있을 때 바로 탈퇴할 수 없습니다.\n다른 팀원에게 방장 권한을 이양하거나 팀원을 모두 강퇴 후 탈퇴해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    Alert.alert(
      '팀 탈퇴',
      isLeader ? '팀을 해체하시겠습니까?' : '정말 팀을 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: isLeader ? '해체' : '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await teamApi.leaveTeam();
              Alert.alert('완료', isLeader ? '팀을 해체했습니다.' : '팀을 탈퇴했습니다.');
              onTeamUpdate(null); // 팀 데이터를 null로 업데이트
              onBack();
            } catch (error: any) {
              console.error('팀 탈퇴 실패:', error);
              Alert.alert('오류', error.message || '탈퇴 중 오류가 발생했습니다.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleTransferLeadership = async (newLeaderId: number, memberName: string) => {
    Alert.alert(
      '방장 권한 이양',
      `${memberName}님에게 방장 권한을 이양하시겠습니까?\n이양 후에는 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '이양',
          onPress: async () => {
            try {
              setProcessingId(newLeaderId);
              await teamApi.transferLeadership(teamData.id, newLeaderId);
              Alert.alert('완료', '방장 권한을 이양했습니다.');
              // 팀 데이터 새로고침
              const updatedTeam = await teamApi.getMyTeam();
              onTeamUpdate(updatedTeam);
              onBack();
            } catch (error: any) {
              console.error('방장 권한 이양 실패:', error);
              Alert.alert('오류', error.message || '권한 이양 중 오류가 발생했습니다.');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const renderJoinRequestsTab = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#018479" />
          <Text style={styles.loadingText}>가입 신청 목록을 불러오는 중...</Text>
        </View>
      ) : joinRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>가입 신청이 없어요</Text>
          <Text style={styles.emptySubtitle}>새로운 팀원의 가입 신청을 기다리고 있어요!</Text>
        </View>
      ) : (
        <ScrollView style={styles.requestList} showsVerticalScrollIndicator={false}>
          {joinRequests.map((request, index) => (
            <View key={`request-${request.requestId}-${index}`} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestName}>{request.userName}</Text>
                <Text style={styles.requestLevel}>Lv.{request.userLevel}</Text>
              </View>
              <Text style={styles.requestDate}>
                {new Date(request.requestDate).toLocaleDateString('ko-KR')} 신청
              </Text>
              {request.message && (
                <Text style={styles.requestMessage}>"{request.message}"</Text>
              )}
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleJoinRequest(request.requestId, false)}
                  disabled={processingId === request.requestId}
                >
                  {processingId === request.requestId ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>거절</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleJoinRequest(request.requestId, true)}
                  disabled={processingId === request.requestId}
                >
                  {processingId === request.requestId ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>승인</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#018479" />
          <Text style={styles.loadingText}>팀원 목록을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView style={styles.memberList} showsVerticalScrollIndicator={false}>
          {teamMembers.map((member, index) => (
            <View key={`member-${member.memberId}-${index}`} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.role === 'LEADER' && (
                    <View style={styles.leaderBadge}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.leaderText}>방장</Text>
                    </View>
                  )}
                  {member.isOnline && <View style={styles.onlineDot} />}
                </View>
                <Text style={styles.memberStats}>
                  {member.totalPoints}점 • {new Date(member.joinedAt).toLocaleDateString('ko-KR')} 가입
                </Text>
              </View>
              {isLeader && member.role !== 'LEADER' && (
                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.transferButton]}
                    onPress={() => handleTransferLeadership(member.memberId, member.name)}
                    disabled={processingId === member.memberId}
                  >
                    <Ionicons name="star-outline" size={12} color="#ffffff" />
                    <Text style={styles.transferButtonText}>위임</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.kickButton]}
                    onPress={() => handleKickMember(member.memberId, member.name)}
                    disabled={processingId === member.memberId}
                  >
                    {processingId === member.memberId ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <>
                        <Ionicons name="close" size={12} color="#ffffff" />
                        <Text style={styles.kickButtonText}>제거</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      
    </View>
  );

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>팀 관리</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Ionicons 
            name="mail" 
            size={20} 
            color={activeTab === 'requests' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            가입 신청
          </Text>
          {joinRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{joinRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'members' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            팀원 관리
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'requests' ? renderJoinRequestsTab() : renderMembersTab()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20 * SCALE,
    paddingTop: 50 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  backButton: {
    padding: 8 * SCALE,
  },
  headerTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 40 * SCALE,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20 * SCALE,
    marginBottom: 20 * SCALE,
    backgroundColor: '#FFFFFF',
    borderRadius: 12 * SCALE,
    padding: 4 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12 * SCALE,
    paddingHorizontal: 16 * SCALE,
    borderRadius: 8 * SCALE,
  },
  activeTab: {
    backgroundColor: '#018479',
  },
  tabText: {
    marginLeft: 8 * SCALE,
    fontSize: 14 * SCALE,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 10 * SCALE,
    paddingHorizontal: 6 * SCALE,
    paddingVertical: 2 * SCALE,
    marginLeft: 4 * SCALE,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10 * SCALE,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12 * SCALE,
    fontSize: 16 * SCALE,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20 * SCALE,
  },
  emptySubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8 * SCALE,
  },
  requestList: {
    flex: 1,
  },
  memberList: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 12 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * SCALE,
  },
  requestName: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#374151',
  },
  requestLevel: {
    fontSize: 12 * SCALE,
    fontWeight: '500',
    color: '#018479',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 8 * SCALE,
  },
  requestDate: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 8 * SCALE,
  },
  requestMessage: {
    fontSize: 14 * SCALE,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 12 * SCALE,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8 * SCALE,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6 * SCALE,
    paddingHorizontal: 12 * SCALE,
    borderRadius: 6 * SCALE,
    gap: 4 * SCALE,
  },
  rejectButton: {
    backgroundColor: '#DC2626',
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#018479',
    flex: 1,
  },
  transferButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  kickButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14 * SCALE,
    fontWeight: '500',
  },
  transferButtonText: {
    color: '#ffffff',
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },
  kickButtonText: {
    color: '#ffffff',
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 12 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4 * SCALE,
  },
  memberName: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#374151',
  },
  leaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 8 * SCALE,
    marginLeft: 8 * SCALE,
    gap: 2 * SCALE,
  },
  leaderText: {
    fontSize: 10 * SCALE,
    fontWeight: '600',
    color: '#F59E0B',
  },
  onlineDot: {
    width: 8 * SCALE,
    height: 8 * SCALE,
    borderRadius: 4 * SCALE,
    backgroundColor: '#018479',
    marginLeft: 8 * SCALE,
  },
  memberStats: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 6 * SCALE,
    alignItems: 'center',
  },
});
