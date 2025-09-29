// Expo Camera 관련 코드를 시뮬레이터 호환성을 위해 임시로 주석 처리
/*
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SCALE } from '../utils/constants';

interface CameraCaptureProps {
  onCapture: (_imageUri: string) => void;
  onClose: () => void;
  challengeTitle: string;
}

export default function CameraCapture({ onCapture, onClose, challengeTitle }: CameraCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('오류', '사진 촬영에 실패했습니다.');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const confirmPicture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한을 요청 중입니다...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 접근 권한이 없습니다.</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{challengeTitle} 인증</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24 * SCALE} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
            <Ionicons name="refresh" size={20 * SCALE} color="#fff" />
            <Text style={styles.retakeButtonText}>다시 촬영</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmButton} onPress={confirmPicture}>
            <Ionicons name="checkmark" size={20 * SCALE} color="#fff" />
            <Text style={styles.confirmButtonText}>인증하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{challengeTitle} 인증</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24 * SCALE} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={24 * SCALE} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraControls: {
    alignItems: 'flex-end',
    padding: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25 * SCALE,
    padding: 15 * SCALE,
  },
  captureButtonContainer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    borderRadius: 40 * SCALE,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60 * SCALE,
    height: 60 * SCALE,
    borderRadius: 30 * SCALE,
    backgroundColor: '#fff',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retakeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  confirmButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
*/

// 시뮬레이터 호환성을 위한 임시 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CameraCaptureProps {
  onCapture: (_imageUri: string) => void;
  onClose: () => void;
  challengeTitle: string;
}

export default function CameraCapture({ onCapture, onClose, challengeTitle }: CameraCaptureProps) {
  const handleMockCapture = () => {
    // 시뮬레이터에서는 더미 이미지 URI 사용
    const mockImageUri = 'https://via.placeholder.com/400x300/27ae60/ffffff?text=Challenge+Photo';
    onCapture(mockImageUri);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challengeTitle} 인증 (시뮬레이터 모드)</Text>
      <Text style={styles.subtitle}>실제 기기에서만 카메라 기능을 사용할 수 있습니다.</Text>
      
      <TouchableOpacity style={styles.mockButton} onPress={handleMockCapture}>
        <Text style={styles.mockButtonText}>더미 사진으로 인증하기</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>닫기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  mockButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  mockButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});