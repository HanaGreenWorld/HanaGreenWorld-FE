import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCALE, COLORS } from '../utils/constants';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
}

export default function TopBar({ title, onBack, onHome }: TopBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24 * SCALE} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton} onPress={onHome}>
          <Ionicons name="home-outline" size={24 * SCALE} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="menu-outline" size={24 * SCALE} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 18 * SCALE, // paddingTop은 동적으로 적용
    backgroundColor: COLORS.white,
  },
  headerButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 5 * SCALE,
  },
});


