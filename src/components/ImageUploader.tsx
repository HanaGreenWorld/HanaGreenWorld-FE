import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image, 
  Alert, 
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// import * as MediaLibrary from 'expo-media-library'; // 제거
import { SCALE, COLORS } from '../utils/constants';

interface ImageUploaderProps {
  onImageSelected: (imageUri: string) => void;
  selectedImage?: string;
  title?: string;
  subtitle?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  title = "📸 인증 사진 업로드",
  subtitle = "카메라로 촬영하거나 갤러리에서 선택하세요"
}) => {
  const [showModal, setShowModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  // 카메라 권한만 요청
  const requestCameraPermission = async () => {
    console.log('카메라 권한 요청 시작...');
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    console.log('카메라 권한 결과:', cameraPermission);
    
    if (cameraPermission.status !== 'granted') {
      console.log('카메라 권한 거부됨');
      Alert.alert(
        '카메라 권한 필요',
        `사진 촬영을 위해 카메라 접근 권한이 필요합니다.\n\n현재 상태: ${cameraPermission.status}\n\n설정에서 카메라 권한을 허용해주세요.`,
        [{ text: '확인' }]
      );
      return false;
    }
    console.log('카메라 권한 승인됨');
    return true;
  };

  // 갤러리 권한만 요청
  const requestGalleryPermission = async () => {
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (mediaLibraryPermission.status !== 'granted') {
      Alert.alert(
        '갤러리 권한 필요',
        '이미지 선택을 위해 갤러리 접근 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return false;
    }
    return true;
  };

  // 카메라로 촬영
  const takePicture = async () => {
    console.log('카메라 촬영 시작...');
    
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      console.log('카메라 권한 없음');
      return;
    }

    try {
      console.log('카메라 실행 중...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 원본 비율 유지
        quality: 0.8,
      });

      console.log('카메라 결과:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('사진 촬영 성공:', result.assets[0].uri);
        
        // 갤러리 저장 기능 제거 (MediaLibrary 의존성 제거)
        console.log('사진 촬영 완료');
        
        onImageSelected(result.assets[0].uri);
        setShowModal(false);
        
        // 성공 애니메이션
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
      } else {
        console.log('사진 촬영 취소됨');
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      Alert.alert('카메라 오류', `사진 촬영 중 오류가 발생했습니다.\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 갤러리에서 선택
  const pickImage = async () => {
    console.log('갤러리 선택 시작...');
    
    const hasGalleryPermission = await requestGalleryPermission();
    if (!hasGalleryPermission) {
      console.log('갤러리 권한 없음');
      return;
    }

    try {
      console.log('갤러리 실행 중...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 원본 비율 유지
        quality: 0.8,
      });

      console.log('갤러리 결과:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('이미지 선택 성공:', result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
        setShowModal(false);
        
        // 성공 애니메이션
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
      } else {
        console.log('이미지 선택 취소됨');
      }
    } catch (error) {
      console.error('갤러리 오류:', error);
      Alert.alert('갤러리 오류', `이미지 선택 중 오류가 발생했습니다.\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.uploadArea, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={[
            styles.uploadButton,
            selectedImage && styles.uploadButtonWithImage
          ]}
          onPress={() => setShowModal(true)}
        >
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.overlayText}>변경</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadTitle}>{title}</Text>
              <Text style={styles.uploadSubtitle}>{subtitle}</Text>
              <View style={styles.uploadHint}>
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.hintText}>탭하여 업로드</Text>
              </View>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* 이미지 선택 모달 */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>사진 업로드</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>

            <View style={styles.optionsContainer}>
              <Pressable 
                style={[styles.option, styles.cameraOption]} 
                onPress={takePicture}
                android_ripple={{ color: '#FF6B6B20' }}
              >
                <View style={styles.optionIconContainer}>
                  <View style={[styles.optionIcon, { backgroundColor: '#FF6B6B' }]}>
                    <Ionicons name="camera" size={28} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>카메라로 촬영</Text>
                  <Text style={styles.optionSubtitle}>지금 바로 인증사진 촬영하기</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>

              <View style={styles.divider} />

              <Pressable 
                style={[styles.option, styles.galleryOption]} 
                onPress={pickImage}
                android_ripple={{ color: '#10B98120' }}
              >
                <View style={styles.optionIconContainer}>
                  <View style={[styles.optionIcon, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="images" size={28} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>갤러리에서 선택</Text>
                  <Text style={styles.optionSubtitle}>저장된 사진에서 선택하기</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 24 * SCALE, // 위아래 여백 증가
  },
  uploadArea: {
    alignItems: 'center',
  },
  uploadButton: {
    width: width - 64 * SCALE, // 양옆 여백 증가 (32 -> 64)
    height: 200 * SCALE,
    borderRadius: 16 * SCALE,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16 * SCALE, // 추가 여백
  },
  uploadButtonWithImage: {
    borderStyle: 'solid',
    borderColor: COLORS.success,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 14 * SCALE,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  overlayText: {
    color: 'white',
    fontSize: 14 * SCALE,
    fontWeight: 'bold',
    marginTop: 4 * SCALE,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    borderRadius: 40 * SCALE,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16 * SCALE,
  },
  uploadTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8 * SCALE,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 14 * SCALE,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16 * SCALE,
    lineHeight: 20 * SCALE,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16 * SCALE,
    paddingVertical: 8 * SCALE,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 20 * SCALE,
  },
  hintText: {
    fontSize: 12 * SCALE,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6 * SCALE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24 * SCALE,
    borderTopRightRadius: 24 * SCALE,
    paddingTop: 8 * SCALE,
    paddingBottom: 40 * SCALE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8 * SCALE,
  },
  modalTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32 * SCALE,
    height: 32 * SCALE,
    borderRadius: 16 * SCALE,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 4 * SCALE,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20 * SCALE,
    paddingHorizontal: 16 * SCALE,
    backgroundColor: 'transparent',
  },
  cameraOption: {
    // 카메라 옵션 특별 스타일 (필요시)
  },
  galleryOption: {
    // 갤러리 옵션 특별 스타일 (필요시)
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16 * SCALE,
  },
  optionIconContainer: {
    marginRight: 16 * SCALE,
  },
  optionIcon: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    borderRadius: 24 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2 * SCALE,
  },
  optionSubtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 18 * SCALE,
  },
});

// 이미지 오버레이 호버 효과를 위한 추가 스타일
const enhancedStyles = StyleSheet.create({
  ...styles,
  imageContainer: {
    ...styles.imageContainer,
  },
});

// 오버레이 호버 효과 (터치 시에만 보이도록)
const ImageContainerWithHover = ({ children, onPress }: any) => {
  const [showOverlay, setShowOverlay] = useState(false);
  
  return (
    <Pressable
      onPressIn={() => setShowOverlay(true)}
      onPressOut={() => setShowOverlay(false)}
      onPress={onPress}
      style={styles.imageContainer}
    >
      {children}
      {showOverlay && (
        <View style={styles.imageOverlay}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.overlayText}>변경</Text>
        </View>
      )}
    </Pressable>
  );
};

export default ImageUploader;
