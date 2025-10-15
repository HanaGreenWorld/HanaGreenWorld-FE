import { Challenge as ApiChallenge } from '../utils/challengeApi';

// 로컬에서 사용하는 챌린지 타입 (API 타입 + UI용 필드)
export type LocalChallenge = ApiChallenge & {
  challengeType: 'image' | 'steps' | 'simple';
  icon: any; // 로컬 아이콘 경로
  completedAt?: string | null;
  pointsEarned?: number;
  verificationStatus?: string;
  aiConfidence?: number;
  aiExplanation?: string;
};

// 챌린지 아이콘 매핑 (기존 UI와 동일)
export const CHALLENGE_ICONS: Record<string, any> = {
  'REUSABLE_BAG': require('../../assets/hana3dIcon/hanaIcon3d_107.png'),
  'PLUGGING': require('../../assets/plugging.png'),
  'TEAM_PLUGGING': require('../../assets/green_team.png'),
  'WEEKLY_STEPS': require('../../assets/hana3dIcon/hanaIcon3d_123.png'),
  'TEAM_WALKING': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'TUMBLER_CHALLENGE': require('../../assets/tumbler.png'),
  'RECYCLE': require('../../assets/hana3dIcon/zero_waste.png'),
  'ELECTRONIC_RECEIPT': require('../../assets/electronic_receipt.png'),
  'MULTIPLE_USE_CUP': require('../../assets/multiple_use_cup.png'),
  'TUMBLER': require('../../assets/tumbler.png'),
  'SOLAR_PANEL': require('../../assets/solar_panel.png'),
  'MONEY_FLUMERIDE': require('../../assets/money_flumeride.png'),
  'default': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
};

// 챌린지 상태 타입 (백엔드와 통일)
export type ChallengeStatus = 'NOT_PARTICIPATED' | 'PARTICIPATED' | 'PENDING' | 'VERIFYING' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';

// 팀 챌린지 상태 타입 (백엔드와 통일)
export type TeamChallengeStatus = 'NOT_STARTED' | 'LEADER_PARTICIPATED' | 'PENDING' | 'VERIFYING' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';

// 챌린지 타입별 분류
export const getChallengeType = (code: string): 'image' | 'steps' | 'simple' => {
  switch (code) {
    case 'REUSABLE_BAG':
    case 'PLUGGING':
    case 'TEAM_PLUGGING':
    case 'ELECTRONIC_RECEIPT':
    case 'MULTIPLE_USE_CUP':
    case 'TUMBLER':
    case 'SOLAR_PANEL':
    case 'MONEY_FLUMERIDE':
      return 'image';
    default:
      return 'image';
  }
};

// AI 가이드 메시지
export const getAiGuide = (code: string): string => {
  switch (code) {
    case 'REUSABLE_BAG':
      return '재사용 가능한 가방을 사용하는 모습을 촬영해주세요.';
    case 'PLUGGING':
      return '플로깅 활동을 하는 모습을 촬영해주세요.';
    case 'TEAM_PLUGGING':
      return '팀원들과 함께 플로깅 활동을 하는 모습을 촬영해주세요.';
    case 'ELECTRONIC_RECEIPT':
      return '전자영수증을 받는 모습을 촬영해주세요.';
    case 'MULTIPLE_USE_CUP':
      return '다회용 컵을 사용하는 모습을 촬영해주세요.';
    case 'TUMBLER':
      return '텀블러를 사용하는 모습을 촬영해주세요.';
    case 'SOLAR_PANEL':
      return '태양광 패널을 설치하거나 사용하는 모습을 촬영해주세요.';
    case 'MONEY_FLUMERIDE':
      return '금융 서비스를 이용하는 모습을 촬영해주세요.';
    default:
      return '챌린지 활동을 하는 모습을 촬영해주세요.';
  }
};
