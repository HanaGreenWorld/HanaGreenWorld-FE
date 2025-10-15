import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { challengeApi } from '../utils/challengeApi';

export const useChallengeAI = () => {
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [verifyingChallenges, setVerifyingChallenges] = useState<Record<string, boolean>>({});

  // AI 검증 시작
  const startAIVerification = useCallback(async (challengeId: number, imageUrl: string) => {
    const challengeIdStr = challengeId.toString();
    
    try {
      setVerifyingChallenges(prev => ({ ...prev, [challengeIdStr]: true }));
      
      console.log('🤖 AI 검증 시작:', { challengeId, imageUrl });
      
      const result = await challengeApi.verifyChallengeWithAI(challengeId, imageUrl);
      
      if (result) {
        setAiResults(prev => ({ ...prev, [challengeIdStr]: result }));
        console.log('✅ AI 검증 완료:', result);
        
        // 검증 결과에 따른 알림
        if (result.verificationStatus === 'APPROVED') {
          Alert.alert(
            '인증 성공! 🎉',
            'AI가 챌린지 인증을 승인했습니다!\n포인트가 지급되었습니다.',
            [{ text: '확인' }]
          );
        } else if (result.verificationStatus === 'REJECTED') {
          Alert.alert(
            '인증 실패',
            'AI가 챌린지 인증을 거부했습니다.\n다른 사진으로 다시 시도해주세요.',
            [{ text: '확인' }]
          );
        } else {
          Alert.alert(
            '검토 필요',
            'AI 검증이 완료되었습니다.\n관리자 검토 후 결과를 알려드리겠습니다.',
            [{ text: '확인' }]
          );
        }
      } else {
        Alert.alert('검증 실패', 'AI 검증 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('AI 검증 실패:', error);
      Alert.alert('검증 실패', 'AI 검증 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setVerifyingChallenges(prev => ({ ...prev, [challengeIdStr]: false }));
    }
  }, []);

  // AI 검증 결과 업데이트
  const updateAIResults = useCallback((challengeId: string, result: any) => {
    setAiResults(prev => ({ ...prev, [challengeId]: result }));
  }, []);

  // AI 검증 상태 업데이트
  const updateVerifyingStatus = useCallback((challengeId: string, isVerifying: boolean) => {
    setVerifyingChallenges(prev => ({ ...prev, [challengeId]: isVerifying }));
  }, []);

  return {
    aiResults,
    verifyingChallenges,
    startAIVerification,
    updateAIResults,
    updateVerifyingStatus,
    setAiResults,
    setVerifyingChallenges
  };
};
