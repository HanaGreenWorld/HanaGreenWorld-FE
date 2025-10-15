import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalChallenge } from '../types/challenge';
import { ChallengeState, TeamChallengeState } from '../hooks/useChallengeState';
import { ChallengeButton } from './ChallengeButton';
import { ImageUploader } from './ImageUploader';
import { SCALE } from '../utils/constants';

interface ChallengeModalProps {
  challenge: LocalChallenge | null;
  state: ChallengeState;
  teamState?: TeamChallengeState;
  userTeamRole: 'LEADER' | 'MEMBER' | null;
  teamInfo: any;
  imageUrl?: string;
  aiResult?: any;
  isUploading?: boolean;
  isVerifying?: boolean;
  visible: boolean;
  onClose: () => void;
  onParticipate: (challenge: LocalChallenge) => Promise<void>;
  onUploadImage: (challengeId: number, imageUri: string) => Promise<void>;
  onStartVerification: (challengeId: number, imageUrl: string) => Promise<void>;
  onImageSelected: (imageUri: string) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  state,
  teamState,
  userTeamRole,
  teamInfo,
  imageUrl,
  aiResult,
  isUploading = false,
  isVerifying = false,
  visible,
  onClose,
  onParticipate,
  onUploadImage,
  onStartVerification,
  onImageSelected
}) => {
  if (!challenge) return null;

  // 상태별 UI 표시 조건
  const shouldShowImageUpload = state !== 'NOT_PARTICIPATED';
  const shouldShowAIResults = ['VERIFYING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW'].includes(state);
  const shouldShowTeamInfo = challenge.isTeamChallenge && state !== 'NOT_PARTICIPATED';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{challenge.title}</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* 챌린지 설명 */}
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          
          {/* 팀 정보 (팀 챌린지이고 참여한 경우) */}
          {shouldShowTeamInfo && teamInfo && (
            <View style={styles.teamInfoSection}>
              <Text style={styles.sectionTitle}>팀 정보</Text>
              <View style={styles.teamInfoCard}>
                <Text style={styles.teamName}>{teamInfo.name}</Text>
                <Text style={styles.teamSlogan}>{teamInfo.slogan}</Text>
                <Text style={styles.teamRole}>
                  내 역할: {userTeamRole === 'LEADER' ? '팀장' : '팀원'}
                </Text>
              </View>
            </View>
          )}
          
          {/* 인증사진 업로드 섹션 */}
          {shouldShowImageUpload && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>인증 사진</Text>
              {!imageUrl ? (
                <ImageUploader
                  onImageSelected={onImageSelected}
                />
              ) : (
                <View style={styles.imageWrapper}>
                  <Image 
                    source={{ 
                      uri: imageUrl,
                      cache: 'force-cache'
                    }}
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          )}
          
          {/* AI 검증 결과 섹션 */}
          {shouldShowAIResults && aiResult && (
            <View style={styles.aiResultSection}>
              <Text style={styles.sectionTitle}>AI 검증 결과</Text>
              <View style={styles.aiResultCard}>
                <View style={styles.aiResultHeader}>
                  <Text style={[
                    styles.aiResultStatus,
                    aiResult.verificationStatus === 'APPROVED' && styles.aiResultSuccess,
                    aiResult.verificationStatus === 'REJECTED' && styles.aiResultError,
                    aiResult.verificationStatus === 'NEEDS_REVIEW' && styles.aiResultWarning
                  ]}>
                    {aiResult.verificationStatus === 'APPROVED' ? '승인' :
                     aiResult.verificationStatus === 'REJECTED' ? '거부' :
                     aiResult.verificationStatus === 'NEEDS_REVIEW' ? '검토 필요' : '검증 중'}
                  </Text>
                  <Text style={styles.aiResultConfidence}>
                    신뢰도: {Math.round((aiResult.confidence || 0) * 100)}%
                  </Text>
                </View>
                <Text style={styles.aiResultDescription}>
                  {aiResult.explanation || 'AI 검증 결과가 없습니다.'}
                </Text>
              </View>
            </View>
          )}
          
          {/* 챌린지 버튼 */}
          <ChallengeButton
            challenge={challenge}
            state={state}
            teamState={teamState}
            userTeamRole={userTeamRole}
            isUploading={isUploading}
            isVerifying={isVerifying}
            imageUrl={imageUrl}
            onParticipate={onParticipate}
            onUploadImage={onUploadImage}
            onStartVerification={onStartVerification}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32 * SCALE,
    height: 32 * SCALE,
    borderRadius: 16 * SCALE,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20 * SCALE,
  },
  challengeDescription: {
    fontSize: 16 * SCALE,
    color: '#374151',
    lineHeight: 24 * SCALE,
    marginBottom: 20 * SCALE,
  },
  teamInfoSection: {
    marginBottom: 20 * SCALE,
  },
  sectionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12 * SCALE,
  },
  teamInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teamName: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  teamSlogan: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    marginBottom: 8 * SCALE,
  },
  teamRole: {
    fontSize: 12 * SCALE,
    color: '#059669',
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 20 * SCALE,
  },
  imageWrapper: {
    width: '100%',
    height: 200 * SCALE,
    borderRadius: 12 * SCALE,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  aiResultSection: {
    marginBottom: 20 * SCALE,
  },
  aiResultCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aiResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * SCALE,
  },
  aiResultStatus: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
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
  aiResultConfidence: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '600',
  },
  aiResultDescription: {
    fontSize: 14 * SCALE,
    color: '#374151',
    lineHeight: 20 * SCALE,
  },
});
