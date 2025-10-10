import { API_BASE_URL } from './constants';
import { getAuthToken } from './authUtils';

export interface Challenge {
  id: number;
  code: string; // ChallengeCode enum value
  title: string;
  description: string;
  rewardPolicy: 'POINTS' | 'TEAM_SCORE';
  points?: number; // POINTS 정책일 때만 사용
  teamScore?: number; // TEAM_SCORE 정책일 때만 사용
  isTeamChallenge: boolean;
  isLeaderOnly: boolean; // 팀장만 참여 가능한 챌린지
  isActive: boolean;
  // 프론트엔드에서 추가로 필요한 필드들 (백엔드에는 없지만 UI에서 사용)
  iconUrl?: string;
  activity?: string;
  aiGuide?: string[];
  process?: string[];
  rewardDesc?: string;
  note?: string;
  isParticipated?: boolean;
  participationStatus?: string;
}

export interface ChallengeParticipationRequest {
  imageUrl?: string;
  stepCount?: number;
  teamId?: number;
}

export interface ChallengeRecord {
  id: number;
  challenge: Challenge;
  member: {
    memberId: number;
  };
  teamId?: number;
  activityDate: string;
  imageUrl?: string;
  stepCount?: number;
  verificationStatus: string;
  verifiedAt?: string;
  pointsAwarded?: number;
  teamScoreAwarded?: number;
  // AI 검증 관련 정보
  aiConfidence?: number;
  aiExplanation?: string;
  aiDetectedItems?: string;
}

export interface ChallengeParticipationResponse {
  challengeRecordId: number;
  challengeTitle: string;
  verificationStatus: string;
  message: string;
  pointsAwarded?: number;
  teamScoreAwarded?: number;
}

export const challengeApi = {
  // 활성화된 챌린지 목록 조회
  getActiveChallenges: async (): Promise<Challenge[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges`);
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  },

  // 챌린지 상세 정보 조회
  getChallengeDetail: async (challengeId: number): Promise<Challenge | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch challenge detail');
      }
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching challenge detail:', error);
      return null;
    }
  },

  // 챌린지 참여
  participateInChallenge: async (
    challengeId: number,
    request: ChallengeParticipationRequest
  ): Promise<ChallengeParticipationResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error('Failed to participate in challenge');
      }
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error participating in challenge:', error);
      return null;
    }
  },

  // 사용자 챌린지 참여 이력 조회
  getMyChallengeParticipations: async (): Promise<ChallengeRecord[]> => {
    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      console.log('🔐 API 호출 - 토큰 존재:', !!token);
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      console.log('📡 API 호출 시작: /challenges/my-participations');
      const response = await fetch(`${API_BASE_URL}/challenges/my-participations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📡 API 에러 응답:', errorText);
        throw new Error(`Failed to fetch challenge participations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📡 API 응답 데이터:', data);
      console.log('📡 참여 내역 개수:', data.data?.length || 0);
      
      // 각 참여 내역의 상세 정보 로깅
      if (data.data && data.data.length > 0) {
        data.data.forEach((record: any, index: number) => {
          console.log(`📡 참여 내역 ${index + 1}:`, {
            challengeId: record.challenge?.id,
            challengeTitle: record.challenge?.title,
            verificationStatus: record.verificationStatus,
            pointsAwarded: record.pointsAwarded,
            activityDate: record.activityDate
          });
        });
      } else {
        console.log('📡 ⚠️ API에서 참여 내역이 없습니다.');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching challenge participations:', error);
      return [];
    }
  },

  // 특정 챌린지 참여 상태 조회
  getChallengeParticipationStatus: async (challengeId: number): Promise<ChallengeRecord | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/participation-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch challenge participation status');
      }
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching challenge participation status:', error);
      return null;
    }
  },

  // 챌린지 활동 내역 저장 (이미지와 함께)
  saveChallengeActivity: async (
    challengeId: number,
    imageUrl: string,
    additionalData?: any
  ): Promise<ChallengeRecord | null> => {
    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const requestBody = {
        imageUrl,
        activityDate: new Date().toISOString().split('T')[0],
        ...(additionalData || {})
      };

      console.log('Challenge activity save request:', requestBody);

      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Challenge activity save response:', data);
      return data.data || null;
    } catch (error) {
      console.error('Error saving challenge activity:', error);
      throw error; // 에러를 다시 던져서 호출하는 곳에서 처리할 수 있게 함
    }
  },

  // AI 검증 시작
  startAiVerification: async (challengeId: number): Promise<ChallengeParticipationResponse | null> => {
    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      console.log('Starting AI verification for challenge:', challengeId);

      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI verification response:', data);
      return data.data || null;
    } catch (error) {
      console.error('Error starting AI verification:', error);
      throw error;
    }
  },
  };