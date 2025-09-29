import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_WIDTH, SCREEN_HEIGHT, scaleSize } from '../utils/constants';

interface PhoneFrameProps {
  children: React.ReactNode;
}

// 반응형 iPhone 프레임을 감싸는 컴포넌트
export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <View style={styles.phoneFrame}>
          <SafeAreaView style={styles.screenContainer}>
            {children}
          </SafeAreaView>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    borderRadius: scaleSize(30),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scaleSize(20),
    },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(40),
    elevation: 20,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
