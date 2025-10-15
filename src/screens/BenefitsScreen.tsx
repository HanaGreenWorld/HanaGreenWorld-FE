import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';
import TopBar from '../components/TopBar';
import { useCalendarData } from '../hooks/useCalendarData';
import { useApp } from '../contexts/AppContext';

interface BenefitsScreenProps {
  onBack?: () => void;
  onHome?: () => void;
  onNavigateToQuiz?: () => void;
  onNavigateToWalking?: () => void;
  onNavigateToEcoMerchants?: () => void;
  onNavigateToEcoChallenge?: () => void;
  onNavigateToElectronicReceipt?: () => void;
}

export function BenefitsScreen({ onBack, onHome, onNavigateToQuiz, onNavigateToWalking, onNavigateToEcoMerchants, onNavigateToEcoChallenge, onNavigateToElectronicReceipt }: BenefitsScreenProps) {
  // 로그인 상태 확인
  const { isLoggedIn } = useApp();
  
  // 달력 데이터 만들기
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1~12로 변환
  const firstDay = new Date(year, month - 1, 1); // month는 0~11이므로 -1
  const firstDow = firstDay.getDay(); // 0:일
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthLabel = `${year}.${String(month).padStart(2, '0')}`;

  // 로그인된 경우에만 API에서 달력 데이터 가져오기
  const { calendarData, loading: calendarLoading, error: calendarError } = useCalendarData(
    isLoggedIn ? year : 0, 
    isLoggedIn ? month : 0
  );
  
  // API 데이터가 없을 때 기본값
  const earningsByDay = isLoggedIn ? (calendarData?.dailyEarnings || {}) : {};
  const totalMonthlyEarnings = isLoggedIn ? (calendarData?.totalEarnings || 0) : 0;
  
  const myPercentile = 12; // 동연령대 상위 12%
  const myRankText = `동연령대 상위 ${myPercentile}%`;
  // 더보기의 혜택 카드 모양을 그대로 차용한 데이터 구조 (아이콘 이미지 + 타이틀 + 서브)
  const benefits = [
    {
      id: 'quiz',
      image: require('../../assets/hana3dIcon/hanaIcon3d_3_103.png'),
      title: '일일 환경 QUIZ',
      subtitle: '하루 1회 참여하고 씨앗 받기',
    },
    {
      id: 'walking',
      image: require('../../assets/hana3dIcon/hanaIcon3d_123.png'),
      title: '걷기',
      subtitle: '5,000보 이상 걸으면 씨앗 지급',
    },
    {
      id: 'receipt',
      image: require('../../assets/hana3dIcon/hanaIcon3d_4_13.png'),
      title: '전자확인증',
      subtitle: '종이 대신 전자확인증 사용',
    },
    {
      id: 'challenge',
      image: require('../../assets/hana3dIcon/hanaIcon3d_103.png'),
      title: '에코 챌린지',
      subtitle: '미션 달성하고 씨앗 받기',
    },
    {
      id: 'eco-store',
      image: require('../../assets/hana3dIcon/hanaIcon3d_85.png'),
      title: '친환경 가맹점 결제',
      subtitle: '그린 매장에서 결제하고 우대',
    },
    // {
    //   id: 'invite',
    //   image: require('../../assets/hana3dIcon/hanaIcon3d_4_121.png'),
    //   title: '친구초대',
    //   subtitle: '5,000 에코씨앗 받기',
    // },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TopBar title="모으기" onBack={onBack} onHome={onHome} />
      {/* 매일 출석하기 - 달력형 */}
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeaderRow}>
          <Text style={styles.calendarMonth}>{monthLabel}</Text>
          <Text style={styles.calendarCount}>
            {!isLoggedIn 
              ? '로그인 후 씨앗 현황을 확인하세요' 
              : calendarLoading 
                ? '로딩 중...' 
                : `이번달 획득 씨앗 ${totalMonthlyEarnings.toLocaleString()}개`
            }
          </Text>
        </View>
        <View style={styles.calendarWeekRow}>
          {['일','월','화','수','목','금','토'].map((d) => (
            <Text key={d} style={styles.calendarWeekTitle}>{d}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {Array.from({ length: firstDow }).map((_, i) => (
            <View key={`blank-${i}`} style={styles.calendarCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const amount = earningsByDay[day] || 0;
            const participated = amount > 0;
            return (
              <View key={`day-${day}`} style={styles.calendarCell}>
                <View style={[styles.calendarDot, participated ? styles.calendarDotOn : styles.calendarDotOff]}>
                  <Text style={[styles.calendarDayText, participated ? styles.calendarDayOn : null]}>{day}</Text>
                </View>
                <Text style={[styles.calendarEarn, !participated && styles.calendarEarnHidden]}>+{amount}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {/* Benefits List */}
      <View style={styles.menuList}>
        {benefits.map((item, index) => (
          <Pressable
            key={item.id}
            style={[styles.menuItem, index === benefits.length - 1 && styles.lastMenuItem]}
            onPress={() => {
              if (item.id === 'quiz' && onNavigateToQuiz) onNavigateToQuiz();
              if (item.id === 'walking' && onNavigateToWalking) onNavigateToWalking();
              if (item.id === 'eco-store' && onNavigateToEcoMerchants) onNavigateToEcoMerchants();
              if (item.id === 'challenge' && onNavigateToEcoChallenge) onNavigateToEcoChallenge();
              if (item.id === 'receipt' && onNavigateToElectronicReceipt) onNavigateToElectronicReceipt();
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <Image source={item.image} style={styles.menuIconImage} resizeMode="contain" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </Pressable>
        ))}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // 더보기 메뉴 스타일 복사
  menuList: {
    backgroundColor: COLORS.white,
    borderRadius: 12 * SCALE,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: 20 * SCALE,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE,
    paddingVertical: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuItem: { borderBottomWidth: 0 },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16 * SCALE,
    backgroundColor: '#F3F4F6',
  },
  menuIconImage: { width: 32 * SCALE, height: 32 * SCALE },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16 * SCALE, color: '#111827', marginBottom: 2 * SCALE },
  menuSubtitle: { fontSize: 14 * SCALE, color: '#6B7280' },

  // Removed unused widget styles

  // Calendar styles
  calendarCard: { backgroundColor: COLORS.white, borderRadius: 12 * SCALE, paddingHorizontal: 16 * SCALE, paddingBottom: 16 * SCALE, paddingVertical: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginHorizontal: 20 * SCALE, marginBottom: 16 * SCALE },
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 * SCALE },
  calendarMonth: { fontSize: 16 * SCALE, color: '#18181B', fontWeight: '800' },
  calendarCount: { fontSize: 14 * SCALE, color: '#111827' },
  calendarWeekRow: { flexDirection: 'row', marginTop: 12 * SCALE },
  calendarWeekTitle: { flex: 1, textAlign: 'center', fontSize: 12 * SCALE, color: '#6B7280' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 * SCALE },
  calendarCell: { width: `${100 / 7}%`, paddingVertical: 6 * SCALE, alignItems: 'center' },
  calendarDot: { width: 36 * SCALE, height: 36 * SCALE, borderRadius: 18 * SCALE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  calendarDotOn: { backgroundColor: '#EAF8F8', borderColor: '#D1E8E4' },
  calendarDotOff: { backgroundColor: 'transparent' },
  calendarDayText: { fontSize: 12 * SCALE, color: '#374151' },
  calendarDayOn: { color: '#008986', fontWeight: '800' },
  calendarEarn: { fontSize: 10 * SCALE, color: '#059669', marginTop: 4 * SCALE, fontWeight: '700' },
  calendarEarnHidden: { opacity: 0 },
  bottomSpacer: {
    height: 100 * SCALE,
  },
}); 