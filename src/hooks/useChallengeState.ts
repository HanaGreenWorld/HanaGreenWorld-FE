import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { challengeApi } from '../utils/challengeApi';
import { teamApi } from '../utils/teamApi';
import { LocalChallenge } from '../types/challenge';

// 명확한 챌린지 상태 정의 (백엔드와 통일)
export type ChallengeState = 
  | 'NOT_PARTICIPATED'    // 참여하기 버튼 클릭 전, DB에 저장 X
  | 'PARTICIPATED'        // 참여하기 버튼 클릭, 이미지 업로드 전, DB에 저장
  | 'PENDING'             // 인증사진 업로드 완료, AI 검증 준비
  | 'VERIFYING'           // AI가 인증하는 중
  | 'APPROVED'            // AI 검증 승인
  | 'REJECTED'            // AI 검증 거부
  | 'NEEDS_REVIEW';       // 수동 검토 필요

// 팀 챌린지 상태 (팀장 관점, 백엔드와 통일)
export type TeamChallengeState = 
  | 'NOT_STARTED'         // 팀장이 참여하지 않음
  | 'LEADER_PARTICIPATED' // 팀장이 참여했지만 이미지 업로드 전
  | 'PENDING'             // 팀장이 이미지 업로드 완료
  | 'VERIFYING'           // AI 검증 진행 중
  | 'NEEDS_REVIEW'        // 수동 검토 필요
  | 'APPROVED'            // AI 검증 승인
  | 'REJECTED';           // AI 검증 거부

interface ChallengeStateData {
  state: ChallengeState;
  teamState?: TeamChallengeState;
  imageUrl?: string;
  aiResult?: any;
  isUploading?: boolean;
  isVerifying?: boolean;
}

export const useChallengeState = () => {
  const [challengeStates, setChallengeStates] = useState<Record<string, ChallengeStateData>>({});
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [userTeamRole, setUserTeamRole] = useState<'LEADER' | 'MEMBER' | null>(null);

  // 팀 정보 로드
  const loadTeamInfo = useCallback(async () => {
    try {
      console.log('🔍 팀 정보 가져오기 시작...');
      const team = await teamApi.getMyTeam();
      
      if (team) {
        setTeamInfo(team);
        setUserTeamRole('LEADER'); // 실제로는 API에서 확인 필요
        console.log('✅ 팀 정보 로드 완료:', team.name);
        return team;
      } else {
        setTeamInfo(null);
        setUserTeamRole(null);
        console.log('📝 사용자가 속한 팀이 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('팀 정보 로드 실패:', error);
      setTeamInfo(null);
      setUserTeamRole(null);
      return null;
    }
  }, []);

  // 챌린지 상태 초기화
  const initializeChallengeState = useCallback(async (challenge: LocalChallenge) => {
    const challengeId = challenge.id.toString();
    
    try {
      // 개인 챌린지 참여 이력 확인
      if (!challenge.isTeamChallenge) {
        const participations = await challengeApi.getMyChallengeParticipations();
        const participation = participations.find(p => p.challenge.id === challenge.id);
        
        if (participation) {
          const state = convertApiStatusToChallengeState(participation.verificationStatus);
          setChallengeStates(prev => ({
            ...prev,
            [challengeId]: {
              state,
              imageUrl: participation.imageUrl,
              aiResult: participation.aiConfidence ? {
                verificationStatus: participation.verificationStatus,
                confidence: participation.aiConfidence,
                explanation: participation.aiExplanation
              } : undefined
            }
          }));
        } else {
          setChallengeStates(prev => ({
            ...prev,
            [challengeId]: { state: 'NOT_PARTICIPATED' }
          }));
        }
      } else {
        // 팀 챌린지 참여 이력 확인
        if (teamInfo) {
          const teamParticipations = await challengeApi.getTeamChallengeParticipations(teamInfo.id);
          const participation = teamParticipations.find(p => p.challenge.id === challenge.id);
          
          if (participation) {
            const state = convertApiStatusToChallengeState(participation.verificationStatus);
            const teamState = convertApiStatusToTeamState(participation.verificationStatus);
            
            setChallengeStates(prev => ({
              ...prev,
              [challengeId]: {
                state,
                teamState,
                imageUrl: participation.imageUrl,
                aiResult: participation.aiConfidence ? {
                  verificationStatus: participation.verificationStatus,
                  confidence: participation.aiConfidence,
                  explanation: participation.aiExplanation
                } : undefined
              }
            }));
          } else {
            setChallengeStates(prev => ({
              ...prev,
              [challengeId]: { 
                state: 'NOT_PARTICIPATED',
                teamState: 'NOT_STARTED'
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('챌린지 상태 초기화 실패:', error);
      setChallengeStates(prev => ({
        ...prev,
        [challengeId]: { state: 'NOT_PARTICIPATED' }
      }));
    }
  }, [teamInfo]);

  // API 상태를 챌린지 상태로 변환
  const convertApiStatusToChallengeState = (apiStatus: string): ChallengeState => {
    switch (apiStatus) {
      case 'NOT_PARTICIPATED':
        return 'NOT_PARTICIPATED';
      case 'PARTICIPATED':
        return 'PARTICIPATED';
      case 'VERIFYING':
      case 'NEEDS_REVIEW':
        return 'VERIFYING';
      case 'APPROVED':
        return 'APPROVED';
      case 'REJECTED':
        return 'REJECTED';
      default:
        return 'NOT_PARTICIPATED';
    }
  };

  // API 상태를 팀 챌린지 상태로 변환
  const convertApiStatusToTeamState = (apiStatus: string): TeamChallengeState => {
    switch (apiStatus) {
      case 'NOT_PARTICIPATED':
        return 'NOT_STARTED';
      case 'PARTICIPATED':
        return 'LEADER_PARTICIPATED';
      case 'VERIFYING':
      case 'NEEDS_REVIEW':
        return 'VERIFYING';
      case 'APPROVED':
      case 'REJECTED':
        return 'APPROVED';
      default:
        return 'NOT_STARTED';
    }
  };

  // 챌린지 참여
  const participateInChallenge = useCallback(async (challenge: LocalChallenge): Promise<boolean> => {
    try {
      const participationResult = await challengeApi.participateInChallenge(challenge.id, {
        teamId: challenge.isTeamChallenge ? teamInfo?.id : undefined
      });
      
      if (participationResult) {
        const challengeId = challenge.id.toString();
        setChallengeStates(prev => ({
          ...prev,
          [challengeId]: {
            ...prev[challengeId],
            state: 'PARTICIPATED',
            teamState: challenge.isTeamChallenge ? 'LEADER_PARTICIPATED' : undefined
          }
        }));
        
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
      console.error('챌린지 참여 실패:', error);
      Alert.alert('참여 실패', '챌린지 참여 중 오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    }
  }, [teamInfo]);

  // 이미지 업로드
  const uploadImage = useCallback(async (challengeId: number, imageUri: string): Promise<boolean> => {
    const challengeIdStr = challengeId.toString();
    
    try {
      setChallengeStates(prev => ({
        ...prev,
        [challengeIdStr]: {
          ...prev[challengeIdStr],
          isUploading: true
        }
      }));

      // 실제 이미지 업로드 API 호출 (임시로 성공 처리)
      // const result = await challengeApi.uploadChallengeImage(challengeId, imageUri);
      const result = true; // 임시로 성공 처리
      
      if (result) {
        setChallengeStates(prev => ({
          ...prev,
          [challengeIdStr]: {
            ...prev[challengeIdStr],
            state: 'PENDING',
            teamState: prev[challengeIdStr].teamState === 'LEADER_PARTICIPATED' ? 'PENDING' : prev[challengeIdStr].teamState,
            imageUrl: imageUri,
            isUploading: false
          }
        }));
        return true;
      } else {
        setChallengeStates(prev => ({
          ...prev,
          [challengeIdStr]: {
            ...prev[challengeIdStr],
            isUploading: false
          }
        }));
        return false;
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setChallengeStates(prev => ({
        ...prev,
        [challengeIdStr]: {
          ...prev[challengeIdStr],
          isUploading: false
        }
      }));
      return false;
    }
  }, []);

  // AI 검증 시작
  const startAIVerification = useCallback(async (challengeId: number, imageUrl: string): Promise<boolean> => {
    const challengeIdStr = challengeId.toString();
    
    try {
      setChallengeStates(prev => ({
        ...prev,
        [challengeIdStr]: {
          ...prev[challengeIdStr],
          isVerifying: true,
          state: 'VERIFYING',
          teamState: prev[challengeIdStr].teamState === 'PENDING' ? 'VERIFYING' : prev[challengeIdStr].teamState
        }
      }));

      // 실제 AI 검증 API 호출 (임시로 성공 처리)
      // const result = await challengeApi.verifyChallengeWithAI(challengeId, imageUrl);
      const result = {
        verificationStatus: 'APPROVED',
        confidence: 0.95,
        explanation: '챌린지 요구사항을 성공적으로 충족했습니다.'
      }; // 임시로 성공 처리
      
      if (result) {
        setChallengeStates(prev => ({
          ...prev,
          [challengeIdStr]: {
            ...prev[challengeIdStr],
            isVerifying: false,
            state: result.verificationStatus === 'APPROVED' ? 'APPROVED' : 
                   result.verificationStatus === 'REJECTED' ? 'REJECTED' : 'NEEDS_REVIEW',
            teamState: 'APPROVED',
            aiResult: result
          }
        }));
        return true;
      } else {
        setChallengeStates(prev => ({
          ...prev,
          [challengeIdStr]: {
            ...prev[challengeIdStr],
            isVerifying: false
          }
        }));
        return false;
      }
    } catch (error) {
      console.error('AI 검증 실패:', error);
      setChallengeStates(prev => ({
        ...prev,
        [challengeIdStr]: {
          ...prev[challengeIdStr],
          isVerifying: false
        }
      }));
      return false;
    }
  }, []);

  // 챌린지 상태 가져오기
  const getChallengeState = useCallback((challengeId: number): ChallengeStateData | undefined => {
    return challengeStates[challengeId.toString()];
  }, [challengeStates]);

  // 상태별 UI 표시 조건
  const shouldShowImageUpload = useCallback((challenge: LocalChallenge): boolean => {
    const state = getChallengeState(challenge.id);
    if (!state) return false;
    
    return state.state !== 'NOT_PARTICIPATED';
  }, [getChallengeState]);

  const shouldShowAIResults = useCallback((challenge: LocalChallenge): boolean => {
    const state = getChallengeState(challenge.id);
    if (!state) return false;
    
    return ['VERIFYING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW'].includes(state.state);
  }, [getChallengeState]);

  const shouldShowTeamInfo = useCallback((challenge: LocalChallenge): boolean => {
    const state = getChallengeState(challenge.id);
    if (!state) return false;
    
    return challenge.isTeamChallenge && state.state !== 'NOT_PARTICIPATED';
  }, [getChallengeState]);

  return {
    challengeStates,
    teamInfo,
    userTeamRole,
    loadTeamInfo,
    initializeChallengeState,
    participateInChallenge,
    uploadImage,
    startAIVerification,
    getChallengeState,
    shouldShowImageUpload,
    shouldShowAIResults,
    shouldShowTeamInfo
  };
};
