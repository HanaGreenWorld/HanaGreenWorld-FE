import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SCALE } from '../utils/constants';
import { fetchDailyQuiz, submitQuizAnswer, fetchTodayQuizResult } from '../utils/ecoSeedApi';
import { Quiz, QuizAttemptResponse, QuizRecord } from '../types';

// Use global SCALE from constants

interface QuizScreenProps {
  onBack: () => void;
  onQuizCompleted?: (selectedAnswer: number) => void;
  quizCompleted?: boolean;
  selectedAnswer?: number | null;
}

export default function QuizScreen({ onBack, onQuizCompleted, quizCompleted = false, selectedAnswer: initialSelectedAnswer = null }: QuizScreenProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(initialSelectedAnswer);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showPrecautions, setShowPrecautions] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const [reward, setReward] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(quizCompleted);
  const [loading, setLoading] = useState(true);
  const [todayResult, setTodayResult] = useState<QuizRecord | null>(null);

  // JSON 문자열을 파싱하는 헬퍼 함수
  const parseOptions = (optionsString: string): string[] => {
    try {
      if (typeof optionsString === 'string') {
        return JSON.parse(optionsString);
      }
      return [];
    } catch (error) {
      console.error('Failed to parse options:', error);
      return [];
    }
  };

  // 퀴즈 데이터 로딩
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);
        
        // 오늘 이미 퀴즈를 풀었는지 확인
        try {
          const result = await fetchTodayQuizResult();
          if (result && (result as any).quiz) {
            setTodayResult(result);
            setHasSubmitted(true);
            setIsCorrect(result.isCorrect);
            setReward(result.pointsAwarded);
          } else {
            const dailyQuiz = await fetchDailyQuiz();
            if (dailyQuiz && dailyQuiz.question && Array.isArray(dailyQuiz.options)) {
              setQuiz(dailyQuiz);
              setHasSubmitted(false);
            } else {
              console.error('Invalid quiz data received:', dailyQuiz);
              Alert.alert('오류', '퀴즈 데이터가 올바르지 않습니다.');
            }
          }
        } catch (error) {
          // 에러는 dailyQuiz 로드로 폴백
          try {
            const dailyQuiz = await fetchDailyQuiz();
            if (dailyQuiz && dailyQuiz.question && Array.isArray(dailyQuiz.options)) {
              setQuiz(dailyQuiz);
              setHasSubmitted(false);
            } else {
              console.error('Invalid quiz data received in fallback:', dailyQuiz);
              Alert.alert('오류', '퀴즈 데이터가 올바르지 않습니다.');
            }
          } catch (fallbackError) {
            console.error('Fallback quiz loading failed:', fallbackError);
            Alert.alert('오류', '퀴즈를 불러올 수 없습니다.');
          }
        }
      } catch (error) {
        console.error('퀴즈 데이터 로딩 실패:', error);
        Alert.alert('오류', '퀴즈를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, []);

  // 초기 선택한 답안 설정
  useEffect(() => {
    if (initialSelectedAnswer !== null) {
      setSelectedAnswer(initialSelectedAnswer);
    }
  }, [initialSelectedAnswer]);

  // 랜덤 보상 생성 (5일 확률이 매우 높게)
  const generateReward = () => {
    const random = Math.random();
    if (random < 0.95) { // 95% 확률로 5
      return 5;
    } else if (random < 0.98) { // 3% 확률로 100-1000
      return Math.floor(Math.random() * 901) + 100;
    } else { // 2% 확률로 1000-10000
      return Math.floor(Math.random() * 9001) + 1000;
    }
  };



  // 화면이 마운트될 때마다 GIF 재시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setGifKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!quiz || selectedAnswer === null) return;
    
    try {
      // API로 답변 제출
      const response = await submitQuizAnswer(quiz.id, { selectedAnswer });
      
      setIsCorrect(response.isCorrect);
      setReward(response.pointsAwarded);
      setHasSubmitted(true);
      setShowResult(true);
      // 즉시 결과 화면에 반영되도록 낙관적 todayResult 구성
      setTodayResult({
        id: 0,
        quiz: {
          ...quiz,
          explanation: response.explanation,
        } as any,
        selectedAnswer,
        isCorrect: response.isCorrect,
        pointsAwarded: response.pointsAwarded,
        attemptedAt: new Date().toISOString(),
      } as any);
      
      // 정답인 경우 포인트 적립 (API에서 이미 처리됨)
      if (response.isCorrect) {
        // 포인트 정보 새로고침
        // earnFromQuizActivity는 더 이상 필요하지 않음
      }
      
      onQuizCompleted?.(selectedAnswer);
    } catch (error) {
      console.error('퀴즈 제출 실패:', error);
      Alert.alert('오류', '퀴즈 제출에 실패했습니다.');
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    // 선택한 답안은 그대로 유지 (재설정하지 않음)
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24 * SCALE} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>퀴즈 HANA</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="home-outline" size={24 * SCALE} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="menu-outline" size={24 * SCALE} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Promotional Banner */}
        <View style={styles.promotionalBanner}>
          <Text style={styles.promotionalText}>
            매일 즐기는 퀴즈HANA 맞히면
          </Text>
          <Text style={styles.promotionalText}>
            최대 <Text style={styles.highlightText}>10,000</Text> 원큐씨앗 지급!
          </Text>
                      <View style={styles.promotionalImage}>
              <Image 
                key={gifKey}
                source={require('../../assets/grow_sprout.gif')} 
                style={styles.sproutImage}
                resizeMode="contain"
              />
            </View>
        </View>

        {/* Quiz Card */}
        <View style={styles.quizCard}>
          <Text style={styles.quizDate}>{new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
          })}</Text>
          <View style={styles.divider} />
          <Text style={styles.quizTitle}>QUIZ</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>퀴즈를 불러오는 중...</Text>
          ) : hasSubmitted && todayResult && todayResult.quiz && todayResult.quiz.question ? (
            // 이미 퀴즈를 푼 경우 결과 표시
            <View>
              <Text style={styles.question}>
                Q. {todayResult.quiz.question}
              </Text>
              <View style={styles.answerOptions}>
                {(todayResult.quiz.options && Array.isArray(todayResult.quiz.options) ? todayResult.quiz.options : []).map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.answerOption,
                      todayResult.selectedAnswer === index && styles.selectedAnswer,
                      index === todayResult.quiz.correctAnswer && styles.correctAnswer,
                      todayResult.selectedAnswer === index && index !== todayResult.quiz.correctAnswer && styles.wrongAnswer,
                    ]}
                    disabled={true}
                  >
                    <Text style={styles.answerNumber}>{index === 0 ? '①' : index === 1 ? '②' : index === 2 ? '③' : '④'}</Text>
                    <Text style={styles.answerText}>{option}</Text>
                    <View style={[
                      styles.radioButton,
                      index === todayResult.quiz.correctAnswer && styles.correctRadioButton,
                      todayResult.selectedAnswer === index && index !== todayResult.quiz.correctAnswer && styles.wrongRadioButton
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultText}>
                  {todayResult.isCorrect ? '정답입니다!' : '아쉽지만 오답입니다.'}
                </Text>
                <Text style={styles.explanationText}>{todayResult.quiz.explanation}</Text>
                {todayResult.isCorrect && (
                  <Text style={styles.pointsText}>+{todayResult.pointsAwarded} 원큐씨앗 획득!</Text>
                )}
              </View>
            </View>
          ) : quiz && quiz.question ? (
            // 새로운 퀴즈 표시
            <View>
              <Text style={styles.question}>
                Q. {quiz.question}
              </Text>
              <View style={styles.answerOptions}>
                {(quiz.options && Array.isArray(quiz.options) ? quiz.options : []).map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.answerOption,
                      selectedAnswer === index && !hasSubmitted && styles.selectedAnswer,
                    ]}
                    onPress={() => !hasSubmitted && handleAnswerSelect(index)}
                    disabled={hasSubmitted}
                  >
                    <Text style={styles.answerNumber}>{index === 0 ? '①' : index === 1 ? '②' : index === 2 ? '③' : '④'}</Text>
                    <Text style={styles.answerText}>{option}</Text>
                    <View style={[
                      styles.radioButton,
                      selectedAnswer === index && !hasSubmitted && styles.selectedRadioButton,
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>퀴즈를 불러올 수 없습니다.</Text>
          )}

          {!hasSubmitted && quiz && (
            <TouchableOpacity 
              style={[
                styles.submitButton,
                selectedAnswer !== null && styles.submitButtonEnabled
              ]}
              onPress={handleSubmit}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.submitButtonText}>
                참여완료
              </Text>
            </TouchableOpacity>
          )}
          
          {hasSubmitted && (
            <View style={styles.completedMessage}>
              <Text style={styles.completedText}>오늘의 퀴즈 참여가 완료되었습니다.</Text>
              <Text style={styles.completedSubText}>내일 새로운 퀴즈로 다시 만나요!</Text>
            </View>
          )}
        </View>

        {/* Precautions Section */}
        <View style={styles.precautionsContainer}>
          <TouchableOpacity 
            style={styles.precautionsHeader} 
            onPress={() => setShowPrecautions(!showPrecautions)}
          >
            <Text style={styles.precautionsTitle}>유의사항</Text>
            <Ionicons 
              name={showPrecautions ? "chevron-up" : "chevron-down"} 
              size={16 * SCALE} 
              color="#6B7280" 
            />
          </TouchableOpacity>
          {showPrecautions && (
            <View style={styles.precautionsContent}>
              <Text style={styles.precautionsText}>
                • 금융상품 설명서와 약관을 반드시 읽어보시기 바랍니다.
              </Text>
              <Text style={styles.precautionsText}>
                • 금융소비자는 설명을 받을 권리가 있습니다.
              </Text>
              <Text style={styles.precautionsText}>
                • 이벤트 내용은 하나은행 사정에 따라 변경 또는 종료될 수 있습니다. (기존 조건 충족 고객 제외)
              </Text>
              <Text style={styles.precautionsText}>
                • 퀴즈HANA 이벤트는 정답 시 5~10,000원큐씨앗을 랜덤 지급합니다. (1인 1회 참여)
              </Text>
              <Text style={styles.precautionsText}>
                • 지급되는 원큐씨앗 개수는 변경될 수 있으며, 적립된 씨앗은 '내 정원 {'>'} 더보기 {'>'} 원큐씨앗'에서 확인 가능합니다.
              </Text>
              <Text style={styles.precautionsText}>
                • 이벤트 관련 문의: 하나은행 고객센터 1599-1111
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>오늘의 퀴즈HANA</Text>
            
            <View style={styles.resultImage}>
              <Image 
                key={gifKey}
                source={isCorrect ? require('../../assets/sprout.png') : require('../../assets/sprout_wilted.png')} 
                style={styles.sproutImage}
                resizeMode="contain"
              />
            </View>

            {isCorrect ? (
              <>
                <Text style={styles.resultMessage}>정답입니다.</Text>
                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardNumber}>{reward}</Text>
                  <Text style={styles.rewardUnit}> 원큐씨앗</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.resultMessage}>아쉽지만 오답입니다.</Text>
                <Text style={styles.resultSubMessage}>내일 다시 도전해주세요.</Text>
              </>
            )}

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleCloseResult}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingTop: 10 * SCALE,
    paddingBottom: 5 * SCALE,
    backgroundColor: '#F5F5F5',
  },
  statusBarText: {
    fontSize: 14 * SCALE,
    color: '#000',
    fontWeight: '600',
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5 * SCALE,
  },
  battery: {
    width: 25 * SCALE,
    height: 12 * SCALE,
    backgroundColor: '#000',
    borderRadius: 2 * SCALE,
    borderWidth: 1,
    borderColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 15 * SCALE,
    backgroundColor: '#F5F5F5',
  },
  headerButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 5 * SCALE,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20 * SCALE,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12 * SCALE,
    position: 'relative',
  },
  activeTab: {
    position: 'relative',
  },
  tabText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  activeTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2 * SCALE,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  promotionalBanner: {
    backgroundColor: '#E5E7EB',
    padding: 20 * SCALE,
    marginHorizontal: 20 * SCALE,
    marginTop: 16 * SCALE,
    borderRadius: 12 * SCALE,
  },
  promotionalText: {
    fontSize: 16 * SCALE,
    color: '#000',
    textAlign: 'center',
    marginBottom: 4 * SCALE,
  },
  highlightText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  promotionalImage: {
    alignItems: 'center',
    // marginTop: 16 * SCALE,
  },
  sproutImage: {
    width: 100 * SCALE,
    height: 100 * SCALE,
  },
  goalImage: {
    position: 'relative',
    alignItems: 'center',
  },
  goalNet: {
    width: 80 * SCALE,
    height: 60 * SCALE,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8 * SCALE,
  },
  goalBase: {
    width: 100 * SCALE,
    height: 8 * SCALE,
    backgroundColor: '#10B981',
    borderRadius: 4 * SCALE,
    marginTop: -4 * SCALE,
  },
  ballImage: {
    width: 30 * SCALE,
    height: 30 * SCALE,
    backgroundColor: '#000',
    borderRadius: 15 * SCALE,
    position: 'absolute',
    bottom: 20 * SCALE,
    left: 25 * SCALE,
  },
  quizLabel: {
    position: 'absolute',
    bottom: 8 * SCALE,
    right: 10 * SCALE,
    backgroundColor: '#10B981',
    paddingHorizontal: 6 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 4 * SCALE,
  },
  quizLabelText: {
    fontSize: 10 * SCALE,
    color: '#fff',
    fontWeight: 'bold',
  },
  quizCard: {
    backgroundColor: '#fff',
    margin: 20 * SCALE,
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
  },
  quizDate: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    marginBottom: 12 * SCALE,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16 * SCALE,
  },
  quizTitle: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 20 * SCALE,
  },
  question: {
    fontSize: 16 * SCALE,
    color: '#000',
    lineHeight: 24 * SCALE,
    marginBottom: 20 * SCALE,
  },
  answerOptions: {
    gap: 12 * SCALE,
    marginBottom: 24 * SCALE,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16 * SCALE,
    backgroundColor: '#fff',
    borderRadius: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedAnswer: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  answerNumber: {
    fontSize: 16 * SCALE,
    color: '#000',
    marginRight: 12 * SCALE,
  },
  answerText: {
    flex: 1,
    fontSize: 16 * SCALE,
    color: '#000',
  },
  radioButton: {
    width: 20 * SCALE,
    height: 20 * SCALE,
    borderRadius: 10 * SCALE,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  selectedRadioButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  correctAnswer: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  wrongAnswer: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  correctRadioButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  submitButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 16 * SCALE,
    borderRadius: 8 * SCALE,
    alignItems: 'center',
  },
  submitButtonEnabled: {
    backgroundColor: '#10B981',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  precautionsContainer: {
    marginHorizontal: 20 * SCALE,
    marginBottom: 100 * SCALE,
  },
  precautionsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12 * SCALE,
    gap: 8 * SCALE,
  },
  precautionsTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#000',
  },
  precautionsContent: {
    paddingTop: 8 * SCALE,
  },
  precautionsText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 8 * SCALE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 16 * SCALE,
    width: '80%',
    padding: 24 * SCALE,
    margin: 40 * SCALE,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20 * SCALE,
  },
  resultImage: {
    marginBottom: 20 * SCALE,
  },
  resultMessage: {
    fontSize: 16 * SCALE,
    color: '#000',
    marginBottom: 8 * SCALE,
  },
  resultSubMessage: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    marginBottom: 20 * SCALE,
  },
  rewardText: {
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 24 * SCALE,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24 * SCALE,
  },
  rewardNumber: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
  },
  rewardUnit: {
    fontSize: 18 * SCALE,
    fontWeight: '500',
    color: '#10B981',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40 * SCALE,
    paddingVertical: 12 * SCALE,
    borderRadius: 8 * SCALE,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 40 * SCALE,
  },
  errorText: {
    fontSize: 16 * SCALE,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 40 * SCALE,
  },
  resultInfo: {
    marginTop: 20 * SCALE,
    padding: 16 * SCALE,
    backgroundColor: '#F9FAFB',
    borderRadius: 8 * SCALE,
  },
  resultText: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8 * SCALE,
  },
  explanationText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
    marginBottom: 8 * SCALE,
  },
  pointsText: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
  },
  completedMessage: {
    alignItems: 'center',
    paddingVertical: 20 * SCALE,
  },
  completedText: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4 * SCALE,
  },
  completedSubText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
  },
  wrongRadioButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
}); 