import { LocalChallenge, CHALLENGE_ICONS } from '../types/challenge';
import { Challenge as ApiChallenge } from './challengeApi';
import { API_BASE_URL } from './constants';

// 챌린지 상태 타입 정의
export type ChallengeStatus = 'NOT_PARTICIPATED' | 'PARTICIPATED' | 'VERIFYING' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';
export type TeamChallengeStatus = 'NOT_STARTED' | 'LEADER_PARTICIPATED' | 'AI_VERIFYING' | 'COMPLETED';

// 챌린지 상태 변환 함수
export const convertToTeamChallengeStatus = (status: ChallengeStatus): TeamChallengeStatus => {
  switch (status) {
    case 'NOT_PARTICIPATED':
      return 'NOT_STARTED';
    case 'PENDING':
    case 'PARTICIPATED':
      return 'LEADER_PARTICIPATED';
    case 'VERIFYING':
    case 'NEEDS_REVIEW':
      return 'AI_VERIFYING';
    case 'APPROVED':
    case 'REJECTED':
      return 'COMPLETED';
    default:
      return 'NOT_STARTED';
  }
};

// 인증사진 업로드 섹션 표시 조건
export const shouldShowImageUpload = (
  challenge: LocalChallenge,
  participationStatus: Record<string, string>,
  teamChallengeStatus: Record<string, string>,
  userTeamRole: 'LEADER' | 'MEMBER' | null,
  aiResults: Record<string, any>
): boolean => {
  if (challenge.challengeType !== 'image') return false;
  
  const challengeId = challenge.id.toString();
  
  if (challenge.isTeamChallenge) {
    // 팀 챌린지: 팀장이고 참여 완료 후에만 표시
    return userTeamRole === 'LEADER' && 
           (participationStatus[challengeId] !== 'NOT_PARTICIPATED' || aiResults[challengeId]);
  } else {
    // 개인 챌린지: 참여 완료 후에만 표시
    return participationStatus[challengeId] !== 'NOT_PARTICIPATED' || aiResults[challengeId];
  }
};

// AI 검증 결과 표시 조건
export const shouldShowAIResults = (
  challenge: LocalChallenge,
  aiResults: Record<string, any>
): boolean => {
  if (challenge.challengeType !== 'image') return false;
  
  const challengeId = challenge.id.toString();
  const result = aiResults[challengeId];
  
  return !!(result && 
           result.verificationStatus && 
           result.verificationStatus !== 'PENDING' && 
           result.verificationStatus !== 'PARTICIPATED');
};

// 버튼 텍스트 생성
export const getButtonText = (
  status: string,
  hasImage: boolean,
  isVerifying: boolean
): string => {
  if (isVerifying) return 'AI 검증 중...';
  if (!hasImage) return '인증 사진을 먼저 업로드하세요';
  return '인증 완료하기';
};

// 버튼 비활성화 조건
export const isButtonDisabled = (
  hasImage: boolean,
  isVerifying: boolean,
  isUploading: boolean
): boolean => {
  return !hasImage || isVerifying || isUploading;
};

// 챌린지 완료 메시지 생성
export const getChallengeCompletionMessage = (challenge: LocalChallenge, points: number): string => {
  if (challenge.challengeType === 'image') {
    return `🎉 ${challenge.title} 챌린지를 완료했습니다!\n${points}개의 씨앗을 받았습니다!`;
  } else {
    return `🎉 ${challenge.title} 챌린지를 완료했습니다!\n${points}개의 씨앗을 받았습니다!`;
  }
};

// 이미지 URL 수정 함수
export const fixImageUrl = (imageUrl: string): string => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.warn('⚠️ 잘못된 이미지 URL:', imageUrl);
    return '';
  }
  
  const trimmedUrl = imageUrl.trim();
  if (!trimmedUrl) {
    console.warn('⚠️ 빈 이미지 URL');
    return '';
  }
  
  try {
    if (trimmedUrl.includes('localhost:8080')) {
      const fixedUrl = trimmedUrl.replace('http://localhost:8080', API_BASE_URL);
      console.log('🔧 이미지 URL 수정:', { original: imageUrl, fixed: fixedUrl });
      return fixedUrl;
    }
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    if (trimmedUrl.startsWith('file://')) {
      return trimmedUrl; // 로컬 파일은 그대로 반환
    }
    return `${API_BASE_URL}${trimmedUrl}`;
  } catch (error) {
    console.error('❌ 이미지 URL 처리 중 오류:', error);
    return '';
  }
};

// API 챌린지를 로컬 챌린지 형태로 변환하는 함수
export const convertApiChallengeToLocal = (apiChallenge: ApiChallenge): LocalChallenge => {
  // challengeType 결정 로직
  let challengeType: 'image' | 'steps' | 'simple' = 'image';
  
  // 걸음수 관련 챌린지들
  const stepsChallenges = ['WEEKLY_STEPS', 'DAILY_STEPS', 'TEAM_WALKING'];
  if (stepsChallenges.includes(apiChallenge.code)) {
    challengeType = 'steps';
  }

  // 기본 필드들을 추가하여 UI에서 사용할 수 있도록 함
  const localChallenge: LocalChallenge = {
    ...apiChallenge,
    challengeType,
    icon: CHALLENGE_ICONS[apiChallenge.code] || CHALLENGE_ICONS.default,
    // UI에서 필요한 기본 필드들 추가
    activity: apiChallenge.description,
    aiGuide: getAiGuide(apiChallenge.code),
    process: [
      '1. 챌린지 요구사항을 확인하세요',
      '2. 관련 활동을 수행하세요',
      '3. 인증 사진을 촬영하세요',
      '4. 사진을 업로드하세요',
      '5. AI 검증을 시작하세요'
    ],
    rewardDesc: apiChallenge.points ? `+${apiChallenge.points} 씨앗` : (apiChallenge.teamScore ? `팀 점수 +${apiChallenge.teamScore}` : ''),
    note: apiChallenge.isTeamChallenge ? '팀 챌린지' : '개인 챌린지',
  };

  return localChallenge;
};

// 챌린지별 AI 가이드 생성
export const getAiGuide = (code: string): string[] => {
  const aiGuides: Record<string, string[]> = {
    'REUSABLE_BAG': [
      '재사용 가능한 가방을 들고 있는 모습을 촬영하세요',
      '가방이 명확히 보이도록 촬영하세요',
      '가방의 재질이나 브랜드가 인식 가능하도록 하세요'
    ],
    'REUSABLE_BAG_EXTENDED': [
      '재사용 가능한 가방을 들고 있는 모습을 촬영하세요',
      '가방이 명확히 보이도록 촬영하세요',
      '가방의 재질이나 브랜드가 인식 가능하도록 하세요'
    ],
    'PLUGGING': [
      '전자기기 플러그를 뽑는 모습을 촬영하세요',
      '플러그가 뽑힌 상태가 명확히 보이도록 하세요',
      '전자기기가 꺼진 상태임을 보여주세요'
    ],
    'PLUGGING_MARATHON': [
      '전자기기 플러그를 뽑는 모습을 촬영하세요',
      '플러그가 뽑힌 상태가 명확히 보이도록 하세요',
      '전자기기가 꺼진 상태임을 보여주세요'
    ],
    'TEAM_PLUGGING': [
      '팀원들과 함께 전자기기 플러그를 뽑는 모습을 촬영하세요',
      '플러그가 뽑힌 상태가 명확히 보이도록 하세요',
      '팀원들이 함께 참여하는 모습을 보여주세요'
    ],
    'NO_PLASTIC': [
      '플라스틱을 사용하지 않는 모습을 촬영하세요',
      '대체품(유리병, 텀블러 등)을 사용하는 모습을 보여주세요',
      '플라스틱 제품이 없는 환경임을 보여주세요'
    ],
    'TUMBLER_CHALLENGE': [
      '텀블러를 사용하는 모습을 촬영하세요',
      '텀블러가 명확히 보이도록 촬영하세요',
      '일회용 컵 대신 텀블러를 사용하는 모습을 보여주세요'
    ],
    'RECYCLE': [
      '재활용품을 분리수거하는 모습을 촬영하세요',
      '재활용품이 올바른 분리수거함에 들어가는 모습을 보여주세요',
      '재활용 가능한 물품임을 명확히 보여주세요'
    ]
  };
  
  return aiGuides[code] || [
    '챌린지와 관련된 활동을 명확히 촬영하세요',
    '활동 내용이 잘 보이도록 조명에 주의하세요',
    '챌린지 요구사항을 충족하는 모습을 보여주세요'
  ];
};

// 검증 상태에 따른 설명 생성 함수
export const getVerificationExplanation = (status: string): string => {
  const explanations: Record<string, string> = {
    'APPROVED': '챌린지 요구사항을 성공적으로 충족했습니다.',
    'REJECTED': '챌린지 요구사항을 충족하지 못했습니다.',
    'PENDING': 'AI 검증이 진행 중입니다.',
    'NEEDS_REVIEW': '수동 검토가 필요합니다.',
    'VERIFIED': '인증이 완료되었습니다.'
  };
  
  return explanations[status] || '검증 상태를 확인할 수 없습니다.';
};
