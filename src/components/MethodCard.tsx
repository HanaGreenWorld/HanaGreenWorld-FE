import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../utils/constants';

interface Props {
  index: string;
  title: string;
  icon: any;
  cta: string;
  disabled?: boolean;
  onPress?: () => void;
}

export default function MethodCard({ index, title, icon, cta, disabled, onPress }: Props) {
  const Container = disabled ? View : Pressable as any;
  return (
    <Container style={[styles.card, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <View style={styles.topRow}>
        <Image source={icon} style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.indexText}>{index}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.linkRow}>
            <Text style={styles.link}>{cta}</Text>
            <Ionicons name="chevron-forward" size={16 * SCALE} color={disabled ? '#D1D5DB' : '#9CA3AF'} />
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 12 * SCALE, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 56 * SCALE, height: 56 * SCALE, marginRight: 16 * SCALE },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 * SCALE },
  disabled: { opacity: 0.5 },
  indexText: { fontSize: 16 * SCALE, color: '#118A80', fontWeight: '600', marginBottom: 6 * SCALE },
  title: { fontSize: 16 * SCALE, color: '#111827', fontWeight: '600', marginBottom: 8 * SCALE },
  link: { fontSize: 14 * SCALE, color: '#6B7280' },
});


