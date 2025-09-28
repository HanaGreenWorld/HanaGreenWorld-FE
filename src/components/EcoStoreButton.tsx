import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../utils/constants';

interface EcoStoreButtonProps {
  onPress?: () => void;
}

export const EcoStoreButton: React.FC<EcoStoreButtonProps> = ({ onPress }) => {
  return (
    <Pressable style={styles.ecoStoreButton} onPress={onPress}>
      <Image source={require('../../assets/hana3dIcon/hanaIcon3d_85.png')} style={styles.ecoStoreIcon} resizeMode="contain" />
      <Text style={styles.ecoStoreText}>친환경 가맹점 확인하기</Text>
      <Ionicons name="chevron-forward" size={16} color="#6B7280" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  ecoStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ecoStoreIcon: { width: 28 * SCALE, height: 28 * SCALE },
  ecoStoreText: { flex: 1, marginLeft: 10 * SCALE, fontSize: 16 * SCALE, fontWeight: '600', color: '#111827' },
});

export default EcoStoreButton;

