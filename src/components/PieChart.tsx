import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import Svg, { Circle, G, Path, Defs, LinearGradient, Stop, Filter, FeDropShadow } from 'react-native-svg';
import { SCALE } from '../utils/constants';

interface PieChartData {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
  showCenterText?: boolean;
  centerText?: string;
  animated?: boolean;
}

export function PieChart({ 
  data, 
  size = 120, 
  strokeWidth = 40, 
  showCenterText = true,
  centerText,
  animated = true 
}: PieChartProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [animated, animatedValue]);

  // 데이터 검증 및 정규화
  const validatedData = data.map(item => ({
    ...item,
    value: isNaN(item.value) || item.value < 0 ? 0 : item.value,
    color: item.color || '#10B981',
    label: item.label || '알 수 없음'
  }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 총합 계산
  const total = validatedData.reduce((sum, item) => sum + item.value, 0);
  
  // 총합이 0인 경우 기본 데이터 제공
  if (total === 0) {
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#E5E7EB" stopOpacity="1" />
              <Stop offset="100%" stopColor="#D1D5DB" stopOpacity="1" />
            </LinearGradient>
            <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <FeDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.1"/>
            </Filter>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="url(#emptyGradient)"
            stroke="#D1D5DB"
            strokeWidth={2}
            filter="url(#shadow)"
          />
        </Svg>
        {showCenterText && (
          <View style={[styles.centerText, { width: size, height: size }]}>
            <Text style={styles.centerTextValue}>데이터 없음</Text>
          </View>
        )}
      </View>
    );
  }
  
  // 각도 계산 (도 단위)
  let currentAngle = 0;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          {validatedData.map((item, index) => (
            <LinearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <Stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
            </LinearGradient>
          ))}
          <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <FeDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000000" floodOpacity="0.15"/>
          </Filter>
        </Defs>
        <G>
          {validatedData.map((item, index) => {
            const percentage = item.value / total;
            const angle = Math.max(0, Math.min(360, percentage * 360));
            
            // 시작점과 끝점 계산
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            // 시작점과 끝점의 좌표 계산
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const startX = size / 2 + radius * Math.cos(startAngleRad);
            const startY = size / 2 + radius * Math.sin(startAngleRad);
            const endX = size / 2 + radius * Math.cos(endAngleRad);
            const endY = size / 2 + radius * Math.sin(endAngleRad);
            
            // NaN 값 검증
            if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
              return null;
            }
            
            // 큰 호인지 작은 호인지 판단
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // SVG 경로 생성
            const path = [
              `M ${size / 2} ${size / 2}`,
              `L ${startX} ${startY}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            const isSelected = selectedIndex === index;
            const scale = isSelected ? 1.05 : 1;
            const opacity = isSelected ? 1 : 0.9;
            
            return (
              <G key={index} transform={`scale(${scale})`} opacity={opacity}>
                <Path
                  d={path}
                  fill={`url(#gradient-${index})`}
                  filter="url(#shadow)"
                  stroke={isSelected ? '#FFFFFF' : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                />
              </G>
            );
          }).filter(Boolean)}
        </G>
      </Svg>
      
      {/* {showCenterText && (
        <View style={[styles.centerText, { width: size, height: size }]}>
          <Text style={styles.centerTextValue}>
            {centerText || `${total.toLocaleString()}`}
          </Text>
          <Text style={styles.centerTextLabel}>총합</Text>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
  },
  centerTextValue: {
    fontSize: 16 * SCALE,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  centerTextLabel: {
    fontSize: 10 * SCALE,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
}); 