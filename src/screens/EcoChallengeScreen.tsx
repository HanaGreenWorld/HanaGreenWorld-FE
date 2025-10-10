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
import TopBar from '../components/TopBar';

// 시뮬레이터 호환성을 위한 조건부 import
// let ImagePicker: any = null;
// let isSimulator = false;

// try {
//   if (Platform.OS !== 'web') {
//     ImagePicker = require('expo-image-picker');
//     // 시뮬레이터 감지
//     isSimulator = Platform.OS === 'ios' && !ImagePicker.launchImageLibraryAsync;
//   }
// } catch (error) {
//   console.log('expo-image-picker not available in simulator');
//   isSimulator = true;
// }

// ImagePicker 활성화
import * as ImagePicker from 'expo-image-picker';
// import * as MediaLibrary from 'expo-media-library'; // 더 이상 사용하지 않음
let isSimulator = false;

interface EcoChallengeScreenProps {
  onBack: () => void;
  onShowHistory?: () => void;
  onShowCompletedChallenges?: () => void;
  onShowSeedHistory?: () => void;
}

// API에서 받아오는 Challenge 타입은 challengeApi에서 import
type LocalChallenge = ApiChallenge & {
  challengeType: 'image' | 'steps' | 'simple';
  icon: any; // 로컬 아이콘 경로
};

// 아이콘 매핑 (새로운 ChallengeCode enum에 맞춤)
const CHALLENGE_ICONS: Record<string, any> = {
  'REUSABLE_BAG': require('../../assets/hana3dIcon/hanaIcon3d_107.png'),
  'PLUGGING': require('../../assets/plugging.png'),
  'TEAM_PLUGGING': require('../../assets/green_team.png'),
  'WEEKLY_STEPS': require('../../assets/hana3dIcon/hanaIcon3d_123.png'),
  'TEAM_WALKING': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'TUMBLER_CHALLENGE': require('../../assets/tumbler.png'),
  'RECYCLE': require('../../assets/hana3dIcon/zero_waste.png'),
  // 기본 아이콘
  'default': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
};

// API 챌린지를 로컬 챌린지 형태로 변환하는 함수
const convertApiChallengeToLocal = (apiChallenge: ApiChallenge): LocalChallenge => {
  // challengeType 결정 로직 (새로운 ChallengeCode enum 기반)
  let challengeType: 'image' | 'steps' | 'simple' = 'image';
  
  // 걸음수 관련 챌린지들
  const stepsChallenges = ['WEEKLY_STEPS', 'DAILY_STEPS', 'TEAM_WALKING'];
  if (stepsChallenges.includes(apiChallenge.code)) {
    challengeType = 'steps';
  }
  
  // 추후 간단한 체크 챌린지가 있다면 여기에 추가
  // const simpleChallenges = ['SIMPLE_CHECK'];
  // if (simpleChallenges.includes(apiChallenge.code)) {
  //   challengeType = 'simple';
  // }

  // 챌린지별 AI 가이드 생성
  const getAiGuide = (code: string): string[] => {
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

// 검증 상태에 따른 설명 생성 함수
const getVerificationExplanation = (status: string): string => {
  const explanations: Record<string, string> = {
    'APPROVED': '챌린지 요구사항을 성공적으로 충족했습니다.',
    'REJECTED': '챌린지 요구사항을 충족하지 못했습니다.',
    'PENDING': 'AI 검증이 진행 중입니다.',
    'NEEDS_REVIEW': '수동 검토가 필요합니다.',
    'VERIFIED': '인증이 완료되었습니다.'
  };
  
  return explanations[status] || '검증 상태를 확인할 수 없습니다.';
};

// 검증 상태에 따른 메시지 생성 함수
const getVerificationMessage = (status: string): string => {
  const messages: Record<string, string> = {
    'APPROVED': '🎉 인증이 성공적으로 완료되었습니다!',
    'REJECTED': '❌ 인증에 실패했습니다. 다시 시도해주세요.',
    'PENDING': '⏳ AI 검증이 진행 중입니다.',
    'NEEDS_REVIEW': '🟡 수동 검토가 필요합니다.',
    'VERIFIED': '✅ 인증이 완료되었습니다.'
  };
  
  return messages[status] || '검증 상태를 확인할 수 없습니다.';
};

export default function EcoChallengeScreen({ onBack, onShowHistory, onShowCompletedChallenges, onShowSeedHistory }: EcoChallengeScreenProps) {
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
  const [pendingImages, setPendingImages] = useState<Record<string, string>>({}); // 인증 대기 중인 이미지들
  const [aiResults, setAiResults] = useState<Record<string, any>>({}); // AI 검증 결과들
  const [verifyingChallenges, setVerifyingChallenges] = useState<Record<string, boolean>>({}); // AI 검증 진행 중인 챌린지들
  
  // API에서 받아온 챌린지 데이터
  const [challenges, setChallenges] = useState<LocalChallenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  
  const selected = challenges.find((c) => c.id.toString() === selectedId) || null;
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

  // 챌린지 데이터 새로고침 함수
  const refreshChallenges = async () => {
    try {
      console.log('챌린지 데이터 새로고침 중...');
      const apiChallenges = await challengeApi.getActiveChallenges();
      console.log('새로고침된 API 챌린지 데이터:', apiChallenges);
      
      if (apiChallenges && apiChallenges.length > 0) {
        const localChallenges = apiChallenges.map(convertApiChallengeToLocal);
        setChallenges(localChallenges);
        console.log('새로고침된 로컬 챌린지:', localChallenges);
        
        // 백엔드에서 받은 참여 상태를 로컬 상태에 반영
        const completedState: Record<string, boolean> = {};
        const statusState: Record<string, string> = {};
        
        localChallenges.forEach(challenge => {
          const challengeId = challenge.id.toString();
          completedState[challengeId] = challenge.isParticipated || false;
          statusState[challengeId] = challenge.participationStatus || 'NOT_PARTICIPATED';
        });
        
        setCompleted(completedState);
        setParticipationStatus(statusState);
      }
    } catch (error) {
      console.error('챌린지 데이터 새로고침 실패:', error);
    }
  };

  // API에서 챌린지 데이터 가져오기
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoadingChallenges(true);
        console.log('API에서 챌린지 데이터 가져오는 중...');
        const apiChallenges = await challengeApi.getActiveChallenges();
        console.log('API 챌린지 데이터:', apiChallenges);
        
        if (apiChallenges && apiChallenges.length > 0) {
          const localChallenges = apiChallenges.map(convertApiChallengeToLocal);
          setChallenges(localChallenges);
          console.log('변환된 로컬 챌린지:', localChallenges);
          
          // 백엔드에서 받은 참여 상태를 로컬 상태에 반영
          const completedState: Record<string, boolean> = {};
          const statusState: Record<string, string> = {};
          
          localChallenges.forEach(challenge => {
            const challengeId = challenge.id.toString();
            completedState[challengeId] = challenge.isParticipated || false;
            statusState[challengeId] = challenge.participationStatus || 'NOT_PARTICIPATED';
          });
          
          setCompleted(completedState);
          setParticipationStatus(statusState);
        } else {
          console.log('API 데이터가 비어있음, 폴백 데이터 사용');
          // setChallenges(FALLBACK_CHALLENGES); // 폴백 데이터 사용 (필요 시)
        }
      } catch (error) {
        console.error('챌린지 데이터 가져오기 실패:', error);
        // setChallenges(FALLBACK_CHALLENGES); // 에러 시 폴백 데이터 사용
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    
    fetchChallenges();
  }, []);

  // 완료된 챌린지의 이미지와 AI 검증 결과 가져오기
  useEffect(() => {
    const fetchCompletedData = async () => {
      try {
        console.log('완료된 챌린지 데이터 가져오기 시작...');
        const participations = await challengeApi.getMyChallengeParticipations();
        console.log('참여 내역 조회 결과:', participations);
        
        // 모든 참여 내역에서 이미지가 있는 것들을 가져오기 (상태에 관계없이)
        const imagesState: Record<string, string> = {};
        const aiResultsState: Record<string, any> = {};
        
        participations.forEach(participation => {
          const challengeId = participation.challenge.id.toString();
          
          // 이미지 URL 저장
          if (participation.imageUrl) {
            console.log(`챌린지 ${challengeId} 이미지 URL:`, participation.imageUrl);
            imagesState[challengeId] = participation.imageUrl;
          }
          
          // AI 검증 결과 저장 (verificationStatus가 있는 경우)
          if (participation.verificationStatus && participation.verificationStatus !== 'NOT_PARTICIPATED') {
            console.log(`챌린지 ${challengeId} AI 검증 상태:`, participation.verificationStatus);
            console.log(`챌린지 ${challengeId} AI 상세 정보:`, {
              confidence: participation.aiConfidence,
              explanation: participation.aiExplanation,
              detectedItems: participation.aiDetectedItems
            });
            
            // 백엔드에서 받은 데이터를 AI 결과 형태로 변환
            const aiResult = {
              verificationStatus: participation.verificationStatus,
              confidence: participation.aiConfidence || 0.95, // 백엔드에서 받은 값 또는 기본값
              explanation: participation.aiExplanation || getVerificationExplanation(participation.verificationStatus),
              detectedItems: participation.aiDetectedItems ? JSON.parse(participation.aiDetectedItems) : [], // JSON 파싱
              message: getVerificationMessage(participation.verificationStatus),
              verifiedAt: participation.verifiedAt
            };
            
            aiResultsState[challengeId] = aiResult;
            console.log(`챌린지 ${challengeId} AI 결과:`, aiResult);
          }
        });
        
        console.log('로드된 이미지 상태:', imagesState);
        console.log('로드된 AI 결과 상태:', aiResultsState);
        
        setCapturedImages(imagesState);
        setAiResults(aiResultsState);
      } catch (error) {
        console.error('완료된 챌린지 데이터 가져오기 실패:', error);
        // 에러가 발생해도 빈 객체로 설정하여 앱이 크래시되지 않도록 함
        setCapturedImages({});
        setAiResults({});
      }
    };
    
    fetchCompletedData();
  }, []);

  // 걸음수 연동 상태 확인
  useEffect(() => {
    const checkWalkingConnection = async () => {
      try {
        const consentResponse = await fetchWalkingConsent();
        setWalkingConnected(consentResponse.isConsented);
        if (consentResponse.isConsented) {
          setCurrentSteps(generateTodaySteps());
        }
      } catch (error) {
        console.error('걸음수 연동 상태 확인 실패:', error);
      }
    };
    checkWalkingConnection();
  }, []);

  // 갤러리 권한 요청
  // useEffect(() => {
  //   const requestGalleryPermission = async () => {
  //     try {
  //       if (ImagePicker && ImagePicker.requestMediaLibraryPermissionsAsync) {
  //         const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //         setGalleryPermission(permission);
  //       } else {
  //         // 시뮬레이터에서는 더미 권한 설정
  //         setGalleryPermission({ granted: true, canAskAgain: true, status: 'granted' });
  //       }
  //     } catch (error) {
  //       console.error('갤러리 권한 요청 실패:', error);
  //       // 에러 시에도 더미 권한 설정
  //       setGalleryPermission({ granted: true, canAskAgain: true, status: 'granted' });
  //     }
  //   };
  //   requestGalleryPermission();
  // }, []);

  // 임시로 더미 권한 설정
  useEffect(() => {
    setGalleryPermission({ granted: true, canAskAgain: true, status: 'granted' });
  }, []);

  // 챌린지 참여하기 버튼 클릭 핸들러
  const handleChallengePress = async (challenge: LocalChallenge) => {
    // 팀장 전용 챌린지 권한 확인
    if (challenge.isLeaderOnly) {
      try {
        const isLeader = await teamApi.isTeamLeader();
        if (!isLeader) {
          Alert.alert(
            '팀장 전용 챌린지',
            '이 챌린지는 팀장만 참여할 수 있습니다.\n\n팀장이 되어 팀을 대표해서 참여해보세요! 👑',
            [{ text: '확인', style: 'default' }]
          );
          return;
        }
      } catch (error) {
        console.error('팀장 권한 확인 실패:', error);
        Alert.alert(
          '권한 확인 실패',
          '팀장 권한을 확인할 수 없습니다. 다시 시도해주세요.',
          [{ text: '확인', style: 'default' }]
        );
        return;
      }
    }

    setSelectedId(challenge.id.toString()); // 선택된 챌린지 설정
    
    if (challenge.challengeType === 'steps') {
      if (walkingConnected) {
        setShowStepsModal(true);
      } else {
        Alert.alert(
          '걸음수 연동 필요',
          '걸음수 챌린지를 참여하려면 건강 앱과 연동이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '연동하기', onPress: () => setShowStepsModal(true) }
          ]
        );
      }
    } else if (challenge.challengeType === 'image') {
      setShowImageOptions(true);
    } else {
      // simple 타입은 바로 완료 처리
      setCompleted((prev) => ({ ...prev, [challenge.id.toString()]: true }));
      setSelectedId(null);
      Alert.alert('인증 완료!', `${challenge.points}개의 씨앗을 받았습니다!`);
    }
  };

  // 갤러리에서 이미지 선택 (사용하지 않음 - ImageUploader 컴포넌트에서 처리)
  const pickImageFromGallery = async () => {
    console.log('pickImageFromGallery 호출됨 - 이 함수는 더 이상 사용하지 않습니다.');
    console.log('ImageUploader 컴포넌트에서 갤러리 선택을 처리합니다.');
    return; // 즉시 종료
    
    try {
      // 아래 코드는 더 이상 실행되지 않음
      if (isSimulator || !ImagePicker || !ImagePicker.launchImageLibraryAsync) {
        console.log('시뮬레이터 모드 - 함수 종료');
        return;
      }

      // 권한 확인
      // if (!galleryPermission?.granted) {
      //   Alert.alert(
      //     '갤러리 접근 권한 필요',
      //     '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.',
      //     [
      //       { text: '취소', style: 'cancel' },
      //       { 
      //         text: '설정으로 이동', 
      //         onPress: async () => {
      //           if (ImagePicker && ImagePicker.requestMediaLibraryPermissionsAsync) {
      //             const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      //             setGalleryPermission(permission);
      //             if (permission.granted) {
      //               pickImageFromGallery();
      //             }
      //           }
      //         }
      //       }
      //     ]
      //   );
      //   return;
      // }

      // const result = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   aspect: [4, 3],
      //   quality: 0.8,
      //   exif: false,
      // });

      // if (!result.canceled && result.assets[0]) {
      //   const selectedAsset = result.assets[0];
      //   handleImageSelection(selectedAsset.uri);
      // }
    } catch (error) {
      console.error('갤러리 이미지 선택 실패:', error);
      Alert.alert('오류', '이미지 선택에 실패했습니다.');
    }
  };

  // 카메라로 사진 촬영 (더미 데이터)
  const takePhotoWithCamera = async () => {
    try {
      // 더미 카메라 이미지
      const dummyCameraImage = 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=Camera+Photo';
      
      // 시뮬레이션을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 800));
      
      handleImageSelection(dummyCameraImage);
    } catch (error) {
      console.error('카메라 촬영 실패:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  // 이미지 업로드 함수 (서버에 실제 업로드)
  const uploadImageToServer = async (imageUri: string) => {
    try {
      console.log('서버 이미지 업로드 시작:', imageUri);
      
      const formData = new FormData();
      const filename = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      console.log('서버 업로드 요청:', `${API_BASE_URL}/upload/image`);
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('서버 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('서버 업로드 성공:', data);
        
        return data; // { success: true, filename, url, localPath, size, contentType }
      } else {
        const errorText = await response.text();
        console.log('서버 업로드 실패:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('서버 업로드 중 오류:', error);
      return null;
    }
  };

  // 이미지 선택 완료 핸들러 (카메라/갤러리 공통)
  const handleImageSelection = async (imageUri: string) => {
    if (!selected) return;
    
    // 해당 챌린지에만 이미지 저장
    setCapturedImages(prev => ({ ...prev, [selected.id.toString()]: imageUri }));
    setShowImageOptions(false);
    setShowCamera(false);
    
    // 업로딩 상태 설정
    setUploadingImages(prev => ({ ...prev, [selected.id.toString()]: true }));
    
    // 실제 서버 업로드 및 DB 저장
    try {
      // 1단계: 서버에 이미지 업로드
      const uploadResult = await uploadImageToServer(imageUri);
      
      if (uploadResult && selected) {
        console.log('이미지 업로드 성공:', uploadResult.url);
        
        // 2단계: 챌린지 참여 기록을 DB에 저장
        console.log('챌린지 참여 기록 저장 시작...');
        const challengeRecord = await challengeApi.saveChallengeActivity(
          selected.id,
          uploadResult.url,
          {
            challengeTitle: selected.title,
            points: selected.points,
            challengeType: selected.challengeType
          }
        );
        
        if (challengeRecord) {
          console.log('챌린지 참여 기록 저장 성공:', challengeRecord);
          
          // 서버에서 받은 이미지 URL을 임시 저장 (인증 대기 상태)
          setPendingImages(prev => ({ ...prev, [selected.id.toString()]: uploadResult.url }));
          setUploadingImages(prev => ({ ...prev, [selected.id.toString()]: false }));
          // setSelectedId(null); // 모달을 닫지 않음 - 사용자가 인증 완료 버튼을 누를 수 있도록 함
          
          Alert.alert('사진 업로드 완료!', '사진이 업로드되었습니다.\n\n이제 "인증 완료" 버튼을 눌러 AI 검증을 시작하세요!');
        } else {
          throw new Error('챌린지 참여 기록 저장에 실패했습니다.');
        }
      } else {
        setUploadingImages(prev => ({ ...prev, [selected.id.toString()]: false }));
        Alert.alert('오류', '이미지 업로드에 실패했습니다. 네트워크 연결을 확인해 주세요.');
      }
    } catch (error) {
      setUploadingImages(prev => ({ ...prev, [selected.id.toString()]: false }));
      console.error('챌린지 참여 중 오류:', error);
      Alert.alert('오류', `챌린지 참여 중 오류가 발생했습니다.\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 이미지 캡처 완료 핸들러 (기존 CameraCapture 컴포넌트용)
  const handleImageCapture = (imageUri: string) => {
    handleImageSelection(imageUri);
  };

  // 이미지 URL 연결 테스트 함수
  const testImageUrl = async (imageUrl: string) => {
    try {
      console.log(`이미지 URL 연결 테스트 시작: ${imageUrl}`);
      const response = await fetch(imageUrl, { method: 'HEAD' });
      console.log(`이미지 URL 응답 상태: ${response.status}`);
      console.log(`이미지 URL 응답 헤더:`, response.headers);
      
      if (response.ok) {
        console.log('✅ 이미지 URL 접근 가능');
        return true;
      } else {
        console.log('❌ 이미지 URL 접근 실패:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ 이미지 URL 연결 테스트 실패:', error);
      return false;
    }
  };

  // AI 검증 시작 함수
  const handleAiVerification = async (challengeId: number, imageUrl: string) => {
    const challengeIdStr = challengeId.toString();
    
    try {
      console.log('🤖 AI 검증 시작:', { challengeId, imageUrl });
      
      // 검증 진행 상태 설정
      setVerifyingChallenges(prev => ({ ...prev, [challengeIdStr]: true }));
      
      // AI 검증 시작 (이미 저장된 챌린지 기록에 대해)
      const verificationResult = await challengeApi.startAiVerification(challengeId);
      
      console.log('🤖 AI 검증 결과:', verificationResult);
      
      if (verificationResult) {
        // AI 검증 결과 저장
        console.log('🤖 AI 결과 저장 중:', { challengeId: challengeIdStr, result: verificationResult });
        setAiResults(prev => {
          const newResults = { ...prev, [challengeIdStr]: verificationResult };
          console.log('🤖 AI 결과 저장 완료:', newResults);
          return newResults;
        });
        
        // AI 검증 결과에 따른 처리
        if (verificationResult.verificationStatus === 'APPROVED') {
          // 즉시 상태 업데이트
          setCompleted((prev) => ({ ...prev, [challengeIdStr]: true }));
          setParticipationStatus((prev) => ({ ...prev, [challengeIdStr]: 'VERIFIED' }));
          setCapturedImages(prev => ({ ...prev, [challengeIdStr]: imageUrl }));
          setPendingImages(prev => {
            const newState = { ...prev };
            delete newState[challengeIdStr];
            return newState;
          });
          
          // 상태 업데이트 후 잠시 대기하여 UI가 반영되도록 함
          setTimeout(async () => {
            // 챌린지 데이터 새로고침으로 최신 상태 반영
            await refreshChallenges();
            setSelectedId(null); // 성공 시에만 모달 닫기
            Alert.alert('🎉 인증 완료!', `축하합니다! ${verificationResult.message}\n\n+${selected?.points || 0} 씨앗을 획득했습니다!`);
          }, 100);
        } else if (verificationResult.verificationStatus === 'NEEDS_REVIEW') {
          setParticipationStatus((prev) => ({ ...prev, [challengeIdStr]: 'PENDING' }));
          Alert.alert('🟡 검토 필요', verificationResult.message);
        } else if (verificationResult.verificationStatus === 'REJECTED') {
          setParticipationStatus((prev) => ({ ...prev, [challengeIdStr]: 'REJECTED' }));
          Alert.alert('❌ 인증 실패', verificationResult.message);
        }
      } else {
        console.log('🤖 AI 검증 결과가 null입니다');
        Alert.alert('오류', 'AI 검증에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('🤖 AI 검증 중 오류:', error);
      Alert.alert('오류', `AI 검증 중 오류가 발생했습니다.\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      // 검증 완료 후 로딩 상태 해제
      setVerifyingChallenges(prev => ({ ...prev, [challengeIdStr]: false }));
    }
  };

  // 걸음수 챌린지 완료 핸들러
  const handleStepsChallengeComplete = async () => {
    if (!selected) return;
    
    try {
      const request: WalkingStepsRequest = {
        steps: currentSteps,
        date: new Date().toISOString().split('T')[0]
      };
      
      await submitWalkingSteps(request);
      setCompleted((prev) => ({ ...prev, [selected.id.toString()]: true }));
      setParticipationStatus((prev) => ({ ...prev, [selected.id.toString()]: 'VERIFIED' }));
      setShowStepsModal(false);
      setSelectedId(null);
      Alert.alert('인증 완료!', `${selected.points}개의 씨앗을 받았습니다!`);
    } catch (error) {
      console.error('걸음수 챌린지 완료 실패:', error);
      Alert.alert('오류', '챌린지 완료에 실패했습니다.');
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
          challenges.map((c) => (
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
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))
        )}

        {/* 참여한 챌린지 내역 섹션 */}
        <View style={styles.completedSection}>
          <Pressable 
            style={styles.completedItem}
            onPress={() => {
              if (onShowSeedHistory) {
                onShowSeedHistory();
              } else if (onShowCompletedChallenges) {
                onShowCompletedChallenges();
              } else {
                Alert.alert('참여한 챌린지', '참여한 챌린지 내역을 확인할 수 있습니다.');
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

      {selected && (
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
          
              
              {/* 이미지 업로드 섹션 (이미지 챌린지인 경우) */}
              {selected.challengeType === 'image' && (
                <View style={[styles.section, styles.imageSection]}>
                  <Text style={styles.sectionTitle}>인증 사진</Text>
                {!completed[selected.id.toString()] && !pendingImages[selected.id.toString()] && !capturedImages[selected.id.toString()] ? (
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
                      console.log(`챌린지 ${selected.id} 이미지 표시 체크:`, {
                        capturedImage: capturedImages[selected.id.toString()],
                        pendingImage: pendingImages[selected.id.toString()],
                        finalImageUrl: imageUrl,
                        hasImage: !!imageUrl
                      });
                      
                      return imageUrl ? (
                        <View style={styles.imageWrapper}>
                          <Image 
                            source={{ 
                              uri: imageUrl,
                              cache: 'force-cache' // 캐시 강제 사용
                            }} 
                            style={styles.completedImage}
                            resizeMode="contain"
                            onError={(error) => {
                              console.error(`이미지 로드 실패 (${imageUrl}):`, error);
                              console.error('에러 상세:', error.nativeEvent);
                            }}
                            onLoad={() => {
                              console.log(`이미지 로드 성공: ${imageUrl}`);
                            }}
                            onLoadStart={() => {
                              console.log(`이미지 로드 시작: ${imageUrl}`);
                              // 이미지 로드 시작 시 연결 테스트
                              testImageUrl(imageUrl);
                            }}
                            onLoadEnd={() => {
                              console.log(`이미지 로드 완료: ${imageUrl}`);
                            }}
                          />
                          
                          {/* 폴백 이미지 (로컬 이미지) */}
                          <View style={styles.fallbackImageContainer}>
                            <Image 
                              source={require('../../assets/hana3dIcon/hanaIcon3d_4_13.png')}
                              style={styles.fallbackImage}
                              resizeMode="contain"
                            />
                            <Text style={styles.fallbackText}>인증 사진</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.noImagePlaceholder}>
                          <Ionicons name="camera" size={48 * SCALE} color="#9CA3AF" />
                          <Text style={styles.noImageText}>인증 사진 없음</Text>
                          <Text style={[styles.noImageText, { fontSize: 12, marginTop: 4 }]}>
                            ID: {selected.id}
                          </Text>
                        </View>
                      );
                    })()}
                    {completed[selected.id] && (
                      <View style={styles.completedImageOverlay}>
                        <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                        <Text style={styles.completedImageText}>인증 완료</Text>
                      </View>
                    )}
                    
                  </View>
                )}
                </View>
              )}

              {/* AI 검증 결과 표시 - 이미지 챌린지에서 AI 분석 완료 시에만 표시 */}
              {selected.challengeType === 'image' && 
               aiResults[selected.id.toString()] && (
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
                      styles.aiResultWarning
                    ]}>
                      {aiResults[selected.id.toString()].verificationStatus === 'APPROVED' ? '✅ 승인' :
                       aiResults[selected.id.toString()].verificationStatus === 'REJECTED' ? '❌ 거부' :
                       '🟡 검토 필요'}
                    </Text>
                  </View>
                  <View style={styles.aiResultRow}>
                    <Text style={styles.aiResultLabel}>신뢰도:</Text>
                    <Text style={styles.aiResultValue}>
                      {Math.round((aiResults[selected.id.toString()].confidence || 0) * 100)}%
                    </Text>
                  </View>
                  {aiResults[selected.id.toString()].explanation && (
                    <View style={styles.aiResultRow}>
                      <Text style={styles.aiResultLabel}>설명:</Text>
                      <Text style={styles.aiResultDescription}>
                        {aiResults[selected.id.toString()].explanation}
                      </Text>
                    </View>
                  )}
                  {aiResults[selected.id.toString()].detectedItems && (
                    <View style={styles.aiResultRow}>
                      <Text style={styles.aiResultLabel}>감지 항목:</Text>
                      <Text style={styles.aiResultValue}>
                        {Array.isArray(aiResults[selected.id.toString()].detectedItems) 
                          ? aiResults[selected.id.toString()].detectedItems.join(', ')
                          : aiResults[selected.id.toString()].detectedItems}
                      </Text>
                    </View>
                  )}
                </View>
                </View>
              )}
              
              <View style={{ height: 12 * SCALE }} />
            </ScrollView>

            <View style={styles.sheetFooter}>
                {!completed[selected.id] && !aiResults[selected.id.toString()] ? (
                selected.challengeType === 'image' ? (
                  // 이미지 챌린지인 경우
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      (!pendingImages[selected.id.toString()] || verifyingChallenges[selected.id.toString()]) && styles.primaryBtnDisabled
                    ]}
                    disabled={!pendingImages[selected.id.toString()] || verifyingChallenges[selected.id.toString()]}
                    onPress={() => {
                      if (pendingImages[selected.id.toString()] && !uploadingImages[selected.id.toString()] && !verifyingChallenges[selected.id.toString()]) {
                        const challengeId = typeof selected.id === 'number' ? selected.id : parseInt(String(selected.id));
                        handleAiVerification(challengeId, pendingImages[selected.id.toString()]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.primaryBtnText,
                      (!pendingImages[selected.id.toString()] || verifyingChallenges[selected.id.toString()]) && styles.primaryBtnTextDisabled
                    ]}>
                      {uploadingImages[selected.id.toString()] ? '업로드 중... ⏳' : 
                       verifyingChallenges[selected.id.toString()] ? '인증하는 중... 🤖' :
                       pendingImages[selected.id.toString()] ? `인증 완료하기 +${selected.points} 씨앗` : '사진을 업로드해주세요' }
                    </Text>
                  </Pressable>
                ) : (
                  // 다른 챌린지 타입인 경우
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => {
                      setCompleted((prev) => ({ ...prev, [selected.id]: true }));
                      setSelectedId(null);
                      Alert.alert('인증 완료!', `${selected.points}개의 씨앗을 받았습니다!`);
                    }}
                  >
                    <Text style={styles.primaryBtnText}>인증 완료하기 +{selected.points} 씨앗</Text>
                  </Pressable>
                )
              ) : (
                <Pressable style={styles.secondaryBtn} onPress={() => setSelectedId(null)}>
                  <Text style={styles.secondaryBtnText}>
                    {completed[selected.id] ? '참여완료' : 
                     aiResults[selected.id.toString()] ? '참여완료' :
                     '닫기'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}


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
                  style={[styles.stepsBtn, styles.stepsBtnSecondary]} 
                  onPress={() => setShowStepsModal(false)}
                >
                  <Text style={styles.stepsBtnSecondaryText}>취소</Text>
                </Pressable>
                <Pressable 
                  style={[styles.stepsBtn, styles.stepsBtnPrimary]} 
                  onPress={handleStepsChallengeComplete}
                >
                  <Text style={styles.stepsBtnPrimaryText}>인증하기 +{selected.points} 씨앗</Text>
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
  // headerTitle: { fontSize: 16 * SCALE, fontWeight: '700', color: '#111827' },
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
  sheetBody: { maxHeight: 420 * SCALE, paddingHorizontal: 20 * SCALE, paddingTop: 16 * SCALE },
  section: { marginBottom: 12 * SCALE },
  sectionTitle: { fontSize: 15 * SCALE, fontWeight: '800', color: COLORS.primary, marginBottom: 8 * SCALE }, // 여백 줄임
  sectionText: { fontSize: 14 * SCALE, color: '#4B5563', lineHeight: 22 * SCALE },
  sheetFooter: { paddingHorizontal: 20 * SCALE, paddingTop: 12 * SCALE },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 16 * SCALE, paddingVertical: 16 * SCALE, alignItems: 'center', justifyContent: 'center', shadowColor: '#138072', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  primaryBtnText: { color: COLORS.white, fontSize: 16 * SCALE, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#F8FAFC', borderRadius: 16 * SCALE, paddingVertical: 16 * SCALE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryBtnText: { color: '#475569', fontSize: 16 * SCALE, fontWeight: '700' },
  
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
  closeBtn: {
    padding: 4 * SCALE,
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
  stepsBtn: {
    flex: 1,
    paddingVertical: 14 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsBtnSecondary: {
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
    marginRight: 12 * SCALE,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  imageOptionsEmoji: {
    fontSize: 24 * SCALE,
  },
  imageOptionsTitleTextContainer: {
    flex: 1,
  },
  imageOptionsTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2 * SCALE,
  },
  imageOptionsSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  imageOptionsContent: {
    padding: 24 * SCALE,
  },
  imageOptionsDesc: {
    fontSize: 16 * SCALE,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 28 * SCALE,
    lineHeight: 24 * SCALE,
    fontWeight: '500',
  },
  imageOptionsButtons: {
    flexDirection: 'row',
    gap: 16 * SCALE,
    marginBottom: 20 * SCALE,
  },
  imageOptionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 24 * SCALE,
    backgroundColor: '#FFFFFF',
    borderRadius: 20 * SCALE,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    // 3D shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageOptionIcon: {
    width: 72 * SCALE,
    height: 72 * SCALE,
    borderRadius: 36 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16 * SCALE,
    // 3D shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  cameraIcon: {
    backgroundColor: '#3B82F6',
  },
  galleryIcon: {
    backgroundColor: '#8B5CF6',
  },
  imageOptionText: {
    fontSize: 16 * SCALE,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4 * SCALE,
  },
  imageOptionSubtext: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  imageOptionsFooter: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  imageOptionsFooterText: {
    fontSize: 13 * SCALE,
    color: '#0369A1',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18 * SCALE,
  },
  simulatorNotice: {
    fontSize: 12 * SCALE,
    color: '#F59E0B',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16 * SCALE,
    marginTop: 8 * SCALE,
    backgroundColor: '#FEF3C7',
    padding: 8 * SCALE,
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  primaryBtnDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  primaryBtnTextDisabled: {
    color: '#9CA3AF',
  },
  
  // 완료된 이미지 표시 스타일
  completedImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200 * SCALE,
    borderRadius: 12 * SCALE,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  completedImage: {
    width: '100%',
    height: '100%',
  },
  completedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedImageText: {
    color: '#10B981',
    fontSize: 14 * SCALE,
    fontWeight: '700',
    marginTop: 8 * SCALE,
  },

  // AI 검증 결과 스타일
  aiResultSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16 * SCALE,
    marginTop: 8 * SCALE,
  },
  aiResultTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12 * SCALE,
  },
  aiResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8 * SCALE,
    padding: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aiResultRow: {
    flexDirection: 'row',
    marginBottom: 8 * SCALE,
    alignItems: 'flex-start',
  },
  aiResultLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#374151',
    width: 60 * SCALE,
    marginRight: 8 * SCALE,
  },
  aiResultValue: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  aiResultDescription: {
    fontSize: 13 * SCALE,
    color: '#6B7280',
    lineHeight: 18 * SCALE,
    flex: 1,
  },
  aiResultSuccess: {
    color: '#059669',
  },
  aiResultError: {
    color: '#DC2626',
  },
  aiResultWarning: {
    color: '#D97706',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  noImageText: {
    color: '#9CA3AF',
    fontSize: 14 * SCALE,
    fontWeight: '500',
    marginTop: 8 * SCALE,
  },
  
  // 이미지 섹션 추가 여백
  imageSection: {
    marginBottom: 8 * SCALE, // 여백 줄임
  },
  
  // 이미지 래퍼 및 디버그 스타일
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imageDebugInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4 * SCALE,
  },
  debugText: {
    color: 'white',
    fontSize: 10 * SCALE,
    textAlign: 'center',
  },
  fallbackImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1, // 메인 이미지 뒤에 배치
  },
  fallbackImage: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    opacity: 0.3,
  },
  fallbackText: {
    color: '#9CA3AF',
    fontSize: 12 * SCALE,
    fontWeight: '500',
    marginTop: 8 * SCALE,
  },
  
});


