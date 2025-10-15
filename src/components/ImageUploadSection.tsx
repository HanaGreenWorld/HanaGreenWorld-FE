import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageUploader } from './ImageUploader';
import { LocalChallenge } from '../types/challenge';
import { SCALE } from '../utils/constants';

interface ImageUploadSectionProps {
  challenge: LocalChallenge;
  capturedImage?: string;
  uploading: boolean;
  onImageSelected: (imageUri: string) => void;
  onImageUpload: (challengeId: number, imageUri: string) => Promise<string | null>;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  challenge,
  capturedImage,
  uploading,
  onImageSelected,
  onImageUpload
}) => {
  const handleImageSelected = async (imageUri: string) => {
    onImageSelected(imageUri);
    
    // 자동으로 이미지 업로드
    try {
      await onImageUpload(challenge.id, imageUri);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>인증 사진 업로드</Text>
      
      <View style={styles.imageContainer}>
        {capturedImage ? (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.uploadedImage}
              resizeMode="cover"
            />
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <Ionicons name="cloud-upload" size={32} color="#FFFFFF" />
                <Text style={styles.uploadingText}>업로드 중...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="camera" size={48 * SCALE} color="#9CA3AF" />
            <Text style={styles.placeholderText}>인증 사진을 업로드해주세요</Text>
            <Text style={styles.placeholderSubtext}>카메라로 촬영하거나 갤러리에서 선택하세요</Text>
          </View>
        )}
      </View>
      
      <ImageUploader
        onImageSelected={handleImageSelected}
        selectedImage={capturedImage}
        title="인증 사진 업로드"
        subtitle="카메라로 촬영하거나 갤러리에서 선택하세요"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20 * SCALE,
  },
  sectionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12 * SCALE,
  },
  imageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200 * SCALE,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200 * SCALE,
    borderRadius: 8 * SCALE,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginTop: 8 * SCALE,
  },
  noImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12 * SCALE,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14 * SCALE,
    color: '#9CA3AF',
    marginTop: 4 * SCALE,
    textAlign: 'center',
  },
});
