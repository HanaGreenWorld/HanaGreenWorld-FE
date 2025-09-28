import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveAuthToken, removeAuthToken } from '../utils/authUtils';
import { API_BASE_URL } from '../utils/constants';
import { testNetworkConnection, testLogin } from '../utils/testApi';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 네트워크 테스트 함수
  const handleTestNetwork = async () => {
    console.log('=== 네트워크 테스트 시작 ===');
    await testNetworkConnection();
  };

  const handleTestLogin = async () => {
    console.log('=== 로그인 테스트 시작 ===');
    await testLogin();
  };

  const handleLogin = async () => {
    if (!memberId.trim() || !password.trim()) {
      Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    // 로그인 요청 로그
    console.log('=== 로그인 요청 시작 ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('요청 URL:', `${API_BASE_URL}/auth/login`);
    console.log('요청 메서드: POST');
    console.log('요청 헤더: Content-Type: application/json');
    console.log('요청 바디:', { loginId: memberId.trim(), password: '***' });
    console.log('요청 시간:', new Date().toISOString());

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          loginId: memberId.trim(),
          password: password,
        }),
        // iOS에서 네트워크 연결 안정성을 위한 설정
        ...(Platform.OS === 'ios' && {
          timeout: 30000, // 30초 타임아웃
        }),
      });

      // 응답 로그
      console.log('=== 응답 수신 ===');
      console.log('응답 상태:', response.status);
      console.log('응답 상태 텍스트:', response.statusText);
      console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
      console.log('응답 시간:', new Date().toISOString());

      const data = await response.json();
      console.log('응답 바디:', data);

      if (response.ok) {
        // 로그인 성공
        console.log('=== 로그인 성공 ===');
        console.log('성공 데이터:', data);
        
        // JWT 토큰 저장
        if (data.accessToken) {
          console.log('JWT 토큰 받음:', data.accessToken);
          await saveAuthToken(data.accessToken);
          console.log('JWT 토큰 저장 완료');
        }
        
        console.log('Dashboard로 이동 시도...');
        
        // 웹에서 즉시 네비게이션 처리
        navigation.navigate('Dashboard');
        
        // 사용자에게 성공 메시지 표시 (선택사항)
        setTimeout(() => {
          Alert.alert('성공', '로그인이 완료되었습니다!');
        }, 100);
      } else {
        // 로그인 실패
        console.log('=== 로그인 실패 ===');
        console.log('실패 상태:', response.status);
        console.log('실패 메시지:', data.message);
        Alert.alert('오류', data.message || '로그인이 실패했습니다.');
      }
    } catch (error) {
      console.error('=== 로그인 에러 ===');
      console.error('에러 타입:', error instanceof Error ? error.constructor.name : 'Unknown');
      console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
      console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('에러 시간:', new Date().toISOString());
      
      // 더 구체적인 에러 메시지 제공
      let errorMessage = '네트워크 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Network')) {
          errorMessage = '서버에 연결할 수 없습니다.\n\n확인사항:\n• 백엔드 서버가 실행 중인지 확인\n• 네트워크 연결 상태 확인\n• IP 주소 설정 확인';
        } else if (error.message.includes('timeout')) {
          errorMessage = '서버 응답 시간이 초과되었습니다.\n잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setIsLoading(false);
      console.log('=== 로그인 처리 완료 ===');
      console.log('로딩 상태 해제:', new Date().toISOString());
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  // 토큰 초기화 함수 (테스트용)
  const handleClearToken = async () => {
    try {
      await removeAuthToken();
      Alert.alert('완료', '저장된 토큰이 삭제되었습니다.');
    } catch (error) {
      Alert.alert('오류', '토큰 삭제에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 로고 영역 */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/hana_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>하나green세상</Text>
            <Text style={styles.subtitle}>친환경 금융 서비스</Text>
          </View>

          {/* 로그인 폼 */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>아이디</Text>
              <TextInput
                style={styles.input}
                value={memberId}
                onChangeText={setMemberId}
                placeholder="아이디를 입력하세요"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 테스트 버튼들 */}
            <View style={styles.testButtons}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestNetwork}
              >
                <Text style={styles.testButtonText}>🔍 네트워크 테스트</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestLogin}
              >
                <Text style={styles.testButtonText}>🔑 로그인 테스트</Text>
              </TouchableOpacity>
            </View>

            {/* 토큰 초기화 버튼 */}
            <TouchableOpacity
              style={styles.clearTokenButton}
              onPress={handleClearToken}
            >
              <Text style={styles.clearTokenButtonText}>🗑️ 토큰 초기화</Text>
            </TouchableOpacity>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <TouchableOpacity style={styles.signupLink} onPress={handleSignup}>
              <Text style={styles.signupText}>
                계정이 없으신가요? <Text style={styles.signupTextBold}>회원가입</Text>
              </Text>
            </TouchableOpacity>

            {/* 테스트 계정 정보 */}
            <View style={styles.testAccountContainer}>
              <Text style={styles.testAccountTitle}>테스트 계정</Text>
              <Text style={styles.testAccountText}>아이디: testuser</Text>
              <Text style={styles.testAccountText}>비밀번호: test1234!</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  signupTextBold: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  testAccountContainer: {
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  testAccountInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  testAccountTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 6,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testAccountText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  clearTokenButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearTokenButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
