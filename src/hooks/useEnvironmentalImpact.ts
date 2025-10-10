import { useState, useEffect } from 'react';
import { fetchEnvironmentalImpact, fetchMonthlyEnvironmentalImpact } from '../utils/ecoSeedApi';

export interface EnvironmentalImpact {
  totalCarbonSaved: number;
  monthlyCarbonSaved: number;
  environmentalGrade: string;
  environmentalScore: number;
  impactLevel: string;
  impactDescription: string;
  impactIcon: string;
  impactColor: string;
  categoryImpacts: Array<{
    category: string;
    carbonSaved: number;
    description: string;
    icon: string;
  }>;
  impactTrends: Array<{
    date: string;
    carbonSaved: number;
    waterSaved: number;
    energySaved: number;
  }>;
  ranking: number;
  rankingDescription: string;
  achievements: string[];
  goals: {
    nextGrade: string;
    remainingCarbon: number;
    progressPercentage: number;
    description: string;
  };
  recommendations: string[];
  analysisDate: string;
}

export function useEnvironmentalImpact() {
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null);
  const [monthlyEnvironmentalImpact, setMonthlyEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = async () => {
    try {
      setLoading(true);
      const impact = await fetchEnvironmentalImpact();
      console.log('🔍 useEnvironmentalImpact - 받아온 데이터:', impact);
      console.log('🔍 useEnvironmentalImpact - monthlyCarbonSaved:', impact?.monthlyCarbonSaved);
      console.log('🔍 useEnvironmentalImpact - totalCarbonSaved:', impact?.totalCarbonSaved);
      setEnvironmentalImpact(impact);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch environmental impact:', err);
      setError('환경 임팩트 정보를 불러오는데 실패했습니다.');
      // 기본값 설정
      setEnvironmentalImpact({
        totalCarbonSaved: 0,
        monthlyCarbonSaved: 0,
        environmentalGrade: 'D급',
        environmentalScore: 0,
        impactLevel: '환경 새내기',
        impactDescription: '환경 보호 여정을 시작해보세요!',
        impactIcon: '🌱',
        impactColor: '#A7F3D0',
        categoryImpacts: [],
        impactTrends: [],
        ranking: 50,
        rankingDescription: '환경 보호에 참여하고 있습니다! 🌱',
        achievements: [],
        goals: {
          nextGrade: 'C급',
          remainingCarbon: 10,
          progressPercentage: 0,
          description: '다음 등급까지 10kg의 탄소를 더 절약하세요!'
        },
        recommendations: [
          '걷기 챌린지에 참여해보세요!',
          '친환경 퀴즈를 풀어보세요!',
          '재활용 챌린지에 도전해보세요!'
        ],
        analysisDate: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyImpact = async () => {
    try {
      const monthlyImpact = await fetchMonthlyEnvironmentalImpact();
      setMonthlyEnvironmentalImpact(monthlyImpact);
    } catch (err) {
      console.error('Failed to fetch monthly environmental impact:', err);
      // 기본값 설정
      setMonthlyEnvironmentalImpact({
        totalCarbonSaved: 0,
        monthlyCarbonSaved: 0,
        environmentalGrade: 'D급',
        environmentalScore: 0,
        impactLevel: '환경 새내기',
        impactDescription: '환경 보호 여정을 시작해보세요!',
        impactIcon: '🌱',
        impactColor: '#A7F3D0',
        categoryImpacts: [],
        impactTrends: [],
        ranking: 50,
        rankingDescription: '환경 보호에 참여하고 있습니다! 🌱',
        achievements: [],
        goals: {
          nextGrade: 'C급',
          remainingCarbon: 10,
          progressPercentage: 0,
          description: '다음 등급까지 10kg의 탄소를 더 절약하세요!'
        },
        recommendations: [
          '걷기 챌린지에 참여해보세요!',
          '친환경 퀴즈를 풀어보세요!',
          '재활용 챌린지에 도전해보세요!'
        ],
        analysisDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  useEffect(() => {
    fetchImpact();
    fetchMonthlyImpact();
  }, []);

  const refreshImpact = () => {
    fetchImpact();
    fetchMonthlyImpact();
  };

  return {
    environmentalImpact,
    monthlyEnvironmentalImpact,
    loading,
    error,
    refreshImpact,
  };
}
