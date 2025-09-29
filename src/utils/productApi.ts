import { Platform } from 'react-native';
import { API_BASE_URL } from './constants';

// 하나은행 서버 URL (적금/대출 API용)
const getBankApiUrl = () => {
  const MAC_IP = '10.10.1.56';
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8082';
  }
  
  if (Platform.OS === 'ios') {
    return `http://${MAC_IP}:8082`;
  }
  
  return 'http://localhost:8082';
};

// 카드 상품 API
export interface CardProduct {
  productId: number;
  productName: string;
  productType: string;
  description: string;
  annualFee: number;
  creditLimit: number | null;
  benefits: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface SavingsProduct {
  productId: number;
  productName: string;
  productType: string;
  description: string;
  basicRate: number;
  maxRate: number;
  minAmount: number;
  maxAmount: number;
  termMonths: number;
  features: string;
  benefits: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface LoanProduct {
  productId: number;
  productName: string;
  productType: string;
  description: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  termMonths: number;
  features: string;
  benefits: string;
  requirements: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

// 고객 적금 계좌 정보
export interface SavingsAccount {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  productName: string;
  accountNumber: string;
  balance: number;
  startDate: string;
  maturityDate: string;
  baseRate: number;
  preferentialRate: number;
  finalRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 고객 대출 계좌 정보
export interface LoanAccount {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  productName: string;
  accountNumber: string;
  accountName: string;
  loanAmount: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 카드 상품 API
export const fetchCardProducts = async (): Promise<CardProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch card products:', error);
    throw error;
  }
};

export const fetchCardProductsByType = async (productType: string): Promise<CardProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/products/type/${productType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch card products by type:', error);
    throw error;
  }
};

export const fetchCardProduct = async (productId: number): Promise<CardProduct> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch card product:', error);
    throw error;
  }
};

// 재시도 로직을 위한 헬퍼 함수
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 타임아웃 설정 (30초로 증가)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: unknown) {
      lastError = error as Error;
      console.warn(`API 호출 시도 ${attempt}/${maxRetries} 실패:`, error);

      // AbortError인 경우 재시도
      if (error instanceof Error && error.name === 'AbortError' && attempt < maxRetries) {
        // 재시도 전 대기 (지수 백오프)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`${delay}ms 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
};

// 적금 상품 API
export const fetchSavingsProducts = async (): Promise<SavingsProduct[]> => {
  try {
    const response = await fetchWithRetry(`${getBankApiUrl()}/savings/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch savings products:', error);
    throw error;
  }
};

export const fetchSavingsProductsByType = async (productType: string): Promise<SavingsProduct[]> => {
  try {
    const response = await fetch(`${getBankApiUrl()}/savings/products/type/${productType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch savings products by type:', error);
    throw error;
  }
};

// 대출 상품 API
export const fetchLoanProducts = async (): Promise<LoanProduct[]> => {
  try {
    const response = await fetchWithRetry(`${getBankApiUrl()}/loans/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch loan products:', error);
    throw error;
  }
};

export const fetchLoanProductsByType = async (productType: string): Promise<LoanProduct[]> => {
  try {
    const response = await fetch(`${getBankApiUrl()}/loans/products/type/${productType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch loan products by type:', error);
    throw error;
  }
};

// 고객 적금 계좌 정보 API
export const fetchUserSavingsAccounts = async (userId: number): Promise<SavingsAccount[]> => {
  try {
    const response = await fetch(`${getBankApiUrl()}/savings/accounts/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch user savings accounts:', error);
    throw error;
  }
};

// 고객 대출 계좌 정보 API
export const fetchUserLoanAccounts = async (userId: number): Promise<LoanAccount[]> => {
  try {
    const response = await fetch(`${getBankApiUrl()}/loans/accounts/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch user loan accounts:', error);
    throw error;
  }
};
