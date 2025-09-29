// 네트워크 테스트용 유틸리티
export const testNetworkConnection = async () => {
  const urls = [
    'http://192.168.123.5:8080/auth/test',
    'http://10.0.2.2:8080/auth/test',
    'http://localhost:8080/auth/test'
  ];

  console.log('=== 네트워크 연결 테스트 시작 ===');
  
  for (const url of urls) {
    try {
      console.log(`테스트 중: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`✅ 성공: ${url} - Status: ${response.status}`);
      const text = await response.text();
      console.log(`응답: ${text}`);
      return { success: true, url, response: text };
    } catch (error) {
      console.log(`❌ 실패: ${url} - Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('=== 모든 URL 테스트 실패 ===');
  return { success: false, url: null, response: null };
};

// 로그인 테스트
export const testLogin = async () => {
  const urls = [
    'http://192.168.123.5:8080/auth/login',
    'http://10.0.2.2:8080/auth/login',
    'http://localhost:8080/auth/login'
  ];

  console.log('=== 로그인 테스트 시작 ===');
  
  for (const url of urls) {
    try {
      console.log(`로그인 테스트 중: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: 'testuser',
          password: 'test1234!'
        }),
      });
      
      console.log(`✅ 로그인 성공: ${url} - Status: ${response.status}`);
      const data = await response.json();
      console.log(`로그인 응답:`, data);
      return { success: true, url, data };
    } catch (error) {
      console.log(`❌ 로그인 실패: ${url} - Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('=== 모든 로그인 URL 테스트 실패 ===');
  return { success: false, url: null, data: null };
};
