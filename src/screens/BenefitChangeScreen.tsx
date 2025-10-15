import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS, SCREEN_WIDTH, SCREEN_HEIGHT, scaleSize } from '../utils/constants';
import { useCardData } from '../hooks/useCardData';
import { useUser } from '../hooks/useUser';

interface BenefitChangeScreenProps {
  visible: boolean;
  onClose: () => void;
  onBenefitSelect: (benefitId: string) => void;
}

interface BenefitItem {
  id: string;
  title: string;
  subtitle: string;
  details: string[];
  isActive: boolean;
  icon: any;
  bgColor: string;
}

export function BenefitChangeScreen({ visible, onClose, onBenefitSelect }: BenefitChangeScreenProps) {
  const [selectedBenefit, setSelectedBenefit] = useState('all_green_life');
  const [isCurrentExpanded, setIsCurrentExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailBenefitId, setDetailBenefitId] = useState<string | null>(null);

  // 사용자 정보 가져오기
  const { userInfo } = useUser();

  const { 
    benefitPackages,
    currentBenefitPackage,
    changeBenefitPackage,
    benefitRecommendation,
    getBenefitRecommendation,
    loading: cardLoading, 
    error: cardError 
  } = useCardData(userInfo?.id || 0);

  // API 데이터를 기반으로 혜택 목록 생성
  const benefits = benefitPackages && benefitPackages.packages 
    ? benefitPackages.packages.map((pkg: any) => {
        // 더 정확한 ID 매칭 로직
        let id = 'all_green_life'; // 기본값
        if (pkg.packageName.includes('올인원') || pkg.packageName.includes('ALL_GREEN_LIFE')) {
          id = 'all_green_life';
        } else if (pkg.packageName.includes('모빌리티') || pkg.packageName.includes('GREEN_MOBILITY')) {
          id = 'green_mobility';
        } else if (pkg.packageName.includes('제로웨이스트') || pkg.packageName.includes('ZERO_WASTE_LIFE')) {
          id = 'zero_waste_life';
        }
        
        console.log('🔍 패키지 매칭:', { packageName: pkg.packageName, id });
        
        return {
          id,
          title: pkg.packageName,
          subtitle: pkg.packageDescription,
          details: pkg.benefits.map((benefit: any) => 
            `${benefit.category}: ${benefit.cashbackRate} 캐시백`
          ),
          isActive: pkg.isActive,
          icon: require('../../assets/hana3dIcon/hanaIcon3d_17.png'), // 기본 아이콘
          bgColor: pkg.isActive ? COLORS.primary : COLORS.border
        };
      })
    : [
        // API 실패 시 기본 데이터 (폴백)
        {
          id: 'all_green_life',
          title: '올인원 그린라이프 캐시백',
          subtitle: '친환경 생활 종합 혜택',
          details: [
            '전기차 충전소: 3% 캐시백',
            '대중교통 (지하철, 버스): 2% 캐시백',
            '공유킥보드, 따릉이: 4% 캐시백',
            '리필스테이션, 제로웨이스트샵: 4% 캐시백',
            '친환경 인증 브랜드: 2% 캐시백',
            '중고거래 플랫폼: 1.5% 캐시백',
            '비건/유기농 식품: 3% 캐시백'
          ],
          isActive: true,
          icon: require('../../assets/hana3dIcon/hanaIcon3d_17.png'),
          bgColor: COLORS.primary
        },
        {
          id: 'green_mobility',
          title: '그린 모빌리티 캐시백',
          subtitle: '친환경 교통수단 특화 혜택',
          details: [
            '전기차 충전소: 7% 캐시백',
            '대중교통 (지하철, 버스): 5% 캐시백',
            '공유킥보드, 따릉이: 10% 캐시백',
            '친환경 렌터카: 3% 캐시백'
          ],
          isActive: false,
          icon: require('../../assets/hana3dIcon/hanaIcon3d_105.png'),
          bgColor: COLORS.border
        },
        {
          id: 'zero_waste_life',
          title: '제로웨이스트 라이프 캐시백',
          subtitle: '환경친화적 소비 특화 혜택',
          details: [
            '리필/제로웨이스트: 10% 캐시백',
            '친환경 브랜드: 5% 캐시백',
            '중고거래: 3% 캐시백',
            '비건/유기농: 7% 캐시백'
          ],
          isActive: false,
          icon: require('../../assets/hana3dIcon/hanaIcon3d_103.png'),
          bgColor: COLORS.border
        }
      ];

  const handleBenefitPress = (benefitId: string) => {
    setSelectedBenefit(benefitId);
  };

  const handleConfirm = async () => {
    try {
      // API를 통해 혜택 패키지 변경
      if (benefitPackages && benefitPackages.packages) {
        const selectedPackage = benefitPackages.packages.find((pkg: any) => pkg.packageName.includes(selectedBenefit));
        if (selectedPackage) {
          await changeBenefitPackage(selectedPackage.packageName);
        }
      }
      onBenefitSelect(selectedBenefit);
      onClose();
    } catch (error) {
      console.error('혜택 변경 실패:', error);
      // 에러 처리 (토스트 메시지 등)
    }
  };

  // API 데이터에서 현재 혜택 가져오기
  const currentBenefit = benefitPackages && benefitPackages.packages 
    ? benefitPackages.packages.find((pkg: any) => pkg.isActive)
    : benefits.find((b: BenefitItem) => b.id === 'all_green_life');

  const toggleCurrentExpand = () => setIsCurrentExpanded(prev => !prev);

  // 혜택 상세 관련 함수들 - 임시 주석처리
  // const openBenefitDetails = (benefitId: string) => {
  //   console.log('🔍 혜택 상세 열기:', benefitId);
  //   console.log('🔍 detailContentById 키들:', Object.keys(detailContentById));
  //   console.log('🔍 매칭되는 데이터:', detailContentById[benefitId]);
  //   
  //   setDetailBenefitId(benefitId);
  //   setShowDetail(true);
  //   console.log('🔍 showDetail 상태:', true);
  //   console.log('🔍 detailBenefitId:', benefitId);
  // };
  // const closeBenefitDetails = () => {
  //   setShowDetail(false);
  //   setDetailBenefitId(null);
  // };

  // AI 추천 데이터 로드 - 임시 주석처리
  // useEffect(() => {
  //   if (visible) {
  //     getBenefitRecommendation();
  //   }
  // }, [visible, getBenefitRecommendation]);

  // detailContentById 객체 - 임시 주석처리
  /*
  const detailContentById: Record<string, {
    title: string;
    subtitle: string;
    rateLabel: string;
    categories: { name: string; desc: string; rate: string; icons: any[] }[];
  }> = {
    all_green_life: {
      title: '올인원 그린라이프 캐시백',
      subtitle: '친환경 생활 종합 혜택',
      rateLabel: '최대 4% 캐시백',
      categories: [
        {
          name: '모빌리티',
          desc: '전기차 충전소, 대중교통, 공유킥보드',
          rate: '3%/2%/4%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_65.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_67.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_69.png'),
          ],
        },
        {
          name: '제로웨이스트',
          desc: '리필스테이션, 친환경 브랜드',
          rate: '4%/2%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_83.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_85.png'),
          ],
        },
        {
          name: '친환경 소비',
          desc: '중고거래, 비건/유기농',
          rate: '1.5%/3%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_87.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_89.png'),
          ],
        },
      ],
    },
    green_mobility: {
      title: '그린 모빌리티 캐시백',
      subtitle: '친환경 교통수단 특화 혜택',
      rateLabel: '최대 10% 캐시백',
      categories: [
        {
          name: '전기차 충전 7%',
          desc: '완속/급속 충전소',
          rate: '7%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_65.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_67.png'),
          ],
        },
        {
          name: '대중교통 5%',
          desc: '지하철, 버스',
          rate: '5%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_69.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_71.png'),
          ],
        },
        {
          name: '공유 모빌리티 10%',
          desc: '공유킥보드, 따릉이 등',
          rate: '10%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_83.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_85.png'),
          ],
        },
        {
          name: '친환경 렌터카 3%',
          desc: '하이브리드/EV 렌터카',
          rate: '3%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_87.png'),
          ],
        },
      ],
    },
    zero_waste_life: {
      title: '제로웨이스트 라이프 캐시백',
      subtitle: '환경친화적 소비 특화 혜택',
      rateLabel: '최대 10% 캐시백',
      categories: [
        {
          name: '리필/제로웨이스트 10%',
          desc: '리필스테이션, 제로웨이스트샵',
          rate: '10%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_101.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_103.png'),
          ],
        },
        {
          name: '친환경 브랜드 5%',
          desc: '환경 인증 브랜드',
          rate: '5%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_105.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_107.png'),
          ],
        },
        {
          name: '중고거래 3%',
          desc: '당근마켓, 번개장터 등',
          rate: '3%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_11.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_13.png'),
          ],
        },
        {
          name: '비건/유기농 7%',
          desc: '비건/유기농 식품',
          rate: '7%',
          icons: [
            require('../../assets/hana3dIcon/hanaIcon3d_15.png'),
            require('../../assets/hana3dIcon/hanaIcon3d_17.png'),
          ],
        },
      ],
    },
  };
  */

  // selectedDetail 관련 코드 - 임시 주석처리
  // const selectedDetail = detailBenefitId
  //   ? (detailContentById as Record<string, { title: string; subtitle: string; rateLabel: string; categories: { name: string; desc: string; rate: string; icons: any[] }[] }>)[detailBenefitId]
  //   : null;
  // 
  // console.log('🔍 selectedDetail:', selectedDetail);
  // console.log('🔍 showDetail:', showDetail);
  // console.log('🔍 detailBenefitId:', detailBenefitId);

  // 혜택 변경 확인 함수 - 임시 주석처리
  // const confirmDetailChange = () => {
  //   if (!detailBenefitId) return;
  //   setSelectedBenefit(detailBenefitId);
  //   onBenefitSelect(detailBenefitId);
  //   setShowDetail(false);
  //   onClose();
  // };

  return (
    <>
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </Pressable>
            <Text style={styles.headerTitle}>혜택 변경</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Benefit Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.cardStack}>
                <View style={styles.cardContent}>
                    {currentBenefit?.icon && (
                      <Image source={currentBenefit.icon} style={styles.cardIconImage} resizeMode="contain" />
                    )}
                  </View>
              </View>
            </View>

            {/* Current Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>적용 중</Text>
              <Text style={styles.currentBenefitTitle}>
                {currentBenefit?.packageName || currentBenefit?.title}
              </Text>
              <View style={styles.subtitleRowCenter}>
                <Text style={styles.currentBenefitSubtitle}>
                  {currentBenefit?.packageDescription || currentBenefit?.subtitle}
                </Text>
                <Pressable
                  onPress={toggleCurrentExpand}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.expandIconArea}
                >
                  <Ionicons
                    name={isCurrentExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#6B7280"
                  />
                </Pressable>
              </View>

              {isCurrentExpanded && (
                <View style={styles.detailsContainer}>
                  {currentBenefit?.benefits ? (
                    // API 데이터 사용
                    currentBenefit.benefits.map((benefit: any, index: number) => (
                      <Text key={index} style={styles.detailText}>
                        • {benefit.category}: {benefit.cashbackRate} 캐시백
                      </Text>
                    ))
                  ) : (
                    // 기존 데이터 사용
                    currentBenefit?.details?.map((detail: string, index: number) => (
                      <Text key={index} style={styles.detailText}>• {detail}</Text>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* AI 추천 혜택 - 임시 주석처리 */}
            {/* {benefitRecommendation && benefitRecommendation.shouldChange && (
              <View style={styles.recommendationContainer}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>이달의 추천 혜택</Text>
                  <View style={styles.hotBadge}>
                    <Text style={styles.hotBadgeText}>HOT</Text>
                  </View>
                </View>
                
                <View style={styles.recommendationCard}>
                  <View style={styles.recommendationCardHeader}>
                    <Text style={styles.recommendationCardTitle}>
                      {benefitRecommendation.recommendedPackage === 'ALL_GREEN_LIFE' ? '올인원 그린라이프 캐시백' :
                       benefitRecommendation.recommendedPackage === 'GREEN_MOBILITY' ? '그린 모빌리티 캐시백' :
                       '제로웨이스트 라이프 캐시백'}
                    </Text>
                    <View style={styles.recommendationIcon}>
                      <Image 
                        source={require('../../assets/hana3dIcon/hanaIcon3d_17.png')} 
                        style={styles.recommendationIconImage} 
                        resizeMode="contain" 
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.recommendationDescription}>
                    {benefitRecommendation.reason}
                  </Text>
                  
                  <View style={styles.recommendationStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statAmount}>
                        {benefitRecommendation.consumptionAnalysis?.ecoAmount?.toLocaleString() || '0'}원
                      </Text>
                      <Text style={styles.statLabel}>지난달 친환경 소비액</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statAmount, { color: COLORS.primary }]}>
                        +{benefitRecommendation.expectedBenefits?.totalExpectedCashback?.toLocaleString() || '0'}원
                      </Text>
                      <Text style={styles.statLabel}>예상 추가 캐시백</Text>
                    </View>
                  </View>
                  
                  <View style={styles.recommendationBenefits}>
                    {benefitRecommendation.expectedBenefits?.categoryBenefits && 
                     Object.entries(benefitRecommendation.expectedBenefits.categoryBenefits).slice(0, 4).map(([category, benefit]: [string, any]) => (
                      <View key={category} style={styles.recommendationBenefitItem}>
                        <View style={styles.recommendationBenefitIcon}>
                          <Ionicons 
                            name={category.includes('전기차') ? 'flash' : 
                                  category.includes('대중교통') ? 'bus' :
                                  category.includes('공유') ? 'bicycle' : 'leaf'} 
                            size={16} 
                            color="#10B981" 
                          />
                        </View>
                        <Text style={styles.recommendationBenefitText}>
                          {category} {benefit.rate}%
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <Pressable 
                    style={styles.recommendationButton}
                    onPress={() => {
                      const packageCode = benefitRecommendation.recommendedPackage;
                      const packageName = packageCode === 'ALL_GREEN_LIFE' ? '올인원 그린라이프 캐시백' :
                                        packageCode === 'GREEN_MOBILITY' ? '그린 모빌리티 캐시백' :
                                        '제로웨이스트 라이프 캐시백';
                      handleBenefitPress(packageCode.toLowerCase().replace('_', '_'));
                      changeBenefitPackage(packageName);
                    }}
                  >
                    <Text style={styles.recommendationButtonText}>이 혜택으로 변경하기 →</Text>
                  </Pressable>
                </View>
              </View>
            )} */}

            {/* Other Benefits - 임시 주석처리 */}
            {/* <View style={styles.otherBenefitsContainer}>
              <Text style={styles.otherBenefitsTitle}>다른 혜택</Text>
              
              <View style={styles.benefitsList}>
                {benefits.filter((benefit: BenefitItem) => benefit.id !== 'all_green_life').map((benefit: BenefitItem) => {
                  return (
                  <Pressable
                    key={benefit.id}
                    style={({ pressed }) => [
                      styles.benefitItem,
                      pressed && styles.benefitItemSelected,
                    ]}
                    onPress={() => openBenefitDetails(benefit.id)}
                  >
                    <View style={[styles.benefitIcon]}>
                      <Image source={benefit.icon} style={styles.benefitIconImage} resizeMode="contain" />
                    </View>
                    
                    <View style={styles.benefitContent}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitSubtitle}>{benefit.subtitle}</Text>
                    </View>
                  
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </Pressable>
                  );
                })}
              </View>
            </View> */}
          </ScrollView>

        </View>
      </View>
    </Modal>
    
    {/* Detail Modal - 임시 주석처리 */}
    {/* <Modal visible={showDetail} transparent animationType="slide" onRequestClose={closeBenefitDetails} presentationStyle="fullScreen">
      <View style={styles.modalOverlay}>
        <View style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <Pressable onPress={closeBenefitDetails} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </Pressable>
            <Text style={styles.headerTitle}>혜택 상세</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 * SCALE }}>
            {selectedDetail && (
              <View style={{ paddingHorizontal: 20 * SCALE, paddingTop: 20 * SCALE, paddingBottom: 60 * SCALE }}>
                <Text style={styles.currentBenefitTitle}>{selectedDetail.title}</Text>
                <Text style={styles.currentBenefitSubtitle}>{selectedDetail.subtitle}</Text>

                <View style={styles.rateChip}>
                  <Text style={styles.rateChipText}>{selectedDetail.rateLabel}</Text>
                </View>

                {selectedDetail.categories.map((cat: { name: string; desc: string; rate: string; icons: any[] }, idx: number) => (
                  <View key={idx} style={styles.detailSectionRow}>
                    <View style={styles.detailSectionLine} />
                    <View style={styles.detailSectionBody}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 * SCALE }}>
                        <Text style={styles.detailSectionTitle}>{cat.name}</Text>
                        <Text style={styles.detailRateText}>{cat.rate}</Text>
                      </View>
                      <Text style={styles.detailSectionDesc}>{cat.desc}</Text>
                      <View style={styles.brandIconRow}>
                        {cat.icons.map((ic: any, i: number) => (
                          <View key={i} style={styles.brandIcon}>
                            <Image source={ic} style={styles.brandIconImage} />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.detailBottomContainer}>
            <Pressable style={styles.detailConfirmButton} onPress={confirmDetailChange}>
              <Text style={styles.detailConfirmButtonText}>다음달 혜택 변경하기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal> */}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: scaleSize(20),
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignSelf: 'center',
    paddingTop: scaleSize(44), // 상태바 여백 추가
    paddingBottom: 0,
    marginBottom: 0,
  },

  detailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: scaleSize(20),
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingTop: scaleSize(44), // 상태바 여백 추가
    zIndex: 100000,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(8),
    paddingBottom: scaleSize(16),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(8),
    paddingBottom: scaleSize(16),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  
  backButton: {
    padding: scaleSize(8),
    marginLeft: scaleSize(-8),
  },
  
  headerTitle: {
    fontSize: scaleSize(18),
    fontWeight: '600',
    color: '#111827',
  },
  
  headerRight: {
    width: scaleSize(40),
  },
  
  content: {
    flex: 1,
  },
  
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: scaleSize(40),
    backgroundColor: '#F9FAFB',
  },
  
  cardStack: {
    position: 'relative',
    width: scaleSize(200),
    height: scaleSize(120),
  },
  
  card: {
    position: 'absolute',
    width: scaleSize(180),
    height: scaleSize(110),
    borderRadius: scaleSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  cardBack: {
    backgroundColor: '#9CA3AF',
    top: scaleSize(10),
    left: scaleSize(20),
    transform: [{ rotate: '8deg' }],
  },
  
  cardFront: {
    backgroundColor: COLORS.primary,
    top: 0,
    left: 0,
  },
  
  cardContent: {
    flex: 1,
    padding: scaleSize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardIcon: {
    fontSize: scaleSize(32),
    marginBottom: scaleSize(8),
  },
  cardIconImage: {
    width: scaleSize(200),
    height: scaleSize(200),
    marginBottom: scaleSize(8),
  },
  
  cardTitle: {
    fontSize: scaleSize(12),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  statusContainer: {
    alignItems: 'center',
    paddingVertical: scaleSize(32),
    paddingHorizontal: scaleSize(20),
  },
  
  statusLabel: {
    fontSize: scaleSize(14),
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: scaleSize(8),
  },
  
  currentBenefitTitle: {
    fontSize: scaleSize(24),
    fontWeight: '700',
    color: '#111827',
    marginBottom: scaleSize(8),
    textAlign: 'center',
  },
  
  currentBenefitSubtitle: {
    fontSize: scaleSize(16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: scaleSize(22),
    marginBottom: scaleSize(24),
  },
  
  detailsContainer: {
    width: '100%',
    marginVertical: scaleSize(20),
  },
  
  detailText: {
    fontSize: scaleSize(14),
    color: '#6B7280',
    lineHeight: scaleSize(20),
    marginBottom: scaleSize(4),
  },
  
  detailButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(12),
    marginTop: scaleSize(4),
    width: scaleSize(110),
  },
  
  detailButtonText: {
    fontSize: scaleSize(14),
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  otherBenefitsContainer: {
    paddingHorizontal: scaleSize(20),
    paddingBottom: scaleSize(40),
  },
  
  otherBenefitsTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#111827',
    marginBottom: scaleSize(20),
  },
  
  benefitsList: {
    gap: scaleSize(16),
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  benefitItemSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
  },
  
  benefitIcon: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(16),
  },
  
  benefitIconText: {
    fontSize: scaleSize(24),
  },
  benefitIconImage: {
    width: scaleSize(56),
    height: scaleSize(56),
  },
  
  benefitContent: {
    flex: 1,
    marginTop: scaleSize(4),
  },
  
  benefitTitle: {
    fontSize: scaleSize(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: scaleSize(4),
  },
  
  benefitSubtitle: {
    fontSize: scaleSize(14),
    color: '#6B7280',
    lineHeight: scaleSize(20),
    marginBottom: scaleSize(8),
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },

  subtitleRowCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
  },

  expandIconArea: {
    padding: scaleSize(4),
  },
  
  benefitDetails: {
    marginTop: scaleSize(4),
  },
  
  benefitDetailText: {
    fontSize: scaleSize(12),
    color: '#6B7280',
    lineHeight: scaleSize(16),
    marginBottom: scaleSize(2),
  },
  
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(16),
    paddingBottom: scaleSize(34),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: scaleSize(16),
    fontWeight: '700',
  },

  detailBottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: scaleSize(20),
    paddingBottom: scaleSize(24),
    paddingTop: scaleSize(12),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomLeftRadius: scaleSize(20),
    borderBottomRightRadius: scaleSize(20),
  },
  detailConfirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
    alignItems: 'center',
  },
  detailConfirmButtonText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontWeight: '700',
  },

  // Pretty detail sections
  rateChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(19, 128, 114, 0.1)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: 999,
    marginTop: scaleSize(8),
    marginBottom: scaleSize(16),
  },
  rateChipText: {
    color: COLORS.primary,
    fontSize: scaleSize(13),
    fontWeight: '700',
  },
  detailSectionRow: {
    flexDirection: 'row',
    gap: scaleSize(20),
    marginBottom: scaleSize(24),
  },
  detailSectionLine: {
    width: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  detailSectionBody: {
    flex: 1,
  },
  detailSectionTitle: {
    fontSize: scaleSize(16),
    fontWeight: '700',
    color: '#111827',
    marginBottom: scaleSize(6),
  },
  detailSectionDesc: {
    fontSize: scaleSize(14),
    color: '#6B7280',
    marginBottom: scaleSize(12),
  },
  detailRateText: {
    fontSize: scaleSize(14),
    color: COLORS.primary,
    fontWeight: '700',
  },
  brandIconRow: {
    flexDirection: 'row',
    gap: scaleSize(12),
  },
  brandIcon: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  brandIconImage: {
    width: scaleSize(30),
    height: scaleSize(30),
  },

  // AI 추천 섹션 스타일
  recommendationContainer: {
    marginHorizontal: scaleSize(20),
    marginBottom: scaleSize(24),
  },
  
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleSize(16),
  },
  
  recommendationTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#1F2937',
  },
  
  hotBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(12),
  },
  
  hotBadgeText: {
    color: 'white',
    fontSize: scaleSize(12),
    fontWeight: '600',
  },
  
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  recommendationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleSize(12),
  },
  
  recommendationCardTitle: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  
  recommendationIcon: {
    width: scaleSize(40),
    height: scaleSize(40),
    backgroundColor: '#F0FDF4',
    borderRadius: scaleSize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  recommendationIconImage: {
    width: scaleSize(24),
    height: scaleSize(24),
  },
  
  recommendationDescription: {
    fontSize: scaleSize(14),
    color: '#6B7280',
    lineHeight: scaleSize(20),
    marginBottom: scaleSize(16),
  },
  
  recommendationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleSize(16),
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statAmount: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: scaleSize(4),
  },
  
  statLabel: {
    fontSize: scaleSize(12),
    color: '#6B7280',
    textAlign: 'center',
  },
  
  recommendationBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: scaleSize(20),
  },
  
  recommendationBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
    marginRight: scaleSize(8),
    marginBottom: scaleSize(8),
  },
  
  recommendationBenefitIcon: {
    marginRight: scaleSize(6),
  },
  
  recommendationBenefitText: {
    fontSize: scaleSize(12),
    color: '#374151',
    fontWeight: '500',
  },
  
  recommendationButton: {
    backgroundColor: '#1F2937',
    paddingVertical: scaleSize(16),
    borderRadius: scaleSize(12),
    alignItems: 'center',
  },
  
  recommendationButtonText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontWeight: '600',
  },
});