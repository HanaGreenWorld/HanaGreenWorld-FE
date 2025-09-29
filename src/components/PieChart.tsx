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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 총합 계산
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // 각도 계산 (도 단위)
  let currentAngle = 0;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            
            // 시작점과 끝점 계산
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            // 시작점과 끝점의 좌표 계산
            const startX = size / 2 + radius * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = size / 2 + radius * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = size / 2 + radius * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = size / 2 + radius * Math.sin((endAngle - 90) * Math.PI / 180);
            
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
          })}
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