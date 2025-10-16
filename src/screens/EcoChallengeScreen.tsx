import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS, API_BASE_URL } from '../utils/constants';
import CameraCapture from '../components/CameraCapture';
import { ImageUploader } from '../components/ImageUploader';
import { 
  submitWalkingSteps, 
  WalkingStepsRequest,
  fetchWalkingConsent,
  fetchTodayWalkingRecord
} from '../utils/ecoSeedApi';
import { challengeApi, Challenge as ApiChallenge } from '../utils/challengeApi';
import { teamApi } from '../utils/teamApi';
import { getUserInfo } from '../utils/authUtils';
import { LocalChallenge, CHALLENGE_ICONS } from '../types/challenge';
import { 
  convertApiChallengeToLocal, 
  getAiGuide, 
  getVerificationExplanation, 
  fixImageUrl,
  getChallengeCompletionMessage
} from '../utils/challengeUtils';
import TopBar from '../components/TopBar';

// ImagePicker 활성화
import * as ImagePicker from 'expo-image-picker';
let isSimulator = false;

// 시뮬레이터 감지
if (Platform.OS === 'ios') {
  try {
    const { Device } = require('expo-device');
    isSimulator = Device.isDevice === false;
  } catch (e) {
    isSimulator = true;
  }
} else {
  isSimulator = false;
}

interface EcoChallengeScreenProps {
  onBack: () => void;
  onShowHistory: () => void;
  onShowSeedHistory: () => void;
}

export default function EcoChallengeScreen({ onBack, onShowHistory, onShowSeedHistory }: EcoChallengeScreenProps) {
  // 기존 상태 관리 방식 사용 (안정성을 위해)
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [userTeamRole, setUserTeamRole] = useState<'LEADER' | 'MEMBER' | null>(null);

  // 팀 정보 로드 함수
  const loadTeamInfo = async () => {
    try {
      console.log('🔍 팀 정보 가져오기 시작...');
      const team = await teamApi.getMyTeam();
      
      if (team) {
        setTeamInfo(team);
        
        // 팀장 여부 확인 - 팀 정보에서 직접 확인
        try {
          console.log('🔍 팀 정보 전체:', team);
          console.log('🔍 팀 정보 isLeader 필드:', team.isLeader);
          
          // 팀 정보에서 직접 isLeader 필드 확인
          if (team.isLeader !== undefined && team.isLeader !== null) {
            setUserTeamRole(team.isLeader ? 'LEADER' : 'MEMBER');
            console.log('✅ 팀장 여부 확인 완료 (팀 정보):', { 
              teamName: team.name, 
              isLeader: team.isLeader,
              role: team.isLeader ? 'LEADER' : 'MEMBER' 
            });
          } else {
            // 백업 방법: owner 필드 확인
            const userInfo = await getUserInfo();
            console.log('🔍 사용자 정보:', userInfo);
            console.log('🔍 팀 owner 정보:', team.owner);
            
            const isOwner = team.owner === userInfo?.name || team.owner === userInfo?.email;
            setUserTeamRole(isOwner ? 'LEADER' : 'MEMBER');
            console.log('✅ 팀장 여부 확인 완료 (owner 필드):', { 
              teamName: team.name, 
              owner: team.owner, 
              userName: userInfo?.name,
              userEmail: userInfo?.email,
              isOwner,
              role: isOwner ? 'LEADER' : 'MEMBER' 
            });
          }
        } catch (roleError) {
          console.error('팀장 여부 확인 실패:', roleError);
          // 임시로 LEADER로 설정 (디버깅용)
          setUserTeamRole('LEADER');
          console.log('⚠️ 팀장 여부 확인 실패, 임시로 LEADER로 설정');
        }
        
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
  };

  // 기존 상태들 (점진적으로 제거 예정)
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [participationStatus, setParticipationStatus] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [walkingConnected, setWalkingConnected] = useState(false);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [galleryPermission, setGalleryPermission] = useState<any>(null);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const [pendingImages, setPendingImages] = useState<Record<string, string>>({});
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [verifyingChallenges, setVerifyingChallenges] = useState<Record<string, boolean>>({});
  const [participatedChallenges, setParticipatedChallenges] = useState<Record<string, boolean>>({});
  const [teamChallengeStatus, setTeamChallengeStatus] = useState<Record<string, string>>({});
  
  // API에서 받아온 챌린지 데이터
  const [challenges, setChallenges] = useState<LocalChallenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  
  const selected = challenges.find((c) => c.id.toString() === selectedId) || null;

  // 누락된 함수들 추가
  const participateInTeamChallenge = async (challenge: LocalChallenge) => {
    try {
      console.log('팀 챌린지 참여 시작:', challenge.title);
      
      // 팀장 권한 확인
      if (userTeamRole !== 'LEADER') {
        Alert.alert(
          '팀장 전용 챌린지',
          '이 챌린지는 팀장만 참여할 수 있습니다.\n\n팀장이 되어 팀을 대표해서 참여해보세요! 👑',
          [{ text: '확인', style: 'default' }]
        );
        return false;
      }
      
      const participationResult = await challengeApi.participateInChallenge(challenge.id, {
        teamId: teamInfo?.id // 팀 챌린지는 teamId 필요
      });
      
      if (participationResult) {
        // 팀 챌린지 상태 업데이트
        const challengeIdStr = challenge.id.toString();
        setTeamChallengeStatus(prev => {
          const newState = { 
            ...prev, 
            [challengeIdStr]: 'LEADER_PARTICIPATED' 
          };
          console.log('🔄 팀 챌린지 상태 업데이트:', { challengeId: challengeIdStr, newState });
          return newState;
        });
        
        Alert.alert(
          '팀 챌린지 참여 완료',
          `${challenge.title}에 성공적으로 참여했습니다!\n이제 인증 사진을 업로드해주세요.`,
          [{ text: '확인', style: 'default' }]
        );
        return true;
      } else {
        Alert.alert('참여 실패', '팀 챌린지 참여에 실패했습니다. 다시 시도해주세요.', [{ text: '확인' }]);
        return false;
      }
    } catch (error) {
      console.error('팀 챌린지 참여 실패:', error);
      Alert.alert('참여 실패', '팀 챌린지 참여 중 오류가 발생했습니다. 다시 시도해주세요.', [{ text: '확인' }]);
      return false;
    }
  };

  const participateInPersonalChallenge = async (challenge: LocalChallenge) => {
    try {
      console.log('개인 챌린지 참여 시작:', challenge.title);
      
      const participationResult = await challengeApi.participateInChallenge(challenge.id, {
        teamId: undefined // 개인 챌린지는 teamId 없음
      });
      
      if (participationResult) {
        // 참여 상태 업데이트
        setParticipationStatus(prev => ({ 
          ...prev, 
          [challenge.id.toString()]: 'PARTICIPATED' 
        }));
        
        Alert.alert(
          '챌린지 참여 완료',
          `${challenge.title}에 성공적으로 참여했습니다!\n이제 인증 사진을 업로드해주세요.`,
          [{ text: '확인', style: 'default' }]
        );
        return true;
      } else {
        Alert.alert('참여 실패', '챌린지 참여에 실패했습니다. 다시 시도해주세요.', [{ text: '확인' }]);
        return false;
      }
    } catch (error) {
      console.error('개인 챌린지 참여 실패:', error);
      Alert.alert('참여 실패', '챌린지 참여 중 오류가 발생했습니다. 다시 시도해주세요.', [{ text: '확인' }]);
      return false;
    }
  };

  const handleStepsChallenge = async (challenge: LocalChallenge) => {
    console.log('걸음수 챌린지 처리:', challenge.title);
    
    // 이미 오늘 제출한 기록이 있는지 확인
    try {
      const todayRecord = await fetchTodayWalkingRecord();
      if (todayRecord.walkingId) {
        // 이미 오늘 제출한 기록이 있음
        Alert.alert(
          '이미 완료됨',
          '오늘은 이미 걸음수 챌린지를 완료했습니다!',
          [{ text: '확인' }]
        );
        // 챌린지 완료 상태로 설정
        setCompleted(prev => ({ ...prev, [challenge.id.toString()]: true }));
        return;
      }
    } catch (error) {
      console.log('오늘 기록 확인 실패, 모달을 계속 표시:', error);
    }
    
    setShowStepsModal(true);
  };

  // 총 보상 계산
  const totalReward = useMemo(() => {
    return challenges.reduce((acc, c) => {
      const challengeId = c.id.toString();
      const isCompleted = completed[challengeId] || 
                         aiResults[challengeId] ||
                         c.isParticipated;
      return acc + (!isCompleted ? (c.points || 0) : 0);
    }, 0);
  }, [completed, challenges, aiResults]);
  
  const completedReward = useMemo(() => {
    return challenges.reduce((acc, c) => {
      const challengeId = c.id.toString();
      // 성공한 챌린지만 계산 (승인된 것만)
      const isSuccess = completed[challengeId] || 
                        aiResults[challengeId]?.verificationStatus === 'APPROVED';
      return acc + (isSuccess ? (c.points || 0) : 0);
    }, 0);
  }, [completed, challenges, aiResults]);
  
  const completedCount = useMemo(() => {
    return challenges.filter(c => {
      const challengeId = c.id.toString();
      return completed[challengeId] || 
             aiResults[challengeId] ||
             c.isParticipated;
    }).length;
  }, [completed, challenges, aiResults]);

  // 챌린지 데이터 로드
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoadingChallenges(true);
        console.log('API에서 챌린지 데이터 가져오는 중...');
        const apiChallenges = await challengeApi.getActiveChallenges();
        
        // 팀 정보도 함께 가져오기
        try {
          await loadTeamInfo();
        } catch (error) {
          console.error('❌ 팀 정보 가져오기 실패 (초기 로드):', error);
        }
        console.log('API 챌린지 데이터:', apiChallenges);
        
        if (apiChallenges && apiChallenges.length > 0) {
          const localChallenges = apiChallenges.map(convertApiChallengeToLocal);
          setChallenges(localChallenges);
          console.log('변환된 로컬 챌린지:', localChallenges);
          
          // 참여 상태는 fetchCompletedData에서 설정됨
        } else {
          console.log('활성 챌린지가 없습니다.');
          setChallenges([]);
        }
      } catch (error) {
        console.error('챌린지 데이터 로드 실패:', error);
        console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace');
        setChallenges([]);
      } finally {
        setIsLoadingChallenges(false);
      }
    };

    fetchChallenges();
  }, []); // 의존성 배열을 빈 배열로 변경하여 한 번만 실행

  // 완료된 챌린지 데이터 가져오기
  useEffect(() => {
    const fetchCompletedData = async () => {
      try {
        console.log('완료된 챌린지 데이터 가져오기 시작...');
        const participations = await challengeApi.getMyChallengeParticipations();
        console.log('참여한 챌린지들:', participations);
        
        const completedState: Record<string, boolean> = {};
        const participatedState: Record<string, boolean> = {};
        const participationStatusState: Record<string, string> = {};
        const teamChallengeStatusState: Record<string, string> = {};
        const imagesState: Record<string, string> = {};
        const pendingImagesState: Record<string, string> = {};
        const aiResultsState: Record<string, any> = {};
        
        participations.forEach(participation => {
          const challengeId = participation.challenge.id.toString();
          const status = participation.verificationStatus;
          const isTeamChallenge = participation.challenge.isTeamChallenge;
          
          // 참여 상태 설정 (모든 참여한 챌린지는 PARTICIPATED 상태)
          participatedState[challengeId] = true;
          
          if (isTeamChallenge) {
            // 팀 챌린지 상태 설정 (백엔드 상태 그대로 사용)
            if (status === 'PARTICIPATED') {
              teamChallengeStatusState[challengeId] = 'LEADER_PARTICIPATED';
            } else if (status === 'PENDING') {
              teamChallengeStatusState[challengeId] = 'PENDING';
            } else if (status === 'VERIFYING') {
              teamChallengeStatusState[challengeId] = 'VERIFYING';
            } else if (status === 'NEEDS_REVIEW') {
              teamChallengeStatusState[challengeId] = 'NEEDS_REVIEW';
            } else if (status === 'APPROVED' || status === 'REJECTED') {
              teamChallengeStatusState[challengeId] = status;
            }
          } else {
            // 개인 챌린지 상태 설정 (백엔드 상태 그대로 사용)
            if (status === 'PARTICIPATED') {
              participationStatusState[challengeId] = 'PARTICIPATED';
            } else if (status === 'PENDING') {
              participationStatusState[challengeId] = 'PENDING';
            } else if (status === 'VERIFYING') {
              participationStatusState[challengeId] = 'VERIFYING';
            } else if (status === 'NEEDS_REVIEW') {
              participationStatusState[challengeId] = 'NEEDS_REVIEW';
            } else if (status === 'APPROVED' || status === 'REJECTED') {
              participationStatusState[challengeId] = status;
            }
          }
          
          // 완료 상태 설정 (승인된 것만)
          if (status === 'APPROVED' || status === 'REJECTED') {
            completedState[challengeId] = true;
          }
          
          // 이미지가 있으면 저장 (서버에서 받은 URL은 pendingImages에만 저장)
          if (participation.imageUrl && typeof participation.imageUrl === 'string') {
            const imageUrl = participation.imageUrl;
            // capturedImages는 화면 표시용이므로 서버 URL을 그대로 사용 (fixImageUrl에서 처리됨)
            imagesState[challengeId] = imageUrl;
            pendingImagesState[challengeId] = imageUrl; // AI 검증용
            console.log('📸 이미지 로드:', { challengeId, imageUrl });
          }
          
          // AI 검증 결과 저장
          if (participation.aiConfidence || participation.aiExplanation) {
            aiResultsState[challengeId] = {
              verificationStatus: participation.verificationStatus,
              confidence: participation.aiConfidence,
              explanation: participation.aiExplanation,
              aiDetectedItems: participation.aiDetectedItems,
              verifiedAt: participation.verifiedAt // 완료 날짜 추가
            };
          }
        });
        
        // 참여하지 않은 챌린지들에 대해서도 NOT_PARTICIPATED 상태 설정
        challenges.forEach(challenge => {
          const challengeId = challenge.id.toString();
          if (!participationStatusState[challengeId]) {
            participationStatusState[challengeId] = 'NOT_PARTICIPATED';
          }
          if (!teamChallengeStatusState[challengeId] && challenge.isTeamChallenge) {
            teamChallengeStatusState[challengeId] = 'NOT_STARTED';
          }
        });
        
        setCompleted(completedState);
        setParticipatedChallenges(participatedState);
        setParticipationStatus(participationStatusState);
        setTeamChallengeStatus(teamChallengeStatusState);
        setCapturedImages(imagesState);
        setPendingImages(pendingImagesState);
        setAiResults(aiResultsState);
        
        console.log('완료된 챌린지 데이터 로드 완료:', { 
          completedState, 
          participationStatusState, 
          teamChallengeStatusState 
        });
      } catch (error) {
        console.error('완료된 챌린지 데이터 로드 실패:', error);
        console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace');
      }
    };

    if (challenges.length > 0) {
      fetchCompletedData();
    }
  }, [challenges]); // challenges가 로드된 후에 실행

  // 걸음수 생성 함수 (WalkingScreen에서 가져옴)
  const generateTodaySteps = (): number => {
    const baseSteps = Math.floor(2000 + Math.random() * 13000);
    const hour = new Date().getHours();
    let multiplier = 1.0;
    
    if (hour >= 6 && hour <= 9) {
      multiplier = 1.2 + Math.random() * 0.3;
    } else if (hour >= 12 && hour <= 14) {
      multiplier = 0.8 + Math.random() * 0.4;
    } else if (hour >= 18 && hour <= 21) {
      multiplier = 1.1 + Math.random() * 0.4;
    } else if (hour >= 22 || hour <= 5) {
      multiplier = 0.3 + Math.random() * 0.4;
    }
    
    return Math.floor(baseSteps * multiplier);
  };

  // 걸음수 연결 확인 및 데이터 로드
  useEffect(() => {
    const checkWalkingConnection = async () => {
      try {
        const consentResponse = await fetchWalkingConsent();
        setWalkingConnected(consentResponse.isConsented);
        
        if (consentResponse.isConsented) {
          // 권한이 있으면 오늘 기록 조회
          try {
            const todayRecord = await fetchTodayWalkingRecord();
            if (todayRecord.walkingId) {
              // 오늘 이미 기록이 있음
              setCurrentSteps(todayRecord.steps || 0);
            } else {
              // 오늘 기록이 없음 - 0으로 초기화 (더미데이터 제거)
              setCurrentSteps(0);
            }
          } catch (error) {
            // 오늘 기록 조회 실패 시 0으로 초기화 (더미데이터 제거)
            setCurrentSteps(0);
          }
        } else {
          // 권한이 없으면 기본값 설정
          setCurrentSteps(0);
        }
        
        console.log('걸음수 연결 상태:', consentResponse.isConsented);
      } catch (error) {
        console.error('걸음수 연결 확인 실패:', error);
        setWalkingConnected(false);
        setCurrentSteps(0);
      }
    };

    checkWalkingConnection();
  }, []); // 의존성 배열을 빈 배열로 변경하여 한 번만 실행

  // 갤러리 권한 설정
  useEffect(() => {
    setGalleryPermission({ granted: true, canAskAgain: true, status: 'granted' });
  }, []); // 의존성 배열을 빈 배열로 변경하여 한 번만 실행


  const uploadImage = async (challengeId: number, imageUri: string): Promise<boolean> => {
    // 임시로 성공 처리
    return true;
  };

  const startAIVerification = async (challengeId: number, imageUrl: string): Promise<boolean> => {
    // 임시로 성공 처리
    return true;
  };

  // 이미지 URL 연결 테스트 함수
  const testImageUrl = async (imageUrl: string) => {
    try {
      console.log(`🔍 이미지 URL 연결 테스트 시작: ${imageUrl}`);
      
      // 타임아웃 설정 (5초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`🔍 이미지 URL 응답 상태: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ 이미지 URL 접근 가능');
        return true;
      } else {
        console.log(`❌ 이미지 URL 접근 실패: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('❌ 이미지 URL 테스트 실패:', error);
      return false;
    }
  };

  const getChallengeState = (challengeId: number) => {
    const challengeIdStr = challengeId.toString();
    let state: 'NOT_PARTICIPATED' | 'PARTICIPATED' | 'PENDING' | 'VERIFYING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW' = 'NOT_PARTICIPATED';
    
    // participationStatus나 teamChallengeStatus를 우선적으로 확인
    const currentParticipationStatus = participationStatus[challengeIdStr];
    const currentTeamChallengeStatus = teamChallengeStatus[challengeIdStr];
    
    if (currentParticipationStatus && currentParticipationStatus !== 'NOT_PARTICIPATED') {
      state = currentParticipationStatus as any;
    } else if (currentTeamChallengeStatus && currentTeamChallengeStatus !== 'NOT_STARTED') {
      state = currentTeamChallengeStatus as any;
    } else if (completed[challengeIdStr]) {
      state = 'APPROVED';
    } else if (verifyingChallenges[challengeIdStr]) {
      state = 'VERIFYING';
    } else if (capturedImages[challengeIdStr]) {
      state = 'PENDING';
    } else if (participatedChallenges[challengeIdStr]) {
      state = 'PARTICIPATED';
    }
    
    return {
      state,
      teamState: undefined,
      imageUrl: capturedImages[challengeIdStr] ? fixImageUrl(capturedImages[challengeIdStr]) : undefined,
      aiResult: aiResults[challengeIdStr],
      isUploading: uploadingImages[challengeIdStr],
      isVerifying: verifyingChallenges[challengeIdStr]
    };
  };

  const shouldShowImageUpload = (challenge: LocalChallenge) => {
    const challengeIdStr = challenge.id.toString();
    const isParticipated = participatedChallenges[challengeIdStr] || 
                          participationStatus[challengeIdStr] === 'PARTICIPATED' ||
                          (challenge.isTeamChallenge && teamChallengeStatus[challengeIdStr] === 'LEADER_PARTICIPATED');
    
    return isParticipated && !completed[challengeIdStr] && !aiResults[challengeIdStr];
  };

  const shouldShowAIResults = (challenge: LocalChallenge) => {
    const challengeIdStr = challenge.id.toString();
    return !!aiResults[challengeIdStr];
  };

  const shouldShowTeamInfo = (challenge: LocalChallenge) => {
    return challenge.isTeamChallenge && teamInfo;
  };

  // 챌린지 참여하기 버튼 클릭 핸들러
  const handleChallengePress = async (challenge: LocalChallenge) => {
    const challengeId = challenge.id.toString();
    
    // 이미 참여한 챌린지인 경우 상세 모달 표시
    if (participatedChallenges[challengeId] || completed[challengeId] || aiResults[challengeId]) {
      setSelectedId(challengeId);
      return;
    }

    // 팀 챌린지인 경우 상세 모달만 표시 (참여는 버튼 클릭 시에만)
    if (challenge.isTeamChallenge) {
      // 팀 정보가 없으면 다시 가져오기
      if (!teamInfo) {
        try {
          await loadTeamInfo();
        } catch (error) {
          console.error('팀 정보 가져오기 실패:', error);
        }
      }
      setSelectedId(challengeId);
      return;
    }

    // 개인 챌린지인 경우 바로 상세 모달 표시
    setSelectedId(challengeId);
  };

  // 이미지 선택 완료 핸들러
  const handleImageSelection = async (imageUri: string) => {
    if (!selected) return;
    
    const challengeIdStr = selected.id.toString();
    
    // 업로드 상태 설정
    setUploadingImages(prev => ({ ...prev, [challengeIdStr]: true }));
    
    try {
      // 실제 이미지 업로드 API 호출
      const uploadResult = await challengeApi.saveChallengeActivity(selected.id, imageUri);
      
      if (uploadResult) {
        // 서버에 업로드된 이미지 URL 사용 (uploadResult.imageUrl 또는 imageUri)
        const serverImageUrl = uploadResult.imageUrl || imageUri;
        
        // 해당 챌린지에만 이미지 저장 (로컬 URI는 화면 표시용, 서버 URL은 AI 검증용)
        setCapturedImages(prev => ({ ...prev, [challengeIdStr]: imageUri })); // 화면 표시용 로컬 URI
        
        // pendingImages에는 서버 URL 저장 (AI 검증용)
        setPendingImages(prev => ({ ...prev, [challengeIdStr]: serverImageUrl }));
        
        // 상태를 PENDING으로 업데이트 (이미지 업로드 완료, AI 검증 대기)
        if (selected.isTeamChallenge) {
          setTeamChallengeStatus(prev => {
            const newState = { ...prev, [challengeIdStr]: 'PENDING' };
            console.log('팀 챌린지 상태 업데이트:', newState);
            return newState;
          });
        } else {
          setParticipationStatus(prev => {
            const newState = { ...prev, [challengeIdStr]: 'PENDING' };
            console.log('개인 챌린지 상태 업데이트:', newState);
            return newState;
          });
        }
        
        console.log('이미지 업로드 성공:', { 
          challengeId: challengeIdStr, 
          localUri: imageUri,
          serverUrl: serverImageUrl,
          newStatus: 'PENDING',
          isTeamChallenge: selected.isTeamChallenge
        });
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      
      // 중복 이미지 에러인지 확인
      if (error instanceof Error && error.message.includes('중복된 이미지')) {
        Alert.alert(
          '⚠️ 중복 이미지 감지', 
          '이미 사용된 이미지입니다.\n\n다른 사진을 촬영하거나 갤러리에서 새로운 이미지를 선택해주세요.', 
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('업로드 실패', '이미지 업로드에 실패했습니다. 다시 시도해주세요.', [{ text: '확인' }]);
      }
    } finally {
      // 업로드 상태 해제
      setUploadingImages(prev => ({ ...prev, [challengeIdStr]: false }));
    }
    
    setShowImageOptions(false);
    setShowCamera(false);
  };

  // AI 검증 시작 함수
  const handleAiVerification = async (challengeId: number, imageUrl: string) => {
    const challengeIdStr = challengeId.toString();
    
    try {
      // 상태 검증: 이미지가 업로드되었는지 확인
      if (!imageUrl || imageUrl.trim() === '') {
        Alert.alert('오류', '인증 사진이 없습니다. 먼저 사진을 업로드해주세요.', [{ text: '확인' }]);
        return;
      }
      
      // 상태 검증: 챌린지 참여 상태 확인
      const selected = challenges.find(c => c.id === challengeId);
      if (!selected) {
        Alert.alert('오류', '챌린지 정보를 찾을 수 없습니다.', [{ text: '확인' }]);
        return;
      }
      
      // 팀 챌린지인 경우 팀장 참여 상태 확인
      if (selected.isTeamChallenge) {
        const teamStatus = teamChallengeStatus[challengeIdStr];
        if (!teamStatus || teamStatus === 'NOT_STARTED') {
          Alert.alert('오류', '팀 챌린지에 먼저 참여해주세요.', [{ text: '확인' }]);
          return;
        }
      } else {
        // 개인 챌린지인 경우 참여 상태 확인
        const currentParticipationStatus = participationStatus[challengeIdStr];
        if (!currentParticipationStatus || currentParticipationStatus === 'NOT_PARTICIPATED') {
          Alert.alert('오류', '챌린지에 먼저 참여해주세요.', [{ text: '확인' }]);
          return;
        }
      }
      
      console.log('AI 검증 시작 전 상태 확인:', {
        challengeId,
        imageUrl: !!imageUrl,
        isTeamChallenge: selected.isTeamChallenge,
        teamStatus: selected.isTeamChallenge ? teamChallengeStatus[challengeIdStr] : null,
        participationStatus: !selected.isTeamChallenge ? participationStatus[challengeIdStr] : null
      });
      
      setVerifyingChallenges(prev => ({ ...prev, [challengeIdStr]: true }));
      
      console.log('AI 검증 API 호출 시작:', {
        challengeId,
        challengeTitle: selected.title,
        isTeamChallenge: selected.isTeamChallenge,
        imageUrl: imageUrl.substring(0, 50) + '...' // URL 일부만 로그
      });
      
      // AI 검증 시작
      const verificationResult = await challengeApi.startAiVerification(challengeId);
      
      if (verificationResult) {
        console.log('AI 검증 시작됨:', verificationResult);
        
        // AI 검증 완료까지 폴링 (안드로이드 최적화)
        const pollForResult = async () => {
          let attempts = 0;
          const maxAttempts = 15; // 최대 30초 대기 (안드로이드에서 더 오래 걸릴 수 있음)
          const pollInterval = Platform.OS === 'android' ? 3000 : 2000; // 안드로이드는 3초, iOS는 2초
          
          const poll = async () => {
            try {
              attempts++;
              console.log(`AI 검증 상태 확인 중... (${attempts}/${maxAttempts}) [${Platform.OS}]`);
              
              const participations = await challengeApi.getMyChallengeParticipations();
              const latestParticipation = participations.find(p => p.challenge.id === challengeId);
              
              console.log('현재 참여 상태:', {
                challengeId,
                found: !!latestParticipation,
                status: latestParticipation?.verificationStatus,
                hasImage: !!latestParticipation?.imageUrl
              });
              
              if (latestParticipation && 
                  (latestParticipation.verificationStatus === 'APPROVED' || 
                   latestParticipation.verificationStatus === 'REJECTED' ||
                   latestParticipation.verificationStatus === 'NEEDS_REVIEW')) {
                
                console.log('AI 검증 완료!', {
                  status: latestParticipation.verificationStatus,
                  confidence: latestParticipation.aiConfidence,
                  explanation: latestParticipation.aiExplanation,
                  detectedItems: latestParticipation.aiDetectedItems
                });
                
                // AI 검증 결과 저장
                const aiResult = {
                  verificationStatus: latestParticipation.verificationStatus,
                  confidence: latestParticipation.aiConfidence || 0.95,
                  explanation: latestParticipation.aiExplanation || 'AI 검증이 완료되었습니다.',
                  aiDetectedItems: latestParticipation.aiDetectedItems ? 
                    (typeof latestParticipation.aiDetectedItems === 'string' ? 
                      latestParticipation.aiDetectedItems.split(',').map(item => item.trim()) : 
                      latestParticipation.aiDetectedItems) : []
                };
                
                setAiResults(prev => ({ ...prev, [challengeIdStr]: aiResult }));
                
                // AI 검증 결과에 따른 처리
                if (latestParticipation.verificationStatus === 'APPROVED') {
                  setCompleted(prev => ({ ...prev, [challengeIdStr]: true }));
                  setParticipatedChallenges(prev => ({ ...prev, [challengeIdStr]: true }));
                  
                  setPendingImages(prev => {
                    const newState = { ...prev };
                    delete newState[challengeIdStr];
                    return newState;
                  });
                  
                  Alert.alert(
                    '챌린지 완료!',
                    `챌린지가 성공적으로 완료되었습니다!\n${latestParticipation.pointsAwarded ? `${latestParticipation.pointsAwarded}개의 씨앗을 받았습니다!` : ''}`,
                    [{ text: '확인', style: 'default' }]
                  );
                } else if (latestParticipation.verificationStatus === 'REJECTED') {
                  // 중복 이미지인지 확인
                  const isDuplicateImage = latestParticipation.aiExplanation?.includes('이전에 사용한 이미지') || 
                                         latestParticipation.aiExplanation?.includes('중복된 이미지');
                  
                  if (isDuplicateImage) {
                    Alert.alert(
                      '⚠️ 중복 이미지 감지',
                      '이미 사용된 이미지입니다.\n\n다른 사진을 촬영하거나 갤러리에서 새로운 이미지를 선택해주세요.',
                      [{ text: '확인', style: 'default' }]
                    );
                  } else {
                    Alert.alert(
                      '챌린지 실패',
                      latestParticipation.aiExplanation || '챌린지 검증이 완료되었습니다.',
                      [{ text: '확인', style: 'default' }]
                    );
                  }
                } else if (latestParticipation.verificationStatus === 'NEEDS_REVIEW') {
                  Alert.alert(
                    '검토 대기',
                    'AI 검증이 완료되었습니다. 관리자 검토 후 포인트가 적립됩니다.',
                    [{ text: '확인', style: 'default' }]
                  );
                }
                
                return; // 폴링 종료
              }
              
              // 아직 검증이 완료되지 않았고 최대 시도 횟수에 도달하지 않았다면 계속 폴링
              if (attempts < maxAttempts) {
                console.log(`${pollInterval/1000}초 후 다시 확인...`);
                setTimeout(poll, pollInterval);
              } else {
                console.log('AI 검증 타임아웃');
                Alert.alert(
                  '검증 대기', 
                  `AI 검증이 시간이 오래 걸리고 있습니다.\n\n${Platform.OS === 'android' ? '안드로이드에서는 검증이 더 오래 걸릴 수 있습니다.' : ''}\n잠시 후 다시 확인해주세요.`, 
                  [{ text: '확인' }]
                );
              }
            } catch (error) {
              console.error('AI 검증 상태 확인 실패:', error);
              if (attempts < maxAttempts) {
                console.log(`에러 발생, ${pollInterval/1000}초 후 재시도...`);
                setTimeout(poll, pollInterval);
              } else {
                console.log('최대 재시도 횟수 초과');
                Alert.alert('검증 실패', 'AI 검증 상태를 확인할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.', [{ text: '확인' }]);
              }
            }
          };
          
          poll();
        };
        
        pollForResult();
      }
    } catch (error) {
      console.error('AI 검증 실패:', error);
      Alert.alert('검증 실패', 'AI 검증 중 오류가 발생했습니다. 다시 시도해주세요.', [{ text: '확인' }]);
    } finally {
      setVerifyingChallenges(prev => ({ ...prev, [challengeIdStr]: false }));
    }
  };

  // 걸음수 제출 함수
  const handleStepsSubmit = async () => {
    if (!selected) return;
    
    try {
      const request: WalkingStepsRequest = {
        steps: currentSteps,
        date: new Date().toISOString().split('T')[0]
      };
      
      const result = await submitWalkingSteps(request);
      
      if (result) {
        setCompleted(prev => ({ ...prev, [selected.id.toString()]: true }));
        setShowStepsModal(false);
        Alert.alert('챌린지 완료!', '걸음수 챌린지가 완료되었습니다!', [{ text: '확인' }]);
      }
    } catch (error: any) {
      console.error('걸음수 제출 실패:', error);
      
      // 409 에러는 이미 오늘 제출한 기록이 있는 경우
      if (error.message && error.message.includes('409')) {
        Alert.alert(
          '이미 제출됨', 
          '오늘은 이미 걸음수를 제출했습니다.\n챌린지가 완료되었습니다!', 
          [{ text: '확인' }]
        );
        // 409 에러여도 챌린지는 완료된 것으로 처리
        setCompleted(prev => ({ ...prev, [selected.id.toString()]: true }));
        setShowStepsModal(false);
      } else {
        Alert.alert('제출 실패', '걸음수 제출 중 오류가 발생했습니다.', [{ text: '확인' }]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="에코 챌린지" onBack={onBack} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>적립할 수 있는 챌린지 씨앗</Text>
          <Text style={styles.headerPoints}>{totalReward} 씨앗</Text>
          <View style={styles.headerSubtitle}>
            <View style={styles.pointIcon}>
              <Text style={styles.pointIconText}>P</Text>
            </View>
            <Text style={styles.headerSubtitleText}>챌린지 달성하고 씨앗을 받으세요</Text>
          </View>
        </View>

        {isLoadingChallenges ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>챌린지를 불러오는 중...</Text>
          </View>
        ) : challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>진행 중인 챌린지가 없어요</Text>
            <Text style={styles.emptyText}>새로운 챌린지가 곧 추가될 예정입니다!</Text>
          </View>
        ) : (
          challenges.map((c) => {
            const challengeId = c.id.toString();
            const isCompleted = completed[challengeId] || aiResults[challengeId] || c.isParticipated;
            const challengeState = getChallengeState(c.id);
            
            return (
              <Pressable 
                key={c.id} 
                style={styles.challengeItem} 
                onPress={() => handleChallengePress(c)}
              >
                <View style={styles.challengeIconContainer}>
                  <Image source={c.icon} style={styles.challengeIcon} />
                </View>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={styles.challengeTitle}>{c.title}</Text>
                    <View style={styles.badgeContainer}>
                      {c.isTeamChallenge && (
                        <View style={styles.teamBadge}>
                          <Text style={styles.teamBadgeText}>TEAM</Text>
                        </View>
                      )}
                      {c.isLeaderOnly && (
                        <View style={styles.leaderBadge}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.leaderBadgeText}>팀장</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {/* <Text style={styles.challengeDescription}>{c.description}</Text> */}
                </View>
                <View style={styles.challengeReward}>
                  <Text style={styles.challengeRewardText}>
                    {c.isTeamChallenge 
                      ? `+${c.teamScore || 0} P` 
                      : `+${c.points} 씨앗`
                    }
                  </Text>
                  {(completed[c.id.toString()] || 
                    aiResults[c.id.toString()] ||
                    c.isParticipated) && (
                    <View style={styles.completedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    </View>
                  )}
                  {participatedChallenges[c.id.toString()] && !completed[c.id.toString()] && !aiResults[c.id.toString()] && (
                    <View style={styles.participatedIndicator}>
                      <Text style={styles.participatedText}>도전중</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            );
          })
        )}

        {/* 참여한 챌린지 내역 섹션 */}
        <View style={styles.completedSection}>
          <Pressable 
            style={styles.completedItem}
            onPress={() => {
              if (onShowSeedHistory) {
                onShowSeedHistory();
              } else {
                Alert.alert('참여한 챌린지', '참여한 챌린지 내역을 확인할 수 있습니다.', [{ text: '확인' }]);
              }
            }}
          >
            <View style={styles.completedIconContainer}>
              <View style={styles.completedPointIcon}>
                <Image 
                  source={require('../../assets/hana3dIcon/hanaIcon3d_51.png')} 
                  style={styles.completedPointImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View style={styles.completedInfo}>
              <Text style={styles.completedTitle}>참여한 챌린지</Text>
              <Text style={styles.completedSubtitle}>참여한 챌린지 내역 보기</Text>
            </View>
            <View style={styles.completedReward}>
              <Text style={styles.completedRewardText}>{completedReward} 씨앗</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        <View style={{ height: 80 * SCALE }} />
      </ScrollView>

      {/* 챌린지 상세 모달 */}
      {selected && (
        <Modal visible={!!selected} transparent animationType="slide">
          <View style={styles.overlay}>
            <Pressable style={styles.backdrop} onPress={() => setSelectedId(null)} />
            <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selected.title}</Text>
            </View>

            <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
              {!!selected.activity && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>활동 내용</Text>
                  <Text style={styles.sectionText}>{selected.activity}</Text>
              </View>
              )}
  
              {/* AI 인증 방법 - 이미지 챌린지에서만 표시 */}
              {selected.challengeType === 'image' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>AI 인증 가이드</Text>
              
                  {/* 실제 AI 가이드 표시 */}
                  {selected.aiGuide && selected.aiGuide.length > 0 ? (
                    selected.aiGuide.map((t, i) => (
                      <Text key={i} style={styles.sectionText}>• {t}</Text>
                    ))
                  ) : (
                    <Text style={styles.sectionText}>AI 인증 방법 정보가 없습니다.</Text>
                  )}
                </View>
              )}
              {!!selected.rewardDesc && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>보상</Text>
                  <Text style={styles.sectionText}>{selected.rewardDesc}</Text>
              </View>
              )}
              {/* 챌린지 기간 정보 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>챌린지 기간</Text>
                <Text style={styles.sectionText}>
                  {selected.startDate && selected.endDate 
                    ? `${selected.startDate.split('T')[0].replace(/-/g, '.')}-${selected.endDate.split('T')[0].replace(/-/g, '.')}`
                    : '상시 진행'
                  }
                </Text>
              </View>

              {/* 챌린지 완료 날짜 (완료된 경우에만 표시) */}
              {(() => {
                const currentParticipationStatus = participationStatus[selected.id.toString()];
                const isCompleted = currentParticipationStatus === 'APPROVED' || currentParticipationStatus === 'REJECTED';
                
                if (isCompleted && aiResults[selected.id.toString()]) {
                  const aiResult = aiResults[selected.id.toString()];
                  const completionDate = aiResult.verifiedAt;
                  
                  if (completionDate) {
                    return (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>완료 날짜</Text>
                        <Text style={styles.sectionText}>
                          {new Date(completionDate).toLocaleDateString('ko-KR')}
                        </Text>
                      </View>
                    );
                  }
                }
                return null;
              })()}
              {/* 팀 정보 섹션 (팀 챌린지이고 참여한 경우) */}
              {(() => {
                const currentTeamChallengeStatus = teamChallengeStatus[selected.id.toString()];
                const hasParticipated = currentTeamChallengeStatus && currentTeamChallengeStatus !== 'NOT_STARTED';
                const showTeamInfo = selected.isTeamChallenge && 
                 teamInfo && 
                 (hasParticipated || aiResults[selected.id.toString()]);
                
                console.log('🔍 팀 정보 섹션 표시 조건:', {
                  isTeamChallenge: selected.isTeamChallenge,
                  hasTeamInfo: !!teamInfo,
                  teamChallengeStatus: currentTeamChallengeStatus,
                  hasParticipated,
                  hasAiResults: !!aiResults[selected.id.toString()],
                  showTeamInfo
                });
                
                if (showTeamInfo) {
                  return (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>팀 정보</Text>
                      <Text style={styles.sectionText}>팀명: {teamInfo.name}</Text>
                      <Text style={styles.sectionText}>팀원: {teamInfo.members}명</Text>
                    </View>
                  );
                }
                return null;
              })()}

              {/* 팀원용 인증 사진 표시 (팀 챌린지이고 팀원인 경우) */}
              {(() => {
                const currentTeamChallengeStatus = teamChallengeStatus[selected.id.toString()];
                const hasParticipated = currentTeamChallengeStatus && currentTeamChallengeStatus !== 'NOT_STARTED';
                const showTeamMemberImage = selected.challengeType === 'image' && 
                  selected.isTeamChallenge && 
                  userTeamRole === 'MEMBER' && 
                  (hasParticipated || aiResults[selected.id.toString()]);
                
                console.log('🔍 팀원용 인증 사진 표시 조건:', {
                  challengeType: selected.challengeType,
                  isTeamChallenge: selected.isTeamChallenge,
                  userTeamRole,
                  currentTeamChallengeStatus,
                  hasParticipated,
                  hasAiResults: !!aiResults[selected.id.toString()],
                  showTeamMemberImage
                });
                
                if (showTeamMemberImage) {
                  return (
                    <View style={[styles.section, styles.imageSection]}>
                      <Text style={styles.sectionTitle}>팀장의 인증 사진</Text>
                      <View style={styles.completedImageContainer}>
                        {(() => {
                          const rawImageUrl = capturedImages[selected.id.toString()] || pendingImages[selected.id.toString()];
                          const imageUrl = rawImageUrl ? fixImageUrl(rawImageUrl) : null;
                          console.log(`팀원용 챌린지 ${selected.id} 이미지 표시 체크:`, {
                            capturedImage: capturedImages[selected.id.toString()],
                            pendingImage: pendingImages[selected.id.toString()],
                            rawImageUrl,
                            imageUrl
                          });
                          
                          if (imageUrl) {
                            return (
                              <Image 
                                source={{ uri: imageUrl }} 
                                style={styles.completedImage}
                                resizeMode="contain"
                                onError={(error) => {
                                  console.error(`팀원용 이미지 로드 실패 (${imageUrl}):`, error);
                                }}
                                onLoad={() => {
                                  console.log(`팀원용 이미지 로드 성공: ${imageUrl}`);
                                }}
                              />
                            );
                          } else {
                            return (
                              <View style={styles.noImagePlaceholder}>
                                <Ionicons name="camera" size={48 * SCALE} color="#9CA3AF" />
                                <Text style={styles.noImageText}>팀장이 아직 인증 사진을 업로드하지 않았습니다.</Text>
                                <Text style={[styles.noImageText, { fontSize: 12, marginTop: 4 }]}>
                                  ID: {selected.id}
                                </Text>
                              </View>
                            );
                          }
                        })()}
                        
                        {completed[selected.id] && (
                          <View style={styles.completedImageOverlay}>
                            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                            <Text style={styles.completedImageText}>인증 완료</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                }
                return null;
              })()}
              
              {/* 이미지 업로드 섹션 (이미지 챌린지인 경우, 팀장만 표시) */}
              {(() => {
                const currentParticipationStatus = participationStatus[selected.id.toString()];
                const currentTeamChallengeStatus = teamChallengeStatus[selected.id.toString()];
                
                // 팀 챌린지와 개인 챌린지의 참여 상태를 구분하여 확인
                const hasParticipated = selected.isTeamChallenge 
                  ? (currentTeamChallengeStatus && currentTeamChallengeStatus !== 'NOT_STARTED')
                  : (currentParticipationStatus && currentParticipationStatus !== 'NOT_PARTICIPATED');
                
                const showImageUpload = selected.challengeType === 'image' && (
                  // 팀 챌린지인 경우: 팀장이고 참여 완료 후에만 표시
                  (selected.isTeamChallenge && userTeamRole === 'LEADER' && 
                   (hasParticipated || aiResults[selected.id.toString()])) || 
                  // 개인 챌린지인 경우: 참여 완료 후에만 표시
                  (!selected.isTeamChallenge && 
                   (hasParticipated || aiResults[selected.id.toString()]))
                );
                
                console.log('🔍 인증사진 업로드 섹션 표시 조건:', {
                  challengeType: selected.challengeType,
                  isTeamChallenge: selected.isTeamChallenge,
                  userTeamRole,
                  participationStatus: currentParticipationStatus,
                  teamChallengeStatus: currentTeamChallengeStatus,
                  hasParticipated,
                  hasAiResults: !!aiResults[selected.id.toString()],
                  showImageUpload,
                  capturedImages: capturedImages[selected.id.toString()],
                  pendingImages: pendingImages[selected.id.toString()],
                  completed: completed[selected.id.toString()],
                  participatedChallenges: participatedChallenges[selected.id.toString()]
                });
                
                if (showImageUpload) {
                  return (
                <View style={[styles.section, styles.imageSection]}>
                  <Text style={styles.sectionTitle}>인증 사진</Text>
                {!capturedImages[selected.id.toString()] && !pendingImages[selected.id.toString()] ? (
                <ImageUploader
                  onImageSelected={handleImageSelection}
                  selectedImage={selected ? (capturedImages[selected.id.toString()] || pendingImages[selected.id.toString()]) : undefined}
                  title={uploadingImages[selected.id.toString()] ? "이미지 업로드 중..." : "인증 사진을 업로드해주세요"}
                  subtitle={uploadingImages[selected.id.toString()] ? "서버에 저장하고 있습니다 ⏳" : "카메라로 촬영하거나 갤러리에서 선택하세요"}
                />
                ) : (
                  <View style={styles.completedImageContainer}>
                    {(() => {
                      const imageUrl = capturedImages[selected.id.toString()] || pendingImages[selected.id.toString()];
                      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                        try {
                          const fixedImageUrl = fixImageUrl(imageUrl);
                          console.log('🖼️ 이미지 표시:', { original: imageUrl, fixed: fixedImageUrl });
                          return (
                            <Image 
                              source={{ uri: fixedImageUrl }} 
                              style={styles.completedImage}
                              resizeMode="contain"
                              onError={(error) => {
                                console.error('이미지 로드 실패:', error.nativeEvent.error);
                                console.error('이미지 URL:', fixedImageUrl);
                                console.error('에러 상세:', error.nativeEvent);
                                // 연결 테스트 실행
                                testImageUrl(fixedImageUrl);
                              }}
                              onLoad={() => {
                                console.log('이미지 로드 성공:', fixedImageUrl);
                              }}
                              onLoadStart={() => {
                                console.log('이미지 로드 시작:', fixedImageUrl);
                                // 이미지 로드 시작 시 연결 테스트
                                testImageUrl(fixedImageUrl);
                              }}
                              onLoadEnd={() => {
                                console.log('이미지 로드 완료:', fixedImageUrl);
                              }}
                            />
                          );
                        } catch (error) {
                          console.error('이미지 URL 처리 실패:', error);
                          return (
                            <View style={styles.noImagePlaceholder}>
                              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                              <Text style={styles.noImageText}>이미지 로드 실패</Text>
                            </View>
                          );
                        }
                      } else {
                        return (
                          <View style={styles.noImagePlaceholder}>
                            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.noImageText}>이미지가 없습니다</Text>
                          </View>
                        );
                      }
                    })()}
                   
                    
                  </View>
                )}
                </View>
              );
                }
                return null;
              })()}

              {/* AI 검증 결과 섹션 */}
              {selected.challengeType === 'image' && 
               aiResults[selected.id.toString()] && 
               aiResults[selected.id.toString()].verificationStatus && 
               aiResults[selected.id.toString()].verificationStatus !== 'PENDING' && 
               aiResults[selected.id.toString()].verificationStatus !== 'PARTICIPATED' && (
                <View style={[styles.section, styles.aiResultSection]}>
                  <Text style={styles.sectionTitle}>AI 검증 결과</Text>
                    
                {/* AI 검증 결과 표시 (이미 조건 확인됨) */}
                <View style={styles.aiResultCard}>
                  <View style={styles.aiResultRow}>
                    <Text style={styles.aiResultLabel}>결과:</Text>
                    <Text style={[
                      styles.aiResultValue,
                      aiResults[selected.id.toString()].verificationStatus === 'APPROVED' ? styles.aiResultSuccess :
                      aiResults[selected.id.toString()].verificationStatus === 'REJECTED' ? styles.aiResultError :
                      styles.aiResultPending
                    ]}>
                      {aiResults[selected.id.toString()].verificationStatus === 'APPROVED' ? '✅ 승인' :
                       aiResults[selected.id.toString()].verificationStatus === 'REJECTED' ? '❌ 거부' :
                       aiResults[selected.id.toString()].verificationStatus === 'NEEDS_REVIEW' ? '🟡 검토 필요' :
                       aiResults[selected.id.toString()].verificationStatus}
                    </Text>
                  </View>
                  
                  {aiResults[selected.id.toString()].confidence && (
                    <View style={styles.aiResultRow}>
                      <Text style={styles.aiResultLabel}>신뢰도:</Text>
                      <Text style={styles.aiResultValue}>
                        {(aiResults[selected.id.toString()].confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                  
                  {aiResults[selected.id.toString()].explanation && (
                    <View style={styles.aiResultRow}>
                      <Text style={styles.aiResultLabel}>설명:</Text>
                      <Text style={styles.aiResultDescription}>
                        {aiResults[selected.id.toString()].explanation}
                      </Text>
                    </View>
                  )}
                  {aiResults[selected.id.toString()].aiDetectedItems && (
                    <View style={styles.aiResultRow}>
                      <Text style={styles.aiResultLabel}>감지 항목:</Text>
                      <Text style={styles.aiResultValue}>
                        {Array.isArray(aiResults[selected.id.toString()].aiDetectedItems) 
                          ? aiResults[selected.id.toString()].aiDetectedItems.join(', ')
                          : aiResults[selected.id.toString()].aiDetectedItems}
                      </Text>
                    </View>
                  )}
                </View>
                </View>
              )}

              {/* 버튼 섹션 */}
              <View style={styles.buttonSection}>
                {(() => {
                  if (!completed[selected.id] && !aiResults[selected.id.toString()]) {
                    // 팀 챌린지 조건 처리
                    if (selected.isTeamChallenge) {
                      // 팀 정보가 없는 경우
                      if (!teamInfo) {
                        return (
                          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                            <Text style={styles.primaryBtnTextDisabled}>
                              팀에 가입해주세요
                            </Text>
                          </View>
                        );
                      }
                      
                      // 팀 챌린지 상태에 따른 버튼 표시
                      const challengeIdStr = selected.id.toString();
                      const currentParticipationStatus = teamChallengeStatus[challengeIdStr];
                      
                      if (!currentParticipationStatus || currentParticipationStatus === 'NOT_STARTED') {
                        // PENDING: 참여 신청도 안한 상태 - "팀 챌린지 참여하기" 버튼
                        if (userTeamRole === 'LEADER') {
                          return (
                            <Pressable
                              style={styles.primaryBtn}
                              onPress={async () => {
                                const participated = await participateInTeamChallenge(selected);
                                if (participated) {
                                  // 참여 성공 시 모달을 닫지 않고 그대로 유지하여 인증 섹션이 보이도록 함
                                }
                              }}
                            >
                              <Text style={styles.primaryBtnText}>
                                팀 챌린지 참여하기
                              </Text>
                            </Pressable>
                          );
                        } else if (userTeamRole === 'MEMBER') {
                          return (
                            <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                              <Text style={styles.primaryBtnTextDisabled}>
                                팀장만 참여 가능
                              </Text>
                            </View>
                          );
                        } else {
                          return (
                            <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                              <Text style={styles.primaryBtnTextDisabled}>
                                팀 역할을 확인할 수 없습니다
                              </Text>
                            </View>
                          );
                        }
                      } else if (currentParticipationStatus === 'LEADER_PARTICIPATED') {
                        // LEADER_PARTICIPATED: 팀장이 참여신청만 한 상태 - 버튼 숨김 (이미지 업로드 섹션 표시)
                        return null;
                      } else if (currentParticipationStatus === 'PENDING') {
                        // PENDING: 팀장이 인증사진 올렸고, AI 검증 대기 - "인증 완료하기" 버튼
                        console.log('🔍 PENDING 상태 버튼 렌더링:', {
                          challengeId: challengeIdStr,
                          currentParticipationStatus,
                          pendingImages: pendingImages[challengeIdStr],
                          verifyingChallenges: verifyingChallenges[challengeIdStr],
                          capturedImages: capturedImages[challengeIdStr]
                        });
                        
                        return (
                          <Pressable
                            style={[
                              styles.primaryBtn,
                              (!pendingImages[challengeIdStr] || verifyingChallenges[challengeIdStr]) && styles.primaryBtnDisabled
                            ]}
                            disabled={!pendingImages[challengeIdStr] || verifyingChallenges[challengeIdStr]}
                            onPress={() => {
                              if (pendingImages[challengeIdStr] && !uploadingImages[challengeIdStr] && !verifyingChallenges[challengeIdStr]) {
                                const challengeId = typeof selected.id === 'number' ? selected.id : parseInt(String(selected.id));
                                handleAiVerification(challengeId, pendingImages[challengeIdStr]);
                              }
                            }}
                          >
                            <Text style={(!pendingImages[challengeIdStr] || verifyingChallenges[challengeIdStr]) ? styles.primaryBtnTextDisabled : styles.primaryBtnText}>
                              {verifyingChallenges[challengeIdStr] ? 'AI 검증 중...' : 
                               !pendingImages[challengeIdStr] ? '인증 사진을 먼저 업로드하세요' : 
                               '인증 완료하기'}
                            </Text>
                          </Pressable>
                        );
                      } else if (currentParticipationStatus === 'AI_VERIFYING') {
                        // VERIFYING: 팀장이 인증사진 올렸고, AI 검증 진행 중 - "AI 검증 중..." 버튼
                        return (
                          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                            <Text style={styles.primaryBtnTextDisabled}>
                              AI 검증 중...
                            </Text>
                          </View>
                        );
                      } else if (currentParticipationStatus === 'COMPLETED') {
                        // APPROVED/REJECTED: AI 검증 완료 - "참여완료" 버튼
                        return (
                          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                            <Text style={styles.primaryBtnTextDisabled}>
                              참여완료
                            </Text>
                          </View>
                        );
                      }
                    } else if (selected.challengeType === 'image') {
                      // 개인 챌린지인 경우 - 팀 챌린지와 동일한 플로우 적용
                      const challengeIdStr = selected.id.toString();
                      const currentParticipationStatus = participationStatus[challengeIdStr];
                      
                      if (!currentParticipationStatus || currentParticipationStatus === 'NOT_PARTICIPATED') {
                        // 참여하지 않은 상태 - "챌린지 참여하기" 버튼
                        return (
                          <Pressable
                            style={styles.primaryBtn}
                            onPress={async () => {
                              const participated = await participateInPersonalChallenge(selected);
                              if (participated) {
                                // 참여 성공 시 모달을 닫지 않고 그대로 유지하여 인증 섹션이 보이도록 함
                              }
                            }}
                          >
                            <Text style={styles.primaryBtnText}>
                              챌린지 참여하기
                            </Text>
                          </Pressable>
                        );
                      } else if (currentParticipationStatus === 'PARTICIPATED') {
                        // PARTICIPATED: 참여 신청만 한 상태 - 버튼 숨김 (이미지 업로드 섹션 표시)
                        return null;
                      } else if (currentParticipationStatus === 'PENDING') {
                        // PENDING: 인증사진 올렸고, AI 검증 대기 - "인증 완료하기" 버튼
                        console.log('🔍 개인 챌린지 PENDING 상태 버튼 렌더링:', {
                          challengeId: challengeIdStr,
                          currentParticipationStatus,
                          pendingImages: pendingImages[challengeIdStr],
                          verifyingChallenges: verifyingChallenges[challengeIdStr],
                          capturedImages: capturedImages[challengeIdStr]
                        });
                        
                        return (
                          <Pressable
                            style={[
                              styles.primaryBtn,
                              (!pendingImages[challengeIdStr] || verifyingChallenges[challengeIdStr]) && styles.primaryBtnDisabled
                            ]}
                            disabled={!pendingImages[challengeIdStr] || verifyingChallenges[challengeIdStr]}
                            onPress={() => {
                              if (pendingImages[challengeIdStr] && !uploadingImages[challengeIdStr] && !verifyingChallenges[challengeIdStr]) {
                                const challengeId = typeof selected.id === 'number' ? selected.id : parseInt(String(selected.id));
                                handleAiVerification(challengeId, pendingImages[challengeIdStr]);
                              }
                            }}
                          >
                            <Text style={(!pendingImages[challengeIdStr] || verifyingChallenges[challengeIdStr]) ? styles.primaryBtnTextDisabled : styles.primaryBtnText}>
                              {verifyingChallenges[challengeIdStr] ? 'AI 검증 중...' : 
                               !pendingImages[challengeIdStr] ? '인증 사진을 먼저 업로드하세요' : 
                               '인증 완료하기'}
                            </Text>
                          </Pressable>
                        );
                      } else if (currentParticipationStatus === 'VERIFYING') {
                        // VERIFYING: 인증사진 올렸고, AI 검증 진행 중 - "AI 검증 중..." 버튼
                        return (
                          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                            <Text style={styles.primaryBtnTextDisabled}>
                              AI 검증 중...
                            </Text>
                          </View>
                        );
                      } else if (currentParticipationStatus === 'APPROVED' || currentParticipationStatus === 'REJECTED') {
                        // APPROVED/REJECTED: AI 검증 완료 - "참여완료" 버튼
                        return (
                          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                            <Text style={styles.primaryBtnTextDisabled}>
                              참여완료
                            </Text>
                          </View>
                        );
                      }
                    } else if (selected.challengeType === 'steps') {
                      // 걸음수 챌린지
                      return (
                        <Pressable
                          style={styles.primaryBtn}
                          onPress={() => handleStepsChallenge(selected)}
                        >
                          <Text style={styles.primaryBtnText}>
                            걸음수 확인하기
                          </Text>
                        </Pressable>
                      );
                    } else {
                      // simple 타입
                      return (
                        <Pressable
                          style={styles.primaryBtn}
                          onPress={() => {
                            setCompleted((prev) => ({ ...prev, [selected.id]: true }));
                            setSelectedId(null);
                            Alert.alert('인증 완료!', getChallengeCompletionMessage(selected, 10), [{ text: '확인' }]);
                          }}
                        >
                          <Text style={styles.primaryBtnText}>
                            완료하기
                          </Text>
                        </Pressable>
                      );
                    }
                  } else {
                    // 완료된 챌린지
                    return (
                      <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
                        <Text style={styles.primaryBtnTextDisabled}>
                          참여완료
                        </Text>
                      </View>
                    );
                  }
                })()}
              </View>
            </ScrollView>

            {/* <View style={styles.sheetFooter}>
              <Pressable 
                style={styles.closeBtn} 
                onPress={() => setSelectedId(null)}
              >
                <Text style={styles.closeBtnText}>
                  {completed[selected.id] || 
                   (aiResults[selected.id.toString()] && aiResults[selected.id.toString()].verificationStatus && aiResults[selected.id.toString()].verificationStatus !== 'PENDING') ? '참여완료' :
                   '닫기'}
                </Text>
              </Pressable>
            </View> */}
          </View>
        </View>
        </Modal>
      )}

      {/* 카메라 모달 */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <CameraCapture
          onCapture={handleImageSelection}
          onClose={() => setShowCamera(false)}
          challengeTitle={selected?.title || '챌린지'}
        />
      </Modal>

      {/* 걸음수 모달 */}
      {showStepsModal && selected && (
        <Modal visible={showStepsModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.stepsModal}>
              <View style={styles.stepsModalHeader}>
                <Text style={styles.stepsModalTitle}>👣 {selected.title}</Text>
                <Pressable onPress={() => setShowStepsModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24 * SCALE} color="#6B7280" />
                </Pressable>
              </View>
              
              <View style={styles.stepsContent}>
                <View style={styles.stepsDisplay}>
                  <Text style={styles.stepsLabel}>오늘의 걸음수</Text>
                  <Text style={styles.stepsValue}>{currentSteps.toLocaleString()}</Text>
                  <Text style={styles.stepsUnit}>걸음</Text>
                </View>
                
                <View style={styles.stepsInfo}>
                  <Text style={styles.stepsInfoText}>
                    {walkingConnected 
                      ? '건강 앱과 연동된 걸음수입니다.' 
                      : '건강 앱과 연동하여 실제 걸음수를 확인하세요.'
                    }
                  </Text>
                </View>
                
                {!walkingConnected && (
                  <View style={styles.connectPrompt}>
                    <Ionicons name="fitness" size={24 * SCALE} color={COLORS.primary} />
                    <Text style={styles.connectText}>건강 앱 연동하기</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.stepsModalFooter}>
                <Pressable 
                  style={styles.stepsBtnSecondary}
                  onPress={() => setShowStepsModal(false)}
                >
                  <Text style={styles.stepsBtnSecondaryText}>취소</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.stepsBtnPrimary, !walkingConnected && styles.stepsBtnSecondary]}
                  onPress={handleStepsSubmit}
                  disabled={!walkingConnected}
                >
                  <Text style={[styles.stepsBtnPrimaryText, !walkingConnected && styles.stepsBtnSecondaryText]}>
                    {walkingConnected ? '챌린지 참여' : '연동 필요'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE, paddingTop: 18 * SCALE, paddingBottom: 8 * SCALE,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerBtn: { padding: 6 * SCALE },
  historyBtn: { 
    padding: 6 * SCALE,
    backgroundColor: '#F0FDF4',
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  content: { flex: 1, padding: 20 * SCALE },
  // 새로운 헤더 섹션 스타일
  headerSection: {
    marginBottom: 32 * SCALE,
    paddingHorizontal: 4 * SCALE,
  },
  headerTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8 * SCALE,
  },
  headerPoints: {
    fontSize: 32 * SCALE,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16 * SCALE,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointIcon: {
    width: 24 * SCALE,
    height: 24 * SCALE,
    borderRadius: 12 * SCALE,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8 * SCALE,
  },
  pointIconText: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitleText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 새로운 챌린지 아이템 스타일
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 4 * SCALE,
    marginBottom: 8 * SCALE,
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeIconContainer: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    marginRight: 16 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeIcon: {
    width: 50 * SCALE,
    height: 50 * SCALE,
    resizeMode: 'contain',
    marginLeft: 12 * SCALE,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4 * SCALE,
  },
  challengeTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 * SCALE,
  },
  teamBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 3 * SCALE,
    borderRadius: 8 * SCALE,
  },
  teamBadgeText: {
    fontSize: 10 * SCALE,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  leaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 3 * SCALE,
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 4 * SCALE,
  },
  leaderBadgeText: {
    fontSize: 10 * SCALE,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  challengeDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 18 * SCALE,
  },
  challengeReward: {
    alignItems: 'flex-end',
    marginRight: 12 * SCALE,
  },
  challengeRewardText: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4 * SCALE,
  },
  completedIndicator: {
    alignItems: 'center',
  },
  participatedIndicator: {
    alignItems: 'center',
    marginTop: 4 * SCALE,
  },
  participatedText: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 2 * SCALE,
  },

  // 완료된 챌린지 섹션 스타일
  completedSection: {
    marginTop: 12 * SCALE,
    paddingTop: 12 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    padding: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedIconContainer: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    marginRight: 10 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedPointIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedPointIconText: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedPointImage: {
    width: 50 * SCALE,
    height: 50 * SCALE,
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6 * SCALE,
  },
  completedSubtitle: {
    fontSize: 15 * SCALE,
    color: '#6B7280',
  },
  completedReward: {
    alignItems: 'flex-end',
    marginRight: 8 * SCALE,
  },
  completedRewardText: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: COLORS.primary,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 20 * SCALE,
    marginHorizontal: 4 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 * SCALE 
  },
  summaryIconContainer: { 
    width: 48 * SCALE, 
    height: 48 * SCALE, 
    borderRadius: 24 * SCALE, 
    backgroundColor: '#F0FDF4', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 * SCALE 
  },
  summaryIcon: { fontSize: 24 * SCALE },
  summaryTextContainer: { flex: 1 },
  summaryTitle: { 
    fontSize: 20 * SCALE, 
    fontWeight: '700', 
    color: '#1F2937',
    marginBottom: 4 * SCALE 
  },
  summarySubtitle: { 
    fontSize: 14 * SCALE, 
    color: '#6B7280' 
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 16 * SCALE,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24 * SCALE,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4 * SCALE,
  },
  statLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16 * SCALE,
  },
  progressContainer: { marginTop: 4 * SCALE },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * SCALE,
  },
  progressLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#374151',
  },
  progressText: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBarContainer: { marginTop: 4 * SCALE },
  progressBarBg: { 
    height: 6 * SCALE, 
    borderRadius: 3 * SCALE, 
    backgroundColor: '#E5E7EB' 
  },
  progressBarFg: { 
    height: '100%', 
    backgroundColor: COLORS.primary,
    borderRadius: 3 * SCALE,
  },

  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    padding: 24 * SCALE,
    marginBottom: 20 * SCALE,
    marginHorizontal: 4 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16 * SCALE,
  },
  cardIconContainer: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    borderRadius: 16 * SCALE,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16 * SCALE,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: { fontSize: 28 * SCALE },
  cardInfo: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6 * SCALE,
  },
  cardTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginBottom: 4 * SCALE,
  },
  cardDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 22 * SCALE,
    marginBottom: 12 * SCALE,
  },
  cardRewardContainer: {
    alignSelf: 'flex-start',
  },
  cardRewardText: {
    fontSize: 13 * SCALE,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 6 * SCALE,
    borderRadius: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  participateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24 * SCALE,
    paddingVertical: 14 * SCALE,
    borderRadius: 16 * SCALE,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  participateButtonText: {
    color: '#FFFFFF',
    fontSize: 15 * SCALE,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16 * SCALE,
    paddingVertical: 10 * SCALE,
    borderRadius: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  completedText: {
    color: '#059669',
    fontSize: 15 * SCALE,
    fontWeight: '700',
    marginLeft: 8 * SCALE,
  },

  // Loading and empty states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60 * SCALE,
  },
  loadingIcon: {
    fontSize: 48 * SCALE,
    marginBottom: 16 * SCALE,
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60 * SCALE,
    paddingHorizontal: 40 * SCALE,
  },
  emptyIcon: {
    fontSize: 64 * SCALE,
    marginBottom: 20 * SCALE,
  },
  emptyTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8 * SCALE,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },
  // Detail overlay styles (3D 느낌)
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24 * SCALE,
    borderTopRightRadius: 24 * SCALE,
    paddingBottom: 20 * SCALE,
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 * SCALE, borderBottomColor: '#F3F4F6', borderBottomWidth: 1 },
  sheetIconWrap: { width: 52 * SCALE, height: 52 * SCALE, borderRadius: 16 * SCALE, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 16 * SCALE },
  sheetIconText: { fontSize: 28 * SCALE },
  sheetTitle: { fontSize: 20 * SCALE, fontWeight: '800', color: '#111827' },
  sheetBody: { maxHeight: 500 * SCALE, paddingHorizontal: 20 * SCALE, paddingTop: 16 * SCALE, paddingBottom: 80 * SCALE },
  section: { marginBottom: 12 * SCALE },
  sectionTitle: { fontSize: 15 * SCALE, fontWeight: '800', color: COLORS.primary, marginBottom: 8 * SCALE },
  sectionText: { fontSize: 14 * SCALE, color: '#4B5563', lineHeight: 22 * SCALE },
  sheetFooter: { paddingHorizontal: 20 * SCALE, paddingTop: 12 * SCALE },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 16 * SCALE, paddingVertical: 16 * SCALE, alignItems: 'center', justifyContent: 'center', marginBottom: 28 * SCALE },
  primaryBtnText: { color: COLORS.white, fontSize: 16 * SCALE, fontWeight: '800' },
  primaryBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0 },
  primaryBtnTextDisabled: { color: '#9CA3AF', fontSize: 16 * SCALE, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#F8FAFC', borderRadius: 16 * SCALE, paddingVertical: 16 * SCALE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryBtnText: { color: '#475569', fontSize: 16 * SCALE, fontWeight: '700' },
  closeBtn: { backgroundColor: '#F3F4F6', borderRadius: 12 * SCALE, paddingVertical: 12 * SCALE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  closeBtnText: { color: '#6B7280', fontSize: 14 * SCALE, fontWeight: '700' },
  buttonSection: { marginTop: 16 * SCALE },
  
  // 이미지 섹션 스타일
  imageSection: { marginTop: 8 * SCALE },
  completedImageContainer: {
    position: 'relative',
    borderRadius: 12 * SCALE,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedImage: {
    width: '100%',
    height: 200 * SCALE,
    resizeMode: 'cover',
  },
  completedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedImageText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '700',
    marginTop: 8 * SCALE,
  },
  noImagePlaceholder: {
    height: 200 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  noImageText: {
    fontSize: 14 * SCALE,
    color: '#9CA3AF',
    marginTop: 8 * SCALE,
  },
  
  // AI 검증 결과 스타일
  aiResultSection: { marginTop: 8 * SCALE },
  aiResultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiResultRow: {
    flexDirection: 'row',
    marginBottom: 8 * SCALE,
  },
  aiResultLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#374151',
    width: 60 * SCALE,
  },
  aiResultValue: {
    fontSize: 14 * SCALE,
    color: '#111827',
    flex: 1,
  },
  aiResultSuccess: {
    color: '#059669',
    fontWeight: '700',
  },
  aiResultError: {
    color: '#DC2626',
    fontWeight: '700',
  },
  aiResultPending: {
    color: '#D97706',
    fontWeight: '700',
  },
  aiResultDescription: {
    fontSize: 14 * SCALE,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20 * SCALE,
  },
  
  // 걸음수 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 * SCALE,
  },
  stepsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    width: '100%',
    maxWidth: 400 * SCALE,
    // 3D shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  stepsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepsModalTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  stepsContent: {
    padding: 20 * SCALE,
  },
  stepsDisplay: {
    alignItems: 'center',
    marginBottom: 20 * SCALE,
    padding: 20 * SCALE,
    backgroundColor: '#F0FDF4',
    borderRadius: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  stepsLabel: {
    fontSize: 14 * SCALE,
    color: '#065F46',
    fontWeight: '600',
    marginBottom: 8 * SCALE,
  },
  stepsValue: {
    fontSize: 36 * SCALE,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 4 * SCALE,
  },
  stepsUnit: {
    fontSize: 16 * SCALE,
    color: '#065F46',
    fontWeight: '600',
  },
  stepsInfo: {
    marginBottom: 16 * SCALE,
  },
  stepsInfoText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20 * SCALE,
  },
  connectPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8 * SCALE,
    padding: 12 * SCALE,
    backgroundColor: '#E8F4F3',
    borderRadius: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  connectText: {
    fontSize: 14 * SCALE,
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepsModalFooter: {
    flexDirection: 'row',
    gap: 12 * SCALE,
    padding: 20 * SCALE,
    paddingTop: 0,
  },
  stepsBtnSecondary: {
    flex: 1,
    paddingVertical: 14 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepsBtnSecondaryText: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepsBtnPrimary: {
    flex: 1,
    paddingVertical: 14 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    // 3D shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepsBtnPrimaryText: {
    fontSize: 14 * SCALE,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  
  // 이미지 선택 옵션 모달 스타일
  imageOptionsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24 * SCALE,
    width: '100%',
    maxWidth: 400 * SCALE,
    // 3D shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
  },
  imageOptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  imageOptionsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageOptionsIconContainer: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    borderRadius: 24 * SCALE,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16 * SCALE,
  },
  imageOptionsIcon: {
    fontSize: 24 * SCALE,
  },
  imageOptionsTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  imageOptionsContent: {
    padding: 24 * SCALE,
  },
  imageOptionsDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 24 * SCALE,
  },
  imageOptionsButtons: {
    gap: 12 * SCALE,
  },
  imageOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16 * SCALE,
    backgroundColor: '#F8FAFC',
    borderRadius: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageOptionBtnIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: '#E8F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  imageOptionBtnText: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 20 * SCALE,
  },
  closeButton: {
    padding: 4 * SCALE,
  },
  stepsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20 * SCALE,
  },
  stepsButton: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    borderRadius: 24 * SCALE,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12 * SCALE,
    paddingVertical: 16 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20 * SCALE,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '700',
  },
});