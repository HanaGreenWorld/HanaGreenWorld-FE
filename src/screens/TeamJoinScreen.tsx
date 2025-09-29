import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { teamApi, TeamResponse, MyJoinRequestResponse } from '../utils/teamApi';
import TeamCreateScreen from './TeamCreateScreen';

const { width, height } = Dimensions.get('window');

interface TeamJoinScreenProps { 
  onBack: () => void; 
  onJoinSuccess: (team: TeamResponse) => void;
}

export default function TeamJoinScreen({ onBack, onJoinSuccess }: TeamJoinScreenProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'list' | 'my-requests'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null);
  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const [myJoinRequests, setMyJoinRequests] = useState<MyJoinRequestResponse[]>([]);

  // 팀 목록 로드
  useEffect(() => {
    if (activeTab === 'list') {
      loadTeamList();
    } else if (activeTab === 'my-requests') {
      loadMyJoinRequests();
    }
  }, [activeTab]);

  const loadTeamList = async () => {
    try {
      setLoading(true);
      const teamList = await teamApi.getTeamList();
      // 랭킹순으로 정렬 (rank가 낮을수록 순위가 높음)
      const sortedTeams = (teamList || []).sort((a, b) => a.rank - b.rank);
      setTeams(sortedTeams);
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
      // 에러 알림 제거, 빈 배열로 설정
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyJoinRequests = async () => {
    try {
      setLoading(true);
      const requests = await teamApi.getMyJoinRequests();
      setMyJoinRequests(requests);
    } catch (error) {
      console.error('내 가입 신청 내역 로드 실패:', error);
      setMyJoinRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const validateInviteCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('알림', '초대코드를 입력해주세요.');
      return;
    }

    try {
      setValidatingCode(true);
      const team = await teamApi.validateInviteCode(inviteCode);
      setSelectedTeam(team);
    } catch (error: any) {
      console.error('초대코드 검증 실패:', error);
      // 에러 알림 제거, 조용히 처리
      setSelectedTeam(null);
    } finally {
      setValidatingCode(false);
    }
  };

  const requestJoinTeam = async (team: TeamResponse) => {
    try {
      setLoading(true);
      const result = await teamApi.requestJoinTeam(team.inviteCode);
      Alert.alert('신청 완료', '팀 가입을 신청했습니다!\n방장의 승인을 기다려주세요. 📩\n\n"내 신청" 탭에서 상태를 확인할 수 있어요!', [
        { 
          text: '내 신청 보기', 
          onPress: () => {
            setActiveTab('my-requests');
            loadMyJoinRequests();
          }
        },
        { text: '확인' }
      ]);
    } catch (error: any) {
      console.error('팀 가입 신청 실패:', error);
      
      // 이미 가입 신청한 경우 친화적인 메시지로 표시
      if (error.message && error.message.includes('이미 가입 신청을 보낸 팀입니다')) {
        Alert.alert('알림', error.message, [
          { 
            text: '내 신청 보기', 
            onPress: () => {
              setActiveTab('my-requests');
              loadMyJoinRequests();
            }
          },
          { text: '확인' }
        ]);
      } else {
        Alert.alert('오류', error.message || '팀 가입 신청에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (team: TeamResponse) => {
    setShowCreateScreen(false);
    onJoinSuccess(team);
  };

  const renderInviteCodeTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inviteSection}>
        <View style={styles.iconContainer}>
        </View>
        <Text style={styles.title}>초대코드로 가입하기</Text>
        <Text style={styles.subtitle}>
          친구나 팀장으로부터 받은 초대코드를 입력하세요{'\n'}
          함께 환경을 지켜나가요!
        </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
            placeholder="초대코드 입력 (예: GG-1234)"
              value={inviteCode}
              onChangeText={setInviteCode}
            autoCapitalize="characters"
              placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[styles.validateButton, validatingCode && styles.disabledButton]}
            onPress={validateInviteCode}
            disabled={validatingCode}
          >
            {validatingCode ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.validateButtonText}>검증</Text>
            )}
          </TouchableOpacity>
        </View>

        {selectedTeam && (
          <View style={styles.teamPreview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>선택한 팀</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedTeam(null)}
              >
                <Ionicons name="close-circle" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.teamCard}>
              <View style={styles.teamCardHeader}>
                <View style={styles.teamBadge}>
                  <Ionicons name="people" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{selectedTeam.name}</Text>
                  <Text style={styles.teamRank}>{selectedTeam.rank}위</Text>
                </View>
              </View>
              <Text style={styles.teamSlogan}>"{selectedTeam.slogan}"</Text>
              <View style={styles.teamStats}>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="people-outline" size={16} color="#018479" />
                  </View>
                  <Text style={styles.statValue}>{selectedTeam.members}</Text>
                  <Text style={styles.statLabel}>멤버</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="leaf-outline" size={16} color="#018479" />
                  </View>
                  <Text style={styles.statValue}>{selectedTeam.totalSeeds}</Text>
                  <Text style={styles.statLabel}>씨앗</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="trophy-outline" size={16} color="#018479" />
                  </View>
                  <Text style={styles.statValue}>{selectedTeam.completedChallenges}</Text>
                  <Text style={styles.statLabel}>성공</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => requestJoinTeam(selectedTeam)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.joinButtonText}>가입 신청하기</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기 중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'APPROVED':
        return '#018479';
      case 'REJECTED':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'APPROVED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const renderMyRequestsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.listSection}>
        <View style={styles.iconContainer}>
        </View>
        <Text style={styles.title}>내 가입 신청 내역</Text>
        <Text style={styles.subtitle}>
          보낸 가입 신청의 상태를 확인해보세요{'\n'}
          승인을 기다리거나 다른 팀에 도전해보세요!
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#018479" />
            <Text style={styles.loadingText}>가입 신청 내역을 불러오는 중...</Text>
          </View>
        ) : myJoinRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>가입 신청 내역이 없어요</Text>
            <Text style={styles.emptySubtitle}>
              팀에 가입 신청을 하면 여기에서 확인할 수 있어요! 🌟
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
            {myJoinRequests.map((request) => (
              <View key={request.requestId} style={styles.requestCard}>
                <View style={styles.requestCardHeader}>
                  <View style={styles.requestTeamInfo}>
                    <Text style={styles.requestTeamName}>{request.teamName}</Text>
                    {request.teamSlogan && (
                      <Text style={styles.requestTeamSlogan}>"{request.teamSlogan}"</Text>
                    )}
                  </View>
                  <View style={[styles.requestStatusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Ionicons 
                      name={getStatusIcon(request.status) as any} 
                      size={12} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.requestStatusText}>{getStatusText(request.status)}</Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.requestDetailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.requestDetailText}>
                      {new Date(request.requestDate).toLocaleDateString('ko-KR')} 신청
                    </Text>
                  </View>

                  {request.message && (
                    <View style={styles.requestDetailRow}>
                      <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
                      <Text style={styles.requestDetailText}>"{request.message}"</Text>
                    </View>
                  )}

                  {request.processedAt && (
                    <View style={styles.requestDetailRow}>
                      <Ionicons name="checkmark-done-outline" size={14} color="#6B7280" />
                      <Text style={styles.requestDetailText}>
                        {new Date(request.processedAt).toLocaleDateString('ko-KR')} 처리
                        {request.processedBy && ` (${request.processedBy})`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderTeamListTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.listSection}>
        <View style={styles.iconContainer}>
        </View>
        <Text style={styles.title}>팀 랭킹</Text>
        <Text style={styles.subtitle}>
          1위부터 순서대로 팀을 확인하고 가입해보세요{'\n'}
          최고의 팀과 함께 도전하세요!
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#018479" />
            <Text style={styles.loadingText}>팀 목록을 불러오는 중...</Text>
          </View>
        ) : (
          <ScrollView style={styles.teamList} showsVerticalScrollIndicator={false}>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamListItem}
                onPress={() => setSelectedTeam(team)}
              >
                <View style={styles.teamItemHeader}>
                  <Text style={styles.teamItemName}>{team.name}</Text>
                  <Text style={styles.teamItemRank}>#{team.rank}위</Text>
                </View>
                <Text style={styles.teamItemSlogan}>{team.slogan}</Text>
                <View style={styles.teamItemStats}>
                  <View style={styles.teamItemStat}>
                    <Ionicons name="people" size={16} color="#6B7280" />
                    <Text style={styles.teamItemStatText}>{team.members}명</Text>
                  </View>
                  <View style={styles.teamItemStat}>
                    <Ionicons name="leaf" size={16} color="#6B7280" />
                    <Text style={styles.teamItemStatText}>{team.totalSeeds}씨앗</Text>
                  </View>
                  <View style={styles.teamItemStat}>
                    <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                    <Text style={styles.teamItemStatText}>{team.completedChallenges}개</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedTeam && (
          <View style={styles.teamPreview}>
            <Text style={styles.previewTitle}>선택한 팀</Text>
            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamName}>{selectedTeam.name}</Text>
                <Text style={styles.teamRank}>#{selectedTeam.rank}위</Text>
              </View>
              <Text style={styles.teamSlogan}>{selectedTeam.slogan}</Text>
              <View style={styles.teamStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedTeam.members}</Text>
                  <Text style={styles.statLabel}>멤버</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedTeam.totalSeeds}</Text>
                  <Text style={styles.statLabel}>씨앗</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedTeam.completedChallenges}</Text>
                  <Text style={styles.statLabel}>성공 챌린지</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => requestJoinTeam(selectedTeam)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.joinButtonText}>가입 신청하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // 팀 생성 화면 표시
  if (showCreateScreen) {
    return (
      <TeamCreateScreen
        onBack={() => setShowCreateScreen(false)}
        onCreateSuccess={handleCreateSuccess}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>팀 가입하기</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
            onPress={() => setActiveTab('invite')}
          >
          <Ionicons 
            name="mail" 
            size={18} 
            color={activeTab === 'invite' ? '#FFFFFF' : '#6B7280'} 
          />
            <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>
              초대코드
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' && styles.activeTab]}
            onPress={() => setActiveTab('list')}
          >
          <Ionicons 
            name="list" 
            size={18} 
            color={activeTab === 'list' ? '#FFFFFF' : '#6B7280'} 
          />
            <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
              랭킹
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my-requests' && styles.activeTab]}
            onPress={() => setActiveTab('my-requests')}
          >
          <Ionicons 
            name="document-text" 
            size={18} 
            color={activeTab === 'my-requests' ? '#FFFFFF' : '#6B7280'} 
          />
            <Text style={[styles.tabText, activeTab === 'my-requests' && styles.activeTabText]}>
              내 신청
            </Text>
          </TouchableOpacity>
        </View>

        {/* 팀 생성 버튼 */}
        <View style={styles.createButtonContainer}>
          <TouchableOpacity
            style={styles.createTeamButton}
            onPress={() => setShowCreateScreen(true)}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.createTeamButtonText}>새 팀 만들기</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'invite' ? renderInviteCodeTab() : 
         activeTab === 'list' ? renderTeamListTab() : 
         renderMyRequestsTab()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#018479',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    minHeight: height * 0.6, // 최소 높이 설정으로 스크롤 가능하게
  },
  inviteSection: {
    minHeight: height * 0.5,
  },
  listSection: {
    minHeight: height * 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  teamGif: {
    width: 80,
    height: 80,
  },
  teamIcon: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  validateButton: {
    backgroundColor: '#018479',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#018479',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  teamPreview: {
    marginTop: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  cancelButton: {
    padding: 4,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#018479',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  teamRank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  teamSlogan: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#018479',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#018479',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  teamList: {
    maxHeight: height * 0.4,
  },
  teamListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  teamItemRank: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamItemSlogan: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  teamItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamItemStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  
  // 팀 생성 버튼 스타일
  createButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createTeamButton: {
    backgroundColor: '#018479',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#018479',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  createTeamButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // 내 가입 신청 내역 스타일
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  requestsList: {
    maxHeight: height * 0.5,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestTeamInfo: {
    flex: 1,
    marginRight: 12,
  },
  requestTeamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  requestTeamSlogan: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  requestStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  requestStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 6,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestDetailText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
});