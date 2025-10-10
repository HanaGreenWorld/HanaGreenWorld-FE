import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, COLORS } from '../utils/constants';
import { integrationApi } from '../services/integrationApi';

const { width } = Dimensions.get('window');

interface GreenSavingsScreenProps {
  onNavigateBack?: () => void;
  onNavigateToSignup?: () => void;
}

export function GreenSavingsScreen({ onNavigateBack, onNavigateToSignup }: GreenSavingsScreenProps) {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    productInfo: false,
    basicRate: false,
    preferentialRate: false,
    cancellation: false,
    notes: false,
    productChange: false,
    terms: false
  });
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const checkProductOwnership = async () => {
      try {
        setIsLoading(true);
        // productId 1 (하나green세상 적금) 보유 여부 직접 확인
        const response = await integrationApi.checkProductOwnership(1);
        setHasActiveApplication(response.hasProduct);
      } catch (error) {
        console.error('상품 보유 여부 확인 실패:', error);
        // 에러 시 기본적으로 가입 가능 상태로 설정
        setHasActiveApplication(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProductOwnership();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => {
            console.log('뒤로가기 버튼 클릭됨');
            onNavigateBack?.();
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>적금</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 상품 개요 */}
        <View style={styles.productOverview}>
          <View style={styles.productHeader}>
            <Text style={styles.productCategory}>하나green세상 적금</Text>
            <Text style={styles.productTitle}>더 푸르게 더 깨끗하게{'\n'}환경은 하나</Text>
          </View>
          
          <View style={styles.interestRateSection}>
            <Text style={styles.interestRateLabel}>연(세전, 1년)</Text>
            <Text style={styles.interestRateValue}>
              <Text style={styles.basicRate}>기본 3.00%</Text>
              <Text style={styles.rateSeparator}>~</Text>
              <Text style={styles.maxRate}>최고 7.00%</Text>
            </Text>
              <View style={styles.subscriptionContainer}>
                <Text style={styles.subscriptionLabel}>가입금액</Text>
                <Text style={styles.subscriptionRange}>1만원~50만원</Text>
              </View>
          </View>

          <View style={styles.actionButtons}>
            <Pressable style={styles.iconButton}>
                <Ionicons name="share-outline" size={20} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconButton}>
                <Ionicons name="heart-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* 환경지킴이 되고 금리왕 되는 법 */}
        <View style={styles.featureCard}>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>환경지킴이 되고{'\n'}금리왕 되는 법</Text>
            <Text style={styles.featureDescription}>나의 친환경 레벨이 올라갈수록{'\n'}우대금리를 받을 수 있어요.</Text>
          </View>
          <View style={styles.featureImageContainer}>
            <Image source={require('../../assets/hana3dIcon/hanaIcon3d_51.png')} style={styles.featureImage} />
          </View>
        </View>

        {/* 다양한 챌린지 도전 */}
        <View style={styles.featureCardGreen}>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>대중교통 이용이{'\n'}금리가 되는 마법!</Text>
            <Text style={styles.featureDescription}>하나카드로 대중교통 이용하면{'\n'}추가 우대금리 혜택이 있어요.</Text>
          </View>
          <View style={styles.featureImageContainer}>
            <Image source={require('../../assets/hana3dIcon/bus.png')} style={styles.featureImage} />
          </View>
        </View>

        {/* 하나원큐 정원을 가꿔라 */}
        <View style={styles.featureCard}>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>하나그린세상{'\n'}정원을 가꿔라</Text>
            <Text style={styles.featureDescription}>하나그린세상 서비스로{'\n'}재미와 금리를 동시에 누려보세요.</Text>
          </View>
          <View style={styles.featureImageContainer}>
            <Image source={require('../../assets/grow_sprout.gif')} style={styles.featureImage} />
          </View>
        </View>

        {/* 가입 전 확인 */}
        <View style={styles.checkBeforeSignup}>
          <Text style={styles.checkTitle}>가입 전 확인해 주세요!</Text>
          <Text style={styles.checkText}>
            ※ 아래 내용은 「금융소비자보호법」제19조(설명의무) 제1항 "금융상품에 관한 중요한 사항" 입니다.
          </Text>
        </View>

        {/* 상품정보 */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('productInfo')}
          >
            <Text style={styles.sectionTitle}>상품정보</Text>
            <Ionicons 
              name={expandedSections.productInfo ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </Pressable>
          
          {expandedSections.productInfo && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>상품특징</Text>
                <Text style={styles.infoValue}>환경을 지키는 마음을 담아, 환경 실천 활동과 하나 그린라이프 카드 사용 실적으로 우대금리를 제공하는 하나원큐 전용 상품</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가입대상</Text>
                <Text style={styles.infoValue}>만 14세 이상 실명의 개인 및 개인사업자 (1인 1계좌)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>판매기간</Text>
                <Text style={styles.infoValue}>2025.02.13(목) ~ 2025.12.31(화) [연중 운영]</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>만기일</Text>
                <Text style={styles.infoValue}>2026.12.31(일) [만기일 고정]</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가입기간</Text>
                <Text style={styles.infoValue}>가입자별 상이 [가입일 ~ 2026.12.31(일)]</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가입금액</Text>
                <Text style={styles.infoValue}>1만원 이상 ~ 50만원 이하 (원 단위)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>적립한도</Text>
                <Text style={styles.infoValue}>매월 1만원 이상 ~ 50만원 이하 (원 단위)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이자지급방법</Text>
                <Text style={styles.infoValue}>만기일시지급식</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>적립방법</Text>
                <Text style={styles.infoValue}>자유적립식</Text>
              </View>
            </View>
          )}
        </View>

        {/* 기본금리 */}
        <View style={styles.section}>
        <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('basicRate')}
        >
            <Text style={styles.sectionTitle}>기본금리</Text>
            <Ionicons 
            name={expandedSections.basicRate ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6B7280" 
            />
        </Pressable>
        
        {expandedSections.basicRate && (
            <View style={styles.sectionContent}>
                <View style={styles.basicRateHeader}>
                    <Text style={styles.basicRateTitle}>기본금리</Text>
                    <Text style={styles.underlineText}>적금기본금리 조회</Text>
                </View>
             
            <Text style={styles.rateDate}>(2025-08-06 기준, 세전)</Text>
            <View style={styles.rateTable}>
                <View style={styles.rateTableHeader}>
                <Text style={styles.rateTableHeaderText}>가입기간</Text>
                <Text style={styles.rateTableHeaderText}>금리 (연율,세전)</Text>
                </View>
                <View style={styles.rateTableRow}>
                <Text style={styles.rateTableLabel}>3개월이상~12개월이하</Text>
                <Text style={styles.rateTableValue}>3.0%</Text>
                </View>
            </View>
            <Text style={styles.rateNote}>
                ※ 만기일 고정 상품으로 가입일에 따라 가입자별 가입 기간이 상이
            </Text>
            </View>
        )}
        </View>

        {/* 우대금리 */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('preferentialRate')}
          >
            <Text style={styles.sectionTitle}>우대금리</Text>
            <Ionicons 
              name={expandedSections.preferentialRate ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </Pressable>
          
          {expandedSections.preferentialRate && (
            <View style={styles.sectionContent}>
              <Text style={styles.preferentialTitle}>우대금리</Text>
              <Text style={styles.preferentialSubTitle}>최대 연 <Text style={styles.preferentialItemRate}>4.00%</Text> (2025.02.13 기준, 세전)</Text>
              <Text style={styles.preferentialDesc}>
                아래 우대항목을 충족하는 경우, 최대 연 5.00%의 우대금리를 만기해지시 제공합니다.
              </Text>
              
              <View style={styles.preferentialTable}>
                <View style={styles.preferentialTableHeader}>
                  <Text style={styles.preferentialTableHeaderText}>우대항목</Text>
                  <Text style={styles.preferentialTableHeaderText}>내용</Text>
                </View>
                
                <View style={styles.preferentialTableRow}>
                  <View style={styles.preferentialItemContainer}>
                    <Text style={styles.preferentialItemTitle}>대중교통 미션</Text>
                    <Text style={styles.preferentialItemRate}>(연 0.70%)</Text>
                  </View>
                  <View style={styles.preferentialConditionContainer}>
                    <Text style={styles.preferentialCondition}>이 적금의 신규일이 포함된 월의 1일부터 만기일이 포함된 월을 기준으로 전전월 말일까지 <Text style={styles.boldText}>본인명의 하나(신용/체크)카드 대중교통 이용실적(주) 발생월수가 계약기간의 1/2 이상인</Text> 경우</Text>
                  </View>
                </View>
                
                <View style={styles.preferentialTableRow}>
                  <View style={styles.preferentialItemContainer}>
                    <Text style={styles.preferentialItemTitle}>종이통장 줄이기</Text>
                    <Text style={styles.preferentialItemRate}>(연 0.30%)</Text>
                  </View>
                  <View style={styles.preferentialConditionContainer}>
                    <Text style={styles.preferentialCondition}>만기해지 할 때까지 이 적금을 종이통장으로 발행한 이력이 없는 경우</Text>
                  </View>
                </View>
                
                <View style={styles.preferentialTableRow}>
                  <View style={styles.preferentialItemContainer}>
                    <Text style={styles.preferentialItemTitle}>친환경 레벨업</Text>
                    <Text style={styles.preferentialItemRate}>(최대 연 2.00%)</Text>
                  </View>
                  <View style={styles.preferentialConditionContainer}>
                    <Text style={styles.preferentialCondition}>「하나그린세상」 콘텐츠 참여를 통해 모은 원큐씨앗 누적량을 기반으로 부여된 친환경 레벨에 따라 우대금리 제공</Text>
                    <View style={styles.teamTable}>
                      <View style={styles.teamTableHeader}>
                        <Text style={styles.teamTableHeaderText}>친환경 레벨</Text>
                        <Text style={styles.teamTableHeaderText}>우대금리</Text>
                      </View>
                      <View style={styles.teamTableRow}>
                        <Text style={styles.teamTableCell}>레벨 3 (전문가)</Text>
                        <Text style={styles.teamTableCell}>연 2.00%</Text>
                      </View>
                      <View style={styles.teamTableRow}>
                        <Text style={styles.teamTableCell}>레벨 2 (실천가)</Text>
                        <Text style={styles.teamTableCell}>연 1.00%</Text>
                      </View>
                      <View style={styles.teamTableRow}>
                        <Text style={styles.teamTableCell}>레벨 1 (새내기)</Text>
                        <Text style={styles.teamTableCell}>연 0.50%</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.preferentialTableRow}>
                  <View style={styles.preferentialItemContainer}>
                    <Text style={styles.preferentialItemTitle}>원큐씨앗 챌린지</Text>
                    <Text style={styles.preferentialItemRate}>(연 1.00%)</Text>
                  </View>
                  <View style={styles.preferentialConditionContainer}>
                    <Text style={styles.preferentialCondition}>이 적금 가입일로부터 <Text style={styles.boldText}>가입연도말까지 가입연도말까지 「하나그린세상」 챌린지에 참여하여 5회 이상 성공한</Text> 경우</Text>
                  </View>
                </View>
              </View>
              {/* 만기수취이자 예시 */}
                <View style={styles.interestExample}>
                    <Text style={styles.interestExampleTitle}>만기수취이자 예시(최고금리 기준)</Text>
                    <Text style={styles.interestExampleText}>
                        월 납입액 50만원/계약기간 12개월/ 연 7.00% = 이자 183,750원(세전)
                    </Text>
                    <Text style={styles.interestExampleNote}>
                        ※ 위 사항은 예시이며, 가입금액, 계약기간, 적용금리 등은 세부사항에 따라 변동 될 수 있습니다.
                    </Text>
                    <Text style={styles.interestExampleNote}>
                        ※ 만기일 고정 상품으로 가입자별 계약기간 상이, 가입 기간 12개월 기준 예시
                    </Text>
                </View>
            </View>
          )}
        </View>


        {/* 상품해지 */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('cancellation')}
          >
            <Text style={styles.sectionTitle}>상품해지</Text>
            <Ionicons 
              name={expandedSections.cancellation ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </Pressable>
        </View>

        {/* 유의사항 */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('notes')}
          >
            <Text style={styles.sectionTitle}>유의사항</Text>
            <Ionicons 
              name={expandedSections.notes ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </Pressable>
        </View>

        {/* 상품변경안내 */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('productChange')}
          >
            <Text style={styles.sectionTitle}>상품변경안내</Text>
            <Ionicons 
              name={expandedSections.productChange ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </Pressable>
        </View>

        {/* 약관 및 상품설명서 */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('terms')}
          >
            <Text style={styles.sectionTitle}>약관 및 상품설명서</Text>
            <Ionicons 
              name={expandedSections.terms ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </Pressable>
        </View>

        {/* 준법감시인 정보 */}
        <View style={styles.complianceInfo}>
          <Text style={styles.complianceText}>
            준법감시인 심의필 제2025-상품공시-119호(2025.02.11)
          </Text>
          <Text style={styles.complianceText}>
            본 공시내용의 유효기간 : 2025.02.11 ~ 2026.01.11
          </Text>
          <Text style={styles.complianceText}>
            기준일 : 2025년 02월 13일
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 상담 버튼 */}
      <Pressable style={styles.consultationButton}>
        <Ionicons name="chatbubble" size={20} color="white" />
        <Text style={styles.consultationButtonText}>상담</Text>
      </Pressable>

      {/* 하단 버튼 */}
      <View style={styles.bottomButton}>
        {hasActiveApplication ? (
          <View style={styles.disabledButtonContainer}>
            <Text style={styles.disabledButtonText}>이미 가입한 상품입니다.</Text>
          </View>
        ) : (
          <Pressable style={styles.mainButton} onPress={() => setShowSignupModal(true)}>
            <Text style={styles.mainButtonText}>가입 신청하기</Text>
          </Pressable>
        )}
      </View>

      {/* 가입 안내 모달 */}
      {showSignupModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable style={styles.modalCloseButton} onPress={() => setShowSignupModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
              <Text style={styles.modalTitle}>상품 가입 안내</Text>
            </View>
            
            <View style={styles.modalContent}>
              <Pressable 
                style={styles.modalCheckItem} 
                onPress={() => setIsAgreed(!isAgreed)}
              >
                <View style={[styles.modalCheckIcon, isAgreed && styles.modalCheckIconActive]}>
                  {isAgreed && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <Text style={styles.modalCheckText}>
                  상품 가입 전 상품 주요 내용 및 설명 확인 등 위 자료들의 내용을 충분히 이해하고 확인하였습니다.
                </Text>
              </Pressable>
            </View>
            
            <Pressable 
              style={[styles.modalButton, isAgreed && styles.modalButtonActive]} 
              onPress={() => {
                if (isAgreed) {
                  setShowSignupModal(false);
                  setIsAgreed(false);
                  onNavigateToSignup?.();
                }
              }}
              disabled={!isAgreed}
            >
              <Text style={[styles.modalButtonText, isAgreed && styles.modalButtonTextActive]}>
                동의하고 시작하기
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 16 * SCALE,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    backButton: {
      padding: 8 * SCALE,
    },
    headerTitle: {
      fontSize: 18 * SCALE,
      fontWeight: 'bold',
      color: '#111827',
    },
    headerRightSpacer: {
      width: 40 * SCALE,
    },
    content: {
      flex: 1,
    },
    productOverview: {
      backgroundColor: '#008B8B',
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 20 * SCALE,
    },
    productHeader: {
      marginTop: 40 * SCALE,
      marginBottom: 90 * SCALE,
    },
    productCategory: {
      fontSize: 16 * SCALE,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 8 * SCALE,
    },
    productTitle: {
      fontSize: 32 * SCALE,
      fontWeight: '500',
      color: 'white',
      marginBottom: 8 * SCALE,
    },
    interestRateSection: {
      marginBottom: 20 * SCALE,
    },
    interestRateLabel: {
      fontSize: 14 * SCALE,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 4 * SCALE,
    },
    interestRateValue: {
      fontSize: 28 * SCALE,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 16 * SCALE,
    },
    basicRate: {
      fontSize: 28 * SCALE,
      fontWeight: '400',
      color: 'white',
    },
    rateSeparator: {
      fontSize: 28 * SCALE,
      fontWeight: '400',
      color: 'white',
    },
    maxRate: {
      fontSize: 32 * SCALE,
      fontWeight: '500',
      color: 'white',
    },
    subscriptionContainer: {
      flexDirection: 'column',
    },
    subscriptionLabel: {
      fontSize: 14 * SCALE,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 8 * SCALE,
    },
    subscriptionRange: {
      fontSize: 16 * SCALE,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    iconButton: {
      padding: 8 * SCALE,
      marginLeft: 8 * SCALE,
    },
    featureCard: {
      backgroundColor: 'white',
      padding: 20 * SCALE,
    },
    featureCardGreen: {
      backgroundColor: '#f1f2f5',
      padding: 20 * SCALE,
    },
    featureContent: {
      flex: 1,
      marginLeft: 8 * SCALE,
      marginTop: 30 * SCALE,
    },
    featureTitle: {
      fontSize: 24 * SCALE,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 12 * SCALE,
    },
    featureDescription: {
      fontSize: 16 * SCALE,
      color: '#6B7280',
      lineHeight: 20 * SCALE,
    },
    featureImage: {
      width: 200 * SCALE,
      height: 200 * SCALE,
      resizeMode: 'contain',
    },
    featureImageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12 * SCALE,
      marginBottom: 24 * SCALE,
    },
    
    // 가입 전 확인 섹션 - 새로운 스타일
    checkBeforeSignup: {
      backgroundColor: '#F9FAFB', // 연한 회색 배경
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 20 * SCALE, // 더 많은 패딩
      marginBottom: 0, // 하단 마진 제거
    },
    checkTitle: {
      fontSize: 18 * SCALE, // 더 큰 폰트
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 12 * SCALE, // 더 많은 마진
    },
    checkText: {
      fontSize: 13 * SCALE, // 약간 더 큰 폰트
      color: '#6B7280',
      lineHeight: 18 * SCALE, // 더 넓은 줄간격
    },
    
    section: {
      backgroundColor: 'white',
      marginBottom: 0, // 섹션 간 간격 제거
      borderBottomWidth: 1, // 하단 경계선만
      borderBottomColor: '#E5E7EB',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 18 * SCALE, // 더 많은 패딩
    },
    sectionTitle: {
      fontSize: 16 * SCALE,
      fontWeight: '600',
      color: '#111827',
    },
    sectionRightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12 * SCALE,
      },
      basicRateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8 * SCALE,
      },
      
      basicRateTitle: {
        fontSize: 16 * SCALE,
        fontWeight: '600',
        color: '#111827',
      },
      
      underlineText: {
        fontSize: 14 * SCALE,
        color: '#008B8B',
        fontWeight: '500',
        textDecorationLine: 'underline',
        textDecorationColor: '#008B8B',
      },
    sectionContent: {
      paddingHorizontal: 20 * SCALE,
      paddingBottom: 20 * SCALE, // 더 많은 하단 패딩
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 16 * SCALE, // 더 많은 마진
      alignItems: 'flex-start', // 상단 정렬
    },
    infoLabel: {
      width: 90 * SCALE, // 더 넓은 라벨 영역
      fontSize: 14 * SCALE, // 더 큰 폰트
      color: '#374151', // 더 진한 회색
      fontWeight: '500', // 약간 굵게
    },
    infoValue: {
      flex: 1,
      fontSize: 14 * SCALE, // 더 큰 폰트
      color: '#111827',
      lineHeight: 20 * SCALE, // 줄간격 추가
    },
    rateDate: {
       fontSize: 13 * SCALE, // 약간 더 큰 폰트
       color: '#6B7280',
       marginBottom: 16 * SCALE, // 더 많은 마진
       textAlign: 'right',
     },
    rateTable: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8 * SCALE,
      marginBottom: 16 * SCALE, // 더 많은 마진
    },
    rateTableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F9FAFB',
      paddingVertical: 14 * SCALE, // 더 많은 패딩
      paddingHorizontal: 16 * SCALE,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    rateTableHeaderText: {
      flex: 1,
      fontSize: 13 * SCALE, // 더 큰 폰트
      fontWeight: '600',
      color: '#111827',
      textAlign: 'center',
    },
    rateTableRow: {
      flexDirection: 'row',
      paddingVertical: 14 * SCALE, // 더 많은 패딩
      paddingHorizontal: 16 * SCALE,
    },
    rateTableLabel: {
      flex: 1,
      fontSize: 13 * SCALE, // 더 큰 폰트
      color: '#111827',
      textAlign: 'center',
    },
    rateTableValue: {
      flex: 1,
      fontSize: 13 * SCALE, // 더 큰 폰트
      fontWeight: '600',
      color: '#111827',
      textAlign: 'center',
    },
    rateNote: {
      fontSize: 12 * SCALE,
      color: '#6B7280',
      lineHeight: 18 * SCALE, // 더 넓은 줄간격
    },
    
    preferentialTitle: {
      fontSize: 16 * SCALE,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 4 * SCALE,
    },
    preferentialSubTitle: {
        fontSize: 14 * SCALE,
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: 8 * SCALE,
    },
    preferentialDesc: {
      fontSize: 14 * SCALE,
      color: '#6B7280',
      marginBottom: 16 * SCALE,
      lineHeight: 20 * SCALE,
    },
    preferentialTable: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8 * SCALE,
      marginBottom: 16 * SCALE,
    },
    preferentialTableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F9FAFB',
      paddingVertical: 12 * SCALE,
      paddingHorizontal: 12 * SCALE,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    preferentialTableHeaderText: {
      flex: 1,
      fontSize: 12 * SCALE,
      fontWeight: '600',
      color: '#111827',
    },

    preferentialTableRow: {
        flexDirection: 'row',
        paddingVertical: 12 * SCALE,
        paddingHorizontal: 12 * SCALE,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      },
      preferentialItemContainer: {
        flex: 1,
        marginRight: 12 * SCALE,
      },
      preferentialItemTitle: {
        fontSize: 14 * SCALE,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4 * SCALE,
      },
      preferentialItemRate: {
        fontSize: 14 * SCALE,
        fontWeight: '600',
        color: '#008B8B',
      },
      preferentialConditionContainer: {
        flex: 2,
      },
    preferentialCondition: {
      fontSize: 14 * SCALE,
      color: '#6B7280',
      marginBottom: 4 * SCALE,
      lineHeight: 16 * SCALE,
    },
    boldText: {
      fontWeight: 'bold',
    },
    teamTable: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8 * SCALE,
        marginTop: 12 * SCALE,
      },
      teamTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        paddingVertical: 10 * SCALE,
        paddingHorizontal: 12 * SCALE,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      },
      teamTableHeaderText: {
        flex: 1,
        fontSize: 12 * SCALE,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
      },
      teamTableRow: {
        flexDirection: 'row',
        paddingVertical: 10 * SCALE,
        paddingHorizontal: 12 * SCALE,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      },
      teamTableCell: {
        flex: 1,
        fontSize: 12 * SCALE,
        color: '#111827',
        textAlign: 'center',
      },
    interestExample: {
      backgroundColor: 'white',
      paddingVertical: 16 * SCALE,
      marginBottom: 0, // 하단 마진 제거
    },
    interestExampleTitle: {
      fontSize: 16 * SCALE,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 12 * SCALE,
    },
    interestExampleText: {
      fontSize: 14 * SCALE,
      color: '#111827',
      marginBottom: 8 * SCALE,
    },
    interestExampleNote: {
      fontSize: 12 * SCALE,
      color: '#6B7280',
      lineHeight: 16 * SCALE,
      marginBottom: 4 * SCALE,
    },
    protectionInfo: {
      backgroundColor: 'white',
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 16 * SCALE,
      marginBottom: 0, // 하단 마진 제거
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    protectionBadge: {
      backgroundColor: '#EF4444',
      borderRadius: 8 * SCALE,
      paddingHorizontal: 12 * SCALE,
      paddingVertical: 8 * SCALE,
      marginRight: 12 * SCALE,
      minWidth: 80 * SCALE,
    },
    protectionBadgeText: {
      fontSize: 12 * SCALE,
      color: 'white',
      fontWeight: '600',
      textAlign: 'center',
    },
    protectionBadgeSubtext: {
      fontSize: 10 * SCALE,
      color: 'white',
      textAlign: 'center',
      marginTop: 2 * SCALE,
    },
    protectionText: {
      flex: 1,
      fontSize: 12 * SCALE,
      color: '#6B7280',
      lineHeight: 16 * SCALE,
    },
    complianceInfo: {
      backgroundColor: 'white',
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 16 * SCALE,
    },
    complianceText: {
      fontSize: 12 * SCALE,
      color: '#6B7280',
      lineHeight: 16 * SCALE,
      marginBottom: 4 * SCALE,
    },
    consultationButton: {
      position: 'absolute',
      right: 20 * SCALE,
      bottom: 100 * SCALE,
      backgroundColor: '#6B7280',
      borderRadius: 25 * SCALE,
      width: 50 * SCALE,
      height: 50 * SCALE,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    consultationButtonText: {
      fontSize: 10 * SCALE,
      color: 'white',
      fontWeight: '600',
      marginTop: 2 * SCALE,
    },
    bottomButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      paddingHorizontal: 20 * SCALE,
      paddingVertical: 16 * SCALE,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    mainButton: {
      backgroundColor: '#008B8B', // 메인 컬러로 변경
      borderRadius: 12 * SCALE,
      paddingVertical: 16 * SCALE,
      alignItems: 'center',
    },
    mainButtonText: {
      color: 'white',
      fontSize: 16 * SCALE,
      fontWeight: '600',
    },
    disabledButtonContainer: {
      backgroundColor: '#F3F4F6',
      borderRadius: 12 * SCALE,
      paddingVertical: 16 * SCALE,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#D1D5DB',
    },
    disabledButtonText: {
      color: '#6B7280',
      fontSize: 16 * SCALE,
      fontWeight: '600',
    },
         bottomSpacer: {
       height: 100 * SCALE,
     },
     modalOverlay: {
       position: 'absolute',
       top: 0,
       left: 0,
       right: 0,
       bottom: 0,
       backgroundColor: 'rgba(0, 0, 0, 0.5)',
       justifyContent: 'flex-end',
       zIndex: 1000,
     },
     modalContainer: {
       backgroundColor: 'white',
       borderTopLeftRadius: 20 * SCALE,
       borderTopRightRadius: 20 * SCALE,
       width: '100%',
       padding: 20 * SCALE,
       paddingBottom: 40 * SCALE,
     },
     modalHeader: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'space-between',
       marginBottom: 20 * SCALE,
       paddingBottom: 16 * SCALE,
       borderBottomWidth: 1,
       borderBottomColor: '#E5E7EB',
     },
     modalCloseButton: {
       padding: 4 * SCALE,
     },
     modalTitle: {
       fontSize: 18 * SCALE,
       fontWeight: 'bold',
       color: '#111827',
       flex: 1,
       textAlign: 'center',
       marginRight: 28 * SCALE, // X 버튼 공간 확보
     },
     modalContent: {
       marginBottom: 20 * SCALE,
     },
     modalCheckItem: {
       flexDirection: 'row',
       alignItems: 'flex-start',
     },
     modalCheckIcon: {
       width: 24 * SCALE,
       height: 24 * SCALE,
       borderRadius: 12 * SCALE,
       backgroundColor: '#D1D5DB',
       borderWidth: 2 * SCALE,
       borderColor: '#CED4DA',
       justifyContent: 'center',
       alignItems: 'center',
       marginRight: 12 * SCALE,
       marginTop: 2 * SCALE,
     },
     modalCheckIconActive: {
       backgroundColor: '#008B8B',
       borderColor: '#008B8B',
     },
     modalCheckText: {
       flex: 1,
       fontSize: 16 * SCALE,
       color: '#111827',
       lineHeight: 20 * SCALE,
     },
     modalButton: {
       backgroundColor: '#D1D5DB',
       borderRadius: 8 * SCALE,
       paddingVertical: 16 * SCALE,
       alignItems: 'center',
     },
     modalButtonActive: {
       backgroundColor: '#008B8B',
     },
     modalButtonText: {
       color: '#9CA3AF',
       fontSize: 16 * SCALE,
       fontWeight: '600',
     },
     modalButtonTextActive: {
       color: 'white',
     },
}); 