import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../utils/constants';
import { integrationApi, UserBankAccountInfo } from '../services/integrationApi';
import { getCurrentUserIdFromToken } from '../utils/jwtUtils';

interface BankHomeMockScreenProps {
  onGoGreenPlay: () => void;
  onBack?: () => void;
}

export default function BankHomeMockScreen({ onGoGreenPlay, onBack }: BankHomeMockScreenProps) {
  const [userAccounts, setUserAccounts] = useState<UserBankAccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryTime] = useState(new Date()); // 처음 들어간 시점의 타임스탬프로 고정

  useEffect(() => {
    loadUserAccounts();
  }, []);

  // 시간 포맷 함수
  const formatTime = (date: Date) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  // 현재 월 가져오기
  const getCurrentMonth = () => {
    return `${entryTime.getMonth() + 1}월`;
  };

  const loadUserAccounts = async () => {
    try {
      setLoading(true);
      // 현재 사용자 ID 가져오기
      const currentUserId = await getCurrentUserIdFromToken();
      if (!currentUserId) {
        throw new Error('사용자 인증이 필요합니다.');
      }
      
      const response = await integrationApi.getBankAccounts(currentUserId);
      console.log('🏦 BankHomeMockScreen - API 응답:', response);
      
      // 모든 계좌 타입을 하나의 배열로 합치기
      const allAccounts = [];
      
      // 입출금 계좌 추가
      if (response.demandDepositAccounts && response.demandDepositAccounts.length > 0) {
        const demandAccounts = response.demandDepositAccounts.map((account: any) => ({
          id: Math.random(),
          bankName: account.bankName || '하나은행',
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          accountTypeDescription: account.accountTypeDescription,
          accountHolderName: account.accountHolderName,
          accountName: account.accountName,
          balance: account.balance ? Number(account.balance) : 0,
          availableBalance: account.balance ? Number(account.balance) : 0,
          isActive: account.isActive,
          status: account.status,
          openDate: account.openDate ? account.openDate.toString() : new Date().toISOString(),
          lastSyncAt: new Date().toISOString()
        }));
        allAccounts.push(...demandAccounts);
        console.log('🏦 입출금 계좌:', demandAccounts);
      }
      
      // 적금 계좌 추가
      if (response.savingsAccounts && response.savingsAccounts.length > 0) {
        const savingsAccounts = response.savingsAccounts.map((account: any) => ({
          id: Math.random(),
          bankName: '하나은행',
          accountNumber: account.accountNumber,
          accountType: 'SAVINGS',
          accountTypeDescription: account.productName || '적금',
          accountHolderName: '사용자',
          accountName: account.productName || '적금 계좌',
          balance: account.balance ? Number(account.balance) : 0,
          availableBalance: account.balance ? Number(account.balance) : 0,
          isActive: account.status === 'ACTIVE',
          status: account.status,
          openDate: account.openDate ? account.openDate.toString() : new Date().toISOString(),
          lastSyncAt: new Date().toISOString()
        }));
        allAccounts.push(...savingsAccounts);
        console.log('🏦 적금 계좌:', savingsAccounts);
      }
      
      // 대출 계좌 추가
      if (response.loanAccounts && response.loanAccounts.length > 0) {
        const loanAccounts = response.loanAccounts.map((account: any) => ({
          id: Math.random(),
          bankName: '하나은행',
          accountNumber: account.accountNumber,
          accountType: 'LOAN',
          accountTypeDescription: account.productName || '대출',
          accountHolderName: '사용자',
          accountName: account.productName || '대출 계좌',
          balance: account.remainingAmount ? Number(account.remainingAmount) : 0,
          availableBalance: account.remainingAmount ? Number(account.remainingAmount) : 0,
          isActive: account.status === 'ACTIVE',
          status: account.status,
          openDate: account.openDate ? account.openDate.toString() : new Date().toISOString(),
          lastSyncAt: new Date().toISOString()
        }));
        allAccounts.push(...loanAccounts);
        console.log('🏦 대출 계좌:', loanAccounts);
      }
      
      // 투자 계좌 추가
      if (response.investmentAccounts && response.investmentAccounts.length > 0) {
        const investmentAccounts = response.investmentAccounts.map((account: any) => ({
          id: Math.random(),
          bankName: '하나은행',
          accountNumber: account.accountNumber,
          accountType: 'INVESTMENT',
          accountTypeDescription: account.productName || '투자',
          accountHolderName: '사용자',
          accountName: account.productName || '투자 계좌',
          balance: account.currentValue ? Number(account.currentValue) : 0,
          availableBalance: account.currentValue ? Number(account.currentValue) : 0,
          isActive: account.status === 'ACTIVE',
          status: account.status,
          openDate: account.openDate ? account.openDate.toString() : new Date().toISOString(),
          lastSyncAt: new Date().toISOString()
        }));
        allAccounts.push(...investmentAccounts);
        console.log('🏦 투자 계좌:', investmentAccounts);
      }
      
      console.log('🏦 모든 계좌:', allAccounts);
      setUserAccounts(allAccounts);
    } catch (error) {
      console.error('계좌 목록 로딩 실패:', error);
      setUserAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>MY</Text>
          </View>
          <Pressable style={styles.segmentBtn}><Text style={styles.segmentText}>전체계좌</Text></Pressable>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIconBtn}><Ionicons name="home" size={18 * SCALE} color="#6B7280" /></Pressable>
          <Pressable style={styles.headerIconBtn}><Ionicons name="card" size={18 * SCALE} color="#6B7280" /></Pressable>
          <Pressable style={styles.headerIconBtn}><Ionicons name="notifications" size={18 * SCALE} color="#6B7280" /></Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert banner */}
        <Pressable style={styles.alertBanner}>
          <Ionicons name="megaphone" size={16 * SCALE} color="#10B981" />
          <Text style={styles.alertText}>민생회복 소비쿠폰 알림 놓치지 마세요!</Text>
          <Ionicons name="chevron-forward" size={16 * SCALE} color="#9CA3AF" />
        </Pressable>

        {/* Account card */}
        {loading ? (
          <View style={styles.accountCard}>
            <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
          </View>
        ) : userAccounts.length > 0 ? (
          userAccounts.slice(0, 1).map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeaderRow}>
                <Text style={styles.accountTitle}>{account.accountName || account.accountTypeDescription}</Text>
                <Pressable><Text style={styles.linkText}>한도계좌</Text></Pressable>
              </View>
              <Pressable style={styles.subRow}>
                <Text style={styles.subText}>{account.accountType === 'CHECKING' ? '입출금' : account.accountType} {account.accountNumber}</Text>
                <Text style={styles.copyText}>복사</Text>
              </Pressable>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceValue}>{account.balance.toLocaleString()}</Text>
                <Text style={styles.balanceUnit}>원</Text>
                <View style={styles.grayPill}><Text style={styles.grayPillText}>숨김</Text></View>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={[styles.ghostBtn]}><Text style={styles.ghostBtnText}>가져오기</Text></Pressable>
                <Pressable style={styles.primaryBtn}><Text style={styles.primaryBtnText}>보내기</Text></Pressable>
                <Pressable style={styles.moreBtn}><Ionicons name="ellipsis-horizontal" size={18 * SCALE} color="#6B7280" /></Pressable>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.accountCard}>
            <Text style={styles.noAccountText}>등록된 계좌가 없습니다.</Text>
          </View>
        )}

        {/* Cards row (horizontal slider) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsSlider}>
          {/* Left green card - clickable to green play */}
          <Pressable style={[styles.promoCard, styles.greenCard, styles.sliderCard]} onPress={onGoGreenPlay}>
            <Image source={require('../../assets/sprout.png')} style={styles.bannerImage} resizeMode="contain" />
            <Text style={styles.promoTitle}>HANA로 그린{'\n'}하나그린세상</Text>
            <Text style={styles.detailMuted}>자세히보기</Text>
          </Pressable>

          {/* Middle card */}
          <View style={[styles.promoCard, styles.blueCard, styles.sliderCard]}>
            <Image source={require('../../assets/basketball.png')} style={styles.bannerImage} resizeMode="contain" />
            <Text style={styles.promoTitle}>게임처럼 즐기는{'\n'}농구Play</Text>
            <Text style={styles.detailMuted}>자세히보기</Text>
          </View>

          {/* Right placeholder card */}
          <View style={[styles.promoCard, styles.pinkCard, styles.sliderCard]}>
            <Image source={require('../../assets/soccerball.png')} style={styles.bannerImage} resizeMode="contain" />
            <Text style={styles.promoTitle}>매일매일 신나는{'\n'}축구Play</Text>
            <Text style={styles.detailMuted}>자세히보기</Text>
          </View>
        </ScrollView>

        {/* 이벤트 배너 */}
        <View style={styles.eventBanner}>
          <View style={styles.eventLeft}>
            <Text style={styles.eventSmallTitle}>하나그린세상</Text>
            <Text style={styles.eventHeadline}>매일매일 미션 참여하고{"\n"}매일매일 원큐씨앗 받자!</Text>
            <View style={styles.eventPagerRow}>
              <View style={styles.pagerBtn}><Ionicons name="chevron-back" size={12 * SCALE} color="#6B7280" /></View>
              <Text style={styles.pagerText}>1/10</Text>
              <View style={styles.pagerBtn}><Ionicons name="pause" size={12 * SCALE} color="#6B7280" /></View>
              <View style={styles.pagerBtn}><Ionicons name="chevron-forward" size={12 * SCALE} color="#6B7280" /></View>
            </View>
          </View>
         <Image source={require('../../assets/beginner.png')} style={styles.eventImage} resizeMode="contain" />
        </View> 

        {/* 지출 카드 */}
        <View style={styles.spendCard}>
          <View style={styles.spendHeaderRow}>
            <Text style={styles.spendTitle}>{getCurrentMonth()} 지출</Text>
            <Text style={styles.spendDate}>{formatTime(entryTime)}</Text>
          </View>
          <View style={styles.spendAmountRow}>
            <Text style={styles.spendAmount}>0</Text>
            <Text style={styles.spendWon}>원</Text>
            <View style={styles.hidePill}><Text style={styles.hidePillText}>숨김</Text></View>
          </View>
          <View style={styles.spendTipBox}>
            <Text style={styles.spendTipText}>지난달 오늘 날짜와 똑같이 썼어요! 〉</Text>
          </View>
        </View>

        <View style={{ height: 20 * SCALE }} />
      </ScrollView>

      {/* Bottom Menu Bar */}
      <View style={styles.bottomMenu}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChips}>
          <View style={styles.chip}><Ionicons name="search" size={16 * SCALE} color="#4B5563" /><Text style={styles.chipText}>검색</Text></View>
          <View style={[styles.chip, styles.filledChip]}><Ionicons name="gift" size={16 * SCALE} color="#B91C1C" /><Text style={[styles.chipText, styles.filledChipText]}>하나원큐 축구Play</Text></View>
          <View style={styles.chip}><Ionicons name="wallet" size={16 * SCALE} color="#7C3AED" /><Text style={styles.chipText}>상품몰</Text></View>
          <View style={styles.chip}><Ionicons name="pricetag" size={16 * SCALE} color="#DB2777" /><Text style={styles.chipText}>청약 가이드</Text></View>
        </ScrollView>
        <View style={styles.navTabs}>
          {[
            { icon: 'home', label: '홈' },
            { icon: 'sparkles', label: '상품' },
            { icon: 'cash', label: '자산' },
            { icon: 'stats-chart', label: '주식' },
            { icon: 'ellipsis-horizontal', label: '메뉴' },
          ].map((t, idx) => (
            <View key={idx} style={styles.navTabItem}>
              <Ionicons name={t.icon as any} size={22 * SCALE} color={idx === 0 ? '#0F8A80' : '#6B7280'} />
              <Text style={[styles.navTabLabel, idx === 0 && { color: '#0F8A80' }]}>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FAF9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE, paddingTop: 18 * SCALE, paddingBottom: 10 * SCALE,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 * SCALE },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 * SCALE },
  avatarCircle: { width: 28 * SCALE, height: 28 * SCALE, borderRadius: 14 * SCALE, backgroundColor: '#E5F4F0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10 * SCALE, color: '#047A6E', fontWeight: '700' },
  segmentBtn: { backgroundColor: '#0F8A80', borderRadius: 16 * SCALE, paddingHorizontal: 10 * SCALE, paddingVertical: 6 * SCALE },
  segmentText: { color: '#FFFFFF', fontSize: 12 * SCALE, fontWeight: '700' },
  headerIconBtn: { width: 34 * SCALE, height: 34 * SCALE, borderRadius: 17 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },

  content: { flex: 1, paddingHorizontal: 16 * SCALE, paddingTop: 10 * SCALE },
  eventSmallTitle: { fontSize: 16 * SCALE, color: '#878788', fontWeight: '500', marginBottom: 6 * SCALE },
  eventBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 * SCALE, marginVertical: 24 * SCALE },
  eventLeft: { flex: 1, marginRight: 10 * SCALE },
  eventHeadline: { fontSize: 20 * SCALE, color: '#111827', fontWeight: '600', lineHeight: 26 * SCALE },
  eventPagerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 * SCALE, marginTop: 12 * SCALE },
  pagerBtn: { width: 24 * SCALE, height: 24 * SCALE, borderRadius: 12 * SCALE, backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center' },
  pagerText: { fontSize: 12 * SCALE, color: '#6B7280', fontWeight: '700' },
  eventImage: { width: 110 * SCALE, height: 90 * SCALE, marginTop: -8 * SCALE },
  bannerImage: { width: 30 * SCALE, height: 30 * SCALE, marginTop: 8 * SCALE, marginBottom: 16 * SCALE },
  spendCard: { backgroundColor: '#FFFFFF', borderRadius: 22 * SCALE, padding: 20 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 * SCALE, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
  spendHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 * SCALE, marginBottom: 12 * SCALE },
  spendTitle: { fontSize: 18 * SCALE, fontWeight: '600', color: '#1F2937' },
  spendDate: { fontSize: 12 * SCALE, color: '#9CA3AF' },
  spendAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 * SCALE, marginBottom: 20 * SCALE },
  spendAmount: { fontSize: 32 * SCALE, fontWeight: '700', color: '#111827' },
  spendWon: { fontSize: 18 * SCALE, color: '#6B7280' },
  hidePill: { backgroundColor: '#E5E7EB', borderRadius: 16 * SCALE, paddingHorizontal: 8 * SCALE, paddingVertical: 4 * SCALE, marginLeft: 6 * SCALE },
  hidePillText: { fontSize: 12 * SCALE, color: '#374151', fontWeight: '700' },
  spendTipBox: { backgroundColor: '#EEF2F7', borderRadius: 16 * SCALE, paddingVertical: 14 * SCALE, alignItems: 'center' },
  spendTipText: { fontSize: 14 * SCALE, color: '#111827', fontWeight: '700' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, padding: 12 * SCALE, gap: 10 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 * SCALE },
  alertText: { flex: 1, fontSize: 12 * SCALE, color: '#374151' },

  accountCard: { backgroundColor: '#E5F4F2', borderRadius: 16 * SCALE, padding: 24 * SCALE, borderWidth: 1, borderColor: '#D8E7E5', marginBottom: 16 * SCALE },
  accountHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 * SCALE },
  accountTitle: { fontSize: 16 * SCALE, fontWeight: '800', color: '#4C5159' },
  linkText: { fontSize: 12 * SCALE, color: '#0F766E', textDecorationLine: 'underline' },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8 * SCALE, marginBottom: 12 * SCALE },
  subText: { fontSize: 12 * SCALE, color: '#1F2937' },
  copyText: { fontSize: 12 * SCALE, color: '#0F766E', textDecorationLine: 'underline' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 * SCALE, marginBottom: 20 * SCALE },
  balanceValue: { fontSize: 32 * SCALE, fontWeight: '700', color: '#111827' },
  balanceUnit: { fontSize: 24 * SCALE, fontWeight: '600', color: '#111827' },
  grayPill: { backgroundColor: '#C9CDD4', borderRadius: 18 * SCALE, paddingHorizontal: 12 * SCALE, paddingVertical: 6 * SCALE },
  grayPillText: { fontSize: 14 * SCALE, color: '#FFFFFF', fontWeight: '800' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE, marginBottom: 8 * SCALE },
  ghostBtn: { flex: 1, height: 48 * SCALE, backgroundColor: '#D1E8E4', borderRadius: 12 * SCALE, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 * SCALE, borderWidth: 0 },
  ghostBtnText: { color: '#4C5159', fontSize: 16 * SCALE, fontWeight: '600' },
  primaryBtn: { flex: 1, height: 48 * SCALE, backgroundColor: '#16A39B', borderRadius: 12 * SCALE, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16 * SCALE, fontWeight: '600' },
  moreBtn: { width: 56 * SCALE, height: 48 * SCALE, borderRadius: 12 * SCALE, backgroundColor: '#D1E8E4', alignItems: 'center', justifyContent: 'center', borderWidth: 0 },

  cardsRow: { flexDirection: 'row', gap: 12 * SCALE },
  promoCard: { flex: 1, borderRadius: 16 * SCALE, padding: 16 * SCALE, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', position: 'relative', paddingBottom: 32 * SCALE },
  greenCard: { backgroundColor: '#E0F4E1', borderColor: '#DDEFDE' },
  blueCard: { backgroundColor: '#E1F0F5', borderColor: '#D5EAF3' },
  pinkCard: { backgroundColor: '#F1E7F6', borderColor: '#EDE0F3' },
  cardsSlider: { paddingVertical: 2 * SCALE, paddingHorizontal: 2 * SCALE },
  sliderCard: { width:150 * SCALE, height: 180 * SCALE, marginRight: 12 * SCALE },
  promoIcon: { width: 48 * SCALE, height: 48 * SCALE, borderRadius: 16 * SCALE, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  promoTitle: { fontSize: 18 * SCALE, fontWeight: '700', color: '#111827', marginBottom: 8 * SCALE },
  detailMuted: { fontSize: 12 * SCALE, color: '#6B7280', position: 'absolute', left: 16 * SCALE, bottom: 24 * SCALE },

  bottomMenu: { backgroundColor: '#FFFFFF', paddingTop: 12 * SCALE, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  quickChips: { paddingHorizontal: 16 * SCALE, gap: 12 * SCALE, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6 * SCALE, backgroundColor: '#EEF2F7', borderRadius: 16 * SCALE, paddingHorizontal: 12 * SCALE, paddingVertical: 8 * SCALE },
  filledChip: { backgroundColor: '#F3F4F6' },
  filledChipText: { color: '#374151' },
  chipText: { fontSize: 12 * SCALE, color: '#4B5563', fontWeight: '700' },
  navTabs: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 16 * SCALE },
  navTabItem: { alignItems: 'center' },
  navTabLabel: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 4 * SCALE, fontWeight: '700' },
  loadingText: { fontSize: 16 * SCALE, color: '#6B7280', textAlign: 'center', padding: 20 * SCALE },
  noAccountText: { fontSize: 16 * SCALE, color: '#6B7280', textAlign: 'center', padding: 20 * SCALE },
});


