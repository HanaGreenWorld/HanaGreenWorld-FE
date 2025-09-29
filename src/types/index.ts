export interface PointTransaction {
  id: string;
  date: string;
  time: string;
  description: string;
  category: string;
  points: number;
  type: 'earn' | 'use';
  icon?: string;
  image?: any;
  timestamp: number;
  balanceAfter?: number; // 거래 후 잔액 추가
}

export type FilterType = 'all' | 'earn' | 'use';
export type PeriodType = 'today' | 'week' | 'month' | '3months' | 'all';
export type SortType = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface PointsHookReturn {
  points: number;
  todayPoints: number;
  hanaMoney: number;
  loading: boolean;
  error: string | null;
  addPoints: (newPoints: number) => Promise<void>;
  usePoints: (usedPoints: number) => Promise<boolean>;
  refreshProfile: () => void;
}

// 등급 시스템 타입
export interface EcoLevel {
  id: string;
  name: string;
  description: string;
  requiredPoints: number;
  icon: string;
  color: string;
}

export interface UserStats {
  totalPoints: number;
  totalCarbonSaved: number;
  totalActivities: number;
  monthlyPoints: number;
  monthlyCarbonSaved: number;
  monthlyActivities: number;
  currentLevel: EcoLevel;
  nextLevel: EcoLevel;
  progressToNextLevel: number;
  pointsToNextLevel: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
}

// 퀴즈 관련 타입
export interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  pointsReward: number;
}

export interface QuizAttemptRequest {
  selectedAnswer: number;
}

export interface QuizAttemptResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  pointsAwarded: number;
}

export interface QuizRecord {
  id: number;
  quiz: Quiz;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsAwarded: number;
  attemptedAt: string;
}