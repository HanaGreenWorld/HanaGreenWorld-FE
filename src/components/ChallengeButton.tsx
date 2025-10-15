import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LocalChallenge } from '../types/challenge';
import { ChallengeState, TeamChallengeState } from '../hooks/useChallengeState';
import { SCALE } from '../utils/constants';

interface ChallengeButtonProps {
  challenge: LocalChallenge;
  state: ChallengeState;
  teamState?: TeamChallengeState;
  userTeamRole: 'LEADER' | 'MEMBER' | null;
  isUploading?: boolean;
  isVerifying?: boolean;
  imageUrl?: string;
  onParticipate: (challenge: LocalChallenge) => Promise<void>;
  onUploadImage: (challengeId: number, imageUri: string) => Promise<void>;
  onStartVerification: (challengeId: number, imageUrl: string) => Promise<void>;
}

export const ChallengeButton: React.FC<ChallengeButtonProps> = ({
  challenge,
  state,
  teamState,
  userTeamRole,
  isUploading = false,
  isVerifying = false,
  imageUrl,
  onParticipate,
  onUploadImage,
  onStartVerification
}) => {
  // 팀 챌린지 버튼 렌더링
  if (challenge.isTeamChallenge) {
    return renderTeamChallengeButton();
  }
  
  // 개인 챌린지 버튼 렌더링
  return renderPersonalChallengeButton();

  function renderTeamChallengeButton() {
    switch (teamState) {
      case 'NOT_STARTED':
        if (userTeamRole === 'LEADER') {
          return (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => onParticipate(challenge)}
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

      case 'LEADER_PARTICIPATED':
        // LEADER_PARTICIPATED 상태에서는 버튼을 숨김 (이미지 업로드 섹션이 표시됨)
        return null;

      case 'PENDING':
        return (
          <Pressable
            style={[styles.primaryBtn, isVerifying && styles.primaryBtnDisabled]}
            disabled={isVerifying}
            onPress={() => {
              // 이미지 URL이 있다면 AI 검증 시작
              if (imageUrl) {
                onStartVerification(challenge.id, imageUrl);
              }
            }}
          >
            <Text style={isVerifying ? styles.primaryBtnTextDisabled : styles.primaryBtnText}>
              {isVerifying ? 'AI 검증 중...' : '인증 완료하기'}
            </Text>
          </Pressable>
        );

      case 'VERIFYING':
        return (
          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
            <Text style={styles.primaryBtnTextDisabled}>
              AI 검증 중...
            </Text>
          </View>
        );

      case 'APPROVED':
        return (
          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
            <Text style={styles.primaryBtnTextDisabled}>
              참여완료
            </Text>
          </View>
        );

      default:
        return null;
    }
  }

  function renderPersonalChallengeButton() {
    switch (state) {
      case 'NOT_PARTICIPATED':
        return (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => onParticipate(challenge)}
          >
            <Text style={styles.primaryBtnText}>
              챌린지 참여하기
            </Text>
          </Pressable>
        );

      case 'PARTICIPATED':
        // PARTICIPATED 상태에서는 버튼을 숨김 (이미지 업로드 섹션이 표시됨)
        return null;

      case 'PENDING':
        return (
          <Pressable
            style={[styles.primaryBtn, isVerifying && styles.primaryBtnDisabled]}
            disabled={isVerifying}
            onPress={() => {
              // 이미지 URL이 있다면 AI 검증 시작
              if (imageUrl) {
                onStartVerification(challenge.id, imageUrl);
              }
            }}
          >
            <Text style={isVerifying ? styles.primaryBtnTextDisabled : styles.primaryBtnText}>
              {isVerifying ? 'AI 검증 중...' : '인증 완료하기'}
            </Text>
          </Pressable>
        );

      case 'VERIFYING':
        return (
          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
            <Text style={styles.primaryBtnTextDisabled}>
              AI 검증 중...
            </Text>
          </View>
        );

      case 'APPROVED':
      case 'REJECTED':
      case 'NEEDS_REVIEW':
        return (
          <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
            <Text style={styles.primaryBtnTextDisabled}>
              참여완료
            </Text>
          </View>
        );

      default:
        return null;
    }
  }
};

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: '#0F8A80',
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 24 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    marginTop: 20 * SCALE,
  },
  primaryBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  primaryBtnTextDisabled: {
    color: '#9CA3AF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
});
