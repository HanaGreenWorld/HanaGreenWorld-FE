import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCALE } from '../utils/constants';

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
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
    backgroundColor: '#FEF2F2',
    borderRadius: 12 * SCALE,
    margin: 16 * SCALE,
  },
  text: {
    fontSize: 14 * SCALE,
    color: '#DC2626',
    textAlign: 'center',
  },
});
