import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  useBarcodeScannerOutput,
  type Barcode,
  type TargetBarcodeFormat,
} from 'react-native-vision-camera-barcode-scanner';

const QR_FORMATS: TargetBarcodeFormat[] = ['qr-code'];
const SCAN_FRAME_SIZE = 240;
const SCAN_INSET = 8;

function extractIdFromQr(rawValue: string): string {
  const trimmed = rawValue.trim();

  try {
    const parsed = JSON.parse(trimmed);
    const jsonId =
      parsed?.id ?? parsed?.ID ?? parsed?.Id ?? parsed?.code ?? parsed?.CODE;
    if (jsonId != null && String(jsonId).trim() !== '') {
      return String(jsonId).trim();
    }
  } catch {
    // QR payload is not JSON
  }

  const queryMatch = trimmed.match(/[?&](?:id|ID|Id)=([^&]+)/);
  if (queryMatch?.[1]) {
    return decodeURIComponent(queryMatch[1]);
  }

  return trimmed;
}

function getScanFrameRect(viewSize: { width: number; height: number }) {
  return {
    x: (viewSize.width - SCAN_FRAME_SIZE) / 2,
    y: (viewSize.height - SCAN_FRAME_SIZE) / 2,
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
  };
}

function isPointInsideFrame(
  point: { x: number; y: number },
  frame: { x: number; y: number; width: number; height: number },
) {
  return (
    point.x >= frame.x + SCAN_INSET &&
    point.x <= frame.x + frame.width - SCAN_INSET &&
    point.y >= frame.y + SCAN_INSET &&
    point.y <= frame.y + frame.height - SCAN_INSET
  );
}

function getUprightImageSize(
  resolution: { width: number; height: number } | undefined,
  viewSize: { width: number; height: number },
) {
  if (resolution == null || resolution.width <= 0 || resolution.height <= 0) {
    return null;
  }

  const viewIsPortrait = viewSize.height >= viewSize.width;
  const imageIsPortrait = resolution.height >= resolution.width;
  if (viewIsPortrait === imageIsPortrait) {
    return { width: resolution.width, height: resolution.height };
  }

  return { width: resolution.height, height: resolution.width };
}

function mapImagePointToView(
  point: { x: number; y: number },
  imageSize: { width: number; height: number },
  viewSize: { width: number; height: number },
) {
  const scale = Math.max(
    viewSize.width / imageSize.width,
    viewSize.height / imageSize.height,
  );
  return {
    x: point.x * scale + (viewSize.width - imageSize.width * scale) / 2,
    y: point.y * scale + (viewSize.height - imageSize.height * scale) / 2,
  };
}

function isBarcodeInsideScanFrame(
  barcode: Barcode,
  viewSize: { width: number; height: number },
  scanFrame: { x: number; y: number; width: number; height: number },
  resolution: { width: number; height: number } | undefined,
) {
  const imageSize = getUprightImageSize(resolution, viewSize);
  if (imageSize == null) {
    return false;
  }

  const box = barcode.boundingBox;
  const rawPoints =
    barcode.cornerPoints.length > 0
      ? barcode.cornerPoints
      : [
        { x: box.left, y: box.top },
        { x: box.right, y: box.top },
        { x: box.right, y: box.bottom },
        { x: box.left, y: box.bottom },
      ];

  const isNormalized = box.right <= 1.5 && box.bottom <= 1.5;
  const imagePoints = rawPoints.map(point =>
    isNormalized
      ? { x: point.x * imageSize.width, y: point.y * imageSize.height }
      : point,
  );

  return imagePoints.every(point =>
    isPointInsideFrame(
      mapImagePointToView(point, imageSize, viewSize),
      scanFrame,
    ),
  );
}

export default function QrCodeScannerScreen({ navigation, route }: any) {
  const returnTo = route?.params?.returnTo as string | undefined;
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [rawValue, setRawValue] = useState<string | null>(null);
  const scannedRef = useRef(false);
  const viewSizeRef = useRef(viewSize);
  viewSizeRef.current = viewSize;
  const barcodeOutputRef = useRef<ReturnType<typeof useBarcodeScannerOutput> | null>(
    null,
  );

  const handleBarcode = useCallback(
    (value: string) => {
      scannedRef.current = true;
      const id = extractIdFromQr(value);

      if (returnTo === 'QrIds') {
        navigation.navigate({
          name: 'QrIds',
          params: { scannedId: id },
          merge: true,
        });
        return;
      }

      setRawValue(value);
      setScannedId(id);
    },
    [navigation, returnTo],
  );

  const onBarcodeScanned = useCallback(
    (barcodes: Barcode[]) => {
      const currentViewSize = viewSizeRef.current;
      if (scannedRef.current || currentViewSize.width === 0) {
        return;
      }

      const scanFrame = getScanFrameRect(currentViewSize);
      const codeInFrame = barcodes.find(
        barcode =>
          !!barcode.rawValue &&
          isBarcodeInsideScanFrame(
            barcode,
            currentViewSize,
            scanFrame,
            barcodeOutputRef.current?.currentResolution,
          ),
      );

      if (codeInFrame?.rawValue) {
        handleBarcode(codeInFrame.rawValue);
      }
    },
    [handleBarcode],
  );

  const barcodeOutput = useBarcodeScannerOutput({
    barcodeFormats: QR_FORMATS,
    outputResolution: 'preview',
    onBarcodeScanned,
    onError: () => {
      
    },
  });
  barcodeOutputRef.current = barcodeOutput;
  const outputs = useMemo(() => [barcodeOutput], [barcodeOutput]);

  const handleScanAgain = () => {
    scannedRef.current = false;
    setScannedId(null);
    setRawValue(null);
  };

  const scanFrame =
    viewSize.width > 0 ? getScanFrameRect(viewSize) : null;

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera permission required</Text>
        <Text style={styles.subtitle}>
          Allow camera access to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openSettings()}>
          <Text style={styles.linkText}>Open settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>No camera found</Text>
        <Text style={styles.subtitle}>
          A back camera is required to scan QR codes.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={event => {
        setViewSize(event.nativeEvent.layout);
      }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && scannedId == null}
        outputs={outputs}
        resizeMode="cover"
      />

      <View style={styles.overlay} pointerEvents="none">
        {scanFrame != null && (
          <>
            <View
              style={[
                styles.scanFrame,
                {
                  left: scanFrame.x,
                  top: scanFrame.y,
                },
              ]}
            />
            <Text
              style={[
                styles.hint,
                { top: scanFrame.y + scanFrame.height + 16 },
              ]}>
              Align the QR code inside the frame
            </Text>
          </>
        )}
      </View>

      {scannedId != null && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Fetched ID</Text>
          <Text style={styles.resultValue}>{scannedId}</Text>
          {rawValue != null && rawValue !== scannedId && (
            <Text style={styles.rawValue}>Raw QR: {rawValue}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Scan again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#EAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  scanFrame: {
    position: 'absolute',
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  resultValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
    color: '#0D5DB8',
  },
  rawValue: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#0D5DB8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  linkButton: {
    marginTop: 12,
  },
  linkText: {
    color: '#0D5DB8',
    fontWeight: '600',
  },
});
