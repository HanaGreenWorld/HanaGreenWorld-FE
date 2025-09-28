import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';

export function FeatureCards() {
  const [activeTab, setActiveTab] = useState<'month' | 'total'>('month');
  const [activeCard, setActiveCard] = useState<'financial' | 'carbon'>('financial');

  const financialData = {
    month: {
      value: '75개',
      percentage: '상위 35%',
      trend: '+12%',
      image: require('../../assets/sprout.png'),
      color: '#10B981',
      bgGradient: ['#ECFDF5', '#F0FDF4'],
      icon: '🌱',
    },
    total: {
      value: '5,100개',
      percentage: '상위 42%',
      trend: '128일째',
      image: require('../../assets/sprout.png'),
      color: '#10B981',
      bgGradient: ['#ECFDF5', '#F0FDF4'],
      icon: '🌱',
    }
  };

  const carbonData = {
    month: {
      value: '2.3kg',
      percentage: '상위 28%',
      trend: '+8%',
      image: require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
      color: '#3B82F6',
      bgGradient: ['#EFF6FF', '#F0F9FF'],
      icon: '🌍',
    },
    total: {
      value: '8.7kg',
      percentage: '상위 31%',
      trend: '128일째',
      image: require('../../assets/hana3dIcon/hanaIcon3d_4_17.png'),
      color: '#3B82F6',
      bgGradient: ['#EFF6FF', '#F0F9FF'],
      icon: '🌍',
    }
  };

  const currentData = activeCard === 'financial' ? financialData[activeTab] : carbonData[activeTab];

  const handleTabChange = (tab: 'month' | 'total') => {
    setActiveTab(tab);
  };

  const handleCardChange = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveCard(activeCard === 'financial' ? 'carbon' : 'financial');
    } else if (direction === 'right') {
      setActiveCard(activeCard === 'carbon' ? 'financial' : 'carbon');
    }
  };

  return (
    <View style={styles.container}>
      {/* 메인 카드 */}
      <View style={styles.mainCard}>
        {/* 그라데이션 배경 */}
        <View style={[styles.gradientOverlay, { 
          backgroundColor: currentData.bgGradient[0] 
        }]} />

        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>나의 환경 임팩트</Text>
            <Text style={styles.subtitle}>친환경 실천으로 만드는 변화</Text>
          </View>
          
          {/* 모던한 탭 */}
          <View style={styles.modernTabContainer}>
            <Pressable
              style={[styles.modernTab, activeTab === 'month' && styles.activeModernTab]}
              onPress={() => handleTabChange('month')}
            >
              <Text style={[styles.modernTabText, activeTab === 'month' && styles.activeModernTabText]}>
                이번달
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modernTab, activeTab === 'total' && styles.activeModernTab]}
              onPress={() => handleTabChange('total')}
            >
              <Text style={[styles.modernTabText, activeTab === 'total' && styles.activeModernTabText]}>
                전체
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 메인 콘텐츠 */}
<View style={styles.contentSection}>
  {/* 배경 이미지 */}
  <View style={styles.backgroundImageContainer}>
    <Image 
      source={currentData.image} 
      style={styles.backgroundImage}
      resizeMode="contain"
    />
  </View>

  {/* 아이콘과 제목 */}
  <View style={styles.cardTitleSection}>
    <Text style={styles.cardTitle}>
      {activeCard === 'financial' ? '원큐씨앗 심기' : '탄소 절약량'}
    </Text>
  </View>

  {/* 메인 숫자 */}
  <Text style={[styles.mainValue, { color: currentData.color }]}>
    {currentData.value}
  </Text>

  {/* 통계 카드들 */}
  <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>평균 대비</Text>
              <Text style={[styles.statCardValue, { color: currentData.color }]}>
                {currentData.percentage}
              </Text>
              <View style={[styles.statCardIndicator, { backgroundColor: currentData.color }]} />
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>
                {activeTab === 'month' ? '증감률' : '연속 실천'}
              </Text>
              <Text style={[styles.statCardValue, { color: currentData.color }]}>
                {currentData.trend}
              </Text>
              <View style={[styles.statCardIndicator, { backgroundColor: currentData.color }]} />
            </View>
          </View>
        </View>

        {/* 네비게이션 */}
        <View style={styles.navigationSection}>
          <Pressable
            style={styles.navButton}
            onPress={() => handleCardChange('left')}
          >
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </Pressable>

          <View style={styles.dotIndicators}>
            <View style={[styles.dot, activeCard === 'financial' && styles.activeDot]} />
            <View style={[styles.dot, activeCard === 'carbon' && styles.activeDot]} />
          </View>

          <Pressable
            style={styles.navButton}
            onPress={() => handleCardChange('right')}
          >
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20 * SCALE,
    marginBottom: 24 * SCALE,
  },
  
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24 * SCALE,
    padding: 24 * SCALE,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },

  header: {
    marginBottom: 28 * SCALE,
    zIndex: 1,
  },

  titleSection: {
    marginBottom: 20 * SCALE,
  },

  mainTitle: {
    fontSize: 22 * SCALE,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4 * SCALE,
  },

  subtitle: {
    fontSize: 14 * SCALE,
    color: '#64748B',
    fontWeight: '500',
  },

  modernTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16 * SCALE,
    padding: 6 * SCALE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  modernTab: {
    flex: 1,
    paddingVertical: 12 * SCALE,
    paddingHorizontal: 20 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
  },

  activeModernTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  modernTabText: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#64748B',
  },

  activeModernTabText: {
    color: '#0F172A',
  },

  contentSection: {
    alignItems: 'center',
    marginBottom: 24 * SCALE,
    zIndex: 1,
  },

  cardTitleSection: {
    alignItems: 'center',
    marginBottom: 20 * SCALE,
  },

  iconBadge: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    borderRadius: 28 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12 * SCALE,
  },

  cardIcon: {
    fontSize: 24 * SCALE,
  },

  cardTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#334155',
  },

  mainValue: {
    fontSize: 40 * SCALE,
    fontWeight: 'bold',
    marginBottom: 24 * SCALE,
    letterSpacing: -1,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 16 * SCALE,
    width: '100%',
    justifyContent: 'center',
  },

  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    alignItems: 'center',
    minWidth: 100 * SCALE,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  statCardLabel: {
    fontSize: 12 * SCALE,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8 * SCALE,
    textAlign: 'center',
  },

  statCardValue: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  statCardIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -12 * SCALE }],
    width: 24 * SCALE,
    height: 3 * SCALE,
    borderRadius: 2 * SCALE,
  },

  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },

  navButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  dotIndicators: {
    flexDirection: 'row',
    gap: 8 * SCALE,
  },

  dot: {
    width: 8 * SCALE,
    height: 8 * SCALE,
    borderRadius: 4 * SCALE,
    backgroundColor: '#CBD5E1',
  },

  activeDot: {
    backgroundColor: '#0F172A',
    transform: [{ scale: 1.2 }],
  },

  titleUnderline: {
    width: 40 * SCALE,
    height: 3 * SCALE,
    borderRadius: 2 * SCALE,
    marginTop: 8 * SCALE,
  },
  
  backgroundImageContainer: {
    position: 'absolute',
    top: -30 * SCALE,
    right: -5 * SCALE,
    width: 150 * SCALE,
    height: 150 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1, // 배경으로 보내기
    opacity: 0.15, // 투명도 조절
  },
  
  backgroundImage: {
    width: '100%',
    height: '100%',
  },

});