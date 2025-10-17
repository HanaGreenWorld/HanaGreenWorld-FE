import { EcoMerchant, LocationSearchRequest } from '../types/merchant';

import { API_BASE_URL } from './constants';
import { getAuthToken } from './authUtils';

const MERCHANT_API_URL = `${API_BASE_URL}/merchants/location`;

// 주변 친환경 가맹점 검색
export const searchNearbyMerchants = async (request: LocationSearchRequest): Promise<EcoMerchant[]> => {
  try {
    console.log('API 요청 데이터:', request);
    console.log('API URL:', `${MERCHANT_API_URL}/nearby`);
    
    const token = await getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${MERCHANT_API_URL}/nearby`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);
    return data;
  } catch (error) {
    console.error('주변 가맹점 검색 실패:', error);
    throw error;
  }
};

// 카테고리별 가맹점 검색
export const searchMerchantsByCategory = async (category: string): Promise<EcoMerchant[]> => {
  try {
    const token = await getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${MERCHANT_API_URL}/category/${category}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('카테고리별 가맹점 검색 실패:', error);
    throw error;
  }
};

// 검증된 가맹점만 조회
export const getVerifiedMerchants = async (): Promise<EcoMerchant[]> => {
  try {
    const token = await getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${MERCHANT_API_URL}/verified`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('검증된 가맹점 조회 실패:', error);
    throw error;
  }
};

// 가맹점명으로 검색
export const searchMerchantsByName = async (keyword: string): Promise<EcoMerchant[]> => {
  try {
    const token = await getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${MERCHANT_API_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('가맹점명 검색 실패:', error);
    throw error;
  }
};

// 모든 활성 가맹점 조회
export const getAllActiveMerchants = async (): Promise<EcoMerchant[]> => {
  try {
    const token = await getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${MERCHANT_API_URL}/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('모든 활성 가맹점 조회 실패:', error);
    throw error;
  }
};

// 카테고리 목록 조회
export const getMerchantCategories = async (): Promise<string[]> => {
  try {
    const token = await getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${MERCHANT_API_URL}/categories`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error);
    throw error;
  }
};
