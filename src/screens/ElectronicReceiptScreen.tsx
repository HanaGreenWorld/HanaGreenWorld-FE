import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import TopBar from '../components/TopBar';
import { SCALE } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useEcoSeeds } from '../hooks/useEcoSeeds';

interface Props {
  onBack?: () => void;
  onHome?: () => void;
  onOpenCarbonGuide?: () => void;
}

export default function ElectronicReceiptScreen({ onBack, onHome, onOpenCarbonGuide }: Props) {
  const { earnSeeds } = useEcoSeeds();
  
  const MOCK = {
    title: '영업점 거래 확인증',
    org: '하나은행',
    date: '2025.08.12 14:32',
    type: '영업점',
    seeds: 3,
  };
  
  // 전자영수증으로 원큐씨앗 적립
  React.useEffect(() => {
    const earnSeedsFromReceipt = async () => {
      try {
        await earnSeeds({
          category: 'ELECTRONIC_RECEIPT',
          pointsAmount: MOCK.seeds,
          description: '전자영수증으로 원큐씨앗 적립'
        });
      } catch (error) {
        console.error('전자영수증 원큐씨앗 적립 실패:', error);
      }
    };
    
    earnSeedsFromReceipt();
  }, [earnSeeds]);

  return (
    <View style={styles.container}>
      <TopBar title="전자확인증" onBack={onBack} onHome={onHome} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 문구 */}
        <View style={styles.noticeBox}>
          <Text style={styles.bullet}>{'• '}
            <Text style={styles.noticeText}>영업점 거래 확인증, 계산서 등을 전자확인증으로 제공해드립니다.</Text>
          </Text>
          <Text style={styles.bullet}>{'• '}
            <Text style={styles.noticeText}>제 3자 앞 거래 증빙용으로 제공 및 사용 불가</Text>
          </Text>
          <Text style={styles.bullet}>{'• '}
            <Text style={styles.noticeText}>전자확인증은 정상거래 완료 후 6개월간 확인 가능합니다. (취소, 정정거래 제외)</Text>
          </Text>
        </View>

        {/* 필터 (목업) */}
        <View style={styles.filters}>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>전체</Text>
            <Ionicons name="chevron-down" size={16 * SCALE} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>1주일</Text>
            <Ionicons name="chevron-down" size={16 * SCALE} color="#6B7280" />
          </Pressable>
        </View>

        {/* 결과 리스트 (목업 1건) */}
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={styles.iconWrap}>
              <Image source={require('../../assets/hana3dIcon/hanaIcon3d_85.png')} style={styles.icon} resizeMode="contain" />
            </View>
          </View>
          <View style={styles.cardCenter}>
            <Text style={styles.cardTitle}>{MOCK.title}</Text>
            <Text style={styles.cardMeta}>{MOCK.org} · {MOCK.type}</Text>
            <Text style={styles.cardDate}>{MOCK.date}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.seedPlus}>+{MOCK.seeds}</Text>
            <Text style={styles.seedUnit}>씨앗</Text>
          </View>
        </View>

        {/* 탄소중립포인트 배너 */}
        <Pressable style={styles.cpBanner} onPress={onOpenCarbonGuide}>
          <View style={styles.cpBannerLeft}>
            <Image source={require('../../assets/zero_waste.png')} style={styles.cpIcon} resizeMode="contain" />
            <View style={styles.cpCoinWrap}>
              <Text style={styles.cpCoinText}>P</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cpHash}>#탄소중립포인트</Text>
            <Text style={styles.cpTitle}>포인트를 적립해 보세요!</Text>
          </View>
        </Pressable>

        <View style={{ height: 60 * SCALE }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20 * SCALE },
  noticeBox: { backgroundColor: '#F9FAFB', borderRadius: 12 * SCALE, padding: 16 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 * SCALE },
  bullet: { fontSize: 12 * SCALE, color: '#6B7280', marginBottom: 6 * SCALE },
  noticeText: { fontSize: 12 * SCALE, color: '#6B7280' },
  filters: { flexDirection: 'row', gap: 12 * SCALE, marginBottom: 16 * SCALE },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, paddingHorizontal: 14 * SCALE, paddingVertical: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  dropdownText: { fontSize: 14 * SCALE, color: '#111827' },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 * SCALE },
  cardLeft: { marginRight: 12 * SCALE },
  iconWrap: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 20 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  icon: { width: 24 * SCALE, height: 24 * SCALE },
  cardCenter: { flex: 1 },
  cardTitle: { fontSize: 14 * SCALE, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 2 * SCALE },
  cardDate: { fontSize: 11 * SCALE, color: '#9CA3AF', marginTop: 2 * SCALE },
  cardRight: { alignItems: 'flex-end', minWidth: 50 * SCALE },
  seedPlus: { fontSize: 16 * SCALE, color: '#10B981', fontWeight: '800' },
  seedUnit: { fontSize: 11 * SCALE, color: '#10B981', marginTop: 2 * SCALE },

  // Carbon-neutral point banner
  cpBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 18 * SCALE, padding: 16 * SCALE, marginTop: 32 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  cpBannerLeft: { flexDirection: 'row', alignItems: 'center', marginRight: 12 * SCALE },
  cpIcon: { width: 32 * SCALE, height: 32 * SCALE },
  cpCoinWrap: { width: 22 * SCALE, height: 22 * SCALE, borderRadius: 11 * SCALE, backgroundColor: '#FCD34D', alignItems: 'center', justifyContent: 'center', marginLeft: -8 * SCALE, borderWidth: 2, borderColor: '#FFF' },
  cpCoinText: { fontSize: 12 * SCALE, fontWeight: '800', color: '#111827' },
  cpHash: { fontSize: 12 * SCALE, color: '#6B7280', marginBottom: 2 * SCALE },
  cpTitle: { fontSize: 16 * SCALE, color: '#111827', fontWeight: '800' },
});


