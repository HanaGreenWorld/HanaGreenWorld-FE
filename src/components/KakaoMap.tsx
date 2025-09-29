import React, { useRef } from "react";
import { View, StyleSheet, Text, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_API_KEY } from "../utils/constants";
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
            background: #f0f0f0;
            position: relative;
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
        <div id="map"></div>
        <div class="map-controls">
          <div class="control-btn" onclick="zoomIn()">+</div>
          <div class="control-btn" onclick="zoomOut()">-</div>
        </div>
        <div id="error" class="error-message" style="display:none;">
          <h3>카카오맵 로드 실패</h3>
          <p>API 키 또는 도메인 설정을 확인해주세요.</p>
        </div>
        
        <script>
          console.log('카카오맵 스크립트 시작');
          console.log('API 키:', '${KAKAO_MAP_API_KEY}');
          console.log('현재 도메인:', window.location.hostname);
          console.log('현재 URL:', window.location.href);
          console.log('User Agent:', navigator.userAgent);
          
          // 에러 핸들러
          window.onerror = function(msg, url, line) {
            console.error('JavaScript 에러:', msg, url, line);
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = 
              '<h3>🗺️ 지도 로드 실패</h3>' +
              '<p>' + msg + '</p>' +
              '<button onclick="location.reload()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">🔄 다시 시도</button>';
            
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: msg + ' (Line: ' + line + ')'
              }));
            }
          };
          
          // 카카오맵 초기화 (스크립트가 이미 head에 로드됨)
          function initKakaoMap() {
            console.log('🗺️ 카카오맵 초기화 시작');
            
            // kakao 객체가 로드될 때까지 대기
            function waitForKakao() {
              if (typeof kakao !== 'undefined') {
                console.log('✅ 카카오 SDK 로드 완료');
                kakao.maps.load(function() {
                  console.log('✅ 카카오맵 라이브러리 로드 완료');
                  initializeMap();
                });
              } else {
                console.log('⏳ 카카오 SDK 로드 대기 중...');
                setTimeout(waitForKakao, 100);
              }
            }
            
            // 초기 대기 후 시작
            setTimeout(waitForKakao, 100);
          }
          
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
              console.log('🗺️ 지도 초기화 시작');
              console.log('📍 중심 좌표:', ${center.lat}, ${center.lon});
              
              // 카카오맵 초기화
              var mapContainer = document.getElementById('map');
              if (!mapContainer) {
                throw new Error('지도 컨테이너를 찾을 수 없습니다');
              }
              
              var mapOption = {
                center: new kakao.maps.LatLng(${center.lat}, ${center.lon}),
                level: 7
              };
              
              console.log('🗺️ 지도 옵션:', mapOption);
              map = new kakao.maps.Map(mapContainer, mapOption);
              console.log('✅ 카카오맵 초기화 성공');
              
              // 현재 위치 마커
              currentLocationMarker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(${center.lat}, ${center.lon}),
                map: map
              });
              
              // 가맹점 데이터
              var merchantsData = ${JSON.stringify(markersData)};
              console.log('가맹점 데이터:', merchantsData);
              
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
                console.log('카카오맵 타일 로드 완료');
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapLoaded',
                    center: { lat: ${center.lat}, lng: ${center.lon} }
                  }));
                }
              });
              
              console.log('카카오맵 설정 완료');
              
              // 에러 메시지 숨기기
              document.getElementById('error').style.display = 'none';
              
            } catch (error) {
              console.error('카카오맵 초기화 에러:', error);
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
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: generateMapHTML() }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        style={{ flex: 1 }}
      />
      {/* <WebView
        ref={webViewRef}
        source={{
          html: generateMapHTML(),
          // baseUrl: "https://10.0.0.2:8080", // 카카오 도메인으로 변경
        }}
        style={styles.webview}
        onMessage={handleMessage}
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
        })}
      /> */}
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
});
