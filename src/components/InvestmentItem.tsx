import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCALE } from '../utils/constants';

interface InvestmentItemProps {
  emoji: string;
  name: string;
  amount: string;
  change: string;
  isPositive?: boolean;
}

export function InvestmentItem({ 
  emoji, 
  name, 
  amount, 
  change, 
  isPositive = true 
}: InvestmentItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      <Text style={[styles.change, { color: isPositive ? '#10B981' : '#EF4444' }]}>
        {change}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  emoji: {
    fontSize: 20 * SCALE,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14 * SCALE,
    color: '#374151',
    marginBottom: 4 * SCALE,
  },
  amount: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  change: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },
}); 