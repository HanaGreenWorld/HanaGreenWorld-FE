import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';

interface ProductsScreenProps {
  initialTab?: string;
}

export function ProductsScreen({ initialTab = 'PICK' }: ProductsScreenProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'PICK', label: 'PICK' },
    { id: '투자', label: '투자' },
    { id: '카드', label: '카드', hasNotification: true },
    { id: '대출', label: '대출' },
    { id: '보험', label: '보험' },
    { id: '연금/저축', label: '연금/저축' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>금융 상품</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
              {tab.hasNotification && <View style={styles.notificationDot} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Product Cards */}
      <View style={styles.content}>
        {/* Insurance Card */}
        <View style={styles.insuranceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardCategory}>보험</Text>
          </View>
          <Text style={styles.cardTitle}>비행기 지연으로 시간낭비?</Text>
          
          {/* 3D Airplane Illustration */}
          <View style={styles.airplaneContainer}>
            <View style={styles.airplane}>
              <View style={styles.airplaneBody}>
                <View style={styles.airplaneWindow} />
                <View style={styles.airplaneWindow} />
                <View style={styles.airplaneWindow} />
              </View>
              <View style={styles.airplaneWing} />
              <View style={styles.airplaneTail} />
              <View style={styles.clockIcon}>
                <Ionicons name="time" size={16} color="white" />
              </View>
            </View>
          </View>

          <Text style={styles.cardDescription}>
            *출국 항공기, 지연, 결함 보상(지수형)(특약)
          </Text>
          <Text style={styles.cardDescription}>
            *항공편이 결항 또는 2시간 이상 지연되는 경우
          </Text>

          {/* Nested Card */}
          <View style={styles.nestedCard}>
            <View style={styles.nestedCardContent}>
              <View style={styles.nestedIcon}>
                <Ionicons name="airplane" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.nestedTextContainer}>
                <Text style={styles.nestedTitle}>하나손해보험 해외여행보험</Text>
                <Text style={styles.nestedDescription}>더 이상 스트레스 받지 말고</Text>
                <Text style={styles.nestedDescription}>보험금으로 보상받자</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Life Insurance Card */}
        <View style={styles.lifeInsuranceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardCategory}>가족·사랑</Text>
          </View>
          <Text style={styles.cardTitle}>원하는 기간동안 사망보장</Text>
          <Text style={styles.cardTitle}>만기시 100% 환급까지!</Text>
          <Text style={styles.cardDescription}>만기환급형 선택시</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20 * SCALE,
    paddingTop: 24 * SCALE,
    paddingBottom: 8 * SCALE,
  },
  headerTitle: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20 * SCALE,
  },
  tab: {
    paddingHorizontal: 16 * SCALE,
    paddingVertical: 12 * SCALE,
    marginRight: 8 * SCALE,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
  notificationDot: {
    position: 'absolute',
    top: 8 * SCALE,
    right: 8 * SCALE,
    width: 6 * SCALE,
    height: 6 * SCALE,
    backgroundColor: '#EF4444',
    borderRadius: 3 * SCALE,
  },
  content: {
    padding: 20 * SCALE,
  },
  insuranceCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16 * SCALE,
    padding: 24 * SCALE,
    marginBottom: 20 * SCALE,
  },
  cardHeader: {
    marginBottom: 12 * SCALE,
  },
  cardCategory: {
    fontSize: 12 * SCALE,
    color: COLORS.primary,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8 * SCALE,
  },
  airplaneContainer: {
    alignItems: 'center',
    marginVertical: 20 * SCALE,
  },
  airplane: {
    position: 'relative',
    width: 120 * SCALE,
    height: 80 * SCALE,
  },
  airplaneBody: {
    width: 100 * SCALE,
    height: 40 * SCALE,
    backgroundColor: 'white',
    borderRadius: 20 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10 * SCALE,
  },
  airplaneWindow: {
    width: 12 * SCALE,
    height: 12 * SCALE,
    backgroundColor: '#E3F2FD',
    borderRadius: 6 * SCALE,
  },
  airplaneWing: {
    position: 'absolute',
    top: 10 * SCALE,
    left: 20 * SCALE,
    width: 40 * SCALE,
    height: 20 * SCALE,
    backgroundColor: COLORS.primary,
    borderRadius: 10 * SCALE,
  },
  airplaneTail: {
    position: 'absolute',
    top: 5 * SCALE,
    right: 10 * SCALE,
    width: 20 * SCALE,
    height: 30 * SCALE,
    backgroundColor: COLORS.primary,
    borderRadius: 10 * SCALE,
  },
  clockIcon: {
    position: 'absolute',
    bottom: 10 * SCALE,
    left: 20 * SCALE,
    width: 24 * SCALE,
    height: 24 * SCALE,
    backgroundColor: COLORS.primary,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 4 * SCALE,
  },
  nestedCard: {
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    marginTop: 16 * SCALE,
  },
  nestedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nestedIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    backgroundColor: '#F3F4F6',
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  nestedTextContainer: {
    flex: 1,
  },
  nestedTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4 * SCALE,
  },
  nestedDescription: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 2 * SCALE,
  },
  lifeInsuranceCard: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 24 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bottomSpacer: {
    height: 100 * SCALE,
  },
}); 