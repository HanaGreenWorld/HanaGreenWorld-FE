import { API_BASE_URL } from './constants';
import { getAuthToken } from './authUtils';

// 팀 관련 타입 정의
export interface TeamResponse {
  id: number;
  name: string;
  slogan: string;
  completedChallenges: number;
  rank: number;
  members: number;
  maxMembers?: number; // 팀 최대 인원
  owner: string;
  isLeader?: boolean; // 현재 사용자가 팀장인지 여부
  createdAt: string;
  inviteCode: string;
  currentChallenge: string;
  totalSeeds: number;
  carbonSavedKg: number;
  emblems: EmblemResponse[];
  stats: TeamStatsResponse;
}

export interface EmblemResponse {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  isEarned: boolean;
  earnedAt: string;
}

export interface TeamStatsResponse {
  monthlyPoints: number;
  totalPoints: number;
  monthlyRank: number;
  totalRank: number;
  carbonSavedKg: number;
  monthlyCarbonSaved: number;
  activeMembers: number;
  completedChallengesThisMonth: number;
}

export interface TeamRankingResponse {
  myTeamRank: number;
  totalTeams: number;
  topTeams: TopTeamResponse[];
  myTeam: TeamRankingInfo;
}

export interface CurrentChallengeResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  isParticipating: boolean;
}

export interface ChatMessageResponse {
  messageId: string;
  teamId: number;
  senderId: number;
  senderName: string;
  messageText: string;
  messageType: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface TopTeamResponse {
  teamId: number;
  teamName: string;
  slogan: string;
  rank: number;
  totalPoints: number;
  monthlyPoints: number;
  members: number;
  leaderName: string;
  emblemUrl: string;
}

export interface TeamRankingInfo {
  teamId: number;
  teamName: string;
  currentRank: number;
  previousRank: number;
  monthlyPoints: number;
  totalPoints: number;
  members: number;
  trend: 'up' | 'down' | 'same';
  rankChange: number;
}

export interface TeamJoinRequest {
  inviteCode: string;
}

export interface TeamInviteCodeResponse {
  inviteCode: string;
}

export interface TeamCreateRequest {
  teamName: string;
  description?: string;
  maxMembers?: number;
}

export interface TeamMembersResponse {
  teamId: number;
  members: TeamMemberResponse[];
  totalCount: number;
}

export interface TeamMemberResponse {
  id: number; // 백엔드에서 'id' 필드로 반환됨
  name: string;
  email: string;
  role: 'LEADER' | 'MEMBER';
  totalPoints: number;
  monthlyPoints: number;
  joinedAt: string;
  profileImageUrl: string;
  isOnline: boolean;
}

export interface JoinRequestResponse {
  requestId: number;
  userId: number;
  userName: string;
  userLevel: number;
  requestDate: string;
  message?: string;
}

export interface MyJoinRequestResponse {
  requestId: number;
  teamId: number;
  teamName: string;
  teamSlogan: string;
  inviteCode: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  processedAt?: string;
  processedBy?: string;
}

// API 호출 함수들
export const teamApi = {
  // 내 팀 정보 조회
  async getMyTeam(): Promise<TeamResponse | null> {
    console.log('=== 팀 데이터 조회 시작 ===');
    const token = await getAuthToken();
    console.log('저장된 토큰:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.error('토큰이 없어서 팀 데이터 조회 실패');
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.');
    }
    
    console.log('API 요청:', `${API_BASE_URL}/teams/my-team`);
    const response = await fetch(`${API_BASE_URL}/teams/my-team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('인증 실패 - 토큰이 만료되었거나 유효하지 않음');
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (response.status === 403) {
        console.error('권한 없음 - 팀에 속하지 않거나 접근 권한 없음');
        throw new Error('팀 접근 권한이 없습니다.');
      }
      if (response.status === 404) {
        console.log('팀이 없음 - 사용자가 속한 팀이 없는 정상 상태');
        return null; // 404는 에러가 아닌 정상 상태로 처리
      }
      console.error(`팀 정보 조회 실패: ${response.status}`);
      throw new Error(`팀 정보 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('팀 데이터 조회 성공:', data);
    return data;
  },

  // 팀 랭킹 조회
  async getTeamRanking(): Promise<TeamRankingResponse> {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.');
    }
    
    const response = await fetch(`${API_BASE_URL}/teams/ranking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`팀 랭킹 조회 실패: ${response.status}`);
    }

    return response.json();
  },

  // 팀 통계 조회
  async getTeamStats(teamId: number): Promise<TeamStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`팀 통계 조회 실패: ${response.status}`);
    }

    return response.json();
  },

  // 팀 초대 코드 생성
  async generateInviteCode(teamId: number): Promise<TeamInviteCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invite-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`초대 코드 생성 실패: ${response.status}`);
    }

    return response.json();
  },

  // 팀 멤버 목록 조회
  async getTeamMembers(teamId: number): Promise<TeamMembersResponse> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`팀 멤버 조회 실패: ${response.status}`);
    }

    return response.json();
  },

  // 팀 가입 신청 (즉시 가입이 아닌 승인 대기)
  async requestJoinTeam(inviteCode: string): Promise<{ message: string }> {
    try {
      console.log('=== 팀 가입 신청 시작 ===');
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/teams/request-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || '팀 가입 신청에 실패했습니다.');
        }
        throw new Error(`팀 가입 신청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('팀 가입 신청 성공:', data);
      return data;
    } catch (error: any) {
      console.error('팀 가입 신청 실패:', error);
      // "이미 가입 신청을 했습니다" 메시지는 에러가 아닌 정보로 처리
      if (error.message && error.message.includes('이미 가입 신청을 했습니다')) {
        throw new Error('이미 가입 신청을 보낸 팀입니다.\n승인을 기다려주세요!');
      }
      throw error;
    }
  },

  // 팀 가입 신청 목록 조회 (방장용)
  async getJoinRequests(teamId: number): Promise<JoinRequestResponse[]> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/join-requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`가입 신청 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('가입 신청 목록 조회 실패:', error);
      throw error;
    }
  },

  // 가입 신청 승인/거절 (방장용)
  async handleJoinRequest(requestId: number, approve: boolean): Promise<{ message: string }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/teams/join-requests/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approve }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('가입 신청 처리 에러 응답:', errorData);
        throw new Error(errorData.message || `가입 신청 처리 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('가입 신청 처리 실패:', error);
      throw error;
    }
  },

  // 팀원 강퇴 (방장용)
  async kickMember(teamId: number, memberId: number): Promise<{ message: string }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/kick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('팀원 강퇴 에러 응답:', errorData);
        throw new Error(errorData.message || `팀원 강퇴 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('팀원 강퇴 실패:', error);
      throw error;
    }
  },

  // 팀 탈퇴
  async leaveTeam(): Promise<{ message: string }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/teams/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`팀 탈퇴 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('팀 탈퇴 실패:', error);
      throw error;
    }
  },

  // 방장 권한 이양
  async transferLeadership(teamId: number, newLeaderId: number): Promise<{ message: string }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/transfer-leadership`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newLeaderId }),
      });

      if (!response.ok) {
        throw new Error(`방장 권한 이양 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('방장 권한 이양 실패:', error);
      throw error;
    }
  },

  // 초대코드 검증
  async validateInviteCode(inviteCode: string): Promise<TeamResponse> {
    try {
      console.log('=== 초대코드 검증 시작 ===');
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/teams/validate-invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || '유효하지 않은 초대코드입니다.');
        }
        throw new Error(`초대코드 검증 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('초대코드 검증 성공:', data);
      return data;
    } catch (error) {
      console.error('초대코드 검증 중 오류 발생:', error);
      throw error;
    }
  },

  // 팀 목록 조회
  async getTeamList(): Promise<TeamResponse[]> {
    try {
      console.log('=== 팀 목록 조회 시작 ===');
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/teams/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`팀 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('팀 목록 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('팀 목록 조회 중 오류 발생:', error);
      throw error;
    }
  },

  // 팀 생성
  async createTeam(request: TeamCreateRequest): Promise<TeamResponse> {
    try {
      console.log('=== 팀 생성 시작 ===');
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/teams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || '팀 생성에 실패했습니다.');
        }
        throw new Error(`팀 생성 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('팀 생성 성공:', data);
      return data;
    } catch (error) {
      console.error('팀 생성 중 오류 발생:', error);
      throw error;
    }
  },

  // 팀 채팅 메시지 조회
  async getTeamMessages(teamId: number): Promise<ChatMessageResponse[]> {
    try {
      console.log('=== 팀 메시지 조회 시작 ===');
      const token = await getAuthToken();
      console.log('저장된 토큰:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!token) {
        console.error('인증 토큰이 없습니다');
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('팀 메시지 조회 응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('인증 실패 - 토큰이 만료되었거나 유효하지 않음');
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        console.error(`팀 메시지 조회 실패: ${response.status}`);
        throw new Error(`팀 메시지 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('팀 메시지 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('팀 메시지 조회 실패:', error);
      throw error;
    }
  },

  // 진행 중인 챌린지 조회
  async getCurrentChallenge(): Promise<CurrentChallengeResponse | null> {
    try {
      console.log('=== 진행 중인 챌린지 조회 시작 ===');
      const token = await getAuthToken();
      console.log('저장된 토큰:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!token) {
        console.error('인증 토큰이 없습니다');
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/challenges/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('진행 중인 챌린지 조회 응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('인증 실패 - 토큰이 만료되었거나 유효하지 않음');
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        if (response.status === 404) {
          console.log('진행 중인 챌린지가 없습니다');
          return null;
        }
        console.error(`진행 중인 챌린지 조회 실패: ${response.status}`);
        throw new Error(`진행 중인 챌린지 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('진행 중인 챌린지 데이터:', data);
      return data;
    } catch (error) {
      console.error('진행 중인 챌린지 조회 실패:', error);
      throw error;
    }
  },

  // 내 가입 신청 내역 조회
  async getMyJoinRequests(): Promise<MyJoinRequestResponse[]> {
    try {
      console.log('=== 내 가입 신청 내역 조회 시작 ===');
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/teams/my-join-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`내 가입 신청 내역 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('내 가입 신청 내역 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('내 가입 신청 내역 조회 실패:', error);
      throw error;
    }
  },

  // 팀장 권한 확인
  async isTeamLeader(): Promise<boolean> {
    try {
      console.log('=== 팀장 권한 확인 시작 ===');
      const token = await getAuthToken();
      
      if (!token) {
        console.error('인증 토큰이 없습니다');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/teams/my-team`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('인증 실패 - 토큰이 만료되었거나 유효하지 않음');
          return false;
        }
        if (response.status === 404) {
          console.log('팀에 속해있지 않습니다');
          return false;
        }
        console.error(`팀 정보 조회 실패: ${response.status}`);
        return false;
      }

      const data = await response.json();
      console.log('팀 정보 데이터:', data);
      
      // 팀장인지 확인 (현재 사용자가 팀장인지)
      const isLeader = data.isLeader || false;
      console.log('팀장 권한 확인 결과:', isLeader);
      
      return isLeader;
    } catch (error) {
      console.error('팀장 권한 확인 실패:', error);
      return false;
    }
  }
};

