import React, { useRef } from "react";
import { View, StyleSheet, Text, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_API_KEY, isKakaoMapApiKeyValid } from "../utils/constants";
import { EcoMerchant } from "../types/merchant";

interface KakaoMapProps {
  center: { lat: number; lon: number };
  merchants: EcoMerchant[];
  onMarkerClick?: (merchant: EcoMerchant) => void;
}

export const KakaoMap: React.FC<KakaoMapProps> = ({
  center,
  merchants,
  onMarkerClick,
}) => {
  const webViewRef = useRef<WebView>(null);

  // API 키 검증 (디버깅용)
  const isApiKeyValid = isKakaoMapApiKeyValid();
  console.log('🗺️ 카카오지도 API 키:', isApiKeyValid ? '유효함' : '유효하지 않음');
  console.log('🗺️ API 키 값:', KAKAO_MAP_API_KEY);

  // WebView 메시지 핸들링
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🗺️ WebView 메시지:', data);
      
      switch (data.type) {
        case 'markerClick':
          if (onMarkerClick && data.merchant) {
            onMarkerClick(data.merchant);
          }
          break;
        case 'mapLoaded':
          console.log('🗺️ 지도 로드 완료');
          break;
        case 'error':
          console.error('🗺️ 지도 에러:', data.message);
          break;
        case 'locationChanged':
          console.log('📍 위치 변경:', data.location);
          break;
        case 'locationError':
          console.error('📍 위치 에러:', data.error);
          break;
        case 'testResponse':
          console.log('✅ WebView 메시지 통신 테스트 성공:', data.message);
          break;
        case 'pageLoaded':
          console.log('✅ WebView 페이지 로드 완료:', data.message);
          break;
        case 'domainInfo':
          console.log('🌐 WebView 도메인 정보:');
          console.log('  - 도메인:', data.domain);
          console.log('  - URL:', data.url);
          console.log('  - Origin:', data.origin);
          console.log('  - 프로토콜:', data.protocol);
          console.log('  - 포트:', data.port);
          console.log('  - 호스트:', data.host);
          break;
        case 'fallbackMap':
          console.log('🗺️ 대체 지도 표시됨:', data.message);
          console.log('  - 도메인:', data.domain);
          console.log('  - URL:', data.url);
          break;
        case 'log':
          console.log('📱 WebView:', data.message);
          break;
        case 'iosTest':
          console.log('🍎 iOS WebView 테스트 성공:', data.message);
          if (data.url) {
            console.log('🔍 WebView URL:', data.url);
            console.log('🔍 WebView 도메인:', data.domain);
            console.log('🔍 WebView 제목:', data.title);
            console.log('🔍 HTML 길이:', data.bodyLength);
          }
          break;
        default:
          console.log('🗺️ 알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('🗺️ WebView 메시지 파싱 에러:', error);
    }
  };

  // 간단한 테스트 HTML 생성 함수
  const generateTestHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WebView 테스트</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .test-container {
            text-align: center;
            padding: 20px;
          }
          .test-button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
          }
          .test-button:hover {
            background: #45a049;
          }
          .status {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="test-container">
          <h1>🗺️ WebView 테스트</h1>
          <div class="status" id="status">
            WebView가 정상적으로 로드되었습니다!
          </div>
          <button class="test-button" onclick="testJavaScript()">JavaScript 테스트</button>
          <button class="test-button" onclick="testMessage()">메시지 테스트</button>
          <div id="result"></div>
        </div>
        
        <script>
          // console.log를 React Native로 전달하는 함수
          function sendLog(message) {
            console.log(message);
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'log',
                message: message
              }));
            }
          }
          
          sendLog('✅ WebView JavaScript 실행됨!');
          
          function testJavaScript() {
            document.getElementById('result').innerHTML = 
              '<p style="color: #4CAF50;">✅ JavaScript가 정상적으로 실행됩니다!</p>';
            sendLog('✅ JavaScript 테스트 성공');
          }
          
          function testMessage() {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'test',
                message: 'WebView에서 React Native로 메시지 전송 성공!'
              }));
              document.getElementById('result').innerHTML = 
                '<p style="color: #4CAF50;">✅ 메시지 전송 성공!</p>';
            } else {
              document.getElementById('result').innerHTML = 
                '<p style="color: #f44336;">❌ ReactNativeWebView 객체를 찾을 수 없습니다</p>';
            }
          }
          
          // React Native에서 오는 메시지 리스너
          document.addEventListener('message', function(event) {
            sendLog('📨 React Native에서 메시지 받음: ' + event.data);
            document.getElementById('status').innerHTML = 
              'React Native에서 메시지 받음: ' + event.data;
          });
          
          // 페이지 로드 완료 알림
          window.addEventListener('load', function() {
            sendLog('✅ 페이지 로드 완료');
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pageLoaded',
                message: 'WebView 페이지 로드 완료'
              }));
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  // 카카오지도 HTML 생성 함수
  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>카카오맵</title>
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
          }
          #map { 
            width: 100%; 
            height: 220px; 
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
          }
          .map-placeholder {
            text-align: center;
            padding: 20px;
          }
          .map-placeholder h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          .map-placeholder p {
            margin: 5px 0;
            font-size: 14px;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div id="map">
        </div>
        
        <script>
          // console.log를 React Native로 전달하는 함수
          function sendLog(message) {
            console.log(message);
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'log',
                message: message
              }));
            }
          }
          
          sendLog('🗺️ 간단한 카카오맵 스크립트 시작');
          sendLog('🔑 API 키: ' + '${KAKAO_MAP_API_KEY}');
          sendLog('🌐 현재 도메인: ' + window.location.hostname);
          sendLog('📍 현재 URL: ' + window.location.href);
          
          // 카카오맵 초기화
          function initMap() {
            sendLog('🗺️ 카카오맵 초기화 시작');
            
            if (typeof kakao !== 'undefined') {
              sendLog('✅ 카카오 SDK 로드 완료');
              kakao.maps.load(function() {
                sendLog('✅ 카카오맵 라이브러리 로드 완료');
                try {
                  var mapContainer = document.getElementById('map');
                  var mapOption = {
                    center: new kakao.maps.LatLng(${center.lat}, ${center.lon}),
                    level: 7
                  };
                  
                  var map = new kakao.maps.Map(mapContainer, mapOption);
                  sendLog('✅ 카카오맵 초기화 성공');
                  
                  // 가맹점 데이터
                  var merchantsData = ${JSON.stringify(merchants.map((merchant, index) => ({
                    id: merchant.id || index,
                    lat: merchant.latitude,
                    lng: merchant.longitude,
                    title: merchant.name,
                    category: merchant.category,
                    distance: merchant.distance,
                  })))};
                  
                  sendLog('가맹점 데이터: ' + merchantsData.length + '개');
                  
                  // 가맹점 마커들 생성
                  merchantsData.forEach(function(merchant, index) {
                    var marker = new kakao.maps.Marker({
                      position: new kakao.maps.LatLng(merchant.lat, merchant.lng),
                      map: map,
                      title: merchant.title
                    });
                    
                    // 인포윈도우
                    var infowindow = new kakao.maps.InfoWindow({
                      content: '<div style="padding:10px;min-width:200px;">' +
                               '<h3 style="margin:0 0 5px 0;font-size:14px;">' + merchant.title + '</h3>' +
                               '<p style="margin:0;font-size:12px;color:#666;">' + merchant.category + '</p>' +
                               '<p style="margin:5px 0 0 0;font-size:12px;color:#4CAF50;">' + 
                               (merchant.distance ? merchant.distance.toFixed(3) + 'km' : '거리 계산 중') + '</p>' +
                               '</div>'
                    });
                    
                    // 마커 클릭 이벤트
                    kakao.maps.event.addListener(marker, 'click', function() {
                      infowindow.open(map, marker);
                      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'markerClick',
                          merchant: merchant
                        }));
                      }
                    });
                  });
                  
                  // 플레이스홀더 숨기기
                  var placeholder = document.getElementById('mapPlaceholder');
                  if (placeholder) {
                    placeholder.style.display = 'none';
                  }
                  
                } catch (error) {
                  sendLog('❌ 카카오맵 초기화 에러: ' + error.message);
                }
              });
            } else {
              sendLog('❌ 카카오 SDK 로드 실패');
              setTimeout(initMap, 100);
            }
          }
          
          // 페이지 로드 완료 후 초기화
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMap);
          } else {
            initMap();
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("WebView 메시지:", data);

      if (data.type === "markerClick" && onMarkerClick) {
        const merchant = merchants.find((m) => m.name === data.merchant.name);
        if (merchant) {
          onMarkerClick(merchant);
        }
      } else if (data.type === "locationChanged") {
        // 위치 변경 시 부모 컴포넌트에 알림
        console.log("위치 변경됨:", data.location);
        // 필요시 onLocationChanged 콜백 추가 가능
      } else if (data.type === "locationError") {
        // 위치 에러 처리
        console.error("위치 에러:", data.error);
        Alert.alert("위치 오류", data.error);
      }
    } catch (error) {
      console.error("카카오맵 메시지 처리 오류:", error);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView 에러:", nativeEvent);
    console.error("에러 URL:", nativeEvent.url);
    console.error("에러 코드:", nativeEvent.code);
    console.error("에러 메시지:", nativeEvent.description);
  };

  const handleLoadEnd = () => {
    console.log("WebView 로드 완료");
    
    // iOS에서 WebView JavaScript 실행 강제
    if (Platform.OS === 'ios' && webViewRef.current) {
      console.log("iOS WebView JavaScript 강제 실행 시도");
      
      // JavaScript 코드를 직접 실행하여 HTML 내용 확인
      const jsCode = `
        console.log('📱 iOS WebView JavaScript 강제 실행됨!');
        console.log('🔍 현재 URL:', window.location.href);
        console.log('🔍 현재 도메인:', window.location.hostname);
        console.log('🔍 document.title:', document.title);
        console.log('🔍 document.body.innerHTML 길이:', document.body.innerHTML.length);
        
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'iosTest',
            message: 'iOS WebView JavaScript 실행 성공!',
            url: window.location.href,
            domain: window.location.hostname,
            title: document.title,
            bodyLength: document.body.innerHTML.length
          }));
        }
      `;
      
      webViewRef.current.injectJavaScript(jsCode);
    }
    
    // WebView 내부에서 JavaScript 실행 테스트
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'test',
        message: 'React Native에서 WebView로 메시지 전송 테스트'
      }));
    }
  };

  // API 키가 유효하지 않을 때 에러 메시지 표시
  if (!isApiKeyValid) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>🗺️ 지도 로드 실패</Text>
        <Text style={styles.errorMessage}>
          카카오지도 API 키가 설정되지 않았습니다.{'\n'}
          개발자에게 문의하세요.
        </Text>
        <Text style={styles.errorSubMessage}>
          현재 API 키: {KAKAO_MAP_API_KEY}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{
          html: generateMapHTML(),
        }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
        originWhitelist={["*"]}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // 네트워크 보안 정책 완화
        allowsBackForwardNavigationGestures={false}
        allowsLinkPreview={false}
        // 안드로이드에서 추가 설정
        {...(Platform.OS === "android" && {
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
          allowsFullscreenVideo: false,
          // 안드로이드 네트워크 보안 정책 완화
          androidLayerType: "hardware",
        })}
        // iOS에서 추가 설정
        {...(Platform.OS === "ios" && {
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
          // iOS 네트워크 보안 정책 완화
          allowsAirPlayForMediaPlayback: false,
          // iOS WebView JavaScript 실행 강제 활성화
          allowsBackForwardNavigationGestures: false,
          allowsLinkPreview: false,
          // iOS에서 JavaScript 실행을 위한 추가 설정
          onShouldStartLoadWithRequest: () => true,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorSubMessage: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
