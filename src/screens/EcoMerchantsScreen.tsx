import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SCALE, COLORS, IPHONE_WIDTH, KAKAO_MAP_API_KEY } from '../utils/constants';
import { EcoMerchant, CATEGORY_EMOJIS } from '../types/merchant';
import { searchNearbyMerchants, searchMerchantsByCategory, searchMerchantsByName } from '../utils/merchantApi';
import { KakaoMap } from '../components/KakaoMap';
import TopBar from '../components/TopBar';

interface EcoMerchantsScreenProps {
  onBack?: () => void;
}

type LatLng = { lat: number; lon: number };

const DEFAULT_CENTER: LatLng = { lat: 37.477291, lon: 126.8625815 };

// 한국 좌표 범위 검증 함수
const isValidKoreanCoordinate = (lat: number, lon: number): boolean => {
  // 한국의 위도: 약 33~38.5도
  // 한국의 경도: 약 124~132도 (동경)
  // 음수 경도는 서경이므로 한국이 아님
  return lat >= 33 && lat <= 38.5 && lon >= 124 && lon <= 132;
};

export function EcoMerchantsScreen({ onBack }: EcoMerchantsScreenProps) {
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [hasLocation, setHasLocation] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<'distance' | 'name'>('distance');

  const [merchants, setMerchants] = useState<EcoMerchant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('위치 권한이 거부되었습니다');
          Alert.alert(
            '위치 권한 필요',
            '친환경 가맹점을 찾기 위해 위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' }
            ]
          );
          setCenter(DEFAULT_CENTER);
          setHasLocation(false);
          return;
        }

        // 현재 위치 가져오기
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        const { latitude, longitude } = location.coords;
        console.log('현재 위치:', latitude, longitude);
        
        // 한국 좌표 범위 검증
        if (isValidKoreanCoordinate(latitude, longitude)) {
          setCenter({ lat: latitude, lon: longitude });
          setHasLocation(true);
          console.log('✅ 한국 좌표 범위 내 위치 사용');
        } else {
          console.log('❌ 한국 범위 밖 좌표, 기본 위치 사용:', latitude, longitude);
          setCenter(DEFAULT_CENTER);
          setHasLocation(false);
          console.log('📍 기본 위치로 설정됨:', DEFAULT_CENTER);
          Alert.alert(
            '위치 알림',
            '현재 위치가 한국 범위를 벗어나 기본 위치(서울)를 사용합니다.',
            [{ text: '확인' }]
          );
        }
      } catch (error) {
        console.error('위치 가져오기 실패:', error);
        setCenter(DEFAULT_CENTER);
        setHasLocation(false);
      }
    };

    getCurrentLocation();
  }, []);

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;
      
      // 한국 좌표 범위 검증
      if (isValidKoreanCoordinate(latitude, longitude)) {
        setCenter({ lat: latitude, lon: longitude });
        setHasLocation(true);
        console.log('✅ 현재 위치로 이동:', latitude, longitude);
      } else {
        console.log('❌ 한국 범위 밖 좌표, 기본 위치 사용:', latitude, longitude);
        setCenter(DEFAULT_CENTER);
        setHasLocation(false);
        Alert.alert(
          '위치 알림',
          '현재 위치가 한국 범위를 벗어나 기본 위치(서울)를 사용합니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('현재 위치 가져오기 실패:', error);
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  // API에서 가맹점 데이터 로드
  const loadMerchants = async () => {
    try {
      setLoading(true);
      console.log('API 호출 시작:', { lat: center.lat, lon: center.lon });
      
      const nearbyMerchants = await searchNearbyMerchants({
        latitude: center.lat,
        longitude: center.lon,
        radius: 10
      });
      
      console.log('API 응답 받음:', nearbyMerchants);
      setMerchants(nearbyMerchants);
    } catch (error) {
      console.error('가맹점 데이터 로드 실패:', error);
      setMerchants([]); // 빈 배열만 사용
      Alert.alert('오류', '가맹점 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 위치가 변경될 때마다 가맹점 데이터 다시 로드
  useEffect(() => {
    loadMerchants();
  }, [center]);

  // 검색어가 변경될 때마다 검색 실행
  useEffect(() => {
    if (search.trim()) {
      const searchMerchants = async () => {
        try {
          setLoading(true);
          const results = await searchMerchantsByName(search.trim());
          setMerchants(results);
        } catch (error) {
          console.error('가맹점 검색 실패:', error);
          // 검색 실패 시 전체 목록에서 필터링
          loadMerchants();
        } finally {
          setLoading(false);
        }
      };
      searchMerchants();
    } else {
      loadMerchants();
    }
  }, [search]);

  const categoryMeta: Record<string, { label: string; emoji: string }> = {
    ECO_FOOD: { label: '친환경 식품/매장', emoji: '🥗' },
    EV_CHARGING: { label: '전기차 충전', emoji: '⚡️' },
    RECYCLING_STORE: { label: '제로웨이스트/리사이클', emoji: '♻️' },
    GREEN_BEAUTY: { label: '친환경 뷰티', emoji: '🌿' },
    ECO_SHOPPING: { label: '친환경 쇼핑', emoji: '🛍️' },
    ORGANIC_CAFE: { label: '유기농 카페', emoji: '☕' }  };

  const haversine = (a: LatLng, b: LatLng) => {
    const R = 6371; // km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const distance = 2 * R * Math.asin(Math.sqrt(h));
    console.log(`거리 계산: (${a.lat}, ${a.lon}) -> (${b.lat}, ${b.lon}) = ${distance.toFixed(2)}km`);
    return distance;
  };

  const filteredSorted = useMemo(() => {
    let list = [...merchants];
    
    console.log('필터링 전 가맹점 수:', list.length);
    console.log('현재 중심 좌표:', center);
    
    // 거리 계산 (항상 현재 중심 좌표 기준으로 재계산)
    list = list.map((m) => {
      const calculatedDistance = haversine(center, { lat: m.latitude, lon: m.longitude });
      console.log(`가맹점 ${m.name}: 위치(${m.latitude}, ${m.longitude}) -> 거리=${calculatedDistance.toFixed(2)}km`);
      return {
        ...m,
        distance: calculatedDistance
      };
    });
    
    // 카테고리 필터링
    if (selectedCategories.length > 0) {
      list = list.filter((m) => selectedCategories.includes(m.category));
    }
    
    // 정렬
    switch (sortKey) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // distance
        list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    
    console.log('필터링 후 가맹점 수:', list.length);
    return list;
  }, [merchants, selectedCategories, sortKey, center]);



  return (
    <View style={styles.container}>
      {/* Header */}
      <TopBar title="친환경 가맹점 확인하기" onBack={onBack} />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Map Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <View>
              <Text style={styles.mapTitle}>내 주변 친환경 가맹점</Text>
              <Text style={styles.mapSubtitle}>{hasLocation ? '현재 위치 기반' : '기본 위치(서울시청) 기준'}</Text>
            </View>
            <Pressable style={styles.refreshBtn} onPress={moveToCurrentLocation}>
              <Ionicons name="locate" size={16} color={COLORS.primary} />
              <Text style={styles.refreshText}>현재 위치</Text>
            </Pressable>
          </View>

          <View style={styles.mapImageWrap}>
            <KakaoMap
              center={center}
              merchants={merchants}
              onMarkerClick={(merchant) => {
                console.log('마커 클릭:', merchant.name);
                // 마커 클릭 시 해당 가맹점으로 스크롤하거나 상세 정보 표시
              }}
            />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsWrap}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={14} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="가맹점명 검색"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.sortWrap}>
            {(['distance', 'name'] as const).map((k) => (
              <Pressable key={k} style={[styles.sortChip, sortKey === k && styles.sortChipActive]} onPress={() => setSortKey(k)}>
                <Text style={[styles.sortChipText, sortKey === k && styles.sortChipTextActive]}>
                  {k === 'distance' ? '거리순' : '이름순'}
                </Text>
              </Pressable>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 * SCALE }}>
            {Object.keys(categoryMeta).map((c) => (
              <Pressable
                key={c}
                style={[styles.catChip, selectedCategories.includes(c) && styles.catChipActive]}
                onPress={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                  )
                }
              >
                <Text style={[styles.catChipText, selectedCategories.includes(c) && styles.catChipTextActive]}>
                  {categoryMeta[c].emoji} {categoryMeta[c].label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <View style={styles.listWrap}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>가맹점 정보를 불러오는 중...</Text>
            </View>
          ) : filteredSorted.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>주변에 친환경 가맹점이 없습니다.</Text>
            </View>
          ) : (
            filteredSorted.map((m) => (
            <View key={m.id} style={styles.merchantItem}>
              <View style={styles.merchantLeft}>
                <View style={styles.merchantIconWrap}>
                  <Text style={{ fontSize: 16 * SCALE }}>
                    {categoryMeta[m.category].emoji}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.merchantName}>{m.name}</Text>
                  <Text style={styles.merchantType}>{categoryMeta[m.category].label}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.distanceText}>{m.distance?.toFixed(1) || 'N/A'}km</Text>
                <Pressable style={styles.navBtn} onPress={() => {
                  const url = `https://map.kakao.com/link/search/${m.name}`;
                  window.open(url, '_blank');
                }}>
                  <Ionicons name="navigate" size={16} color="#111827" />
                  <Text style={styles.navBtnText}>길찾기</Text>
                </Pressable>
              </View>
            </View>
          ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE, paddingTop: 10 * SCALE, paddingBottom: 10 * SCALE, backgroundColor: 'white'
  },
  headerIcon: { width: 28 * SCALE, alignItems: 'center' },
  headerTitle: { fontSize: 16 * SCALE, fontWeight: '700', color: '#111827' },

  body: { flex: 1 },
  mapCard: {
    marginTop: 12 * SCALE, marginHorizontal: 20 * SCALE,
    backgroundColor: 'white', borderRadius: 16 * SCALE, padding: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB'
  },
  mapHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 * SCALE },
  mapTitle: { fontSize: 14 * SCALE, fontWeight: '700', color: '#111827' },
  mapSubtitle: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 2 * SCALE },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 * SCALE, backgroundColor: '#F3F4F6', paddingHorizontal: 10 * SCALE, paddingVertical: 6 * SCALE, borderRadius: 999 },
  refreshText: { fontSize: 12 * SCALE, color: COLORS.primary, fontWeight: '700' },
  mapImageWrap: { borderRadius: 12 * SCALE, overflow: 'hidden' },
  mapImage: { width: IPHONE_WIDTH * SCALE - 24 * SCALE, height: 220 * SCALE, backgroundColor: '#E5E7EB' },

  controlsWrap: { marginTop: 12 * SCALE, marginHorizontal: 20 * SCALE },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8 * SCALE,
    backgroundColor: 'white', borderRadius: 999, paddingHorizontal: 12 * SCALE, paddingVertical: 8 * SCALE,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  searchInput: { flex: 1, fontSize: 13 * SCALE, color: '#111827' },
  sortWrap: { flexDirection: 'row', gap: 8 * SCALE, marginTop: 8 * SCALE },
  sortChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 10 * SCALE, paddingVertical: 6 * SCALE, borderRadius: 999 },
  sortChipActive: { backgroundColor: 'rgba(19,128,114,0.12)', borderWidth: 1, borderColor: COLORS.primary },
  sortChipText: { fontSize: 12 * SCALE, color: '#374151' },
  sortChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  catChip: { backgroundColor: 'white', paddingHorizontal: 10 * SCALE, paddingVertical: 6 * SCALE, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 * SCALE },
  catChipActive: { backgroundColor: 'rgba(19,128,114,0.12)', borderColor: COLORS.primary },
  catChipText: { fontSize: 12 * SCALE, color: '#374151' },
  catChipTextActive: { color: COLORS.primary, fontWeight: '700' },

  listWrap: { marginTop: 12 * SCALE, marginHorizontal: 20 * SCALE, gap: 8 * SCALE, marginBottom: 24 * SCALE },
  merchantItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 12 * SCALE, padding: 12 * SCALE, borderWidth: 1, borderColor: '#E5E7EB' },
  merchantLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 * SCALE, flex: 1 },
  merchantIconWrap: { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 20 * SCALE, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  merchantIcon: { width: 24 * SCALE, height: 24 * SCALE },
  merchantName: { fontSize: 14 * SCALE, fontWeight: '700', color: '#111827' },
  merchantType: { fontSize: 12 * SCALE, color: '#6B7280', marginTop: 2 * SCALE },
  distanceText: { fontSize: 12 * SCALE, fontWeight: '700', color: COLORS.primary, marginBottom: 6 * SCALE, textAlign: 'right' },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 * SCALE, backgroundColor: '#F3F4F6', paddingHorizontal: 10 * SCALE, paddingVertical: 6 * SCALE, borderRadius: 999 },
  navBtnText: { fontSize: 12 * SCALE, color: '#111827', fontWeight: '600' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 * SCALE },
  loadingText: { fontSize: 14 * SCALE, color: '#6B7280' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 * SCALE },
  emptyText: { fontSize: 14 * SCALE, color: '#6B7280' },

});

export default EcoMerchantsScreen;

