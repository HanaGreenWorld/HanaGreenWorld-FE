import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import NumericKeypad from '../components/NumericKeypad';
import { SCALE, COLORS, IPHONE_WIDTH } from '../utils/constants';
import { useEcoSeeds } from '../hooks/useEcoSeeds';

interface SeedConversionScreenProps {
  onBack: () => void;
}

export default function SeedConversionScreen({ onBack }: SeedConversionScreenProps) {
  const { ecoSeedInfo, convertSeedsToHanaMoney, refreshProfile } = useEcoSeeds();
  const [inputValue, setInputValue] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrecautions, setShowPrecautions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // API에서 받아온 원큐씨앗 잔액 사용
  const currentBalance = ecoSeedInfo.currentSeeds;

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshProfile();
    };

    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();
  }, [refreshProfile]);

  const handleNumberPress = (num: string) => {
    if (num === 'X') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (num === '완료') {
      setShowKeypad(false);
    } else {
      setInputValue(prev => prev + num);
    }
  };

  const handleQuickAdd = (amount: number) => {
    const newValue = parseInt(inputValue || '0') + amount;
    setInputValue(newValue.toString());
  };

  const handleConversion = async () => {
    if (!inputValue || parseInt(inputValue) === 0) {
      Alert.alert('오류', '전환할 원큐씨앗을 입력해주세요.');
      return;
    }

    const conversionAmount = parseInt(inputValue);
    
    if (conversionAmount < 100) {
      Alert.alert('오류', '최소 100개부터 전환 가능합니다.');
      return;
    }

    if (conversionAmount > currentBalance) {
      Alert.alert('오류', '보유한 원큐씨앗 개수 내에서 전환 가능합니다.');
      return;
    }

    if (conversionAmount > 30000) {
      Alert.alert('오류', '1회 최대 30,000개까지 전환 가능합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // useEcoSeeds 훅의 convertSeedsToHanaMoney 함수 사용
      await convertSeedsToHanaMoney({
        pointsAmount: conversionAmount
      });

      Alert.alert(
        '전환 완료', 
        `${conversionAmount}개의 원큐씨앗이 하나머니로 전환되었습니다.\n\n전환된 하나머니: ${conversionAmount}원\n\n잔여 원큐씨앗: ${(currentBalance - conversionAmount).toLocaleString()}개`,
        [
          {
            text: '확인',
            onPress: () => {
              setInputValue('');
              onBack(); // 전환 완료 후 이전 화면으로 돌아가기
            },
          },
        ]
      );
    } catch (error) {
      console.error('Conversion error:', error);
      Alert.alert('오류', '원큐씨앗 전환에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="원큐씨앗 전환하기" onBack={onBack} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>보유 원큐씨앗</Text>
            <TouchableOpacity style={styles.helpButton} onPress={() => setShowHelpModal(true)}>
              <Ionicons name="help-circle-outline" size={16 * SCALE} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>{currentBalance}개</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>하나머니로 전환하실{'\n'}원큐씨앗을 입력해주세요.</Text>
          <TouchableOpacity 
            style={styles.inputField} 
            onPress={() => setShowKeypad(true)}
          >
            <Text style={styles.inputText}>
              {inputValue || '원큐씨앗을 입력해주세요.'}
            </Text>
          </TouchableOpacity>
          {parseInt(inputValue) > currentBalance && (
            <Text style={styles.errorText}>보유한 원큐씨앗 개수 내에서 전환 가능합니다.</Text>
          )}
          {inputValue && parseInt(inputValue) < 100 && (
            <Text style={styles.errorText}>100개부터 ~ 30,000개까지 전환 가능합니다.</Text>
          )}
        </View>

        {/* Conversion Rules */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>전환 규칙</Text>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• 1원큐씨앗 = 1하나머니로 전환 가능합니다.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• 1회 전환 가능한 원큐씨앗은 100개 ~ 30,000개 입니다.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• 1일 최대 전환 가능 원큐씨앗은 500,000개입니다.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• 원큐씨앗은 2025년 12월 10일까지만 유효합니다.</Text>
          </View>
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
              <Text style={styles.precautionsSubtitle}>[하나머니]</Text>
              <View style={styles.precautionsItem}>
                <Text style={styles.precautionsText}>• 하나금융그룹 포인트로 즉시 현금 전환 가능합니다. (1하나머니 = 1원)</Text>
              </View>
              <View style={styles.precautionsItem}>
                <Text style={styles.precautionsText}>• 하나머니 앱을 통해 간편결제, 무료송금, 현금출금 등 이용 가능합니다. (하나카드에서 운영)</Text>
              </View>
              <View style={styles.precautionsItem}>
                <Text style={styles.precautionsText}>• 하나머니 서비스는 만 14세 이상 이용 가능합니다.</Text>
              </View>
              <View style={styles.precautionsItem}>
                <Text style={styles.precautionsText}>• 적립된 하나머니는 활성 하나머니 서비스 회원만 획득 가능합니다. (출금, 휴면, 비회원 제외)</Text>
              </View>
              <View style={styles.precautionsItem}>
                <Text style={styles.precautionsText}>• 하나머니 고객센터: 1800-0000</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Conversion Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.conversionButton, 
            (!inputValue || parseInt(inputValue) === 0 || parseInt(inputValue) < 100 || parseInt(inputValue) > currentBalance || isLoading) && styles.conversionButtonDisabled
          ]}
          onPress={handleConversion}
          disabled={!inputValue || parseInt(inputValue) === 0 || parseInt(inputValue) < 100 || parseInt(inputValue) > currentBalance || isLoading}
        >
          <Text style={styles.conversionButtonText}>
            {isLoading ? '전환 중...' : '하나머니로 전환하기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpContainer}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>보유 원큐씨앗 안내</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24 * SCALE} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.helpContent}>
              <Text style={styles.helpText}>
                보유 원큐씨앗은 2025년 1월 2일부터 하나머니로 전환 후 사용 가능합니다.
              </Text>
              <Text style={styles.helpText}>
                (1회 전환: 최소 100개~최대 30,000개 / 1일 최대 500,000개 전환 가능)
              </Text>
              <Text style={styles.helpText}>
                ※2024년 6월 11일부터 2024년 12월 10일 18시까지 적립된 원큐씨앗은 2024년 12월 10일 자정 리셋 되었습니다.
              </Text>
              <Text style={styles.helpText}>
                ※ 2024년 12월 11일 이후 확인되는 원큐씨앗은 2025년 12월 10일까지만 유효합니다. (2024년 12월 10일 18시 이후 적립 분)
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Numeric Keypad Modal */}
      <NumericKeypad
        visible={showKeypad}
        onClose={() => setShowKeypad(false)}
        onNumberPress={handleNumberPress}
        onQuickAdd={(amount) => handleQuickAdd(amount)}
        onClear={() => setInputValue('')}
        title="원큐씨앗 입력"
        quickAddOptions={[
          { label: '+100', value: 100 },
          { label: '+1000', value: 1000 },
          { label: '+10000', value: 10000 },
          { label: '+30000', value: 30000 },
          { label: '지우기', value: 0 }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
  },
  balanceContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * SCALE,
  },
  balanceLabel: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontWeight: '500',
  },
  helpButton: {
    width: 20 * SCALE,
    height: 20 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputSection: {
    marginTop: 24 * SCALE,
  },
  inputLabel: {
    fontSize: 24 * SCALE,
    color: '#374151',
    marginBottom: 20 * SCALE,
    fontWeight: '500',
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 12 * SCALE,
  },
  inputText: {
    fontSize: 18 * SCALE,
    color: 'rgb(175, 175, 175)',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12 * SCALE,
    color: '#EF4444',
    marginTop: 8 * SCALE,
  },
  rulesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    marginTop: 24 * SCALE,
    marginBottom: 16 * SCALE,
  },
  rulesTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16 * SCALE,
  },
  ruleItem: {
    marginBottom: 8 * SCALE,
  },
  ruleText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 20 * SCALE,
    backgroundColor: '#F5F5F5',
  },
  conversionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
  },
  conversionButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  conversionButtonText: {
    color: '#fff',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  precautionsContainer: {
    padding: 12 * SCALE,
    marginTop: 8 * SCALE,
    marginBottom: 100 * SCALE,
  },
  precautionsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8 * SCALE,
  },
  precautionsTitle: {
    fontSize: 16 * SCALE,
    fontWeight: '500',
    color: '#111827',
  },
  precautionsContent: {
    marginTop: 16 * SCALE,
  },
  precautionsSubtitle: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12 * SCALE,
  },
  precautionsItem: {
    marginBottom: 8 * SCALE,
  },
  precautionsText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
  },
  helpContainer: {
    backgroundColor: '#fff',
    borderRadius: 16 * SCALE,
    marginHorizontal: 20 * SCALE,
    marginTop: 190 * SCALE,
    padding: 20 * SCALE,
    maxHeight: '60%',
    width: IPHONE_WIDTH * SCALE - 40 * SCALE,
    maxWidth: IPHONE_WIDTH * SCALE - 40 * SCALE,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16 * SCALE,
  },
  helpTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  helpContent: {
    gap: 12 * SCALE,
  },
  helpText: {
    fontSize: 14 * SCALE,
    color: '#374151',
    lineHeight: 20 * SCALE,
  },
}); 