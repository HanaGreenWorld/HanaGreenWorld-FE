import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { teamApi, TeamResponse } from '../utils/teamApi';

const { width, height } = Dimensions.get('window');

interface TeamCreateScreenProps {
  onBack: () => void;
  onCreateSuccess: (team: TeamResponse) => void;
}

export default function TeamCreateScreen({ onBack, onCreateSuccess }: TeamCreateScreenProps) {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState('20');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    // 입력 검증
    if (!teamName.trim()) {
      Alert.alert('알림', '팀 이름을 입력해주세요.');
      return;
    }

    if (teamName.length < 2 || teamName.length > 20) {
      Alert.alert('알림', '팀 이름은 2-20자 사이여야 합니다.');
      return;
    }

    if (description.length > 100) {
      Alert.alert('알림', '팀 설명은 100자 이하여야 합니다.');
      return;
    }

    const maxMembersNum = parseInt(maxMembers);
    if (isNaN(maxMembersNum) || maxMembersNum < 1 || maxMembersNum > 50) {
      Alert.alert('알림', '최대 팀원 수는 1-50명 사이여야 합니다.');
      return;
    }

    try {
      setLoading(true);
      const team = await teamApi.createTeam({
        teamName: teamName.trim(),
        description: description.trim(),
        maxMembers: maxMembersNum,
      });

      Alert.alert(
        '팀 생성 완료! 🎉',
        `"${team.name}" 팀이 성공적으로 생성되었습니다.\n\n초대코드: ${team.inviteCode}\n\n이제 친구들을 초대해보세요!`,
        [
          { text: '확인', onPress: () => onCreateSuccess(team) }
        ]
      );
    } catch (error: any) {
      console.error('팀 생성 실패:', error);
      Alert.alert('오류', error.message || '팀 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>팀 만들기</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="add-circle" size={64} color="#10B981" />
            </View>
            
            <Text style={styles.title}>새로운 팀을 만들어보세요!</Text>
            <Text style={styles.subtitle}>
              친구들과 함께 환경 보호에 참여하고{'\n'}
              팀 랭킹을 올려보세요
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {/* 팀 이름 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  팀 이름 <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="팀 이름을 입력하세요 (2-20자)"
                  value={teamName}
                  onChangeText={setTeamName}
                  maxLength={20}
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.characterCount}>{teamName.length}/20</Text>
              </View>

              {/* 팀 설명 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>팀 설명</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="팀에 대한 간단한 설명을 입력하세요 (선택사항)"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={100}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.characterCount}>{description.length}/100</Text>
              </View>

              {/* 최대 팀원 수 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>최대 팀원 수</Text>
                <View style={styles.maxMembersContainer}>
                  <TextInput
                    style={[styles.input, styles.maxMembersInput]}
                    placeholder="20"
                    value={maxMembers}
                    onChangeText={setMaxMembers}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.maxMembersLabel}>명</Text>
                </View>
                <Text style={styles.helpText}>1-50명 사이로 설정할 수 있습니다</Text>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, loading && styles.disabledButton]}
              onPress={handleCreateTeam}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>팀 만들기</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 팀 만들기 팁</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🎯</Text>
                <Text style={styles.tipText}>멋진 팀 이름으로 팀원들의 관심을 끌어보세요</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>📝</Text>
                <Text style={styles.tipText}>팀 설명으로 팀의 목표나 특징을 소개해보세요</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>👥</Text>
                <Text style={styles.tipText}>적절한 팀원 수를 설정하여 활발한 활동을 유지하세요</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  maxMembersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxMembersInput: {
    flex: 1,
    marginRight: 12,
  },
  maxMembersLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#018479',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#018479',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

