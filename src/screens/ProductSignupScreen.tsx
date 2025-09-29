import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SCALE, COLORS } from '../utils/constants';
import NumericKeypad from '../components/NumericKeypad';
import { integrationApi, UserBankAccountInfo } from '../services/integrationApi';

 

interface ProductSignupScreenProps {
  onNavigateBack?: () => void;
}

export function ProductSignupScreen({ onNavigateBack }: ProductSignupScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<UserBankAccountInfo | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [showSavingsKeypad, setShowSavingsKeypad] = useState(false);
  const [isAutoTransfer, setIsAutoTransfer] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transferDate, setTransferDate] = useState(new Date());
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [signupResponse, setSignupResponse] = useState<any>(null);

  // 계좌 관련 상태
  const [userAccounts, setUserAccounts] = useState<UserBankAccountInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  // 계좌 데이터 로딩
  useEffect(() => {
    loadUserAccounts();
  }, []);

  const loadUserAccounts = async () => {
    try {
      setLoading(true);
      const response = await integrationApi.getActiveUserBankAccounts();
      const accounts = response.data.demandDepositAccounts || [];
      setUserAccounts(accounts as any);
      // 첫 번째 계좌를 기본 선택
      if (accounts.length > 0) {
        setSelectedAccount(accounts[0] as any);
      }
    } catch (error) {
      console.error('계좌 목록 로딩 실패:', error);
      Alert.alert('오류', '계좌 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 1년 후 만기일 계산
  const getMaturityDate = () => {
    const today = new Date();
    const maturityDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const year = maturityDate.getFullYear();
    const month = String(maturityDate.getMonth() + 1).padStart(2, '0');
    const day = String(maturityDate.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일 만기로`;
  };

  // 키보드 관련 함수들
  const handleSavingsNumberPress = (num: string) => {
    if (num === 'X') {
      setSavingsAmount(prev => prev.slice(0, -1));
    } else if (num === '완료') {
      // 완료 버튼을 누를 때 금액 범위 확인 및 조정
      const currentAmount = parseInt(savingsAmount.replace(/[^0-9]/g, '') || '0');
      let adjustedAmount = currentAmount;

      if (currentAmount < 10000) {
        adjustedAmount = 10000;
      } else if (currentAmount > 500000) {
        adjustedAmount = 500000;
      }

      if (adjustedAmount !== currentAmount) {
        setSavingsAmount(adjustedAmount.toString());
      }

      setShowSavingsKeypad(false);
    } else {
      const newAmount = savingsAmount + num;
      const numericAmount = parseInt(newAmount.replace(/[^0-9]/g, '') || '0');

      // 입력 중 실시간으로 범위 확인 및 조정
      let adjustedAmount = numericAmount;
      if (numericAmount > 500000) {
        adjustedAmount = 500000;
      }

      setSavingsAmount(adjustedAmount.toString());
    }
  };

  const handleSavingsQuickAdd = (amount: number) => {
    const currentAmount = parseInt(savingsAmount.replace(/[^0-9]/g, '') || '0');
    let newAmount = currentAmount + amount;

    // 범위 확인 및 조정
    if (newAmount < 10000) {
      newAmount = 10000;
    } else if (newAmount > 500000) {
      newAmount = 500000;
    }

    setSavingsAmount(newAmount.toString());
  };

  const handleSavingsClear = () => {
    setSavingsAmount('');
  };

  const formatSavingsAmount = (amount: string) => {
    if (!amount) return '';
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''));
    if (isNaN(numAmount)) return '';
    return numAmount.toLocaleString() + '원';
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepQuestion}>얼마를 저축할까요?</Text>

      <View style={styles.savingsSection}>
        <Text style={styles.maturityDate}>{getMaturityDate()}</Text>
        <Pressable
          style={styles.amountSection}
          onPress={() => setShowSavingsKeypad(true)}
        >
          <Text style={[styles.amountText, !savingsAmount && styles.amountTextPlaceholder]}>
            {savingsAmount ? formatSavingsAmount(savingsAmount) : '1만원 ~ 50만원'}
          </Text>
          <Text style={styles.amountLabel}>가입하기</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepQuestion}>정기적으로 저축할까요?</Text>

      <View style={styles.autoTransferSection}>
             <Pressable
         style={styles.autoTransferHeader}
         onPress={() => setIsAutoTransfer(!isAutoTransfer)}
       >
         <View style={[styles.autoTransferIcon, !isAutoTransfer && styles.autoTransferIconInactive]}>
           {isAutoTransfer && <Ionicons name="checkmark" size={16} color="white" />}
         </View>
         <View style={styles.titleAndHelpContainer}>
           <Text style={styles.autoTransferTitle}>자동이체 신청</Text>
           <View style={styles.helpIconWrapper}>
             <Ionicons name="help-circle-outline" size={16} color="white" />
           </View>
         </View>
       </Pressable>

        {isAutoTransfer && (
          <View style={styles.autoTransferDetails}>
            <Pressable
              style={styles.transferDateSection}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.transferDateContainer}>
                <Text style={styles.transferDate}>
                  매월 {transferDate.getDate().toString().padStart(2, '0')}일
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </View>
            </Pressable>

            {/* DatePicker - 날짜 버튼 바로 아래에 배치 */}
            {showDatePicker && (
              <DateTimePicker
                value={transferDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setTransferDate(selectedDate);
                  }
                }}
              />
            )}
            <View style={styles.transferAmount}>
              <Text style={styles.transferAmountText}>
                {savingsAmount ? formatSavingsAmount(savingsAmount) : '금액을 입력해주세요'}
              </Text>
              <Text style={styles.transferAmountSuffix}> 씩 저축하기</Text>
            </View>
            <Text style={styles.transferInfo}>
              <Text style={styles.transferInfoHighlight}>2025.09.{transferDate.getDate().toString().padStart(2, '0')}</Text>부터 <Text style={styles.transferInfoHighlight}>매월 {transferDate.getDate().toString().padStart(2, '0')}일</Text> <Text style={styles.transferInfoHighlight}>{savingsAmount ? formatSavingsAmount(savingsAmount) : '금액'}</Text>씩 자동이체 됩니다.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepQuestion}>어느 계좌에서 출금할까요?</Text>

      <View style={styles.accountSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
          </View>
        ) : userAccounts.length === 0 ? (
          <View style={styles.noAccountContainer}>
            <Text style={styles.noAccountText}>등록된 계좌가 없습니다.</Text>
            <Pressable style={styles.addAccountButton}>
              <Text style={styles.addAccountText}>계좌 등록하기</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.accountItem}
            onPress={() => setShowAccountSelector(true)}
          >
            <View style={styles.accountIcon}>
              <Image source={require('../../assets/hana_logo.png')} style={styles.accountIconImage} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountType}>
                {selectedAccount?.accountType === 'CHECKING' ? '입출금' : (selectedAccount?.accountType || '계좌 선택')}
              </Text>
              <Text style={styles.accountNumber}>{selectedAccount?.accountNumber || '계좌를 선택해주세요'}</Text>
              <Text style={styles.accountBalance}>
                출금가능금액 {selectedAccount?.balance?.toLocaleString() || '0'}원
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </Pressable>
        )}

        <Pressable style={styles.otherAccountButton}>
          <Ionicons name="business" size={20} color="#6B7280" />
          <Text style={styles.otherAccountText}>다른 금융계좌에서 출금하기</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </Pressable>
      </View>

      {/* 계좌 선택 모달 */}
      <Modal
        visible={showAccountSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.accountSelectorContainer}>
            <View style={styles.accountSelectorHeader}>
              <Text style={styles.accountSelectorTitle}>출금 계좌 선택</Text>
              <Pressable
                style={styles.accountSelectorClose}
                onPress={() => setShowAccountSelector(false)}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>

            <ScrollView style={styles.accountSelectorList}>
              {userAccounts.map((account, index) => {
                const applicationAmount = parseInt(savingsAmount.replace(/[^0-9]/g, '')) || 0;
                const accountBalance = account.balance || 0;
                const isInsufficient = applicationAmount > accountBalance;

                return (
                  <Pressable
                    key={account.id || `account-${index}`}
                    style={[
                      styles.accountSelectorItem,
                      selectedAccount?.id === account.id && styles.accountSelectorItemSelected,
                      isInsufficient && styles.accountSelectorItemInsufficient
                    ]}
                    onPress={() => {
                      // 가입금액과 잔액 비교
                      if (applicationAmount > accountBalance) {
                        Alert.alert(
                          '잔액 부족',
                          `선택한 계좌의 잔액이 부족합니다.\n\n현재 잔액: ${accountBalance.toLocaleString()}원\n필요 금액: ${applicationAmount.toLocaleString()}원\n\n더 많은 금액이 있는 계좌를 선택해주세요.`
                        );
                        return;
                      }

                      setSelectedAccount(account);
                      setShowAccountSelector(false);
                    }}
                  >
                    <View style={styles.accountIcon}>
                      <Image source={require('../../assets/hana_logo.png')} style={styles.accountIconImage} />
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountType}>{account.accountType}</Text>
                      <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                      <Text style={[
                        styles.accountBalance,
                        isInsufficient && styles.accountBalanceInsufficient
                      ]}>
                        잔액: {account.balance?.toLocaleString() || '0'}원
                        {isInsufficient && ' (부족)'}
                      </Text>
                    </View>
                    {selectedAccount?.id === account.id && (
                      <Ionicons name="checkmark" size={20} color="#008B8B" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );


  const renderCompletionScreen = () => (
    <View style={styles.completionContainer}>
      <View style={styles.completionIcon}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>
      <Text style={styles.completionTitle}>적금 가입이 완료되었습니다!</Text>
      <Text style={styles.completionSubtitle}>하나green세상 적금</Text>

      <View style={styles.completionDetails}>
        {signupResponse?.savingsAccountNumber && (
          <View style={styles.completionDetailItem}>
            <Text style={styles.completionDetailLabel}>적금계좌번호</Text>
            <Text style={styles.completionDetailValue}>{signupResponse.savingsAccountNumber}</Text>
          </View>
        )}
        <View style={styles.completionDetailItem}>
          <Text style={styles.completionDetailLabel}>가입금액</Text>
          <Text style={styles.completionDetailValue}>
            {savingsAmount ? formatSavingsAmount(savingsAmount) : '금액을 입력해주세요'}
          </Text>
        </View>
        <View style={styles.completionDetailItem}>
          <Text style={styles.completionDetailLabel}>출금계좌</Text>
          <Text style={styles.completionDetailValue}>
            {(() => {
              const accountNumber = signupResponse?.withdrawalAccountNumber || selectedAccount?.accountNumber;
              const bankName = signupResponse?.withdrawalBankName || selectedAccount?.bankName || '하나은행';
              return accountNumber ? `${bankName} ${accountNumber}` : '계좌를 선택해주세요';
            })()}
          </Text>
        </View>
        <View style={styles.completionDetailItem}>
          <Text style={styles.completionDetailLabel}>만기일</Text>
          <Text style={styles.completionDetailValue}>{getMaturityDate().replace(' 만기로', '')}</Text>
        </View>
        {signupResponse?.autoTransferEnabled && (
          <>
            <View style={styles.completionDetailItem}>
              <Text style={styles.completionDetailLabel}>자동이체</Text>
              <Text style={styles.completionDetailValue}>
                {signupResponse.autoTransferInfo || '매월 ' + signupResponse.transferDay + '일'}
              </Text>
            </View>
            <View style={styles.completionDetailItem}>
              <Text style={styles.completionDetailLabel}>이체금액</Text>
              <Text style={styles.completionDetailValue}>
                {signupResponse.monthlyTransferAmount ? formatSavingsAmount(signupResponse.monthlyTransferAmount.toString()) : '금액을 입력해주세요'}
              </Text>
            </View>
          </>
        )}
        {/* Debug: 자동이체 정보 확인 */}
        {console.log('signupResponse:', signupResponse)}
        {console.log('autoTransferEnabled:', signupResponse?.autoTransferEnabled)}
        {console.log('transferDay:', signupResponse?.transferDay)}
        {console.log('monthlyTransferAmount:', signupResponse?.monthlyTransferAmount)}
      </View>
      

    </View>
  );

  const getCurrentStepContent = () => {
    if (showCompletionScreen) {
      return renderCompletionScreen();
    }

    switch (currentStep) {
      case 1: return renderStep1(); // 저축 금액
      case 2: return renderStep2(); // 자동이체
      case 3: return renderStep3(); // 계좌 선택
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return savingsAmount.length > 0; // 저축 금액 입력 확인
      case 2: return true; // 자동이체
      case 3: return selectedAccount !== null; // 계좌 선택 확인
      default: return false;
    }
  };

  const handleContinue = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // 가입 신청 처리
      await submitApplication();
    }
  };

  const submitApplication = async () => {
    if (!selectedAccount) {
      Alert.alert('오류', '출금 계좌를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      const applicationData = {
        savingProductId: 1, // TODO: 실제 적금 상품 ID로 변경
        applicationAmount: parseInt(savingsAmount.replace(/[^0-9]/g, '')),
        withdrawalAccountId: selectedAccount.id,
        withdrawalAccountNumber: selectedAccount.accountNumber,
        withdrawalBankName: selectedAccount.bankName || '하나은행', // 기본값 설정
        autoTransferEnabled: isAutoTransfer,
        transferDay: isAutoTransfer ? transferDate.getDate() : undefined,
        monthlyTransferAmount: isAutoTransfer ? parseInt(savingsAmount.replace(/[^0-9]/g, '')) : undefined,
      };

      const response = await integrationApi.createSavingsApplication(applicationData);

      console.log('가입 신청 완료:', response);
      console.log('response.data:', response.data);
      setSignupResponse(response.data);
      setShowCompletionScreen(true);
    } catch (error) {
      console.error('가입 신청 실패:', error);
      Alert.alert('오류', '가입 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior="height"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onNavigateBack}>
          <Ionicons name="close" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>상품가입</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {getCurrentStepContent()}
      </ScrollView>

      {/* 저축 금액 키보드 */}
      <NumericKeypad
        visible={showSavingsKeypad}
        onClose={() => setShowSavingsKeypad(false)}
        onNumberPress={handleSavingsNumberPress}
        onQuickAdd={handleSavingsQuickAdd}
        onClear={handleSavingsClear}
        title="1만원 이상 ~ 50만원 이하"
        quickAddOptions={[
          { label: "+1만", value: 10000 },
          { label: "+5만", value: 50000 },
          { label: "+10만", value: 100000 },
          { label: "+50만", value: 500000 },
          { label: "지우기", value: 0 },
        ]}
      />

      {/* 하단 버튼 */}
      <View style={styles.bottomButton}>
        <Pressable
          style={[styles.mainButton, !canProceed() && styles.mainButtonDisabled]}
          onPress={showCompletionScreen ? () => onNavigateBack?.() : handleContinue}
          disabled={!canProceed()}
        >
          <Text style={[styles.mainButtonText, !canProceed() && styles.mainButtonTextDisabled]}>
            {showCompletionScreen ? '확인' : (currentStep === 3 ? '가입신청' : '계속')}
          </Text>
        </Pressable>
      </View>

      {/* 상담 버튼 */}
      <Pressable style={styles.consultationButton}>
        <Ionicons name="chatbubble" size={20} color="white" />
        <Text style={styles.consultationButtonText}>상담</Text>
      </Pressable>

      {/* 성공 모달 */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successModalIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text style={styles.successModalTitle}>가입이 완료되었습니다!</Text>
            <Text style={styles.successModalText}>
              정보가 성공적으로 확인되었습니다.{'\n'}
              다음 단계로 진행해주세요.
            </Text>
            <Pressable
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingTop: 24 * SCALE,
    paddingBottom: 16 * SCALE,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8 * SCALE,
    marginLeft: 8 * SCALE,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20 * SCALE,
  },
  stepQuestion: {
    fontSize: 28 * SCALE,
    fontWeight: '400',
    color: '#111827',
    marginVertical: 20 * SCALE,
  },
  stepDescription: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    lineHeight: 24 * SCALE,
    marginBottom: 30 * SCALE,
  },
  accountSection: {
    backgroundColor: 'white',
    marginBottom: 20 * SCALE,
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accountIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    // backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 12 * SCALE,
  },
  accountIconImage: {
    width: 30 * SCALE,
    height: 30 * SCALE,
    resizeMode: 'contain',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12 * SCALE,
  },
  accountType: {
    fontSize: 16 * SCALE,
    color: '#008B8B',
    fontWeight: '500',
    marginBottom: 4 * SCALE,
  },
  accountNumber: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#008B8B',
    marginBottom: 4 * SCALE,
    flex: 1,
  },
  accountBalance: {
    fontSize: 14 * SCALE,
    color: '#9CA3AF',
    marginTop: 2 * SCALE,
  },
  accountBalanceInsufficient: {
    color: '#EF4444',
    fontWeight: '600',
  },
  otherAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 16 * SCALE,
  },
  otherAccountText: {
    flex: 1,
    fontSize: 16 * SCALE,
    color: '#111827',
    marginLeft: 12 * SCALE,
  },
  savingsSection: {
    paddingVertical: 20 * SCALE,
  },
  maturityDate: {
    fontSize: 20 * SCALE,
    color: '#111827',
    marginBottom: 20 * SCALE,
    textDecorationLine: 'underline',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 * SCALE,
  },
  amountText: {
    fontSize: 20 * SCALE,
    fontWeight: '500',
    color: '#008B8B',
    textDecorationLine: 'underline',
  },
  amountTextPlaceholder: {
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  amountLabel: {
    fontSize: 20 * SCALE,
    color: '#111827',
    marginLeft: 8 * SCALE,
  },
  autoTransferSection: {
    paddingVertical: 20 * SCALE,
  },
  autoTransferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20 * SCALE,
  },
  autoTransferIcon: {
    width: 24 * SCALE,
    height: 24 * SCALE,
    borderRadius: 16 * SCALE,
    backgroundColor: '#008B8B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12 * SCALE,
  },
  autoTransferIconInactive: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  helpIconWrapper: {
    width: 20 * SCALE,
    height: 20 * SCALE,
    borderRadius: 12 * SCALE,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoTransferTitle: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#111827',
  },
  titleAndHelpContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * SCALE,
  },
  infoButton: {
    padding: 4 * SCALE,
  },
  autoTransferDetails: {
    paddingLeft: 8 * SCALE,
  },
  transferDate: {
    fontSize: 20 * SCALE,
    color: '#008B8B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  transferDateSection: {
    marginBottom: 20 * SCALE,
  },
  transferDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * SCALE,
  },
  transferAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12 * SCALE,
  },
  transferAmountText: {
    fontSize: 20 * SCALE,
    fontWeight: '600',
    color: '#008B8B',
    textDecorationLine: 'underline',
  },
  transferAmountSuffix: {
    fontSize: 20 * SCALE,
    fontWeight: '500',
    color: '#111827',
  },
  transferInfo: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    lineHeight: 20 * SCALE,
  },
  transferInfoHighlight: {
    color: '#008B8B',
    fontWeight: '600',
  },
  // 완료 화면 스타일
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40 * SCALE,
  },
  completionIcon: {
    marginBottom: 24 * SCALE,
  },
  completionTitle: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8 * SCALE,
  },
  completionSubtitle: {
    fontSize: 18 * SCALE,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40 * SCALE,
  },
  completionDetails: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12 * SCALE,
    padding: 20 * SCALE,
    marginBottom: 40 * SCALE,
  },
  completionDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  completionDetailLabel: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
  },
  completionDetailValue: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    color: '#111827',
  },
  completionButton: {
    backgroundColor: '#008B8B',
    borderRadius: 12 * SCALE,
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 40 * SCALE,
    width: '100%',
    alignItems: 'center',
  },
  completionButtonText: {
    color: 'white',
    fontSize: 18 * SCALE,
    fontWeight: '600',
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
    backgroundColor: '#008B8B',
    borderRadius: 12 * SCALE,
    paddingVertical: 16 * SCALE,
    alignItems: 'center',
  },
  mainButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  mainButtonText: {
    color: 'white',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  mainButtonTextDisabled: {
    color: '#9CA3AF',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16 * SCALE,
    padding: 24 * SCALE,
    width: '85%',
    maxWidth: 320 * SCALE,
    alignItems: 'center',
  },
  successModalIcon: {
    marginBottom: 16 * SCALE,
  },
  successModalTitle: {
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12 * SCALE,
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    lineHeight: 24 * SCALE,
    textAlign: 'center',
    marginBottom: 24 * SCALE,
  },
  successModalButton: {
    backgroundColor: '#008B8B',
    borderRadius: 8 * SCALE,
    paddingHorizontal: 24 * SCALE,
    paddingVertical: 12 * SCALE,
  },
  successModalButtonText: {
    color: 'white',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },

  // 계좌 선택 관련 스타일
  loadingContainer: {
    padding: 20 * SCALE,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
  },
  noAccountContainer: {
    padding: 20 * SCALE,
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 16 * SCALE,
    color: '#6B7280',
    marginBottom: 16 * SCALE,
  },
  addAccountButton: {
    backgroundColor: '#008B8B',
    borderRadius: 8 * SCALE,
    paddingHorizontal: 16 * SCALE,
    paddingVertical: 12 * SCALE,
  },
  addAccountText: {
    color: 'white',
    fontSize: 14 * SCALE,
    fontWeight: '600',
  },
  accountSelectorContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20 * SCALE,
    borderTopRightRadius: 20 * SCALE,
    maxHeight: '70%',
    width: '90%',
    alignSelf: 'center',
  },
  accountSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20 * SCALE,
    paddingVertical: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accountSelectorTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#111827',
  },
  accountSelectorClose: {
    padding: 4 * SCALE,
  },
  accountSelectorList: {
    maxHeight: 300 * SCALE,
  },
  accountSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 60 * SCALE,
  },
  accountSelectorItemSelected: {
    backgroundColor: '#F0FDFA',
  },
  accountSelectorItemInsufficient: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
}); 