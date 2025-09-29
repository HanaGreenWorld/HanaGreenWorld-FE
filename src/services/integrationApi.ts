import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARD_API_BASE_URL, API_BASE_URL } from '../utils/constants';
import { getCurrentUserIdFromToken } from '../utils/jwtUtils';

export interface HanamoneyInfo {
  membershipId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  membershipLevel: string;
  isActive: boolean;
  joinDate: string;
}

export interface TransactionInfo {
  transactionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  transactionDate: string;
}

export interface HanamoneyInfoResponse {
  hanamoneyInfo: HanamoneyInfo;
  recentTransactions: TransactionInfo[];
  responseTime: string;
}

export interface CardInfo {
  cardNumber: string;
  cardName: string;
  cardType: string;
  cardStatus: string;
  creditLimit: number;
  availableLimit: number;
  monthlyUsage: number;
  issueDate: string;
  expiryDate: string;
  benefits: string[];
}

export interface CardSummary {
  totalCardCount: number;
  activeCardCount: number;
  totalCreditLimit: number;
  totalAvailableLimit: number;
  monthlyTotalUsage: number;
  primaryCardType: string;
}

export interface CardListResponse {
  cards: CardInfo[];
  summary: CardSummary;
  responseTime: string;
}

export interface SavingsAccountInfo {
  accountNumber: string;
  productName: string;
  accountType: string;
  balance: number;
  interestRate: number;
  openDate: string;
  maturityDate: string;
  status: string;
}

export interface LoanAccountInfo {
  accountNumber: string;
  productName: string;
  loanType: string;
  loanAmount: number;
  remainingAmount: number;
  interestRate: number;
  baseRate?: number;
  preferentialRate?: number;
  monthlyPayment: number;
  startDate: string;
  maturityDate: string;
  status: string;
}

export interface InvestmentAccountInfo {
  accountNumber: string;
  productName: string;
  productType: string;
  investmentAmount: number;
  currentValue: number;
  profitLoss: number;
  profitLossRate: number;
  startDate: string;
  status: string;
}

export interface AccountSummary {
  totalAccounts: number;
  totalSavingsBalance: number;
  totalLoanAmount: number;
  totalInvestmentValue: number;
  netWorth: number;
  customerGrade: string;
}

export interface UserBankAccountInfo {
  id: number;
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountTypeDescription: string;
  accountHolderName: string;
  accountName?: string;
  balance: number;
  availableBalance: number;
  isActive: boolean;
  status: string;
  openDate: string;
  lastSyncAt: string;
}

export interface BankAccountsResponse {
  savingsAccounts?: any[];
  loanAccounts?: any[];
  investmentAccounts?: any[];
  demandDepositAccounts?: DemandDepositAccountInfo[];
  summary?: any;
  responseTime?: string;
}

export interface DemandDepositAccountInfo {
  accountNumber: string;
  accountName: string;
  accountType: string;
  accountHolderName: string;
  bankName: string;
  accountTypeDescription: string;
  balance: number;
  openDate: string;
  isActive: boolean;
  status: string;
}

export interface SavingsApplicationInfo {
  id: number;
  userId: number;
  savingsProductId: number;
  productName: string;
  applicationAmount: number;
  withdrawalAccountId: number;
  withdrawalAccountInfo: string;
  autoTransferEnabled: boolean;
  transferDay?: number;
  monthlyTransferAmount?: number;
  applicationStatus: string;
  applicationDate: string;
  createdAt: string;
}

class IntegrationApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    console.log('🌐 API 요청 시작');
    console.log('URL:', url);
    console.log('Options:', options);
    
    const token = await this.getAuthToken();
    console.log('토큰 상태:', token ? '있음' : '없음');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 내부 서비스 인증 헤더 추가
      'X-Internal-Service': 'aGFuYS1pbnRlcm5hbC1zZXJ2aWNlLTIwMjQ=', // 'hana-internal-service-2024'의 base64 인코딩
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    console.log('요청 헤더:', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API 오류 발생');
        console.error('상태코드:', response.status);
        console.error('오류 메시지:', errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ API 응답 성공:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ API 요청 실패:', error);
      throw error;
    }
  }

  /**
   * 하나머니 정보 조회
   */
  async getHanamoneyInfo(memberId: number): Promise<HanamoneyInfoResponse> {
    console.log('🪙 하나머니 정보 조회 시작:', memberId);
    
    // JWT 토큰에서 현재 사용자 ID 확인
    const currentUserId = await getCurrentUserIdFromToken();
    console.log('🔍 JWT에서 추출한 사용자 ID:', currentUserId);
    console.log('🔍 요청한 사용자 ID:', memberId);
    
    // 사용자 ID 불일치 검증
    if (currentUserId && currentUserId !== memberId) {
      console.error('🚨 보안 경고: JWT 토큰의 사용자 ID와 요청한 사용자 ID가 다릅니다!');
      console.error(`JWT 사용자 ID: ${currentUserId}, 요청 사용자 ID: ${memberId}`);
      throw new Error(`보안 위반: 다른 사용자의 데이터에 접근하려고 시도했습니다. (JWT: ${currentUserId}, 요청: ${memberId})`);
    }
    
    const response = await this.makeAuthenticatedRequest(
      `${CARD_API_BASE_URL}/api/integration/hanamoney-info`,
      {
        method: 'POST',
        body: JSON.stringify({
          memberId,
          customerConsent: true,
        }),
      }
    );

    console.log('🪙 하나머니 정보 응답:', response);
    return response.data;
  }

  /**
   * 카드 목록 조회
   */
  async getCardList(memberId: number): Promise<CardListResponse> {
    console.log('💳 카드 목록 조회 시작:', memberId);
    
    // JWT 토큰에서 현재 사용자 ID 확인
    const currentUserId = await getCurrentUserIdFromToken();
    console.log('🔍 JWT에서 추출한 사용자 ID:', currentUserId);
    console.log('🔍 요청한 사용자 ID:', memberId);
    
    // 사용자 ID 불일치 검증
    if (currentUserId && currentUserId !== memberId) {
      console.error('🚨 보안 경고: JWT 토큰의 사용자 ID와 요청한 사용자 ID가 다릅니다!');
      console.error(`JWT 사용자 ID: ${currentUserId}, 요청 사용자 ID: ${memberId}`);
      throw new Error(`보안 위반: 다른 사용자의 데이터에 접근하려고 시도했습니다. (JWT: ${currentUserId}, 요청: ${memberId})`);
    }
    
    console.log('💳 API URL:', `${CARD_API_BASE_URL}/api/integration/cards/${memberId}?consent=true`);
    
    try {
      const response = await this.makeAuthenticatedRequest(
        `${CARD_API_BASE_URL}/api/integration/cards/${memberId}?consent=true`
      );

      console.log('💳 카드 목록 응답 상태:', response.status);
      console.log('💳 카드 목록 응답 데이터:', JSON.stringify(response.data, null, 2));
      
      // 응답 데이터 구조 확인 및 정규화
      const responseData = response.data || response;
      console.log('💳 정규화된 응답 데이터:', responseData);
      
      // 응답 데이터가 올바른 구조인지 확인
      if (responseData && typeof responseData === 'object') {
        return {
          cards: responseData.cards || [],
          summary: responseData.summary || {
            totalCardCount: 0,
            activeCardCount: 0,
            totalCreditLimit: 0,
            totalAvailableLimit: 0,
            monthlyTotalUsage: 0,
            primaryCardType: ''
          },
          responseTime: responseData.responseTime || new Date().toISOString()
        };
      }
      
      // 응답이 예상과 다른 경우 빈 데이터 반환
      console.log('💳 응답 구조가 예상과 다름, 빈 데이터 반환');
      return {
        cards: [],
        summary: {
          totalCardCount: 0,
          activeCardCount: 0,
          totalCreditLimit: 0,
          totalAvailableLimit: 0,
          monthlyTotalUsage: 0,
          primaryCardType: ''
        },
        responseTime: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('💳 카드 목록 조회 실패:', error);
      
      // 400 에러 시 빈 데이터 반환 (기존 카드가 없을 수 있음)
      if (error.status === 400 || error.message?.includes('400')) {
        console.log('💳 400 에러 - 빈 데이터 반환');
        return {
          cards: [],
          summary: {
            totalCardCount: 0,
            activeCardCount: 0,
            totalCreditLimit: 0,
            totalAvailableLimit: 0,
            monthlyTotalUsage: 0,
            primaryCardType: ''
          },
          responseTime: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }

  /**
   * 은행 계좌 목록 조회
   */
  async getBankAccounts(memberId: number): Promise<BankAccountsResponse> {
    console.log('🏦 은행 계좌 조회 시작:', memberId);
    
    // JWT 토큰에서 현재 사용자 ID 확인
    const currentUserId = await getCurrentUserIdFromToken();
    console.log('🔍 JWT에서 추출한 사용자 ID:', currentUserId);
    console.log('🔍 요청한 사용자 ID:', memberId);
    
    // 사용자 ID 불일치 검증
    if (currentUserId && currentUserId !== memberId) {
      console.error('🚨 보안 경고: JWT 토큰의 사용자 ID와 요청한 사용자 ID가 다릅니다!');
      console.error(`JWT 사용자 ID: ${currentUserId}, 요청 사용자 ID: ${memberId}`);
      throw new Error(`보안 위반: 다른 사용자의 데이터에 접근하려고 시도했습니다. (JWT: ${currentUserId}, 요청: ${memberId})`);
    }

    console.log('🏦 API URL:', `${API_BASE_URL}/api/v1/integration/bank-accounts/${memberId}?consent=true`);

    try {
      const response = await this.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/v1/integration/bank-accounts/${memberId}?consent=true`
      );

      console.log('🏦 은행 계좌 응답:', response);
      
      // 응답 데이터 구조 확인 및 정규화
      const responseData = response.data || response;
      console.log('🏦 정규화된 응답 데이터:', responseData);
      
      // 응답 데이터가 올바른 구조인지 확인
      if (responseData && typeof responseData === 'object') {
        return {
          savingsAccounts: responseData.savingsAccounts || [],
          loanAccounts: responseData.loanAccounts || [],
          investmentAccounts: responseData.investmentAccounts || [],
          demandDepositAccounts: responseData.demandDepositAccounts || [],
          summary: responseData.summary || {
            totalAccounts: 0,
            totalSavingsBalance: 0,
            totalLoanAmount: 0,
            totalInvestmentValue: 0,
            netWorth: 0,
            customerGrade: 'BRONZE'
          },
          responseTime: responseData.responseTime || new Date().toISOString()
        };
      }
      
      // 응답이 예상과 다른 경우 빈 데이터 반환
      console.log('🏦 응답 구조가 예상과 다름, 빈 데이터 반환');
      return {
        savingsAccounts: [],
        loanAccounts: [],
        investmentAccounts: [],
        demandDepositAccounts: [],
        summary: {
          totalAccounts: 0,
          totalSavingsBalance: 0,
          totalLoanAmount: 0,
          totalInvestmentValue: 0,
          netWorth: 0,
          customerGrade: 'BRONZE'
        },
        responseTime: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('🏦 은행 계좌 조회 실패:', error);

      // 400 에러 시 빈 데이터 반환 (기존 계좌가 없을 수 있음)
      if (error.status === 400 || error.message?.includes('400')) {
        console.log('🏦 400 에러 - 빈 데이터 반환');
        return {
          savingsAccounts: [],
          loanAccounts: [],
          investmentAccounts: [],
          demandDepositAccounts: [],
          summary: {
            totalAccounts: 0,
            totalSavingsBalance: 0,
            totalLoanAmount: 0,
            totalInvestmentValue: 0,
            netWorth: 0,
            customerGrade: 'BRONZE'
          },
          responseTime: new Date().toISOString()
        };
      }

      throw error;
    }
  }

  /**
   * 통합 고객 정보 조회
   */
  async getIntegratedCustomerInfo(memberId: number) {
    console.log('📊 통합 고객 정보 조회 시작:', memberId);
    
    // JWT 토큰에서 현재 사용자 ID 확인
    const currentUserId = await getCurrentUserIdFromToken();
    console.log('🔍 JWT에서 추출한 사용자 ID:', currentUserId);
    console.log('🔍 요청한 사용자 ID:', memberId);
    
    // 사용자 ID 불일치 검증
    if (currentUserId && currentUserId !== memberId) {
      console.error('🚨 보안 경고: JWT 토큰의 사용자 ID와 요청한 사용자 ID가 다릅니다!');
      console.error(`JWT 사용자 ID: ${currentUserId}, 요청 사용자 ID: ${memberId}`);
      throw new Error(`보안 위반: 다른 사용자의 데이터에 접근하려고 시도했습니다. (JWT: ${currentUserId}, 요청: ${memberId})`);
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        `${CARD_API_BASE_URL}/api/integration/customer-info`,
        {
          method: 'POST',
          body: JSON.stringify({
            memberId,
            customerConsent: true,
            targetServices: ['BANK', 'CARD'],
            infoType: 'ALL',
          }),
        }
      );

      console.log('📊 통합 고객 정보 응답:', response);
      
      // 응답 데이터 구조 확인 및 정규화
      const responseData = response.data || response;
      console.log('📊 정규화된 응답 데이터:', responseData);
      
      // 응답 데이터가 올바른 구조인지 확인
      if (responseData && typeof responseData === 'object') {
        return {
          cardList: responseData.cardList || {
            availableLimit: 0,
            cards: [],
            primaryCardName: '',
            primaryCardType: '',
            totalCards: 0,
            totalCreditLimit: 0,
            usedAmount: 0
          },
          consumptionSummary: responseData.consumptionSummary || {
            categoryAmounts: {},
            recentTransactions: [],
            totalAmount: 0,
            totalCashback: 0
          },
          ecoBenefits: responseData.ecoBenefits || {
            achievementRate: 0,
            ecoCategories: {},
            ecoScore: 0,
            monthlyGoal: 0,
            totalEcoAmount: 0,
            totalEcoCashback: 0
          },
          transactions: responseData.transactions || [],
          responseTime: responseData.responseTime || new Date().toISOString()
        };
      }
      
      // 응답이 예상과 다른 경우 기본 데이터 반환
      console.log('📊 응답 구조가 예상과 다름, 기본 데이터 반환');
      return {
        cardList: {
          availableLimit: 0,
          cards: [],
          primaryCardName: '',
          primaryCardType: '',
          totalCards: 0,
          totalCreditLimit: 0,
          usedAmount: 0
        },
        consumptionSummary: {
          categoryAmounts: {},
          recentTransactions: [],
          totalAmount: 0,
          totalCashback: 0
        },
        ecoBenefits: {
          achievementRate: 0,
          ecoCategories: {},
          ecoScore: 0,
          monthlyGoal: 0,
          totalEcoAmount: 0,
          totalEcoCashback: 0
        },
        transactions: [],
        responseTime: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('📊 통합 고객 정보 조회 실패:', error);
      
      // 에러 시 기본 데이터 반환
      console.log('📊 에러 발생 - 기본 데이터 반환');
      return {
        cardList: {
          availableLimit: 0,
          cards: [],
          primaryCardName: '',
          primaryCardType: '',
          totalCards: 0,
          totalCreditLimit: 0,
          usedAmount: 0
        },
        consumptionSummary: {
          categoryAmounts: {},
          recentTransactions: [],
          totalAmount: 0,
          totalCashback: 0
        },
        ecoBenefits: {
          achievementRate: 0,
          ecoCategories: {},
          ecoScore: 0,
          monthlyGoal: 0,
          totalEcoAmount: 0,
          totalEcoCashback: 0
        },
        transactions: [],
        responseTime: new Date().toISOString()
      };
    }
  }

  /**
   * 사용자 은행 계좌 목록 조회 (사용자별로 계좌 조회)
   */
  async getUserBankAccounts(): Promise<{ data: UserBankAccountInfo[] }> {
    console.log('🏦 사용자 은행 계좌 목록 조회 시작');

    // 현재 사용자 ID 가져오기
    const currentUserId = await getCurrentUserIdFromToken();
    if (!currentUserId) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    // getBankAccounts 함수 재사용
    const bankAccounts = await this.getBankAccounts(currentUserId);

    // 입출금 계좌만 반환
    const demandDepositAccounts = bankAccounts.demandDepositAccounts || [];

    console.log('🏦 사용자 은행 계좌 목록 응답:', demandDepositAccounts);
    return { data: demandDepositAccounts as any };
  }

  /**
   * 사용자 은행 계좌 등록
   */
  async createUserBankAccount(accountData: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    accountHolderName: string;
    balance: number;
  }): Promise<{ data: UserBankAccountInfo }> {
    console.log('🏦 사용자 은행 계좌 등록 시작:', accountData);

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/bank-accounts`,
      {
        method: 'POST',
        body: JSON.stringify(accountData),
      }
    );

    console.log('🏦 사용자 은행 계좌 등록 응답:', response);
    return response;
  }

  /**
   * 활성 계좌 목록 조회 (적금 가입 시 선택용)
   */
  async getActiveUserBankAccounts(): Promise<{ data: BankAccountsResponse }> {
    console.log('🏦 활성 사용자 입출금 계좌 목록 조회 시작');
  
    // 현재 사용자 ID 가져오기
    const currentUserId = await getCurrentUserIdFromToken();
    if (!currentUserId) {
      throw new Error('사용자 인증이 필요합니다.');
    }
  
    console.log('🏦 API URL:', `${API_BASE_URL}/api/v1/integration/bank-accounts/${currentUserId}?consent=true`);
  
    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/v1/integration/bank-accounts/${currentUserId}?consent=true`,
      {
        method: 'GET',
      }
    );
  
    console.log('🏦 활성 사용자 입출금 계좌 목록 응답:', response);
    return response;
  }

  /**
   * 적금 가입 신청
   */
  async createSavingsApplication(applicationData: {
    savingProductId: number;
    applicationAmount: number;
    withdrawalAccountId: number;
    withdrawalAccountNumber: string;
    withdrawalBankName: string;
    autoTransferEnabled: boolean;
    transferDay?: number;
    monthlyTransferAmount?: number;
  }): Promise<{ data: SavingsApplicationInfo }> {
    console.log('💰 적금 가입 신청 시작:', applicationData);

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/savings-applications`,
      {
        method: 'POST',
        body: JSON.stringify(applicationData),
      }
    );

    console.log('💰 적금 가입 신청 응답:', response);
    return response;
  }

  /**
   * 적금 가입 신청 수정
   */
  async updateSavingsApplication(applicationId: number, updateData: {
    applicationAmount?: number;
    withdrawalAccountId?: number;
    autoTransferEnabled?: boolean;
    transferDay?: number;
    monthlyTransferAmount?: number;
  }): Promise<{ data: SavingsApplicationInfo }> {
    console.log('💰 적금 가입 신청 수정 시작:', { applicationId, updateData });

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/savings-applications/${applicationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );

    console.log('💰 적금 가입 신청 수정 응답:', response);
    return response;
  }

  /**
   * 적금 가입 신청 취소
   */
  async cancelSavingsApplication(applicationId: number): Promise<{ data: null }> {
    console.log('💰 적금 가입 신청 취소 시작:', applicationId);

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/savings-applications/${applicationId}`,
      {
        method: 'DELETE',
      }
    );

    console.log('💰 적금 가입 신청 취소 응답:', response);
    return response;
  }

  /**
   * 진행 중인 신청 수 조회
   */
  async getActiveApplicationCount(): Promise<{ data: number }> {
    console.log('💰 진행 중인 신청 수 조회 시작');

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/savings-applications/active-count`,
      {
        method: 'GET',
      }
    );

    console.log('💰 진행 중인 신청 수 응답:', response);
    return response;
  }

  /**
   * 특정 상품 보유 여부 확인
   */
  async checkProductOwnership(productId: number): Promise<{ hasProduct: boolean }> {
    console.log('🔍 상품 보유 여부 확인 시작:', productId);

    // 현재 사용자 ID 가져오기
    const currentUserId = await getCurrentUserIdFromToken();
    if (!currentUserId) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/api/v1/integration/check-product-ownership`,
      {
        method: 'POST',
        body: JSON.stringify({
          productId,
        }),
      }
    );

    console.log('🔍 상품 보유 여부 확인 응답:', response);
    return response.data;
  }
}

export const integrationApi = new IntegrationApiService();
