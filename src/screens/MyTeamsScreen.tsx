import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Image, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import { useChat } from '../hooks/useChat';
import type { ChatTransport, ChatMessage } from '../types/chat';
import { teamApi, type TeamResponse, type ChatMessageResponse } from '../utils/teamApi';
import { WebSocketTransport } from '../utils/websocketTransport';
import { isLoggedIn } from '../utils/authUtils';
import TeamJoinScreen from './TeamJoinScreen';
import TeamManageScreen from './TeamManageScreen';
import { useUser } from '../hooks/useUser';

interface MyTeamsScreenProps { onBack?: () => void; onHome?: () => void }

// 단일 팀 가입 가정 (백엔드 연동 시 서버에서 내려줌)
const MY_TEAM = {
  id: 'green_garden',
  name: '우리가 일등',
  slogan: '하루 한 걸음, 지구 백 걸음',
  completedChallenges: 27,
  rank: 3,
  members: 12,
  owner: '그린리더',
  createdAt: '2025.03.01',
  inviteCode: 'GG-7X3K',
  currentChallenge: '주간 누적 걸음수 대결',
  totalSeeds: 3450,
  carbonSavedKg: 42.6,
};

export default function MyTeamsScreen({ onBack, onHome }: MyTeamsScreenProps) {
  const [draft, setDraft] = useState('');
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<ChatTransport | null>(null);
  const [showJoinScreen, setShowJoinScreen] = useState(false);
  const [showManageScreen, setShowManageScreen] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([]);
  const [noTeam, setNoTeam] = useState(false);
  const [teamMemberCount, setTeamMemberCount] = useState<number>(0);
  
  // 사용자 정보 가져오기
  const { userInfo } = useUser();

  // API에서 팀 데이터 로드
  useEffect(() => {
    loadTeamData();
  }, []);

  // 채팅 메시지 로드
  const loadChatMessages = async (teamId: number) => {
    try {
      console.log('=== 채팅 메시지 로드 시작 ===');
      const messages = await teamApi.getTeamMessages(teamId);
      console.log('로드된 메시지 수:', messages.length);
      
      // ChatMessageResponse를 ChatMessage로 변환
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        id: msg.messageId,
        teamId: String(msg.teamId),
        senderId: String(msg.senderId),
        senderName: msg.senderName,
        text: msg.messageText,
        createdAt: new Date(msg.createdAt).getTime()
      }));
      
      setLoadedMessages(chatMessages);
      console.log('변환된 채팅 메시지:', chatMessages);
    } catch (error) {
      console.error('채팅 메시지 로드 실패:', error);
    }
  };

  // 팀원 수 로드
  const loadTeamMemberCount = async (teamId: number) => {
    try {
      const members = await teamApi.getTeamMembers(teamId);
      setTeamMemberCount(members.members.length);
    } catch (error) {
      console.error('팀원 수 로드 실패:', error);
      setTeamMemberCount(0);
    }
  };

  // WebSocket Transport 초기화 - 팀 데이터가 로드된 후에만 실행
  useEffect(() => {
    if (!teamData || noTeam) return; // 팀이 없으면 WebSocket 초기화하지 않음

    const initTransport = async () => {
      try {
        console.log('WebSocket Transport 초기화 시작...');
        const wsTransport = new WebSocketTransport();
        await wsTransport.connect();
        setTransport(wsTransport);
        console.log('WebSocket Transport 초기화 완료! 🚀');
      } catch (error) {
        console.error('WebSocket Transport 초기화 실패:', error);
        // 실패 시 null로 설정하여 목업 데이터 사용
        setTransport(null);
      }
    };

    initTransport();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (transport) {
        transport.disconnect();
      }
    };
  }, [teamData, noTeam]); // teamData와 noTeam 상태에 의존

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoTeam(false);
      const data = await teamApi.getMyTeam();
      
      if (data === null) {
        // 팀이 없는 정상 상태
        console.log('사용자가 속한 팀이 없음 - 정상 상태');
        setNoTeam(true);
        setTeamData(null);
      } else {
        setTeamData(data);
        loadChatMessages(data.id);
        // 팀원 수 로드
        loadTeamMemberCount(data.id);
      }
    } catch (err: any) {
      console.error('팀 데이터 로드 실패:', err);
      setError('팀 정보를 불러오는데 실패했습니다.');
      
      // 에러 시 목업 데이터 사용
      const mockData = {
        id: 1,
        name: '우리가 일등',
        slogan: '하루 한 걸음, 지구 백 걸음',
        completedChallenges: 27,
        rank: 3,
        members: 12,
        owner: '그린리더',
        createdAt: '2025.03.01',
        inviteCode: 'GG-7X3K',
        currentChallenge: '주간 누적 걸음수 대결',
        totalSeeds: 3450,
        carbonSavedKg: 42.6,
        emblems: [],
        stats: {
          monthlyPoints: 1250,
          totalPoints: 3450,
          monthlyRank: 3,
          totalRank: 3,
          carbonSavedKg: 42.6,
          activeMembers: 12,
          completedChallengesThisMonth: 8
        }
      };
      setTeamData(mockData);
      // 목업 데이터로도 채팅 메시지 로드 시도
      loadChatMessages(mockData.id);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket Transport 사용
  const { messages, send } = useChat(
    transport, 
    teamData?.id?.toString() || null, 
    userInfo?.id?.toString() || '1'
  );

  const handleJoinSuccess = (team: TeamResponse) => {
    setTeamData(team);
    setNoTeam(false);
    setShowJoinScreen(false);
    // 팀 가입 후 채팅 메시지 로드
    loadChatMessages(team.id);
  };

  const handleShowJoinScreen = () => {
    setShowJoinScreen(true);
  };

  const handleTeamUpdate = (updatedTeam: TeamResponse | null) => {
    setTeamData(updatedTeam);
    if (updatedTeam === null) {
      setNoTeam(true);
    }
  };

  const handleLeaveTeam = async () => {
    const isLeader = userInfo?.name === teamData?.owner;
    
    if (isLeader && teamMemberCount > 1) {
      Alert.alert(
        '팀 탈퇴',
        '방장은 팀원이 있을 때 탈퇴할 수 없습니다.\n다른 팀원에게 방장 권한을 이양하거나 팀원을 모두 강퇴 후 탈퇴해주세요.',
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
              setTeamData(null);
              setNoTeam(true);
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

  const chatList = useMemo(() => {
    // 로드된 메시지와 실시간 메시지를 합치고 중복 제거
    const allMessages = [...loadedMessages, ...messages];
    const uniqueMessages = allMessages.filter((msg, index, self) => 
      index === self.findIndex(m => m.id === msg.id)
    );
    // 생성 시간순으로 정렬
    return uniqueMessages.sort((a, b) => a.createdAt - b.createdAt);
  }, [loadedMessages, messages]);
  
  const CURRENT_USER = { 
    id: userInfo?.id?.toString() || '1', 
    name: userInfo?.name || '사용자' 
  };
  const displayMessages: ChatMessage[] = chatList;

  // 로딩 중이거나 데이터가 없을 때
  if (showJoinScreen) {
    return (
      <TeamJoinScreen 
        onBack={() => setShowJoinScreen(false)}
        onJoinSuccess={() => {
          setShowJoinScreen(false);
          loadTeamData();
        }}
      />
    );
  }

  // 팀 관리 화면 표시
  if (showManageScreen && teamData) {
    return (
      <TeamManageScreen
        onBack={() => setShowManageScreen(false)}
        teamData={teamData}
        onTeamUpdate={handleTeamUpdate}
      />
    );
  }


  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="My팀" onBack={onBack} onHome={onHome} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>팀 정보를 불러오는 중... 🌱</Text>
        </View>
      </View>
    );
  }

  if (!teamData || noTeam) {
    return (
      <View style={styles.container}>
        <TopBar title="My팀" onBack={onBack} onHome={onHome} />
        <View style={styles.noTeamContainer}>
          <View style={styles.noTeamIcon}>
            <Image 
              source={require('../../assets/green_team.png')} 
              style={styles.noTeamImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.noTeamTitle}>팀에 속하지 않았어요</Text>
          <Text style={styles.noTeamSubtitle}>
            친구들과 함께 환경 보호에 참여해보세요!{'\n'}
            팀에 가입하여 챌린지를 함께 완료하고{'\n'}
            랭킹을 올려보세요.
          </Text>
          <TouchableOpacity
            style={styles.joinTeamButton}
            onPress={() => setShowJoinScreen(true)}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.joinTeamButtonText}>팀 가입하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="My팀" onBack={onBack} onHome={onHome} />

      {/* 팀 정보 카드 */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.teamCard}>
          <View style={styles.teamHeaderRow}>
            <View style={styles.teamNameSection}>
              <View style={styles.teamNameRow}>
                <Text style={styles.teamNameBig}>{teamData.name} 🌱</Text>
                <View style={styles.rankBadge}><Text style={styles.rankText}>🏆 {teamData.rank}위</Text></View>
              </View>
              <Text style={styles.teamSlogan}>{teamData.slogan}</Text>
            </View>
            <View style={styles.teamActionIcons}>
              {/* 팀 관리 아이콘 - 방장만 표시 */}
              {userInfo?.name === teamData?.owner && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => setShowManageScreen(true)}
                >
                  <Ionicons name="settings-outline" size={20} color="#6C7180" />
                </TouchableOpacity>
              )}

              {/* 팀 탈퇴 아이콘 */}
              {(() => {
                const isLeader = userInfo?.name === teamData?.owner;
                const canLeave = !isLeader || (isLeader && teamMemberCount === 1);

                return (
                  <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={handleLeaveTeam}
                    disabled={!canLeave}
                  >
                    <Ionicons
                      name="exit-outline"
                      size={20}
                      color={canLeave ? "#DC2626" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                );
              })()}
            </View>
          </View>
          {/* 메타 정보 */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>방장 {teamData.owner}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.metaText}>개설 {(() => {
              try {
                const date = new Date(teamData.createdAt);
                if (isNaN(date.getTime())) {
                  // Invalid date인 경우 기본값 반환
                  return '2025.01.01';
                }
                return date.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              } catch (error) {
                console.error('날짜 파싱 오류:', error);
                return '2025.01.01';
              }
            })()}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.inviteText}>초대코드 {teamData.inviteCode}</Text>
          </View>
          <View style={styles.teamStatsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{teamData.completedChallenges}</Text>
              <Text style={styles.statLabel}>성공한 챌린지</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{teamData.members}</Text>
              <Text style={styles.statLabel}>팀원 수</Text>
            </View>
          </View>



          {/* 진행 중 챌린지 */}
          <View style={styles.currentChallengeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentTitle}>진행 중 챌린지</Text>
              <Text style={styles.currentSubtitle}>{teamData.currentChallenge}</Text>
            </View>
            <Pressable style={styles.participateBtn}><Text style={styles.participateText}>바로가기</Text></Pressable>
          </View>

          {/* 누적 성과 */}
          <View style={styles.accumRow}>
            <View style={styles.accumChip}>
              <Image source={require('../../assets/hana3dIcon/hanaIcon3d_123.png')} style={styles.accumIcon} />
              <Text style={styles.accumLabel}>팀 포인트</Text>
              <Text style={styles.accumValue}>{teamData.totalSeeds.toLocaleString()}P</Text>
            </View>
            <View style={styles.accumChip}>
              <Image source={require('../../assets/hana3dIcon/hanaIcon3d_47.png')} style={styles.accumIcon} />
              <Text style={styles.accumLabel}>탄소절감</Text>
              <Text style={styles.accumValue}>{teamData.carbonSavedKg}kg</Text>
            </View>
          </View>
        </View>

        {/* 채팅 영역 */}
        <View style={styles.chatContainer}>
          <ScrollView 
            style={styles.chat} 
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {displayMessages.map((m, index) => {
              const isMe = m.senderId === CURRENT_USER.id;
              const name = m.senderName || (isMe ? CURRENT_USER.name : '알수없음');
              
              // 디버깅 로그 추가
              console.log('🎯 메시지 디버깅:', {
                messageId: m.id,
                senderId: m.senderId,
                senderIdType: typeof m.senderId,
                currentUserId: CURRENT_USER.id,
                currentUserIdType: typeof CURRENT_USER.id,
                isMe: isMe,
                text: m.text
              });
              
              // 고유한 key 생성: messageId + index + timestamp
              const uniqueKey = `${m.id || 'msg'}_${index}_${m.createdAt || Date.now()}`;
              return (
                <View key={uniqueKey} style={[styles.msgRow, isMe ? styles.rowMe : styles.rowOther]}>
                  <Text style={[styles.nameText, isMe && styles.nameRight]}>{name}</Text>
                  <View style={[styles.msgBubble, isMe ? styles.me : styles.other]}>
                    <Text style={[styles.msgText]}>{m.text}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput 
              value={draft} 
              onChangeText={setDraft} 
              placeholder="메시지를 입력하세요 💬" 
              style={styles.input}
              multiline
              maxLength={1000}
            />
            <Pressable 
              style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]} 
              onPress={() => { 
                console.log('🎯 메시지 전송 버튼 클릭:', { draft: draft.trim(), transport: !!transport, teamId: teamData?.id });
                if (draft.trim()) {
                  send(draft.trim()); 
                  setDraft(''); 
                }
              }}
              disabled={!draft.trim()}
            >
              <Text style={[styles.sendText, !draft.trim() && styles.sendTextDisabled]}>
                {transport ? '⬆️' : '⬆️'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  list: { flex: 1 },
  teamCard: { backgroundColor: '#FFFFFF', borderRadius: 16 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', margin: 20 * SCALE },
  teamHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamNameSection: {
    flex: 1,
    marginRight: 12 * SCALE,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * SCALE,
  },
  teamActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * SCALE,
    marginBottom: 12 * SCALE,
  },
  headerIconButton: {
    width: 32 * SCALE,
    height: 32 * SCALE,
    borderRadius: 16 * SCALE,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  teamNameBig: { fontSize: 20 * SCALE, fontWeight: '800', color: '#111827' },
  teamSlogan: { fontSize: 14 * SCALE, color: '#6B7280', marginTop: 4 * SCALE },
  rankBadge: { backgroundColor: '#FEF3C7', borderRadius: 12 * SCALE, paddingHorizontal: 10 * SCALE, paddingVertical: 6 * SCALE, borderWidth: 1, borderColor: '#FCD34D' },
  rankText: { fontSize: 12 * SCALE, color: '#92400E', fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 * SCALE, marginTop: 8 * SCALE },
  metaText: { fontSize: 12 * SCALE, color: '#6B7280' },
  inviteText: { fontSize: 12 * SCALE, color: '#0F8A80', fontWeight: '700' },
  dot: { color: '#D1D5DB' },
  teamStatsRow: { flexDirection: 'row', gap: 12 * SCALE, marginTop: 12 * SCALE },
  statChip: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12 * SCALE, paddingVertical: 12 * SCALE, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statValue: { fontSize: 18 * SCALE, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 2 * SCALE },
  chatWrap: { flex: 1, marginBottom: 20 * SCALE, marginHorizontal: 20 * SCALE, borderRadius: 12 * SCALE, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  menuList: { backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', margin: 20 * SCALE },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 * SCALE, paddingVertical: 16 * SCALE, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  lastItem: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE },
  teamBadge: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 20 * SCALE, backgroundColor: '#EAF8F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D6F0F0' },
  teamBadgeText: { fontSize: 12 * SCALE, fontWeight: '800', color: '#008986' },
  teamName: { fontSize: 16 * SCALE, color: '#111827', fontWeight: '600' },
  teamMeta: { fontSize: 12 * SCALE, color: '#6B7280' },
  chevron: { fontSize: 22 * SCALE, color: '#D1D5DB' },

  chatContainer: { 
    height: 300 * SCALE, // 채팅 영역 높이 고정
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20 * SCALE, // 좌우 여백 추가
    marginBottom: 20 * SCALE, // 하단 여백 추가
    borderRadius: 16 * SCALE, // 모서리 둥글게
    borderWidth: 1, // 테두리 추가
    borderColor: '#E5E7EB',
    overflow: 'hidden' // 자식 요소들이 둥근 모서리를 벗어나지 않도록
  },
  chat: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  chatContent: { 
    padding: 12 * SCALE,
    paddingBottom: 8 * SCALE
  },
  msgRow: { 
    marginBottom: 8 * SCALE
  },
  rowMe: { 
    alignItems: 'flex-end' // 내 메시지는 오른쪽 정렬
  },
  rowOther: { 
    alignItems: 'flex-start' // 다른 사람 메시지는 왼쪽 정렬
  },
  msgBubble: { 
    maxWidth: '70%', 
    paddingHorizontal: 12 * SCALE, 
    paddingVertical: 10 * SCALE, 
    borderRadius: 16 * SCALE,
    marginHorizontal: 4 * SCALE
  },
  me: { alignSelf: 'flex-end', backgroundColor: '#E8F3FF' },
  other: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6' },
  msgText: { fontSize: 14 * SCALE, color: '#111827' },
  nameText: { fontSize: 11 * SCALE, color: '#6B7280', marginBottom: 4 * SCALE },
  nameRight: { textAlign: 'right', alignSelf: 'flex-end' },
  sectionTitle: { fontSize: 14 * SCALE, color: '#111827', fontWeight: '800', marginTop: 14 * SCALE, marginBottom: 8 * SCALE },
  emblemRow: { flexDirection: 'row', gap: 10 * SCALE, marginBottom: 8 * SCALE },
  emblemBox: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 8 * SCALE, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  emblemImg: { width: 28 * SCALE, height: 28 * SCALE },
  emblemDim: { opacity: 0.35 },
  currentChallengeCard: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE, backgroundColor: '#F0FDF4', borderRadius: 12 * SCALE, padding: 12 * SCALE, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 8 * SCALE },
  currentTitle: { fontSize: 12 * SCALE, color: '#065F46', fontWeight: '700' },
  currentSubtitle: { fontSize: 14 * SCALE, color: '#065F46', marginTop: 2 * SCALE },
  participateBtn: { backgroundColor: '#065F46', paddingHorizontal: 10 * SCALE, paddingVertical: 8 * SCALE, borderRadius: 10 * SCALE },
  participateText: { color: '#FFFFFF', fontSize: 12 * SCALE, fontWeight: '700' },
  accumRow: { flexDirection: 'row', gap: 12 * SCALE, marginTop: 12 * SCALE },
  accumChip: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, padding: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  accumIcon: { width: 20 * SCALE, height: 20 * SCALE, marginBottom: 6 * SCALE },
  accumLabel: { fontSize: 12 * SCALE, color: '#6B7280' },
  accumValue: { fontSize: 14 * SCALE, color: '#111827', fontWeight: '800', marginTop: 2 * SCALE },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8 * SCALE, backgroundColor: '#F7F8FA', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22 * SCALE, paddingHorizontal: 14 * SCALE, paddingVertical: 10 * SCALE, marginRight: 8 * SCALE, fontSize: 14 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  sendBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 12 * SCALE, paddingVertical: 10 * SCALE, borderRadius: 22 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  sendBtnDisabled: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  sendText: { color: '#0F8A80', fontWeight: '700', fontSize: 12 * SCALE },
  sendTextDisabled: { color: '#9CA3AF' },
  
  // 로딩 및 에러 스타일
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 * SCALE },
  loadingText: { fontSize: 16 * SCALE, color: '#6B7280', textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 * SCALE },
  errorText: { fontSize: 16 * SCALE, color: '#EF4444', textAlign: 'center', marginBottom: 8 * SCALE },
  errorSubtext: { fontSize: 14 * SCALE, color: '#6B7280', textAlign: 'center', marginBottom: 20 * SCALE },
  retryButton: { backgroundColor: '#0F8A80', paddingHorizontal: 24 * SCALE, paddingVertical: 12 * SCALE, borderRadius: 8 * SCALE, marginBottom: 12 * SCALE },
  retryButtonText: { color: '#FFFFFF', fontSize: 14 * SCALE, fontWeight: '600' },
  joinButton: { backgroundColor: '#10B981', paddingHorizontal: 24 * SCALE, paddingVertical: 12 * SCALE, borderRadius: 8 * SCALE },
  joinButtonText: { color: '#FFFFFF', fontSize: 14 * SCALE, fontWeight: '600' },
  
  // 팀 없음 스타일
  noTeamContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 * SCALE,
    backgroundColor: '#F9FAFB'
  },
  noTeamIcon: { 
    marginBottom: 24 * SCALE,
  },
  noTeamImage: {
    width: 100 * SCALE,
    height: 100 * SCALE,
    backgroundColor: '#F3F4F6',
    borderRadius: 50 * SCALE,
    padding: 20 * SCALE
  },
  noTeamTitle: { 
    fontSize: 24 * SCALE, 
    fontWeight: '700', 
    color: '#374151', 
    textAlign: 'center',
    marginBottom: 12 * SCALE
  },
  noTeamSubtitle: { 
    fontSize: 16 * SCALE, 
    color: '#6B7280', 
    textAlign: 'center', 
    lineHeight: 24 * SCALE,
    marginBottom: 32 * SCALE
  },
  joinTeamButton: { 
    backgroundColor: '#10B981', 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32 * SCALE, 
    paddingVertical: 16 * SCALE, 
    borderRadius: 12 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  joinTeamButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16 * SCALE, 
    fontWeight: '600',
    marginLeft: 8 * SCALE
  },
  
  // 팀 관리 버튼 스타일
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    borderRadius: 8 * SCALE,
    // borderWidth: 1,
    // borderColor: '#10B981',
    backgroundColor: '#008479',
    marginTop: 12 * SCALE,
    gap: 6 * SCALE,
  },
  manageButtonText: {
    color: '#10B981',
    fontSize: 14 * SCALE,
    fontWeight: '500',
  },
  
  // 팀 탈퇴 버튼 스타일
  leaveTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#FFFFFF',
    marginTop: 8 * SCALE,
    gap: 6 * SCALE,
  },
  leaveTeamButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  leaveTeamButtonText: {
    color: '#DC2626',
    fontSize: 14 * SCALE,
    fontWeight: '500',
  },
  leaveTeamButtonTextDisabled: {
    color: '#9CA3AF',
  },
});


