import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCALE } from '../utils/constants';

interface NoDataStateProps {
  title: string;
  subtitle?: string;
}

export const NoDataState: React.FC<NoDataStateProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    margin: 16 * SCALE,
  },
  title: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8 * SCALE,
  },
  subtitle: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
  },
});
