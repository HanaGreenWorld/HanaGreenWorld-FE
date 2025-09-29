import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';

interface TabNavigationProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const tabs = [
  {
    id: 'home',
    name: '내 정원',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    id: 'my',
    name: '마이',
    icon: 'person-outline',
    activeIcon: 'person',
  },
  {
    id: 'collect',
    name: '모으기',
    icon: 'leaf-outline',
    activeIcon: 'leaf',
  },
  {
    id: 'benefits',
    name: 'My팀',
    icon: 'chatbubble-ellipses-outline',
    activeIcon: 'chatbubble-ellipses',
  },
  {
    id: 'report',
    name: '리포트',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
  },
];

export function TabNavigation({ activeTab, onTabPress }: TabNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={(isActive ? tab.activeIcon : tab.icon) as any}
                  size={24 * SCALE}
                  color={isActive ? COLORS.primary : COLORS.textLight}
                />
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.name}
                </Text>
              </View>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8 * SCALE,
    paddingTop: 8 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    paddingVertical: 8 * SCALE,
  },
  tabText: {
    fontSize: 11 * SCALE,
    color: COLORS.textLight,
    marginTop: 4 * SCALE,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20 * SCALE,
    height: 3 * SCALE,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5 * SCALE,
  },
}); 