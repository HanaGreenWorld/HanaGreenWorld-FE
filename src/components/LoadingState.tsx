import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCALE } from '../utils/constants';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = '정보를 불러오는 중...' 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
});
