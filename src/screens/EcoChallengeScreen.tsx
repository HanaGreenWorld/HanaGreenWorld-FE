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
  'REUSABLE_BAG': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
  'REUSABLE_BAG_EXTENDED': require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
  'PLUGGING': require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
  'PLUGGING_MARATHON': require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
  'TEAM_PLUGGING': require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
  'WEEKLY_STEPS': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'DAILY_STEPS': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'TEAM_WALKING': require('../../assets/hana3dIcon/hanaIcon3d_4_33.png'),
  'NO_PLASTIC': require('../../assets/hana3dIcon/hanaIcon3d_4_31.png'),
  'TUMBLER_CHALLENGE': require('../../assets/hana3dIcon/hanaIcon3d_4_31.png'),
  'RECYCLE': require('../../assets/hana3dIcon/hanaIcon3d_4_35.png'),
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

  // 기본 필드들을 추가하여 UI에서 사용할 수 있도록 함
  const localChallenge: LocalChallenge = {
    ...apiChallenge,
    challengeType,
    icon: CHALLENGE_ICONS[apiChallenge.code] || CHALLENGE_ICONS.default,
    // UI에서 필요한 기본 필드들 추가
    activity: apiChallenge.description,
    aiGuide: [],
    process: [],
    rewardDesc: apiChallenge.points ? `+${apiChallenge.points} 씨앗` : (apiChallenge.teamScore ? `팀 점수 +${apiChallenge.teamScore}` : ''),
    note: apiChallenge.isTeamChallenge ? '팀 챌린지' : '개인 챌린지',
  };

  return localChallenge;
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
  
  // API에서 받아온 챌린지 데이터
  const [challenges, setChallenges] = useState<LocalChallenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  
  const selected = challenges.find((c) => c.id.toString() === selectedId) || null;
  const totalReward = useMemo(() => challenges.reduce((acc, c) => acc + (completed[c.id.toString()] ? (c.points || 0) : 0), 0), [completed, challenges]);
  const completedCount = useMemo(() => Object.values(completed).filter(Boolean).length, [completed]);

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

  // 완료된 챌린지의 이미지 가져오기
  useEffect(() => {
    const fetchCompletedImages = async () => {
      try {
        console.log('완료된 챌린지 이미지 가져오기 시작...');
        const participations = await challengeApi.getMyChallengeParticipations();
        console.log('참여 내역 조회 결과:', participations);
        
        const completedParticipations = participations.filter(p => p.verificationStatus === 'VERIFIED');
        console.log('완료된 챌린지:', completedParticipations);
        
        const imagesState: Record<string, string> = {};
        completedParticipations.forEach(participation => {
          if (participation.imageUrl) {
            imagesState[participation.challenge.id.toString()] = participation.imageUrl;
          }
        });
        
        console.log('이미지 상태:', imagesState);
        setCapturedImages(imagesState);
      } catch (error) {
        console.error('완료된 챌린지 이미지 가져오기 실패:', error);
        // 에러가 발생해도 빈 객체로 설정하여 앱이 크래시되지 않도록 함
        setCapturedImages({});
      }
    };
    
    fetchCompletedImages();
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
  const handleChallengePress = (challenge: LocalChallenge) => {
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
      Alert.alert('인증 완료!', `${challenge.points}개의 씨앗을 받았습니다! 🌱`);
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
      // 서버에 이미지 업로드
      const uploadResult = await uploadImageToServer(imageUri);
      
      if (uploadResult && selected) {
        console.log('업로드 성공, 갤러리에 저장 시도...');
        
        // 갤러리 저장은 ImageUploader에서 MediaLibrary로 처리됨
        console.log('사진이 ImageUploader에서 갤러리에 저장됨');
        
        // 서버에서 받은 이미지 URL로 업데이트
        setCapturedImages(prev => ({ ...prev, [selected.id.toString()]: uploadResult.url }));
        
        // 챌린지 활동 내역을 DB에 저장
        const challengeId = typeof selected.id === 'number' ? selected.id : parseInt(String(selected.id));
        
        const savedActivity = await challengeApi.saveChallengeActivity(challengeId, uploadResult.url, {
          challengeTitle: selected.title,
          points: selected.points,
          challengeType: selected.challengeType || 'image',
          activityDate: new Date().toISOString().split('T')[0]
        });
        
        if (savedActivity) {
          setCompleted((prev) => ({ ...prev, [selected.id.toString()]: true }));
          setParticipationStatus((prev) => ({ ...prev, [selected.id.toString()]: 'VERIFIED' }));
          setUploadingImages(prev => ({ ...prev, [selected.id.toString()]: false }));
          setSelectedId(null);
          Alert.alert('인증 완료! 🎉', `${selected.points}개의 씨앗을 받았습니다! 🌱\n\n✅ 이미지가 서버에 저장되었습니다.\n✅ 갤러리에도 추가되었습니다.\n✅ DB에 활동 내역이 기록되었습니다.`);
        } else {
          setUploadingImages(prev => ({ ...prev, [selected.id.toString()]: false }));
          Alert.alert('오류', 'DB 저장에 실패했습니다. 다시 시도해 주세요.');
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
      Alert.alert('인증 완료!', `${selected.points}개의 씨앗을 받았습니다! 🌱`);
    } catch (error) {
      console.error('걸음수 챌린지 완료 실패:', error);
      Alert.alert('오류', '챌린지 완료에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20 * SCALE} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>에코 챌린지</Text>
        {onShowHistory && (
          <Pressable onPress={onShowHistory} style={styles.historyBtn}>
            <Ionicons name="time-outline" size={20 * SCALE} color={COLORS.primary} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>남은 챌린지 씨앗</Text>
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
            <Text style={styles.loadingIcon}>🌱</Text>
            <Text style={styles.loadingText}>챌린지를 불러오는 중...</Text>
          </View>
        ) : challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌿</Text>
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
                  {c.isTeamChallenge && (
                    <View style={styles.teamBadge}>
                      <Text style={styles.teamBadgeText}>TEAM</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.challengeDescription}>{c.description}</Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.challengeRewardText}>
                  {c.isTeamChallenge 
                    ? `+${c.teamScore || 0} 포인트` 
                    : `+${c.points} 씨앗`
                  }
                </Text>
                {completed[c.id.toString()] && (
                  <View style={styles.completedIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))
        )}

        {/* 완료된 챌린지 내역 섹션 */}
        {completedCount > 0 && (
          <View style={styles.completedSection}>
            <Pressable 
              style={styles.completedItem}
              onPress={() => {
                if (onShowSeedHistory) {
                  onShowSeedHistory();
                } else if (onShowCompletedChallenges) {
                  onShowCompletedChallenges();
                } else {
                  Alert.alert('완료된 챌린지', '완료된 챌린지 내역을 확인할 수 있습니다.');
                }
              }}
            >
              <View style={styles.completedIconContainer}>
                <View style={styles.completedPointIcon}>
                  <Text style={styles.completedPointIconText}>P</Text>
                </View>
              </View>
              <View style={styles.completedInfo}>
                <Text style={styles.completedTitle}>받은 챌린지 씨앗</Text>
                <Text style={styles.completedSubtitle}>완료한 챌린지 내역 보기</Text>
              </View>
              <View style={styles.completedReward}>
                <Text style={styles.completedRewardText}>{totalReward} 씨앗</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        )}

        <View style={{ height: 80 * SCALE }} />
      </ScrollView>

      {selected && (
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setSelectedId(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIconWrap}>
                <Text style={styles.sheetIconText}>🌱</Text>
              </View>
              <Text style={styles.sheetTitle}>{selected.title}</Text>
            </View>

            <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
              {!!selected.activity && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>활동 내용</Text>
                  <Text style={styles.sectionText}>{selected.activity}</Text>
              </View>
              )}
              {!!selected.process && selected.process.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>진행 방식</Text>
                  {selected.process.map((t, i) => (
                    <Text key={i} style={styles.sectionText}>- {t}</Text>
                  ))}
                </View>
              )}
              {!!selected.aiGuide && selected.aiGuide.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>AI 인증 방법</Text>
                  {selected.aiGuide.map((t, i) => (
                    <Text key={i} style={styles.sectionText}>- {t}</Text>
                  ))}
                </View>
              )}
              {!!selected.rewardDesc && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>보상</Text>
                  <Text style={styles.sectionText}>{selected.rewardDesc}</Text>
              </View>
              )}
              {!!selected.note && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>비고</Text>
                  <Text style={styles.sectionText}>{selected.note}</Text>
                </View>
              )}
              <View style={{ height: 12 * SCALE }} />
            </ScrollView>

            {/* 이미지 업로드 섹션 (이미지 챌린지인 경우) */}
            {selected.challengeType === 'image' && (
              <View style={[styles.section, styles.imageSection]}>
                <Text style={styles.sectionTitle}>📸 인증 사진</Text>
                {!completed[selected.id.toString()] ? (
                <ImageUploader
                  onImageSelected={handleImageSelection}
                  selectedImage={selected ? capturedImages[selected.id.toString()] : undefined}
                  title={uploadingImages[selected.id.toString()] ? "이미지 업로드 중..." : "인증 사진을 업로드해주세요"}
                  subtitle={uploadingImages[selected.id.toString()] ? "서버에 저장하고 있습니다 ⏳" : "카메라로 촬영하거나 갤러리에서 선택하세요"}
                />
                ) : (
                  <View style={styles.completedImageContainer}>
                    {capturedImages[selected.id.toString()] ? (
                      <Image 
                        source={{ uri: capturedImages[selected.id.toString()] }} 
                        style={styles.completedImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Ionicons name="camera" size={48 * SCALE} color="#9CA3AF" />
                        <Text style={styles.noImageText}>인증 사진 없음</Text>
                      </View>
                    )}
                    <View style={styles.completedImageOverlay}>
                      <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                      <Text style={styles.completedImageText}>인증 완료</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={styles.sheetFooter}>
              {!completed[selected.id] ? (
                selected.challengeType === 'image' ? (
                  // 이미지 챌린지인 경우
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      !capturedImages[selected.id] && styles.primaryBtnDisabled
                    ]}
                    disabled={!capturedImages[selected.id]}
                    onPress={() => {
                      if (capturedImages[selected.id] && !uploadingImages[selected.id]) {
                        setCompleted((prev) => ({ ...prev, [selected.id]: true }));
                        setSelectedId(null);
                        Alert.alert('인증 완료! 🎉', `${selected.points}개의 씨앗을 받았습니다! 🌱\n\n이미지가 성공적으로 저장되었습니다! ✅`);
                      }
                    }}
                  >
                    <Text style={[
                      styles.primaryBtnText,
                      !capturedImages[selected.id] && styles.primaryBtnTextDisabled
                    ]}>
                      {uploadingImages[selected.id] ? '업로드 중... ⏳' : 
                       capturedImages[selected.id] ? `인증 완료하기 +${selected.points} 씨앗 🌱` : '사진을 업로드해주세요 📸'}
                    </Text>
                  </Pressable>
                ) : (
                  // 다른 챌린지 타입인 경우
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => {
                      setCompleted((prev) => ({ ...prev, [selected.id]: true }));
                      setSelectedId(null);
                      Alert.alert('인증 완료!', `${selected.points}개의 씨앗을 받았습니다! 🌱`);
                    }}
                  >
                    <Text style={styles.primaryBtnText}>인증 완료하기 +{selected.points} 씨앗</Text>
                  </Pressable>
                )
              ) : (
                <Pressable style={styles.secondaryBtn} onPress={() => setSelectedId(null)}>
                  <Text style={styles.secondaryBtnText}>닫기</Text>
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
    width: 40 * SCALE,
    height: 40 * SCALE,
    resizeMode: 'contain',
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
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  teamBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 3 * SCALE,
    borderRadius: 8 * SCALE,
    marginLeft: 8 * SCALE,
  },
  teamBadgeText: {
    fontSize: 10 * SCALE,
    fontWeight: '700',
    color: '#1F2937',
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
    marginTop: 24 * SCALE,
    paddingTop: 24 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 4 * SCALE,
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedIconContainer: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    marginRight: 16 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedPointIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedPointIconText: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  completedSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  completedReward: {
    alignItems: 'flex-end',
    marginRight: 12 * SCALE,
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
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 16 * SCALE,
    marginHorizontal: 4 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16 * SCALE,
  },
  cardIconContainer: {
    width: 44 * SCALE,
    height: 44 * SCALE,
    borderRadius: 22 * SCALE,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  cardIcon: { fontSize: 22 * SCALE },
  cardInfo: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6 * SCALE,
  },
  cardTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 8 * SCALE,
  },
  cardRewardContainer: {
    alignSelf: 'flex-start',
  },
  cardRewardText: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 4 * SCALE,
    borderRadius: 12 * SCALE,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  participateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 12 * SCALE,
    borderRadius: 12 * SCALE,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  participateButtonText: {
    color: '#FFFFFF',
    fontSize: 14 * SCALE,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    borderRadius: 12 * SCALE,
  },
  completedText: {
    color: '#10B981',
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginLeft: 6 * SCALE,
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
    borderTopLeftRadius: 20 * SCALE,
    borderTopRightRadius: 20 * SCALE,
    paddingBottom: 16 * SCALE,
    // 3D shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 18,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 * SCALE, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  sheetIconWrap: { width: 44 * SCALE, height: 44 * SCALE, borderRadius: 22 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 * SCALE },
  sheetIconText: { fontSize: 24 * SCALE },
  sheetTitle: { fontSize: 16 * SCALE, fontWeight: '800', color: '#111827' },
  sheetBody: { maxHeight: 420 * SCALE, paddingHorizontal: 16 * SCALE, paddingTop: 12 * SCALE },
  section: { marginBottom: 12 * SCALE },
  sectionTitle: { fontSize: 13 * SCALE, fontWeight: '800', color: COLORS.primary, marginBottom: 6 * SCALE },
  sectionText: { fontSize: 12 * SCALE, color: '#4B5563', lineHeight: 18 * SCALE },
  sheetFooter: { paddingHorizontal: 16 * SCALE, paddingTop: 8 * SCALE },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12 * SCALE, paddingVertical: 12 * SCALE, alignItems: 'center', justifyContent: 'center', shadowColor: '#138072', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 12 },
  primaryBtnText: { color: COLORS.white, fontSize: 13 * SCALE, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#EEF2FF', borderRadius: 12 * SCALE, paddingVertical: 12 * SCALE, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: COLORS.blue, fontSize: 13 * SCALE, fontWeight: '700' },
  
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
    borderRadius: 16 * SCALE,
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
    marginVertical: 20 * SCALE,
    paddingVertical: 16 * SCALE,
  },
  
});


