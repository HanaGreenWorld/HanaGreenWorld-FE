import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SCALE, COLORS } from '../utils/constants';
import { useUser } from '../hooks/useUser';
import { logout } from '../utils/authUtils';

export function Header() {
  const { userInfo, loading } = useUser();
  
  // 사용자 이름의 첫 글자를 아바타로 사용
  const getAvatarText = () => {
    if (loading || !userInfo) return '?';
    return userInfo.name.charAt(0);
  };

  // 사용자 이름 표시
  const getUserName = () => {
    if (loading) return '로딩 중...';
    if (!userInfo) return '사용자';
    return `${userInfo.name}님`;
  };

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // 로그인 화면으로 이동하는 로직이 필요합니다
              console.log('로그아웃 완료');
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.primary, '#0A5A4F', '#0D4A42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* 상단 영역 */}
          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getAvatarText()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>안녕하세요! 🌱</Text>
                <Text style={styles.userName}>{getUserName()}</Text>
              </View>
            </View>
          </View>


        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 15 * SCALE,
    paddingTop: 16 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  header: {
    borderRadius: 36 * SCALE,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContent: {
    paddingVertical: 14 * SCALE,
    paddingHorizontal: 20 * SCALE,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    borderRadius: 24 * SCALE,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12 * SCALE,
  },
  avatarText: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14 * SCALE,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2 * SCALE,
  },
  userName: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12 * SCALE,
  },
  iconButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: -36 * SCALE,
  },
  badge: {
    position: 'absolute',
    top: -4 * SCALE,
    right: -4 * SCALE,
    width: 18 * SCALE,
    height: 18 * SCALE,
    backgroundColor: COLORS.accent,
    borderRadius: 9 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10 * SCALE,
    fontWeight: 'bold',
    color: 'white',
  },

}); 