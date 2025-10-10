import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Ionicons from '@expo/vector-icons';
import { SCALE } from '../utils/constants';

interface TipBubbleProps {
  text: string;
  icon?: string;
  iconColor?: string;
}

export default function TipBubble({ text, icon = 'chatbubble-ellipses-outline', iconColor = '#F59E0B' }: TipBubbleProps) {
  return (
    <View style={styles.container}>
      <Ionicons.Ionicons name={icon as any} size={16 * SCALE} color={iconColor} style={{ marginRight: 8 * SCALE }} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12 * SCALE, padding: 12 * SCALE, marginTop: 8 * SCALE },
  text: { fontSize: 13 * SCALE, color: '#6B7280' },
});


