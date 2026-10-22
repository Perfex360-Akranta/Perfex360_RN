export type ImageSource = 'camera' | 'library';

function loadPicker() {
  return require('react-native-image-picker') as {
    launchCamera: (options: object) => Promise<{
      didCancel?: boolean;
      errorCode?: string;
      errorMessage?: string;
      assets?: { uri?: string }[];
    }>;
    launchImageLibrary: (options: object) => Promise<{
      didCancel?: boolean;
      errorCode?: string;
      errorMessage?: string;
      assets?: { uri?: string }[];
    }>;
  };
}

function loadOcr() {
  return require('@dariyd/react-native-text-recognition') as {
    recognizeText: (uri: string, options?: { recognitionLevel?: 'line' | 'word' | 'block' }) => Promise<{
      success?: boolean;
      fullText?: string;
      errorMessage?: string;
    }>;
  };
}

export async function pickImage(source: ImageSource) {
  const picker = loadPicker();
  const options = {
    mediaType: 'photo' as const,
    selectionLimit: 1,
    quality: 0.85 as const,
    saveToPhotos: false,
  };
  const result =
    source === 'camera'
      ? await picker.launchCamera(options)
      : await picker.launchImageLibrary(options);

  if (result.didCancel) {
    return null;
  }
  if (result.errorCode) {
    if (result.errorCode === 'permission') {
      throw new Error(
        source === 'camera'
          ? 'Allow camera access to scan text into the field.'
          : 'Allow photo access to read text from an image.',
      );
    }
    throw new Error(result.errorMessage || 'Could not open the image.');
  }

  return result.assets?.[0]?.uri ?? null;
}

export async function readTextFromImage(uri: string) {
  const { recognizeText } = loadOcr();
  const result = await recognizeText(uri, { recognitionLevel: 'line' });
  if (result && result.success === false) {
    throw new Error(result.errorMessage || 'Could not read text from that image.');
  }
  return typeof result?.fullText === 'string' ? result.fullText.trim() : '';
}
