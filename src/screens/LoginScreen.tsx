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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// SafeAreaView는 PhoneFrame에서 처리됨
import { saveAuthToken, removeAuthToken, saveUserInfo } from '../utils/authUtils';
import { API_BASE_URL, COLORS, SCALE } from '../utils/constants';
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
    console.log('🔘 로그인 버튼 클릭됨!');
    console.log('📱 플랫폼:', Platform.OS);
    console.log('📝 입력된 아이디:', memberId);
    console.log('🔒 비밀번호 길이:', password.length);
    
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
        
        // 사용자 정보 저장
        if (data.memberId && data.email && data.name) {
          console.log('사용자 정보 받음:', { memberId: data.memberId, email: data.email, name: data.name });
          await saveUserInfo({
            memberId: data.memberId,
            email: data.email,
            name: data.name
          });
          console.log('사용자 정보 저장 완료');
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* 네비게이션바 */}
      <View style={styles.navigationBar}>
        <View style={styles.navLeft} />
        <Text style={styles.navTitle}>로그인</Text>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.navIcon}>
            <Ionicons name="home-outline" size={24 * SCALE} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIcon}>
            <Ionicons name="menu-outline" size={24 * SCALE} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 메인 안내 텍스트 */}
          <View style={styles.mainContent}>
            <Text style={styles.instructionText}>아이디와 비밀번호를{'\n'}입력해 주세요</Text>
            
            {/* 입력 필드들 */}
            <View style={styles.inputFieldsContainer}>
              <TextInput
                style={styles.inputField}
                value={memberId}
                onChangeText={setMemberId}
                placeholder="아이디"
                placeholderTextColor="#999999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.inputField}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor="#999999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 도움말 링크들 */}
            <View style={styles.helpLinksContainer}>
              <View style={styles.helpLinksRow}>
                <TouchableOpacity 
                  style={styles.helpLink}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.helpLinkText}>아이디 찾기</Text>
                </TouchableOpacity>
                <Text style={styles.helpLinkSeparator}>|</Text>
                <TouchableOpacity 
                  style={styles.helpLink}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.helpLinkText}>회원가입</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.usageGuideLink}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.usageGuideText}>아이디 로그인 이용 안내</Text>
                <View style={styles.questionMark}>
                  <Text style={styles.questionMarkText}>?</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            {/* 다른 로그인 방법 */}
            <TouchableOpacity 
              style={styles.otherLoginMethods}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.otherLoginText}>다른 로그인방법</Text>
              <Text style={styles.chevronIcon}>⌄</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: 'white',
  },
  statusBarTime: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBarIcon: {
    fontSize: 14,
    color: 'black',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navLeft: {
    width: 60, // 아이콘들과 균형을 맞추기 위한 공간
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    flex: 1,
    textAlign: 'center',
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: 60, // 왼쪽과 균형을 맞추기 위한 고정 너비
    justifyContent: 'flex-end',
  },
  navIcon: {
    padding: 5,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 28,
  },
  inputFieldsContainer: {
    marginBottom: 30,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    color: 'black',
  },
  helpLinksContainer: {
    marginBottom: 180,
  },
  helpLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44, // 최소 터치 영역 보장
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpLinkText: {
    fontSize: 14,
    color: '#666666',
  },
  helpLinkSeparator: {
    fontSize: 14,
    color: '#cccccc',
    marginHorizontal: 8,
  },
  usageGuideLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageGuideText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  questionMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMarkText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: COLORS.primary, // teal 색상
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 56, // 최소 높이 보장
    justifyContent: 'center', // 세로 중앙 정렬
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otherLoginMethods: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 48, // 최소 터치 영역 보장
  },
  otherLoginText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  chevronIcon: {
    fontSize: 16,
    color: '#666666',
  },
});

export default LoginScreen;
