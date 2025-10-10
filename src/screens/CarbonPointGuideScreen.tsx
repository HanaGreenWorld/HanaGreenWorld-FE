import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Linking } from 'react-native';
import { SCALE } from '../utils/constants';
import * as Ionicons from '@expo/vector-icons';
import TipBubble from '../components/TipBubble';
import MethodCard from '../components/MethodCard';

interface Props { onBack?: () => void; onHome?: () => void; onOpenReceipt?: () => void }

export default function CarbonPointGuideScreen({ onBack, onOpenReceipt }: Props) {
  return (
    <View style={styles.container}>
      {/* Custom Header (no TopBar) */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Ionicons.Ionicons name="close" size={24 * SCALE} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>탄소중립포인트 안내</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 소개(컬러 배경 영역) */}
        <Text style={styles.headline}>탄소중립포인트{'\n'}녹색생활 실천이란?</Text>
        <Text style={styles.body}>다양한 기업의 친환경 활동에 참여하면,{'\n'}한국환경공단에서 주는 포인트를{'\n'}받을 수 있는 제도예요.</Text>

        {/* 흰색 섹션 시작 */}
        <View style={styles.whiteSection}>
          <Text style={styles.sectionTitle}>포인트 적립 방법</Text>
          <Text style={styles.step}>STEP 1</Text>
          <Text style={styles.bodyStrong}><Text style={{ color: '#118A80', fontWeight: '700' }}>‘탄소중립포인트 녹색생활 실천’</Text>{'\n'}홈페이지에서 회원가입을 해 주세요.</Text>
          {/* 말풍선 안내 */}
          <TipBubble text="[포인트 지급 관련 정보]에서 하나은행 계좌를 입력하면 계좌로 포인트를 받을 수 있어요." />
          {/* 목업 이미지 */}
          <Image source={require('../../assets/cpoint.png')} style={styles.mockImage} resizeMode="contain" />
          {/* 회원가입 CTA */}
          <Pressable style={styles.cta} onPress={() => Linking.openURL('https://www.cpoint.or.kr/netzero/main.do')}>
            <Text style={styles.ctaText}>회원가입 바로가기</Text>
          </Pressable>

          {/* STEP 2 */}
          <Text style={[styles.step, { marginTop: 40 * SCALE }]}>STEP 2</Text>
          <Text style={styles.bodyStrong}>하나은행에서 <Text style={{ color: '#118A80', fontWeight: '700' }}>2가지 방법</Text>으로 포인트를 적립해 보세요.</Text>

          {/* 방법 01 - 전자확인증 (활성) */}
          <MethodCard index="01." title="하나은행 영업점에서 거래하고 종이 대신 전자확인증 받기" icon={require('../../assets/electronic_receipt.png')} cta="전자확인증 바로가기" onPress={onOpenReceipt} />

          {/* 방법 02 - 다회용컵 (비활성) */}
          <MethodCard index="02." title="다회용 컵 반납하고 하나은행 계좌로 보증금 돌려받기" icon={require('../../assets/multiple_use_cup.png')} cta="컵 반납 바로가기" disabled />

          {/* 유의사항 */}
          <Text style={styles.sectionTitle}>유의사항</Text>
          {[
            '하나은행에서 받을 수 있는 전자확인증 종류는 입금, 지급, 만기갱신, 해지 영수증입니다.',
            '하나은행 계좌로 보증금을 돌려받을 수 있는 다회용 컵은 해피해빗 컵입니다.',
            '무인 반납기에서 하나은행 선택 후 컵 아래쪽 QR코드를 스캔하면 보증금을 돌려받을 수 있습니다.',
            '탄소중립포인트는 연 최대 70,000원까지 받을 수 있습니다.',
            '개인정보 수정 및 회원 탈퇴는 탄소중립포인트 녹색생활 실천 홈페이지에서 할 수 있습니다.',
            '자세한 내용은 탄소중립포인트 녹색생활 실천 홈페이지 FAQ를 참고해 주세요.',
          ].map((t, i) => (
            <Text key={i} style={styles.bullet}>{'• '}{t}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F4F1' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 * SCALE, paddingVertical: 16 * SCALE, backgroundColor: '#E8F4F1' },
  headerBtn: { width: 40 * SCALE, height: 40 * SCALE, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16 * SCALE, fontWeight: '400', color: '#111827' },
  content: { padding: 20 * SCALE },
  headline: { fontSize: 20 * SCALE, fontWeight: '700', color: '#118A80', marginBottom: 12 * SCALE },
  body: { fontSize: 15 * SCALE, color: '#374151', lineHeight: 22 * SCALE, marginBottom: 12 * SCALE },
  bodyStrong: { fontSize: 18 * SCALE, color: '#111827', fontWeight: '600', marginBottom: 10 * SCALE },
  sectionTitle: { fontSize: 18 * SCALE, fontWeight: '500', color: '#111827', marginTop: 30 * SCALE, marginBottom: 10 * SCALE },
  step: { fontSize: 14 * SCALE, color: '#118A80', fontWeight: '600', marginTop: 12 * SCALE, marginBottom: 6 * SCALE, textDecorationLine: 'underline' },
  cta: { borderWidth: 1, borderColor: '#118A80', borderRadius: 12 * SCALE, alignItems: 'center', paddingVertical: 12 * SCALE, marginTop: 20 * SCALE, width: '70%', alignSelf: 'center' },
  ctaText: { color: '#118A80', fontSize: 16 * SCALE, fontWeight: '500' },
  
  bullet: { fontSize: 14 * SCALE, color: '#6B7280', marginBottom: 8 * SCALE, lineHeight: 22 * SCALE },
  whiteSection: { backgroundColor: '#FFFFFF', marginHorizontal: -20 * SCALE, paddingHorizontal: 20 * SCALE, paddingTop: 16 * SCALE, paddingBottom: 20 * SCALE, marginTop: 16 * SCALE, borderTopLeftRadius: 16 * SCALE, borderTopRightRadius: 16 * SCALE },
  tipBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12 * SCALE, padding: 12 * SCALE, marginTop: 8 * SCALE },
  mockImage: { width: '100%', height: 300 * SCALE, marginTop: 16 * SCALE },
  whiteBottomSpacer: { height: 20 * SCALE },
  whiteFooter: { height: 80 * SCALE, backgroundColor: '#FFFFFF' },
});


