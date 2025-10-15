import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS, IPHONE_WIDTH } from '../utils/constants';
import TopBar from '../components/TopBar';
import { useEcoSeeds } from '../hooks/useEcoSeeds';
import { 
  submitWalkingSteps, 
  WalkingStepsRequest,
  fetchWalkingConsent,
  updateWalkingConsent,
  fetchTodayWalkingRecord,
  fetchRecentWalkingRecords,
  WalkingConsentResponse,
  WalkingResponse
} from '../utils/ecoSeedApi';

interface WalkingScreenProps {
  onBack: () => void;
  onAwardSeeds: (amount: number) => void;
}

// 간단한 더미 헬스 동기화 함수 (실제 연동 시 HealthKit/Google Fit 권한 및 API 연동 필요)
function generateTodaySteps(): number {
  // 2,000 ~ 14,000 사이 랜덤 걸음수
  return Math.floor(2000 + Math.random() * 12000);
}

export default function WalkingScreen({ onBack, onAwardSeeds }: WalkingScreenProps) {
  const { refreshProfile } = useEcoSeeds();
  const [connected, setConnected] = useState(false);
  const [steps, setSteps] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);
  const [recentRewards, setRecentRewards] = useState<Array<{ date: string; steps: number; seeds: number }>>([]);
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [todayRecord, setTodayRecord] = useState<WalkingResponse | null>(null);

  // 서버에서 걷기 권한 상태와 오늘 기록 조회
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        // 걷기 권한 상태 조회
        const consentResponse = await fetchWalkingConsent();
        setConnected(consentResponse.isConsented);
        
        if (consentResponse.isConsented) {
          // 권한이 있으면 오늘 기록과 최근 기록 조회
          try {
            const todayRecord = await fetchTodayWalkingRecord();
            if (todayRecord.walkingId) {
              // 오늘 이미 기록이 있음
              setTodayRecord(todayRecord);
              setSteps(todayRecord.steps || 0);
              setClaimedToday(true);
              setLastSyncAt(todayRecord.activityDate ? new Date(todayRecord.activityDate).toLocaleTimeString() : new Date().toLocaleTimeString());
            } else {
              // 오늘 기록이 없음 - 0으로 초기화 (더미데이터 제거)
              setSteps(0);
              setLastSyncAt(new Date().toLocaleTimeString());
            }
            
            // 최근 걷기 기록 조회
            try {
              const recentRecords = await fetchRecentWalkingRecords();
              if (recentRecords && recentRecords.length > 0) {
                const formattedRewards = recentRecords.map(record => ({
                  date: record.activityDate ? new Date(record.activityDate).toLocaleDateString() : new Date().toLocaleDateString(),
                  steps: record.steps || 0,
                  seeds: record.pointsAwarded || 0
                }));
                setRecentRewards(formattedRewards);
              }
            } catch (error) {
              console.error('최근 걷기 기록 조회 실패:', error);
            }
          } catch (error) {
            // 오늘 기록 조회 실패 시 0으로 초기화 (더미데이터 제거)
            setSteps(0);
            setLastSyncAt(new Date().toLocaleTimeString());
          }
        } else {
          // 권한이 없으면 권한 요청 모달 표시
          setPermissionVisible(true);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('걷기 권한 상태 조회 실패:', error);
        // 에러 발생 시 기본값으로 설정
        setConnected(false);
        setPermissionVisible(true);
        setInitialized(true);
      }
    };
    fetchConnectionStatus();
  }, []);

  const distanceKm = useMemo(() => {
    // 평균 보폭 0.78m 기준으로 거리 계산
    const meters = steps * 0.78;
    return Math.round((meters / 1000) * 100) / 100; // 소수점 2자리
  }, [steps]);

  const savedCo2Kg = useMemo(() => {
    // 1km를 차 대신 걸을 때 약 0.21kg CO2 절감(참고치)
    return Math.round(distanceKm * 0.21 * 100) / 100;
  }, [distanceKm]);

  const canClaim = connected && steps >= 5000 && !claimedToday;
  
  // 오늘 이미 보상을 받았는지 확인
  const hasClaimedToday = claimedToday || (todayRecord && todayRecord.walkingId);

  const handleConnect = () => {
    setPermissionVisible(true);
  };

  const handleSync = () => {
    const s = generateTodaySteps();
    setSteps(s);
    setLastSyncAt(new Date().toLocaleTimeString());
  };

  // 목데이터 걸음수 생성 (실제 건강 앱 연동 시뮬레이션)
  const generateTodaySteps = (): number => {
    // 2,000 ~ 15,000 사이 랜덤 걸음수 (현실적인 범위)
    const baseSteps = Math.floor(2000 + Math.random() * 13000);
    
    // 시간대별로 다른 패턴 적용 (아침/점심/저녁)
    const hour = new Date().getHours();
    let multiplier = 1.0;
    
    if (hour >= 6 && hour <= 9) {
      // 아침: 운동하는 사람들 (높은 걸음수)
      multiplier = 1.2 + Math.random() * 0.3;
    } else if (hour >= 12 && hour <= 14) {
      // 점심: 점심시간 산책 (보통)
      multiplier = 0.8 + Math.random() * 0.4;
    } else if (hour >= 18 && hour <= 21) {
      // 저녁: 저녁 운동 (높은 걸음수)
      multiplier = 1.1 + Math.random() * 0.4;
    } else if (hour >= 22 || hour <= 5) {
      // 밤/새벽: 낮은 걸음수
      multiplier = 0.3 + Math.random() * 0.4;
    }
    
    return Math.floor(baseSteps * multiplier);
  };

  const computeRewardSeeds = (currentSteps: number): number => {
    // 5,000 걸음 이상부터 구간별 가중 랜덤 보상
    // 5k~7k: 2~10, 7k~10k: 5~15, 10k+: 10~30
    if (currentSteps >= 10000) {
      return 10 + Math.floor(Math.random() * 21); // 10~30 (21개 숫자)
    }
    if (currentSteps >= 7000) {
      return 5 + Math.floor(Math.random() * 11); // 5~15 (11개 숫자)
    }
    if (currentSteps >= 5000) {
      return 2 + Math.floor(Math.random() * 9); // 2~10 (9개 숫자)
    }
    return 0; // 5,000 걸음 미만일 때
    };

  const handleClaim = async () => {
    if (!canClaim) return;
    const seeds = computeRewardSeeds(steps);
    
    try {
      // 걷기 기록 제출 API 호출 (걷기 기록 저장 + 포인트 적립)
      const request: WalkingStepsRequest = {
        steps: steps,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
      };
      
      const response = await submitWalkingSteps(request);
      
      // 성공 시 상태 업데이트
      onAwardSeeds(response.pointsAwarded || seeds);
      setClaimedToday(true);
      setRecentRewards((prev) => [
        { date: new Date().toLocaleDateString(), steps, seeds: response.pointsAwarded || seeds },
        ...prev,
      ].slice(0, 5));
      
      // 프로필 새로고침으로 포인트 동기화
      await refreshProfile();
      
      // 성공 메시지
      Alert.alert('성공', `${response.pointsAwarded || seeds}개의 원큐씨앗이 적립되었습니다!`);
    } catch (error) {
      console.error('걷기 기록 제출 실패:', error);
      Alert.alert('오류', '걷기 기록 제출에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TopBar title="걷기" onBack={onBack} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 연결 카드 */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.heroIconBox}>
                <Image source={require('../../assets/hana3dIcon/hanaIcon3d_3_105.png')} style={styles.heroIcon} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.cardTitle}>건강 데이터 연동</Text>
              </View>
            </View>
            {!connected ? (
              <Pressable style={[styles.primaryBtn]} onPress={handleConnect}>
                <Text style={styles.primaryBtnText}>연결하기</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.grayBtn} onPress={handleSync}>
                <Ionicons name="refresh" size={14 * SCALE} color="#374151" />
                <Text style={styles.grayBtnText}>동기화</Text>
              </Pressable>
            )}
          </View>
          {connected && (
            <Text style={styles.metaText}>마지막 동기화: {lastSyncAt}</Text>
          )}
        </View>

        {/* 오늘 걸음/씨앗 카드 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>오늘의 걸음</Text>
          <View style={styles.stepsRow}>
            <Text style={styles.stepsValue}>{connected ? steps.toLocaleString() : '-'}</Text>
            <Text style={styles.stepsUnit}> 걸음</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.envStatsRow}>
            <View style={styles.envStat}>
              <Image source={require('../../assets/hana3dIcon/hanaIcon3d_123.png')} style={styles.envIcon} resizeMode="contain" />
              <Text style={styles.envStatLabel}>이동거리</Text>
              <Text style={styles.envStatValue}>{connected ? `${distanceKm} km` : '-'}</Text>
            </View>
            <View style={styles.envStat}>
              <Image source={require('../../assets/hana3dIcon/hanaIcon3d_47.png')} style={styles.envIcon} resizeMode="contain" />
              <Text style={styles.envStatLabel}>CO₂ 절감</Text>
              <Text style={styles.envStatValue}>{connected ? `${savedCo2Kg} kg` : '-'}</Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>5,000걸음 이상이면 오늘의 원큐씨앗을 받을 수 있어요</Text>
          </View>

          <Pressable 
            style={[styles.claimBtn, !canClaim && styles.btnDisabled]}
            onPress={handleClaim}
            disabled={!canClaim}
          >
            <Text style={styles.claimBtnText}>
              {hasClaimedToday ? '오늘은 이미 받았어요' : '원큐씨앗 받기'}
            </Text>
          </Pressable>
        </View>

        {/* 보상 히스토리 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>최근 보상</Text>
          {recentRewards.length === 0 ? (
            <Text style={styles.emptyText}>아직 보상이 없어요</Text>
          ) : (
            <View style={{ gap: 10 * SCALE }}>
              {recentRewards.map((r, idx) => (
                <View key={`${r.date}-${idx}`} style={styles.historyRow}>
                  <Text style={styles.historyLeft}>{r.date}</Text>
                  <Text style={styles.historyMid}>{r.steps.toLocaleString()} 걸음</Text>
                  <Text style={styles.historyRight}>+{r.seeds} 씨앗</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 프로모션 배너: 도전 365 적금 알아보기 */}
        <View style={styles.challengeBanner}>
          <View style={styles.challengeLeft}>
            <Text style={styles.challengeTitle}>걷기만 했는데{"\n"}우대금리 혜택 받아요</Text>
            <Pressable style={styles.challengeCta} onPress={() => Linking.openURL('https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1452858_115157.jsp')}>
              <Text style={styles.challengeCtaText}>도전 365 적금 알아보기</Text>
            </Pressable>
          </View>
          <Image source={require('../../assets/coin.png')} style={styles.challengeImage} resizeMode="contain" />
        </View>

        {/* 이번 달 건강 리포트 (요약 카드) */}
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>이번 달 건강 리포트</Text>
          <View style={styles.weekRow}>
            {['월','화','수','목','금','토','일'].map((d) => (
              <Text key={d} style={styles.weekDay}>{d}</Text>
            ))}
          </View>
          <View style={styles.barsRow}>
            {[7477,11022,8623,11323,9591,504,2900].map((v, idx) => {
              const h = Math.min(100, Math.max(12, Math.round((v / 12000) * 100)));
              const isToday = idx === 6;
              return (
                <View key={idx} style={styles.barWrap}>
                  <View style={[styles.bar, isToday ? styles.barToday : null, { height: h }]} />
                  <Text style={styles.barLabel}>{isToday ? '오늘' : ''}</Text>
                </View>
              );
            })}
          </View>
          <Pressable style={styles.reportCta}>
            <Text style={styles.reportCtaText}>이번 달 건강 리포트</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 권한 요청 모달 */}
      <Modal visible={permissionVisible} transparent animationType="fade" onRequestClose={() => setPermissionVisible(false)}>
        <View style={styles.permOverlay}>
          <View style={styles.permContainer}>
            <Text style={styles.permTitle}>{`‘하나green세상’이(가) 사용자의\n동작 및 피트니스 활동에\n접근하려고 합니다.`}</Text>
            <Text style={styles.permBody}>{`하나green세상 걷기 서비스에서 걸음 수를\n측정하기 위해 필요한 권한입니다.\n(필수 권한)`}</Text>

            <View style={styles.permDivider} />

            <View style={styles.permButtons}>
              <Pressable style={[styles.permBtn]} onPress={() => setPermissionVisible(false)}>
                <Text style={[styles.permBtnText, styles.permCancelText]}>허용 안 함</Text>
              </Pressable>
              <View style={styles.permBtnDivider} />
                             <Pressable style={[styles.permBtn]} onPress={async () => {
                 setPermissionVisible(false);
                 try {
                   // 권한 업데이트 API 호출
                   await updateWalkingConsent({ isConsented: true });
                   setConnected(true);
                   
                   // 오늘 기록이 있는지 확인
                   try {
                     const todayRecord = await fetchTodayWalkingRecord();
                     if (todayRecord.walkingId) {
                       // 오늘 이미 기록이 있음
                       setTodayRecord(todayRecord);
                       setSteps(todayRecord.steps || 0);
                       setClaimedToday(true);
                       setLastSyncAt(todayRecord.activityDate ? new Date(todayRecord.activityDate).toLocaleTimeString() : new Date().toLocaleTimeString());
                     } else {
                       // 오늘 기록이 없음 - 0으로 초기화 (더미데이터 제거)
                       setSteps(0);
                       setLastSyncAt(new Date().toLocaleTimeString());
                     }
                   } catch (error) {
                     // 오늘 기록 조회 실패 시 0으로 초기화 (더미데이터 제거)
                     setSteps(0);
                     setLastSyncAt(new Date().toLocaleTimeString());
                   }
                 } catch (error) {
                   console.error('권한 업데이트 실패:', error);
                   Alert.alert('오류', '권한 업데이트에 실패했습니다.');
                 }
               }}>
                 <Text style={[styles.permBtnText, styles.permAllowText]}>허용</Text>
               </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16 * SCALE,
    paddingTop: 18 * SCALE,
    paddingBottom: 8 * SCALE,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 6 * SCALE,
  },
  headerTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20 * SCALE,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16 * SCALE,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8 * SCALE,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * SCALE,
  },
  heroIconBox: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 28 * SCALE,
    height: 28 * SCALE,
  },
  cardTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginTop: 2 * SCALE,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14 * SCALE,
    paddingVertical: 10 * SCALE,
    borderRadius: 10 * SCALE,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12 * SCALE,
    fontWeight: '700',
  },
  grayBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10 * SCALE,
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 * SCALE,
  },
  grayBtnText: {
    color: '#374151',
    fontSize: 12 * SCALE,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 11 * SCALE,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8 * SCALE,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stepsValue: {
    fontSize: 32 * SCALE,
    fontWeight: '800',
    color: '#111827',
  },
  stepsUnit: {
    fontSize: 18 * SCALE,
    color: '#6B7280',
    marginLeft: 6 * SCALE,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12 * SCALE,
  },
  envStatsRow: {
    flexDirection: 'row',
    gap: 12 * SCALE,
  },
  envStat: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  envIcon: {
    width: 36 * SCALE,
    height: 36 * SCALE,
    marginBottom: 6 * SCALE,
  },
  envStatLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    marginBottom: 2 * SCALE,
  },
  envStatValue: {
    fontSize: 14 * SCALE,
    fontWeight: '700',
    color: '#111827',
  },
  noticeBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10 * SCALE,
    padding: 10 * SCALE,
    marginTop: 12 * SCALE,
    marginBottom: 10 * SCALE,
  },
  noticeText: {
    fontSize: 12 * SCALE,
    color: '#065F46',
    fontWeight: '600',
    textAlign: 'center',
  },
  claimBtn: {
    marginTop: 8 * SCALE,
    backgroundColor: '#111827',
    borderRadius: 12 * SCALE,
    paddingVertical: 14 * SCALE,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 14 * SCALE,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyLeft: {
    fontSize: 12 * SCALE,
    color: '#374151',
  },
  historyMid: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
  historyRight: {
    fontSize: 12 * SCALE,
    color: COLORS.primary,
    fontWeight: '700',
  },
  // 권한 모달
  permOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permContainer: {
    width: IPHONE_WIDTH * 0.7 * SCALE,
    backgroundColor: '#3B3B3D',
    borderRadius: 18 * SCALE,
    paddingTop: 18 * SCALE,
    paddingBottom: 0,
    paddingHorizontal: 16 * SCALE,
    borderWidth: 0,
  },
  permTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22 * SCALE,
    marginBottom: 10 * SCALE,
  },
  permBody: {
    fontSize: 12 * SCALE,
    color: '#E6E7EA',
    lineHeight: 18 * SCALE,
    textAlign: 'center',
    marginBottom: 12 * SCALE,
  },
  permDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  permButtons: { flexDirection: 'row' },
  permBtn: { flex: 1, paddingVertical: 14 * SCALE, alignItems: 'center' },
  permBtnDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  permBtnText: { fontSize: 14 * SCALE, fontWeight: '700' },
  permCancelText: { color: '#8EA1B5' },
  permAllowText: { color: '#4FB0FF' },
  // 챌린지 배너
  challengeBanner: {
    backgroundColor: '#0F8A80',
    borderRadius: 18 * SCALE,
    padding: 24 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16 * SCALE,
  },
  challengeLeft: {
    flex: 1,
    marginRight: 12 * SCALE,
  },
  challengeTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12 * SCALE,
  },
  challengeCta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12 * SCALE,
    paddingVertical: 10 * SCALE,
    paddingHorizontal: 14 * SCALE,
    alignSelf: 'flex-start',
  },
  challengeCtaText: {
    color: '#0F8A80',
    fontWeight: '700',
    fontSize: 12 * SCALE,
    letterSpacing: 0.1,
  },
  challengeImage: {
    width: 64 * SCALE,
    height: 72 * SCALE,
  },
  // 리포트 카드
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12 * SCALE,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6 * SCALE,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 10 * SCALE,
    color: '#6B7280',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120 * SCALE,
    gap: 8 * SCALE,
    marginBottom: 12 * SCALE,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 18 * SCALE,
    backgroundColor: '#DCE7E6',
    borderRadius: 8 * SCALE,
  },
  barToday: {
    backgroundColor: '#0F8A80',
  },
  barLabel: {
    marginTop: 6 * SCALE,
    fontSize: 10 * SCALE,
    color: '#9CA3AF',
  },
  reportCta: {
    backgroundColor: '#E8F4F3',
    borderRadius: 12 * SCALE,
    paddingVertical: 12 * SCALE,
    alignItems: 'center',
  },
  reportCtaText: {
    color: '#0F8A80',
    fontSize: 14 * SCALE,
    fontWeight: '700',
  },
  claimedInfo: {
    marginTop: 16 * SCALE,
    padding: 16 * SCALE,
    backgroundColor: '#F0F9FF',
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  claimedText: {
    fontSize: 14 * SCALE,
    color: '#0EA5E9',
    textAlign: 'center',
    fontWeight: '500',
  },
});


