import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE, IPHONE_WIDTH, COLORS } from '../utils/constants';

interface NumericKeypadProps {
  visible: boolean;
  onClose: () => void;
  onNumberPress: (num: string) => void;
  onQuickAdd?: (amount: number) => void;
  onClear?: () => void;
  title?: string;
  quickAddOptions?: { label: string; value: number }[];
}

export default function NumericKeypad({
  visible,
  onClose,
  onNumberPress,
  onQuickAdd,
  onClear,
  title = "금액을 입력하세요",
  quickAddOptions = [
    { label: "+1만", value: 10000 },
    { label: "+5만", value: 50000 },
    { label: "+10만", value: 100000 },
    { label: "+50만", value: 500000 },
    { label: "지우기", value: 0 },
  ]
}: NumericKeypadProps) {
  const handleQuickAdd = (amount: number) => {
    if (amount === 0 && onClear) {
      onClear();
    } else if (onQuickAdd) {
      onQuickAdd(amount);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.keypadContainer}>
          <View style={styles.keypadHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24 * SCALE} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.keypadTitle}>{title}</Text>
            <View style={{ width: 24 * SCALE }} />
          </View>
          
          {/* Quick Add Buttons */}
          <View style={styles.quickAddContainer}>
            {quickAddOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.quickAddButton} 
                onPress={() => handleQuickAdd(option.value)}
              >
                <Text style={styles.quickAddText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.keypadButton}
                onPress={() => onNumberPress(num.toString())}
              >
                <Text style={styles.keypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.keypadButton} onPress={() => onNumberPress('X')}>
              <Ionicons name="backspace-outline" size={20 * SCALE} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={() => onNumberPress('0')}>
              <Text style={styles.keypadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={() => onNumberPress('완료')}>
              <Text style={styles.keypadButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  keypadContainer: {
    backgroundColor: '#374151',
    borderTopLeftRadius: 20 * SCALE,
    borderTopRightRadius: 20 * SCALE,
    padding: 20 * SCALE,
    paddingBottom: 40 * SCALE,
    width: IPHONE_WIDTH * SCALE,
    maxWidth: IPHONE_WIDTH * SCALE,
  },
  keypadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * SCALE,
  },
  keypadTitle: {
    color: COLORS.white,
    fontSize: 16 * SCALE,
    fontWeight: '500',
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20 * SCALE,
  },
  quickAddButton: {
    backgroundColor: '#4B5563',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    borderRadius: 8 * SCALE,
  },
  quickAddText: {
    color: COLORS.white,
    fontSize: 12 * SCALE,
    fontWeight: '500',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30 * SCALE,
  },
  keypadButton: {
    width: (IPHONE_WIDTH * SCALE - 60 * SCALE) / 3,
    height: 50 * SCALE,
    backgroundColor: '#6B7280',
    borderRadius: 8 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10 * SCALE,
  },
  keypadButtonText: {
    color: COLORS.white,
    fontSize: 18 * SCALE,
    fontWeight: '500',
  },
}); 