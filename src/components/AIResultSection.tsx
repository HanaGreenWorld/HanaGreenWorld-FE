import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCALE } from '../utils/constants';

interface AIResultSectionProps {
  aiResult: {
    verificationStatus: string;
    confidence: number;
    explanation?: string;
    detectedItems?: string[] | string;
  };
}

export const AIResultSection: React.FC<AIResultSectionProps> = ({ aiResult }) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✅ 승인';
      case 'REJECTED':
        return '❌ 거부';
      default:
        return '🟡 검토 필요';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return styles.aiResultSuccess;
      case 'REJECTED':
        return styles.aiResultError;
      default:
        return styles.aiResultWarning;
    }
  };

  return (
    <View style={[styles.section, styles.aiResultSection]}>
      <Text style={styles.sectionTitle}>AI 검증 결과</Text>
      
      <View style={styles.aiResultCard}>
        <View style={styles.aiResultRow}>
          <Text style={styles.aiResultLabel}>결과:</Text>
          <Text style={[styles.aiResultValue, getStatusStyle(aiResult.verificationStatus)]}>
            {getStatusText(aiResult.verificationStatus)}
          </Text>
        </View>
        
        <View style={styles.aiResultRow}>
          <Text style={styles.aiResultLabel}>신뢰도:</Text>
          <Text style={styles.aiResultValue}>
            {Math.round((aiResult.confidence || 0) * 100)}%
          </Text>
        </View>
        
        {aiResult.explanation && (
          <View style={styles.aiResultRow}>
            <Text style={styles.aiResultLabel}>설명:</Text>
            <Text style={styles.aiResultDescription}>
              {aiResult.explanation}
            </Text>
          </View>
        )}
        
        {aiResult.detectedItems && (
          <View style={styles.aiResultRow}>
            <Text style={styles.aiResultLabel}>감지 항목:</Text>
            <Text style={styles.aiResultValue}>
              {Array.isArray(aiResult.detectedItems) 
                ? aiResult.detectedItems.join(', ')
                : aiResult.detectedItems}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20 * SCALE,
  },
  aiResultSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
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
    width: 80 * SCALE,
    marginRight: 10 * SCALE,
  },
  aiResultValue: {
    fontSize: 14 * SCALE,
    color: '#111827',
    flex: 1,
  },
  aiResultDescription: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20 * SCALE,
  },
  aiResultSuccess: {
    color: '#059669',
    fontWeight: '600',
  },
  aiResultError: {
    color: '#DC2626',
    fontWeight: '600',
  },
  aiResultWarning: {
    color: '#D97706',
    fontWeight: '600',
  },
});
