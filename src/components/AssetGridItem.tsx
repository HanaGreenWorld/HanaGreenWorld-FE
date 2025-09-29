import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SCALE } from '../utils/constants';

interface AssetGridItemProps {
  emoji: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function AssetGridItem({ emoji, title, subtitle, onPress }: AssetGridItemProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.icon}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    backgroundColor: '#F3F4F6',
    borderRadius: 24 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12 * SCALE,
  },
  emoji: {
    fontSize: 24 * SCALE,
  },
  title: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  subtitle: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
}); 