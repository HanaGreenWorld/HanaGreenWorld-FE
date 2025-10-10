import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
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
}

export function PieChart({ data, size = 120, strokeWidth = 40 }: PieChartProps) {
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
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="#E5E7EB"
            stroke="#D1D5DB"
            strokeWidth={2}
          />
        </Svg>
      </View>
    );
  }
  
  // 각도 계산 (도 단위)
  let currentAngle = 0;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {validatedData.map((item, index) => {
            const percentage = item.value / total;
            const angle = Math.max(0, Math.min(360, percentage * 360)); // 0-360도 범위로 제한
            
            // 시작점과 끝점 계산
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            // 시작점과 끝점의 좌표 계산 (NaN 방지)
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const startX = size / 2 + radius * Math.cos(startAngleRad);
            const startY = size / 2 + radius * Math.sin(startAngleRad);
            const endX = size / 2 + radius * Math.cos(endAngleRad);
            const endY = size / 2 + radius * Math.sin(endAngleRad);
            
            // NaN 값 검증
            if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
              console.warn('PieChart: Invalid coordinates detected', { item, startAngle, endAngle });
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
            
            return (
              <Path
                key={index}
                d={path}
                fill={item.color}
              />
            );
          }).filter(Boolean)}
        </G>
      </Svg>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    position: 'relative',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextValue: {
    fontSize: 12 * SCALE,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
}); 