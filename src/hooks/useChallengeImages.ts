import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { challengeApi } from '../utils/challengeApi';
import { fixImageUrl } from '../utils/challengeUtils';

export const useChallengeImages = () => {
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [pendingImages, setPendingImages] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  // 이미지 업로드
  const uploadImage = useCallback(async (challengeId: number, imageUri: string) => {
    const challengeIdStr = challengeId.toString();
    
    try {
      setUploadingImages(prev => ({ ...prev, [challengeIdStr]: true }));
      
      console.log('📸 이미지 업로드 시작:', { challengeId, imageUri });
      
      const result = await challengeApi.uploadChallengeImage(challengeId, imageUri);
      
      if (result && result.imageUrl) {
        const fixedImageUrl = fixImageUrl(result.imageUrl);
        setCapturedImages(prev => ({ ...prev, [challengeIdStr]: fixedImageUrl }));
        setPendingImages(prev => ({ ...prev, [challengeIdStr]: fixedImageUrl }));
        
        console.log('✅ 이미지 업로드 완료:', fixedImageUrl);
        return fixedImageUrl;
      } else {
        Alert.alert('업로드 실패', '이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        return null;
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      Alert.alert('업로드 실패', '이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
      return null;
    } finally {
      setUploadingImages(prev => ({ ...prev, [challengeIdStr]: false }));
    }
  }, []);

  // 이미지 설정
  const setImage = useCallback((challengeId: string, imageUri: string) => {
    setCapturedImages(prev => ({ ...prev, [challengeId]: imageUri }));
    setPendingImages(prev => ({ ...prev, [challengeId]: imageUri }));
  }, []);

  // 이미지 제거
  const removeImage = useCallback((challengeId: string) => {
    setCapturedImages(prev => {
      const newState = { ...prev };
      delete newState[challengeId];
      return newState;
    });
    setPendingImages(prev => {
      const newState = { ...prev };
      delete newState[challengeId];
      return newState;
    });
  }, []);

  // 업로드 상태 업데이트
  const updateUploadingStatus = useCallback((challengeId: string, isUploading: boolean) => {
    setUploadingImages(prev => ({ ...prev, [challengeId]: isUploading }));
  }, []);

  return {
    capturedImages,
    pendingImages,
    uploadingImages,
    uploadImage,
    setImage,
    removeImage,
    updateUploadingStatus,
    setCapturedImages,
    setPendingImages,
    setUploadingImages
  };
};
