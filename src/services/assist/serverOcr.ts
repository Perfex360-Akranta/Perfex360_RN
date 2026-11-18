import { api } from '../axios/axiosInstance';

/**
 * Reversibility flag: set to false to skip the server (Gemini) OCR entirely
 * and use only on-device OCR. The server has a matching `ocr.gemini.enabled`.
 */
export const serverOcrEnabled = true;

const SERVER_OCR_TIMEOUT_MS = 28000;
const MAX_IMAGE_EDGE = 1280;
const MAX_BASE64_CHARS = 7000000;

export type ServerOcrHints = {
  label?: string;
  multiline?: boolean;
  maxLength?: number;
  options?: string[];
};

async function toBase64(uri: string): Promise<string> {
  const RNFS = require('react-native-fs');
  let path = uri;
  try {
    const Resizer = require('react-native-image-resizer').default;
    const resized = await Resizer.createResizedImage(
      uri,
      MAX_IMAGE_EDGE,
      MAX_IMAGE_EDGE,
      'JPEG',
      70,
    );
    if (resized?.uri) {
      path = resized.uri;
    }
  } catch {
    // Resize is best-effort; fall back to the original image.
  }
  return RNFS.readFile(path.replace(/^file:\/\//, ''), 'base64');
}

/**
 * Returns recognized text from the server, or null on ANY problem
 * (disabled, timeout, 429/5xx, network, success=false, empty text)
 * so the caller can silently fall back to on-device OCR.
 */
export async function readTextFromServer(
  uri: string,
  hints: ServerOcrHints = {},
): Promise<string | null> {
  if (!serverOcrEnabled) {
    console.log('[ServerOCR] disabled');
    return null;
  }
  try {
    const started = Date.now();
    const imageBase64 = await toBase64(uri);
    console.log('[ServerOCR] payload chars', imageBase64?.length);
    if (!imageBase64 || imageBase64.length > MAX_BASE64_CHARS) {
      return null;
    }
    const response = await api.post(
      '/ocr/handwriting',
      {
        imageBase64,
        label: hints.label,
        multiline: !!hints.multiline,
        maxLength: hints.maxLength,
        options: hints.options?.length ? hints.options : undefined,
      },
      { timeout: SERVER_OCR_TIMEOUT_MS },
    );
    const data = response?.data;
    console.log('[ServerOCR] response', Date.now() - started, 'ms', JSON.stringify(data));
    const text = typeof data?.text === 'string' ? data.text.trim() : '';
    return data?.success === true && text ? text : null;
  } catch (e: any) {
    console.log('[ServerOCR] failed -> fallback', e?.response?.status, e?.message);
    return null;
  }
}
