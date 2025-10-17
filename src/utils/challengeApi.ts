import { Platform } from 'react-native';
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
  // 챌린지 기간 정보
  startDate?: string;
  endDate?: string;
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

export interface ChallengeDetail extends Challenge {
  // 챌린지 기간 정보
  startDate?: string;
  endDate?: string;
  isCurrentlyActive: boolean;
  periodStatus: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  periodDescription: string;
  
  // 사용자 참여 정보
  participationDate?: string; // 실제 참여 완료 날짜 (APPROVED/REJECTED일 때만)
  participationMessage: string; // 참여 상태에 따른 메시지
  
  // 환경 임팩트 정보
  carbonSaved?: number;
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
      const token = await getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/challenges`, {
        headers,
      });
      
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
  getChallengeDetail: async (challengeId: number): Promise<ChallengeDetail | null> => {
    try {
      const token = await getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}`, {
        headers,
      });
      
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
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      console.log('챌린지 참여 API 호출:', { challengeId, request });

      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/participate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('챌린지 참여 응답 상태:', response.status);

      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('챌린지 참여 응답:', data);
      return data.data || null;
    } catch (error) {
      console.error('Error participating in challenge:', error);
      throw error; // 에러를 다시 던져서 호출하는 곳에서 처리할 수 있게 함
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
      
      // 안드로이드에서 네트워크 타임아웃 방지를 위한 AbortController 사용
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      const response = await fetch(`${API_BASE_URL}/challenges/my-participations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
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

  // 이미지 업로드 (서버에 실제 파일 저장) - FormData 방식 (개선)
  uploadImage: async (imageUri: string): Promise<string | null> => {
    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      console.log('📤 이미지 업로드 시작:', imageUri);

      // FormData 생성
      const formData = new FormData();
      
      // 파일명 생성 (확장자 포함)
      const extension = imageUri.split('.').pop() || 'jpg';
      const filename = `challenge_${Date.now()}.${extension}`;
      
      // React Native에서 FormData 사용 시 올바른 형식
      // iOS와 Android 모두 동일한 방식 사용 (더 안정적)
      formData.append('file', {
        uri: imageUri,
        type: `image/${extension}`,
        name: filename,
      } as any);

      console.log('📤 FormData 생성 완료, 서버로 전송 중...');

      // 먼저 서버 연결 테스트
      try {
        console.log('🔍 서버 연결 테스트 중...');
        const healthResponse = await fetch(`${API_BASE_URL}/upload/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('🔍 서버 연결 테스트 결과:', healthResponse.status);
      } catch (healthError) {
        console.error('🔍 서버 연결 테스트 실패:', healthError);
      }

      const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type은 FormData 사용 시 자동으로 설정됨
        },
        body: formData,
      });

      if (uploadResponse.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `이미지 업로드 실패: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      console.log('📤 이미지 업로드 성공:', uploadData);
      
      if (uploadData.success && uploadData.url) {
        return uploadData.url;
      } else {
        throw new Error('이미지 업로드 응답이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('❌ 이미지 업로드 실패:', error);
      throw error;
    }
  },

  // 챌린지 활동 내역 저장 (이미지와 함께)
  saveChallengeActivity: async (
    challengeId: number,
    imageUri: string,
    additionalData?: any
  ): Promise<ChallengeRecord | null> => {
    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      console.log('💾 챌린지 활동 저장 시작:', { challengeId, imageUri });

      // 먼저 이미지를 서버에 업로드
      let imageUrl: string;
      
      if (imageUri.startsWith('file://')) {
        // 로컬 파일인 경우 서버에 업로드
        console.log('📤 로컬 이미지 파일을 서버에 업로드 중...');
        const uploadedUrl = await challengeApi.uploadImage(imageUri);
        if (!uploadedUrl) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
        imageUrl = uploadedUrl;
        console.log('📤 이미지 업로드 완료, 서버 URL:', imageUrl);
      } else if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        // 이미 서버 URL인 경우 그대로 사용
        imageUrl = imageUri;
        console.log('🌐 이미 서버 URL 사용:', imageUrl);
      } else {
        throw new Error('지원하지 않는 이미지 URL 형식입니다.');
      }

      const requestBody = {
        imageUrl,
        activityDate: new Date().toISOString().split('T')[0],
        ...(additionalData || {})
      };

      console.log('💾 챌린지 활동 저장 요청:', requestBody);

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
      console.log('💾 챌린지 활동 저장 완료:', data);
      return data.data || null;
    } catch (error) {
      console.error('❌ 챌린지 활동 저장 실패:', error);
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

      // 안드로이드에서 네트워크 타임아웃 방지를 위한 AbortController 사용
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃 (AI 검증은 더 오래 걸릴 수 있음)

      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

  // 팀별 챌린지 참여 상태 조회
  getTeamChallengeParticipations: async (teamId: number): Promise<ChallengeRecord[]> => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/challenges/team/${teamId}/participations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting team challenge participations:', error);
      throw error;
    }
  },
  };