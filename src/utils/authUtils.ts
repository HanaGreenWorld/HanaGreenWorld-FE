import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './constants';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  email: string;
  name: string;
  message: string;
}

/**
 * 로그인 API 호출
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    console.log('🔐 로그인 시도:', `${API_BASE_URL}/auth/login`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ 로그인 실패:', errorData);
      throw new Error(errorData.message || '로그인에 실패했습니다.');
    }

    const data = await response.json();
    console.log('✅ 로그인 성공:', data);
    return data;
  } catch (error) {
    console.error('❌ 로그인 에러:', error);
    
    // 네트워크 에러인 경우 더 친화적인 메시지 제공
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('네트워크 연결을 확인해주세요. 서버가 실행 중인지 확인하세요.');
    }
    
    throw error;
  }
};

/**
 * JWT 토큰 저장
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('JWT 토큰 저장 완료');
  } catch (error) {
    console.error('Failed to save auth token:', error);
    throw new Error('토큰 저장에 실패했습니다.');
  }
};

/**
 * JWT 토큰 가져오기
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * JWT 토큰 삭제 (로그아웃)
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('JWT 토큰 삭제 완료');
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

/**
 * 로그인 상태 확인
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    console.log('authUtils: 토큰 확인 결과:', token ? '토큰 존재' : '토큰 없음');
    
    // 토큰이 있으면 로그인된 상태로 간주
    return token !== null;
  } catch (error) {
    console.error('Failed to check login status:', error);
    return false;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    await removeAuthToken();
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
