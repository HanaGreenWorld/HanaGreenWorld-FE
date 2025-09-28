import React from 'react';
import { AppProvider } from './src/contexts/AppContext';
import { ScreenRenderer } from './src/components/ScreenRenderer';
import { 
  TabVisibilityController, 
  GlobalActionProvider, 
  PhoneFrame 
} from './src/components';

// 리팩토링된 메인 App 컴포넌트
export default function App() {
  return (
    <AppProvider>
      <PhoneFrame>
        <GlobalActionProvider />
        <ScreenRenderer />
        <TabVisibilityController />
      </PhoneFrame>
    </AppProvider>
  );
}
