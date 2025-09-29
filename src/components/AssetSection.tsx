import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../utils/constants';

interface AssetSectionProps {
  title: string;
  children: React.ReactNode;
  showArrow?: boolean;
}

export function AssetSection({ title, children, showArrow = true }: AssetSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showArrow && <Ionicons name="chevron-forward" size={16} color="#6B7280" />}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 20 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16 * SCALE,
  },
  title: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#111827',
  },
}); 