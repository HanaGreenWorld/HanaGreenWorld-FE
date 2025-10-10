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

  // 매우 간단한 카카오지도 HTML 생성 함수
  const generateSimpleMapHTML = () => {
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          <div class="map-placeholder" id="mapPlaceholder">
            <h3>🗺️ 카카오지도 로딩 중...</h3>
            <p>위치: ${center.lat}, ${center.lon}</p>
            <p>가맹점 수: ${merchants.length}개</p>
          </div>
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

  const generateMapHTML = () => {
    const markersData = merchants.map((merchant, index) => ({
      id: merchant.id || index,
      lat: merchant.latitude,
      lng: merchant.longitude,
      title: merchant.name,
      category: merchant.category,
      distance: merchant.distance,
    }));

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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            z-index: 1000;
          }
          .map-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .control-btn {
            width: 32px;
            height: 32px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            color: #333;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .control-btn:hover {
            background: #f5f5f5;
          }
          .location-btn {
            width: 36px;
            height: 36px;
            background: #4CAF50;
            color: white;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div id="map">
          <div class="map-placeholder" id="mapPlaceholder">
            <h3>🗺️ 카카오지도 로딩 중...</h3>
            <p>위치: ${center.lat}, ${center.lon}</p>
            <p>가맹점 수: ${merchants.length}개</p>
          </div>
        </div>
        <div class="map-controls">
          <div class="control-btn" onclick="zoomIn()">+</div>
          <div class="control-btn" onclick="zoomOut()">-</div>
        </div>
        <div id="error" class="error-message" style="display:none;">
          <h3>카카오맵 로드 실패</h3>
          <p>API 키 또는 도메인 설정을 확인해주세요.</p>
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
          
          sendLog('🗺️ 카카오맵 스크립트 시작');
          sendLog('🔑 API 키: ' + '${KAKAO_MAP_API_KEY}');
          sendLog('🌐 현재 도메인: ' + window.location.hostname);
          sendLog('📍 현재 URL: ' + window.location.href);
          sendLog('📱 User Agent: ' + navigator.userAgent);
          sendLog('🔍 프로토콜: ' + window.location.protocol);
          sendLog('🔍 포트: ' + window.location.port);
          sendLog('🔍 전체 호스트: ' + window.location.host);
          sendLog('🔍 origin: ' + window.location.origin);
          sendLog('🔍 pathname: ' + window.location.pathname);
          
          // React Native로 도메인 정보 전송
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'domainInfo',
              domain: window.location.hostname,
              url: window.location.href,
              origin: window.location.origin,
              protocol: window.location.protocol,
              port: window.location.port,
              host: window.location.host
            }));
          }
          
          // API 키 검증
          if (!'${KAKAO_MAP_API_KEY}' || '${KAKAO_MAP_API_KEY}' === 'undefined') {
            sendLog('❌ API 키가 설정되지 않았습니다!');
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = 
              '<h3>❌ API 키 오류</h3>' +
              '<p>카카오지도 API 키가 설정되지 않았습니다.</p>' +
              '<p>개발자에게 문의하세요.</p>';
            return;
          }
          
          sendLog('✅ API 키 검증 통과: ' + '${KAKAO_MAP_API_KEY}');
          
          // 에러 핸들러
          window.onerror = function(msg, url, line) {
            console.error('JavaScript 에러:', msg, url, line);
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = 
              '<h3>🗺️ 지도 로드 실패</h3>' +
              '<p>' + msg + '</p>' +
              '<p>URL: ' + url + '</p>' +
              '<p>Line: ' + line + '</p>' +
              '<button onclick="location.reload()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">🔄 다시 시도</button>';
            
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: msg + ' (Line: ' + line + ', URL: ' + url + ')'
              }));
            }
          };
          
          // Promise 에러 핸들러
          window.addEventListener('unhandledrejection', function(event) {
            console.error('Promise 에러:', event.reason);
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Promise 에러: ' + event.reason
              }));
            }
          });
          
          // 카카오맵 초기화 (autoload=false로 설정됨)
          function initKakaoMap() {
            sendLog('🗺️ 카카오맵 초기화 시작');
            
            // kakao 객체가 로드될 때까지 대기
            function waitForKakao() {
              sendLog('🔍 kakao 객체 확인 중... ' + typeof kakao);
              if (typeof kakao !== 'undefined') {
                sendLog('✅ 카카오 SDK 로드 완료');
                sendLog('🔍 kakao.maps 확인 중... ' + typeof kakao.maps);
                
                // autoload=false이므로 수동으로 로드
                kakao.maps.load(function() {
                  sendLog('✅ 카카오맵 라이브러리 로드 완료');
                  sendLog('🔍 kakao.maps.Map 확인 중... ' + typeof kakao.maps.Map);
                  sendLog('🔍 kakao.maps.LatLng 확인 중... ' + typeof kakao.maps.LatLng);
                  initializeMap();
                });
              } else {
                sendLog('⏳ 카카오 SDK 로드 대기 중... (시도 횟수: ' + (waitForKakao.attempts || 0) + ')');
                waitForKakao.attempts = (waitForKakao.attempts || 0) + 1;
                
                // 최대 50번 시도 (5초)
                if (waitForKakao.attempts < 50) {
                  setTimeout(waitForKakao, 100);
                } else {
                  sendLog('❌ 카카오 SDK 로드 실패 - 타임아웃');
                  sendLog('🔍 window 객체 확인: ' + typeof window);
                  sendLog('🔍 document 객체 확인: ' + typeof document);
                  sendLog('🔍 kakao 객체 상태: ' + typeof kakao);
                  sendLog('🔍 현재 도메인: ' + window.location.hostname);
                  sendLog('🔍 현재 URL: ' + window.location.href);
                  
                  // 도메인 설정 문제일 가능성이 높으므로 안내 메시지 표시
                  document.getElementById('error').style.display = 'block';
                  document.getElementById('error').innerHTML = 
                    '<h3>❌ 카카오 SDK 로드 실패</h3>' +
                    '<p>카카오지도 SDK를 로드할 수 없습니다.</p>' +
                    '<p><strong>가능한 원인:</strong></p>' +
                    '<p>1. 도메인 설정 문제</p>' +
                    '<p>2. 네트워크 연결 문제</p>' +
                    '<p>3. API 키 권한 문제</p>' +
                    '<p><strong>현재 도메인:</strong> ' + window.location.hostname + '</p>' +
                    '<p><strong>현재 URL:</strong> ' + window.location.href + '</p>' +
                    '<p><strong>해결 방법:</strong></p>' +
                    '<p>카카오 개발자 콘솔에서 현재 도메인을 추가하세요.</p>' +
                    '<button onclick="showFallbackMap()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">🗺️ 대체 지도 보기</button>';
                }
              }
            }
            
            // 초기 대기 후 시작
            setTimeout(waitForKakao, 100);
          }
          
          // React Native에서 오는 메시지 리스너
          document.addEventListener('message', function(event) {
            console.log('📨 React Native에서 메시지 받음:', event.data);
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'test') {
                console.log('✅ WebView 메시지 통신 테스트 성공:', data.message);
                // React Native로 응답 전송
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'testResponse',
                    message: 'WebView에서 React Native로 응답 전송 성공'
                  }));
                }
              }
            } catch (error) {
              console.error('메시지 파싱 에러:', error);
            }
          });
          
          // 페이지 로드 완료 후 카카오맵 초기화
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initKakaoMap);
          } else {
            initKakaoMap();
          }
          
          
          var map; // 전역 변수로 지도 선언
          var currentLocationMarker; // 현재 위치 마커
          
          function initializeMap() {
            try {
              sendLog('🗺️ 지도 초기화 시작');
              sendLog('📍 중심 좌표: ${center.lat}, ${center.lon}');
              sendLog('🔍 kakao.maps.Map 생성자 확인: ' + typeof kakao.maps.Map);
              sendLog('🔍 kakao.maps.LatLng 생성자 확인: ' + typeof kakao.maps.LatLng);
              
              // 카카오맵 초기화
              var mapContainer = document.getElementById('map');
              if (!mapContainer) {
                throw new Error('지도 컨테이너를 찾을 수 없습니다');
              }
              sendLog('✅ 지도 컨테이너 찾음');
              
              var mapOption = {
                center: new kakao.maps.LatLng(${center.lat}, ${center.lon}),
                level: 7
              };
              
              sendLog('🗺️ 지도 옵션 설정 완료');
              sendLog('🗺️ 지도 생성 시도 중...');
              map = new kakao.maps.Map(mapContainer, mapOption);
              sendLog('✅ 카카오맵 초기화 성공');
              sendLog('🔍 생성된 지도 객체: ' + (map ? '성공' : '실패'));
              
              // 플레이스홀더 숨기기
              var placeholder = document.getElementById('mapPlaceholder');
              if (placeholder) {
                placeholder.style.display = 'none';
              }
              
              // 현재 위치 마커
              currentLocationMarker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(${center.lat}, ${center.lon}),
                map: map
              });
              
              // 가맹점 데이터
              var merchantsData = ${JSON.stringify(markersData)};
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
              
              // 지도 로드 완료 이벤트
              kakao.maps.event.addListener(map, 'tilesloaded', function() {
                sendLog('카카오맵 타일 로드 완료');
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapLoaded',
                    center: { lat: ${center.lat}, lng: ${center.lon} }
                  }));
                }
              });
              
              sendLog('카카오맵 설정 완료');
              
              // 에러 메시지 숨기기
              document.getElementById('error').style.display = 'none';
              
            } catch (error) {
              sendLog('❌ 카카오맵 초기화 에러: ' + error.message);
              document.getElementById('error').style.display = 'block';
              document.getElementById('error').innerHTML = '<h3>지도 초기화 실패</h3><p>' + error.message + '</p>';
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: error.toString()
                }));
              }
            }
          }
          
          // 확대 기능
          function zoomIn() {
            if (map) {
              var level = map.getLevel();
              map.setLevel(level - 1);
            }
          }
          
          // 축소 기능
          function zoomOut() {
            if (map) {
              var level = map.getLevel();
              map.setLevel(level + 1);
            }
          }
          
          // 대체 지도 표시 함수
          function showFallbackMap() {
            sendLog('🗺️ 대체 지도 표시');
            document.getElementById('error').style.display = 'none';
            document.getElementById('mapPlaceholder').style.display = 'block';
            document.getElementById('mapPlaceholder').innerHTML = 
              '<h3>🗺️ 대체 지도</h3>' +
              '<p>📍 현재 위치: ${center.lat}, ${center.lon}</p>' +
              '<p>🏪 가맹점 수: ${merchants.length}개</p>' +
              '<p>📍 서울시청 기준</p>' +
              '<div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">' +
              '<p style="margin: 5px 0;">🔍 카카오지도 로드 실패</p>' +
              '<p style="margin: 5px 0;">📱 대체 UI로 표시 중</p>' +
              '<p style="margin: 5px 0;">🌐 도메인: ' + window.location.hostname + '</p>' +
              '</div>';
              
            // React Native로 대체 지도 표시 알림
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'fallbackMap',
                message: '대체 지도 표시됨',
                domain: window.location.hostname,
                url: window.location.href
              }));
            }
          }
          
            function goToCurrentLocation() {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var moveLatLon = new kakao.maps.LatLng(lat, lng);

                    // 지도 중심 이동
                    if (map) {
                      map.setCenter(moveLatLon);
                    }

                    // 현재 위치 마커 업데이트
                    if (currentLocationMarker) {
                      currentLocationMarker.setPosition(moveLatLon);
                    }

                    // React Native로 알림 (안전 체크)
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                          type: 'locationChanged',
                          location: { lat: lat, lng: lng }
                        })
                      );
                    }

                    console.log('현재 위치로 이동:', lat, lng);
                  },
                  function(error) {
                    console.error('위치 정보 가져오기 실패:', error);

                    // React Native로 에러 알림 (안전 체크)
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                          type: 'locationError',
                          error: error.message
                        })
                      );
                    }

                    // fallback: 기본 위치(서울 시청)로 이동
                    var fallbackLatLon = new kakao.maps.LatLng(37.5665, 126.9780);
                    if (map) {
                      map.setCenter(fallbackLatLon);
                    }
                    if (currentLocationMarker) {
                      currentLocationMarker.setPosition(fallbackLatLon);
                    }
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                  }
                );
              } else {
                // 위치 서비스 지원 안 함
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(
                    JSON.stringify({
                      type: 'locationError',
                      error: '이 브라우저에서는 위치 서비스를 지원하지 않습니다.'
                    })
                  );
                }
              }
            }
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
          html: generateSimpleMapHTML(),
          baseUrl: 'https://localhost',
        }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
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
