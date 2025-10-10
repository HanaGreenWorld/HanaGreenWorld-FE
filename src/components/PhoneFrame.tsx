import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_WIDTH, SCREEN_HEIGHT, scaleSize } from '../utils/constants';

interface PhoneFrameProps {
  children: React.ReactNode;
  backgroundColor?: string; // SafeArea 배경색 지정 가능
}

// 내부 컴포넌트에서 SafeAreaView 사용 (자동 SafeArea 처리)
const PhoneFrameContent: React.FC<PhoneFrameProps> = ({ children, backgroundColor }) => {
  const bgColor = backgroundColor || '#F5F5F5';
  
  return (
    <View style={[styles.appContainer, { backgroundColor: bgColor }]}>
      <View style={[styles.phoneFrame, { backgroundColor: bgColor }]}>
        <SafeAreaView style={[styles.screenContainer, { backgroundColor: bgColor }]}>
          {React.Children.toArray(children).filter(child => 
            typeof child !== 'string' && child !== null && child !== undefined
          )}
        </SafeAreaView>
      </View>
    </View>
  );
};

// 반응형 iPhone 프레임을 감싸는 컴포넌트
export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, backgroundColor }) => {
  return (
    <SafeAreaProvider>
      <PhoneFrameContent backgroundColor={backgroundColor}>
        {children}
      </PhoneFrameContent>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5', // 화면과 동일한 배경색
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#F5F5F5', // 화면과 동일한 배경색
    borderRadius: scaleSize(30),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scaleSize(10),
    },
    shadowOpacity: 0.05, // 매우 부드러운 그림자
    shadowRadius: scaleSize(20),
    elevation: 5, // 부드러운 그림자
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    // SafeArea는 동적으로 적용됨
  },
});
