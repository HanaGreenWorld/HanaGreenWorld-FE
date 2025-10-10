import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageBackground, Image, Pressable } from 'react-native';
import { EcoStoreButton } from '../components/EcoStoreButton';
import TopBar from '../components/TopBar';
import { LinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, SCALE } from '../utils/constants';
import { useEcoSeeds } from '../hooks/useEcoSeeds';
import { useSavingsAccountData } from '../hooks/useSavingsAccountData';
import { checkTodayQuizParticipation } from '../utils/ecoSeedApi';
import { getCurrentUserIdFromToken } from '../utils/jwtUtils';
import { integrationApi } from '../services/integrationApi';

interface GreenPlayScreenProps {
  onBack?: () => void;
  onEnterGreenZone?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToQuiz?: () => void;
  onNavigateToSavings?: () => void;
  onNavigateToEcoMerchants?: () => void;
  onNavigateToEcoChallenge?: () => void;
  onNavigateToTeams?: () => void;
  quizCompleted?: boolean;
  ecoSeeds?: number;
  onHome?: () => void;
}

export const GreenPlayScreen: React.FC<GreenPlayScreenProps> = ({ onBack, onEnterGreenZone, onNavigateToHistory, onNavigateToQuiz, onNavigateToSavings, onNavigateToEcoMerchants, onNavigateToEcoChallenge, onNavigateToTeams, quizCompleted = false, ecoSeeds: propEcoSeeds, onHome }) => {
  const { ecoSeedInfo, refreshProfile } = useEcoSeeds();
  const [actualQuizCompleted, setActualQuizCompleted] = useState(quizCompleted);
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  // 사용자 ID 가져오기
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getCurrentUserIdFromToken();
        setCurrentUserId(userId || 0);
      } catch (error) {
        console.error('사용자 ID 조회 실패:', error);
        setCurrentUserId(0);
      }
    };
    fetchUserId();
  }, []);

  // 적금 계좌 보유 여부 확인
  // const { savingsAccounts } = useSavingsAccountData(currentUserId > 0 ? currentUserId : 1);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 일관된 데이터 사용을 위해 ecoSeedInfo의 currentSeeds를 우선 사용
  const ecoSeeds = ecoSeedInfo?.currentSeeds ?? propEcoSeeds ?? 0;

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshProfile();
    };

    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();
  }, [refreshProfile]);

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

  // 컴포넌트 마운트 시 실제 퀴즈 참여 상태를 확인
  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const hasParticipated = await checkTodayQuizParticipation();
        setActualQuizCompleted(hasParticipated);
      } catch (error) {
        console.error('퀴즈 참여 상태 확인 실패:', error);
        // 에러 시 prop 값 사용
        setActualQuizCompleted(quizCompleted);
      }
    };

    checkQuizStatus();
  }, [quizCompleted]);
  return (
    <View style={styles.container}>
      <TopBar title="하나그린세상" onBack={onBack} onHome={onHome} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Announcement Banner */}
        <View style={styles.announcementBanner}>
          <View style={styles.announcementContent}>
            <Ionicons name="leaf-outline" size={16 * SCALE} color="#000" style={styles.announcementIcon} />
            <Text style={styles.announcementText}>7월 그린HANA 환경보호 결과 발표!</Text>
          </View>
          <Ionicons name="chevron-forward" size={16 * SCALE} color="#000" />
        </View>

        {/* Main Promotional Area */}
        <View style={styles.promotionalArea}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400' }}
            style={styles.promotionalBackground}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
              style={styles.promotionalOverlay}
            >
              <View style={styles.promotionalContent}>
                <Text style={styles.promotionalTitle}>HANA로 그린 푸른 지구</Text>
                <Text style={styles.promotionalSubtitle}>하나<Text style={styles.promotionalSubtitleHighlight}>그린</Text>세상</Text>
              </View>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={18 * SCALE} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
             {/* Green Savings Product Card */}
             <View style={styles.savingsCard}>
               <View style={styles.savingsCardBlur}>
                 <View style={styles.savingsCardContent}>
                   {hasActiveApplication ? (
                     <View style={styles.savingsStatusContainer}>
                       <View style={styles.savingsStatusContent}>
                         <Image
                           source={require('../../assets/expert.png')}
                           style={styles.savingsStatusIcon}
                           resizeMode="contain"
                         />
                         <View style={styles.hasSavingsCardContainer}>
                          <Text style={styles.hasSavingsCardSubTitle}>친환경 적금</Text>
                          <Text style={styles.hasSavingsCardTitle}>하나green세상 적금</Text>
                         </View>
                       </View>
                       <View style={styles.savingsStatusBadge}>
                         <Text style={styles.savingsStatusText}>보유중</Text>
                       </View>
                     </View>
                   ) : (
                     <>
                       <Text style={styles.savingsCardTitle}>하나green세상 적금 가입하고{'\n'}함께 환경보호하면 금리 UP!</Text>
                       <Text style={styles.savingsCardRate}>최저 3.0% ~ 최고 7.0% (연, 세전)</Text>
                       <TouchableOpacity
                         style={styles.savingsButton}
                         onPress={() => { onNavigateToSavings?.(); }}
                       >
                         <Text style={styles.savingsButtonText}>적금 가입하기</Text>
                       </TouchableOpacity>
                     </>
                   )}
                 </View>
               </View>
             </View>
          </ImageBackground>
        </View>

        {/* Bottom Section with Gradient Background */}
        <View style={styles.bottomSection}>
          <LinearGradient
            colors={['rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,0.7)']}
            style={styles.bottomSectionGradient}
          >
            {/* Green Ball Section */}
            <TouchableOpacity style={styles.greenBallSection} onPress={onNavigateToHistory}>
              <LinearGradient
                colors={['#20B2AA', '#008B8B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.greenBallGradient}
              >
                <View style={styles.greenBallSectionContent}>
                  <Image source={require('../../assets/sprout.png')} style={styles.greenBallIcon} />
                  <Text style={styles.greenBallText}>원큐씨앗</Text>
                </View>
                <View style={styles.greenBallCountContainer}>
                  <Text style={styles.greenBallCountNumber}>{ecoSeeds}</Text>
                  <Text style={styles.greenBallCountUnit}> 개</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Activity Cards */}
            <View style={styles.activityCards}>
              <TouchableOpacity style={styles.activityCard} onPress={onNavigateToQuiz}>
                <Text style={styles.activityCardTitle}>퀴즈</Text>
                <Text style={styles.activityCardSubtitle}>HANA</Text>
                <Image 
                  source={require('../../assets/hana3dIcon/hanaIcon3d_3_103.png')} 
                  style={styles.activityCardIcon} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.activityCard} onPress={onNavigateToEcoChallenge}>
                <Text style={styles.activityCardTitle}>챌린지</Text>
                <Text style={styles.activityCardSubtitle}>HANA</Text>
                <Image 
                  source={require('../../assets/hana3dIcon/hanaIcon3d_51.png')} 
                  style={styles.activityCardIcon} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.activityCard} onPress={onNavigateToTeams}>
                <Text style={styles.activityCardTitle}>다함께</Text>
                <Text style={styles.activityCardSubtitle}>HANA</Text>
                                <Image 
                  source={require('../../assets/green_team.png')} 
                  style={styles.activityCardIcon} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
            </View>
            {/* 친환경 가맹점 확인하기 */}
            <EcoStoreButton onPress={onNavigateToEcoMerchants} />
            
            {/* 하단 여백 추가 */}
            <View style={styles.bottomSpacer} />
          </LinearGradient>
        </View>
      </ScrollView>

              {/* Bottom Button */}
        <View style={styles.bottomButtonContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,1)']}
            style={styles.bottomButtonGradient}
          >
            <TouchableOpacity style={styles.bottomButton} onPress={onEnterGreenZone}>
              <Text style={styles.bottomButtonText}>내 정원 입장</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  announcementBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d8d8d8',
    paddingHorizontal: 15 * SCALE,
    paddingVertical: 15 * SCALE,
  },
  announcementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  announcementIcon: {
    marginRight: 8 * SCALE,
  },
  announcementText: {
    fontSize: 14 * SCALE,
    color: '#000',
    fontWeight: '500',
  },
  promotionalArea: {
    overflow: 'hidden',
    height: 350 * SCALE,
  },
  promotionalBackground: {
    flex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100 * SCALE,
  },
  promotionalOverlay: {
    flex: 1,
    padding: 20 * SCALE,
    justifyContent: 'space-between',
  },
  promotionalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  promotionalTitle: {
    fontSize: 20 * SCALE,
    color: '#fff',
  },
  promotionalSubtitle: {
    fontSize: 28 * SCALE,
    color: '#fff',
    fontWeight: '600',
  },
  promotionalSubtitleHighlight: {
    color: COLORS.secondary,
  },
  shareButton: {
    position: 'absolute',
    top: 20 * SCALE,
    right: 20 * SCALE,
    width: 40 * SCALE,
    height: 40 * SCALE,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsCard: {
    marginHorizontal: 20 * SCALE,
    marginBottom: 20 * SCALE,
    borderRadius: 15 * SCALE,
    overflow: 'hidden',
  },
  savingsCardBlur: {
    backgroundColor: 'rgba(82, 82, 82, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15 * SCALE,
    padding: 20 * SCALE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  savingsCardContent: {
    position: 'relative',
  },
  hasSavingsCardContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    paddingTop: 10 * SCALE,
  },
  hasSavingsCardSubTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#A2ECDF',
    marginBottom: 8 * SCALE,
  },
  hasSavingsCardTitle: {
    fontSize: 22 * SCALE,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8 * SCALE,
  },
  savingsStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  savingsStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savingsStatusBadge: {
    backgroundColor: '#19A697',
    borderRadius: 12 * SCALE,
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 4 * SCALE,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  savingsCardTitle: {
    fontSize: 20 * SCALE,
    fontWeight: 'semibold',
    color: '#FFF',
    marginBottom: 8 * SCALE,
  },
  savingsCardRate: {
    fontSize: 14 * SCALE,
    fontWeight: '400',
    color: COLORS.secondary,
    marginBottom: 16 * SCALE,
  },
  savingsButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 30 * SCALE,
    paddingVertical: 12 * SCALE,
    borderRadius: 8 * SCALE,
  },
  savingsButtonText: {
    color: '#000',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSection: {
  },
  bottomSectionGradient: {
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 20 * SCALE,
  },
  greenBallSection: {
    marginBottom: 20 * SCALE,
    borderRadius: 10 * SCALE,
    overflow: 'hidden',
  },
  greenBallGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15 * SCALE,
    paddingVertical: 20 * SCALE,
  },
  greenBallSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenBallIcon: {
    width: 26 * SCALE,
    height: 26 * SCALE,
    marginHorizontal: 8 * SCALE,
  },
  greenBallText: {
    fontSize: 16 * SCALE,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4 * SCALE,
  },
  greenBallCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8 * SCALE,
  },
  greenBallCountNumber: {
    fontSize: 16 * SCALE,
    color: '#FEEE98',
    fontWeight: '500',
  },
  greenBallCountUnit: {
    fontSize: 16 * SCALE,
    color: '#fff',
    fontWeight: '500',
  },
  activityCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20 * SCALE,
    gap: 10 * SCALE,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 10 * SCALE,
    padding: 15 * SCALE,
    alignItems: 'center',
  },
  activityCardTitle: {
    fontSize: 16 * SCALE,
    color: '#fff',
    fontWeight: '600',
    marginTop: 12 * SCALE,
    marginBottom: 4 * SCALE,
    textAlign: 'center',
  },
  activityCardSubtitle: {
    fontSize: 14 * SCALE,
    color: '#ccc',
    marginBottom: 12 * SCALE,
    textAlign: 'center',
  },
  activityCardIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    marginLeft: 40 * SCALE,
  },
  statusButton: {
    paddingHorizontal: 8 * SCALE,
    paddingVertical: 4 * SCALE,
    borderRadius: 12 * SCALE,
    minWidth: 50 * SCALE,
    alignItems: 'center',
  },
  statusButtonRed: {
    backgroundColor: '#FF4444',
  },
  statusButtonBlue: {
    backgroundColor: '#4444FF',
  },
  statusButtonGreen: {
    backgroundColor: '#44FF44',
  },
  statusButtonGray: {
    backgroundColor: '#6B7280',
  },
  statusButtonText: {
    fontSize: 8 * SCALE,
    color: '#fff',
    fontWeight: '600',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomButtonGradient: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  bottomButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18 * SCALE,
    borderRadius: 10 * SCALE,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16 * SCALE,
    fontWeight: 'semibold',
  },
  ecoStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 120 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ecoStoreIcon: {
    width: 32 * SCALE,
    height: 32 * SCALE,
    marginRight: 12 * SCALE,
  },
  ecoStoreText: {
    flex: 1,
    fontSize: 16 * SCALE,
    color: '#111827',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80 * SCALE, // 하단 여백 추가
  },
  // Savings Status Styles
  savingsStatusIcon: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    marginRight: 12 * SCALE,
  },
  savingsStatusText: {
    fontSize: 14 * SCALE,
    color: '#ffffff',
    fontWeight: '600',
  },
}); 