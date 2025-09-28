/**
 * JWT 토큰 디코딩 유틸리티
 */

export interface JWTDecodedPayload {
  email: string;
  memberId: number;
  iat: number;
  exp: number;
}

/**
 * JWT 토큰을 디코딩하여 페이로드 정보를 반환
 */
export const decodeJWT = (token: string): JWTDecodedPayload | null => {
  try {
    // JWT 토큰은 header.payload.signature 형태
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // payload 부분 디코딩 (base64url)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);
    
    console.log('🔍 JWT 토큰 디코딩 결과:', parsedPayload);
    return parsedPayload;
  } catch (error) {
    console.error('JWT 토큰 디코딩 실패:', error);
    return null;
  }
};

/**
 * 현재 저장된 JWT 토큰에서 사용자 ID 추출
 */
export const getCurrentUserIdFromToken = async (): Promise<number | null> => {
  try {
    const { getAuthToken } = await import('./authUtils');
    const token = await getAuthToken();
    
    if (!token) {
      console.log('🔍 JWT 토큰이 없습니다');
      return null;
    }

    const decoded = decodeJWT(token);
    if (decoded && decoded.memberId) {
      console.log('🔍 JWT에서 추출한 사용자 ID:', decoded.memberId);
      return decoded.memberId;
    }
    
    return null;
  } catch (error) {
    console.error('JWT에서 사용자 ID 추출 실패:', error);
    return null;
  }
};

