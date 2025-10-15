import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SCALE } from '../utils/constants';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = '정보를 불러오는 중...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size="large" 
        color="#10B981" 
        style={styles.spinner}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 16 * SCALE,
  },
  text: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
  },
});
