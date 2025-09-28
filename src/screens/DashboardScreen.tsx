import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions, Pressable, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import TopBar from '../components/TopBar';
import { ActivityTracker } from '../components/ActivityTracker';
import { FeatureCards } from '../components/FeatureCards';
import { usePoints } from '../hooks/usePoints';
import { useEcoSeeds } from '../hooks/useEcoSeeds';
import { useUserStats } from '../hooks/useUserStats';
import { SCALE } from '../utils/constants';

interface DashboardScreenProps {
  onNavigateToHistory: () => void;
  onBack?: () => void;
  onHome?: () => void;
  ecoSeeds?: number;
}

export function DashboardScreen({ onNavigateToHistory, onBack, onHome, ecoSeeds: propEcoSeeds }: DashboardScreenProps) {
  const { points, todayPoints, addPoints, loading, error, hanaMoney } = usePoints();
  const { ecoSeedInfo, loading: ecoSeedsLoading, refreshProfile } = useEcoSeeds();
  const { userStats, loading: statsLoading } = useUserStats();
  
  // 일관된 데이터 사용을 위해 ecoSeedInfo의 currentSeeds를 우선 사용
  const displayEcoSeeds = ecoSeedInfo?.currentSeeds ?? propEcoSeeds ?? 0;

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshProfile();
    };

    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();
  }, [refreshProfile]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Common TopBar */}
      <TopBar title="내 정원" onBack={onBack} onHome={onHome} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Header />

        {/* Balance Cards ported from MoreScreen */}
        <View style={styles.balanceSection}>
          <Pressable style={styles.balanceCard} onPress={onNavigateToHistory}>
            <Text style={styles.balanceLabel}>원큐씨앗</Text>
            <View style={styles.balanceAmountContainer}>
              <Text style={styles.balanceAmount}>
                {loading ? '로딩 중...' : displayEcoSeeds.toLocaleString()}
              </Text>
              <Text style={styles.balanceUnit}> 개</Text>
            </View>
          </Pressable>
          <View style={[styles.balanceCard, styles.hanaMoneyCard]}>
            <Text style={styles.balanceLabel}>하나머니</Text>
            <View style={styles.balanceAmountContainer}>
              <Text style={styles.balanceAmountMoney}>
                {loading ? '로딩 중...' : hanaMoney.toLocaleString()}
              </Text>
              <Text style={styles.balanceUnit}> 원</Text>
            </View>
          </View>
        </View>
        {userStats && (
          <ActivityTracker 
            onPointsEarned={addPoints}
            userStats={{
              ...userStats,
              monthlyPoints: todayPoints, // 현재 월 포인트는 usePoints에서 가져온 값 사용
            }}
          />
        )}
        <FeatureCards />
      </ScrollView>
    </View>
  );
}

// Use global SCALE from constants

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  balanceSection: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 16 * SCALE,
    paddingTop: 8 * SCALE,
    flexDirection: 'row',
    gap: 12 * SCALE,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hanaMoneyCard: {
    backgroundColor: '#FFFFFF',
  },
  balanceLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 8 * SCALE,
  },
  balanceAmount: {
    fontSize: 28 * SCALE,
    fontWeight: '800',
    color: '#0F8A80',
  },
  balanceAmountMoney: {
    fontSize: 28 * SCALE,
    fontWeight: '800',
    color: '#374151',
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceUnit: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#6B7280',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 15 * SCALE,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 5 * SCALE,
  },
}); 