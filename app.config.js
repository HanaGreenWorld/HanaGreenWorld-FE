import 'dotenv/config';

export default {
  expo: {
    name: "하나은행",
    slug: "hanabank",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/hana1q1.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    // splash: {
    //   image: "./assets/hana1q2.png",
    //   resizeMode: "contain",
    //   backgroundColor: "#ffffff"
    // },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jimpark.hanagreenworld",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "친환경 가맹점을 찾기 위해 위치 정보가 필요합니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "친환경 가맹점을 찾기 위해 위치 정보가 필요합니다.",
        NSCameraUsageDescription: "에코챌린지 인증을 위해 카메라 접근이 필요합니다.",
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSAllowsArbitraryLoadsInWebContent: true,
          NSAllowsLocalNetworking: true,
          NSExceptionDomains: {
            "192.168.123.5": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSExceptionMinimumTLSVersion: "1.0",
              NSIncludesSubdomains: true
            },
            "localhost": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSExceptionMinimumTLSVersion: "1.0",
              NSIncludesSubdomains: true
            }
          }
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/hana1q1.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.jimpark.hanagreenworld",
      usesCleartextTraffic: true,
      networkSecurityConfig: {
        cleartextTrafficPermitted: true,
        allowBackup: true,
        allowArbitraryLoads: true,
        allowArbitraryLoadsInWebContent: true
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/hana1q1.png"
    },
    plugins: [
      "expo-dev-client",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "친환경 가맹점을 찾기 위해 위치 정보가 필요합니다.",
          locationAlwaysPermission: "친환경 가맹점을 찾기 위해 위치 정보가 필요합니다.",
          locationWhenInUsePermission: "친환경 가맹점을 찾기 위해 위치 정보가 필요합니다."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "에코챌린지 인증을 위해 카메라 접근이 필요합니다."
        }
      ],
      // [
      //   "expo-image-picker",
      //   {
      //     photosPermission: "에코챌린지 인증을 위해 갤러리 접근이 필요합니다."
      //   }
      // ]
    ],
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      kakaoMapApiKey: process.env.KAKAO_MAP_API_KEY,
      eas: {
        projectId: "96e90ae7-f6be-45dd-8c41-237963fb4a20"
      }
    }
  }
};
