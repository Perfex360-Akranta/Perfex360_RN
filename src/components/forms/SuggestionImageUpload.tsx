import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

interface Props {
  value: PickedImage | null;
  existingImageUrl?: string | null;
  onChange: (image: PickedImage | null) => void;
  onCameraVisibleChange?: (visible: boolean) => void;
}
export interface SuggestionImageUploadHandle {
  open: () => void;
}

// export default function SuggestionImageUpload({ value, existingImageUrl, onChange }: Props) {
const SuggestionImageUpload = forwardRef<SuggestionImageUploadHandle, Props>(
  function SuggestionImageUpload(
    { value, existingImageUrl, onChange, onCameraVisibleChange },
    ref,
  ) {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [takingPhoto, setTakingPhoto] = useState(false);

    const device = useCameraDevice('back');
    const photoOutput = usePhotoOutput();
    const { hasPermission, requestPermission } = useCameraPermission();
    const imageUri = value?.uri ?? existingImageUrl;
    const openCamera = async () => {
      try {
        if (!hasPermission) {
          const granted = await requestPermission();

          if (!granted) {
            Alert.alert(
              'Camera Permission',
              'Please allow camera access in your phone settings to take a photo.',
            );
            return;
          }
        }

        setCameraVisible(true);
      } catch (error) {
        Alert.alert(
          'Error',
          'Unable to request camera permission. Please try again.',
        );
      }
    };

    const capturePhoto = async () => {
      if (takingPhoto) return;

      if (!hasPermission) {
        Alert.alert('Camera Permission', 'Please allow camera access.');
        return;
      }

      if (!device) {
        Alert.alert('Camera Error', 'No camera is available on this device.');
        return;
      }

      setTakingPhoto(true);

      try {
        const photo = await photoOutput.capturePhoto({}, {});


        const filePath = await photo.saveToTemporaryFileAsync();

        try {
          const resizedImage = await ImageResizer.createResizedImage(
            `file://${filePath}`,
            1600,             // Maximum width
            1600,             // Maximum height
            'JPEG',
            75,               // Quality: 75%
            0,                // Rotation
          );

          const imagePath = resizedImage.uri.replace('file://', '');
          const imageStat = await RNFS.stat(imagePath);

          const maxSize = 5 * 1024 * 1024;

          if (Number(imageStat.size) > maxSize) {
            Alert.alert(
              'Image Too Large',
              'The image exceeds 5 MB. Please capture another photo.',
            );
            return;
          }

          onChange({
            uri: resizedImage.uri,
            name: `suggestion_${Date.now()}.jpg`,
            type: 'image/jpeg',
          });
          // const filePath = await photo.saveToTemporaryFileAsync();

          // onChange({
          //   uri: `file://${filePath}`,
          //   name: `suggestion_${Date.now()}.jpg`,
          //   type: 'image/jpeg',
          // });

          setCameraVisible(false);
        } finally {
          photo.dispose();
        }
      } catch (error) {
        Alert.alert(
          'Camera Error',
          error instanceof Error
            ? error.message
            : 'Unable to capture photo. Please try again.',
        );
      } finally {
        setTakingPhoto(false);
      }
    };

    return (
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.uploadBtn} onPress={openCamera}>
            <MaterialIcons name="upload" size={20} color="#fff" />
            <Text style={styles.btnText}>
              {imageUri ? 'Change Image' : 'Upload Image'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => setPreviewVisible(true)}>
              <MaterialIcons name="visibility" size={20} color="#1976D2" />
              <Text style={styles.previewText}>Preview</Text>
            </TouchableOpacity>
          )}
        </View>

        {value && (
          <Text style={styles.fileName} numberOfLines={1}>
            {value.name}
          </Text>
        )}

        {/* Camera modal: capture a new photo only */}
        <Modal
          visible={cameraVisible}
          animationType="slide"
          onRequestClose={() => setCameraVisible(false)}>
          <View style={styles.cameraContainer}>
            {hasPermission && device ? (
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={cameraVisible}
                outputs={[photoOutput]}
              />
            ) : (
              <View style={styles.cameraMessage}>
                <Text style={styles.cameraMessageText}>
                  {!hasPermission
                    ? 'Camera permission is required.'
                    : 'Waiting for the camera...'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cameraCloseBtn}
              onPress={() => setCameraVisible(false)}>
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureBtn}
              onPress={capturePhoto}
              disabled={takingPhoto || !hasPermission || !device}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            {takingPhoto && (
              <Text style={styles.capturingText}>Capturing photo...</Text>
            )}
          </View>
        </Modal>

        {/* Existing full-screen preview */}
        <Modal
          visible={previewVisible}
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}>
          <View style={styles.previewContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPreviewVisible(false)}>
              <MaterialIcons name="close" size={26} color="white" />
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </View>
    );
  },
);
export default SuggestionImageUpload;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  btnText: { color: '#fff', marginLeft: 6 },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976D2',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginLeft: 10,
  },
  previewText: { color: '#1976D2', marginLeft: 6 },
  fileName: { marginTop: 6, color: '#555', fontSize: 12 },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'red',
    elevation: 5,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraMessageText: { color: '#fff', fontSize: 16 },
  cameraCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#333',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#fff',
    marginBottom: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  capturingText: {
    position: 'absolute',
    bottom: 120,
    color: '#fff',
    fontSize: 14,
  },
});