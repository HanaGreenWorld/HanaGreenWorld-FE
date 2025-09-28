import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import type { EcoReport } from './EcoReportScreen';
import { PieChart } from '../components/PieChart';

interface Props {
  report: EcoReport;
  onBack?: () => void;
  onHome?: () => void;
}

export default function EcoReportDetailScreen({ report, onBack, onHome }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <TopBar title={`${report.month} 리포트`} onBack={onBack} onHome={onHome} />
      <ScrollView style={{ padding: 20 * SCALE }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <PieChart data={report.activities} size={160 * SCALE} strokeWidth={40 * SCALE} />
          <View style={{ marginTop: 12 * SCALE }}>
            {report.activities.map((a) => (
              <Text key={a.label} style={{ fontSize: 12 * SCALE, color: '#374151', marginBottom: 4 * SCALE }}>{a.label}: {a.value}%</Text>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>요약</Text>
          <Text style={styles.text}>가장 많이 한 활동: {report.topActivity}</Text>
          <Text style={styles.text}>원큐씨앗: {report.seeds.toLocaleString()}개</Text>
          <Text style={styles.text}>탄소절감: {report.carbonKg}kg</Text>
        </View>
        <View style={{ height: 60 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 * SCALE },
  title: { fontSize: 14 * SCALE, fontWeight: '800', color: '#111827', marginBottom: 8 * SCALE },
  text: { fontSize: 12 * SCALE, color: '#374151', marginBottom: 4 * SCALE },
});


