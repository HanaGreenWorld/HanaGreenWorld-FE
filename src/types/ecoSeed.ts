export interface EcoSeedResponse {
  totalSeeds: number;        // 총 적립된 원큐씨앗
  currentSeeds: number;      // 현재 사용 가능한 원큐씨앗
  monthlySeeds: number;      // 이번달 적립된 원큐씨앗
  usedSeeds: number;         // 사용된 원큐씨앗
  convertedSeeds: number;    // 하나머니로 전환된 원큐씨앗
  message: string;           // 응답 메시지
}

export interface EcoSeedTransactionResponse {
  transactionId: number;
  transactionType: 'EARN' | 'USE';
  category: string;
  categoryDisplayName: string;
  categoryImageUrl: string;
  description: string;
  pointsAmount: number;
  balanceAfter: number;
  occurredAt: string; // ISO 8601 형식의 날짜 문자열
}

export interface EcoSeedEarnRequest {
  category: string;
  pointsAmount: number;
  description?: string;
}

export interface EcoSeedConvertRequest {
  pointsAmount: number;
}

export enum PointCategory {
  WALKING = 'WALKING',
  QUIZ = 'QUIZ',
  CHALLENGE = 'CHALLENGE',
  RECYCLING = 'RECYCLING',
  ECO_MERCHANT = 'ECO_MERCHANT',
  ELECTRONIC_RECEIPT = 'ELECTRONIC_RECEIPT',
  OTHER = 'OTHER'
}

export const PointCategoryDisplayName: Record<PointCategory, string> = {
  [PointCategory.WALKING]: '걷기',
  [PointCategory.QUIZ]: '퀴즈',
  [PointCategory.CHALLENGE]: '챌린지',
  [PointCategory.RECYCLING]: '재활용',
  [PointCategory.ECO_MERCHANT]: '친환경 가맹점',
  [PointCategory.ELECTRONIC_RECEIPT]: '전자확인증',
  [PointCategory.OTHER]: '기타'
};
