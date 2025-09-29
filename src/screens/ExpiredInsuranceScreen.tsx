import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';

interface ExpiredInsuranceScreenProps {
  expiredInsuranceData: any[];
  onBack?: () => void;
}

export function ExpiredInsuranceScreen({ expiredInsuranceData, onBack }: ExpiredInsuranceScreenProps) {
  const isEmpty = expiredInsuranceData.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>보장이 끝난 보험</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyBox}>
          <Image
            source={require('../../assets/hana3dIcon/hanaIcon3d_87.png')}
            style={styles.emptyIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>보험내역이 없어요</Text>
        </View>
      ) : (
        <View style={styles.listBox}>
          {/* TODO: 리스트 렌더링 */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24 * SCALE,
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 8 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8 * SCALE,
    marginRight: 16 * SCALE,
  },
  title: {
    fontSize: 22 * SCALE,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    marginBottom: 16 * SCALE,
  },
  emptyText: {
    fontSize: 18 * SCALE,
    color: COLORS.gray,
    marginTop: 8 * SCALE,
  },
  listBox: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
    // TODO: 리스트 스타일
  },
}); 