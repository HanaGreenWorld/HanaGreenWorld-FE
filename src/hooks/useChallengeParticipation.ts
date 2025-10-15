import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { challengeApi } from '../utils/challengeApi';
import { LocalChallenge } from '../types/challenge';

export const useChallengeParticipation = () => {
  const [participationStatus, setParticipationStatus] = useState<Record<string, string>>({});
  const [teamChallengeStatus, setTeamChallengeStatus] = useState<Record<string, string>>({});
  const [participatedChallenges, setParticipatedChallenges] = useState<Record<string, boolean>>({});

  // 개인 챌린지 참여
  const participateInPersonalChallenge = useCallback(async (challenge: LocalChallenge): Promise<boolean> => {
    try {
      const participationResult = await challengeApi.participateInChallenge(challenge.id, {
        teamId: null
      });
      
      if (participationResult) {
        setParticipationStatus(prev => ({ ...prev, [challenge.id.toString()]: 'PARTICIPATED' }));
        
        Alert.alert(
          '챌린지 참여 완료',
          `${challenge.title}에 성공적으로 참여했습니다!\n이제 인증 사진을 업로드해주세요.`,
          [{ text: '확인', style: 'default' }]
        );
        return true;
      } else {
        Alert.alert('참여 실패', '챌린지 참여에 실패했습니다. 다시 시도해주세요.');
        return false;
      }
    } catch (error) {
      console.error('개인 챌린지 참여 실패:', error);
      Alert.alert('참여 실패', '챌린지 참여 중 오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    }
  }, []);

  // 팀 챌린지 참여
  const participateInTeamChallenge = useCallback(async (
    challenge: LocalChallenge,
    userTeamRole: 'LEADER' | 'MEMBER' | null,
    teamInfo: any,
    verifyTeamChallengeParticipation: (challenge: LocalChallenge) => Promise<boolean>
  ): Promise<boolean> => {
    try {
      if (userTeamRole !== 'LEADER') {
        Alert.alert(
          '권한 없음',
          '팀 챌린지는 팀장만 참여할 수 있습니다.\n\n현재 역할: ' + (userTeamRole === 'MEMBER' ? '팀원' : '알 수 없음'),
          [{ text: '확인', style: 'default' }]
        );
        return false;
      }
      
      const isValidParticipation = await verifyTeamChallengeParticipation(challenge);
      
      if (isValidParticipation) {
        const participationResult = await challengeApi.participateInChallenge(challenge.id, {
          teamId: teamInfo?.id
        });
        
        if (participationResult) {
          setParticipationStatus(prev => ({ ...prev, [challenge.id.toString()]: 'PARTICIPATED' }));
          updateTeamChallengeStatus(challenge.id.toString(), 'LEADER_PARTICIPATED');
          
          Alert.alert(
            '팀 확인 및 챌린지 참여 완료',
            `${challenge.title}에 성공적으로 참여했습니다!\n이제 팀원들과 함께 챌린지를 완료해보세요!`,
            [{ text: '확인', style: 'default' }]
          );
          return true;
        } else {
          Alert.alert('참여 실패', '챌린지 참여에 실패했습니다. 다시 시도해주세요.');
          return false;
        }
      } else {
        Alert.alert('참여 실패', '팀 챌린지 참여 조건을 만족하지 않습니다.');
        return false;
      }
    } catch (error) {
      console.error('팀 챌린지 참여 실패:', error);
      Alert.alert('참여 실패', '챌린지 참여 중 오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    }
  }, []);

  // 팀 챌린지 상태 업데이트
  const updateTeamChallengeStatus = useCallback((challengeId: string, status: string) => {
    setTeamChallengeStatus(prev => ({ ...prev, [challengeId]: status }));
  }, []);

  // 참여 상태 업데이트
  const updateParticipationStatus = useCallback((challengeId: string, status: string) => {
    setParticipationStatus(prev => ({ ...prev, [challengeId]: status }));
  }, []);

  // 참여 완료 상태 업데이트
  const updateParticipatedChallenges = useCallback((challengeId: string, participated: boolean) => {
    setParticipatedChallenges(prev => ({ ...prev, [challengeId]: participated }));
  }, []);

  return {
    participationStatus,
    teamChallengeStatus,
    participatedChallenges,
    participateInPersonalChallenge,
    participateInTeamChallenge,
    updateTeamChallengeStatus,
    updateParticipationStatus,
    updateParticipatedChallenges,
    setParticipationStatus,
    setTeamChallengeStatus,
    setParticipatedChallenges
  };
};
