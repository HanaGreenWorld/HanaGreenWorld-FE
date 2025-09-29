import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SCALE, COLORS } from '../utils/constants';

interface AccountItemProps {
  iconText: string;
  iconColor?: string;
  name: string;
  balance: string;
  showTransferButton?: boolean;
  onTransfer?: () => void;
}

export function AccountItem({ 
  iconText, 
  iconColor = '#F3F4F6', 
  name, 
  balance, 
  showTransferButton = false,
  onTransfer 
}: AccountItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: iconColor }]}>
        <Text style={styles.iconText}>{iconText}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.balance}>{balance}</Text>
      </View>
      {showTransferButton && (
        <Pressable style={styles.transferButton} onPress={onTransfer}>
          <Text style={styles.transferButtonText}>송금</Text>
        </Pressable>
      )}
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
  iconText: {
    color: 'white',
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14 * SCALE,
    color: '#374151',
    marginBottom: 4 * SCALE,
  },
  balance: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  transferButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8 * SCALE,
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    alignSelf: 'flex-start',
  },
  transferButtonText: {
    color: 'white',
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },
}); 