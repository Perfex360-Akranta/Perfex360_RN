import { api } from '../axios/axiosInstance';
import type { ActiveField, DropdownOption } from '../../context/FieldAssistContext';

/**
 * Feature flag for the full-form scan. Set to false to hide the
 * "Scan form" button entirely. Server side flag: `ocr.form.enabled`.
 * The existing single-field OCR is not affected by this flag.
 */
export let formOcrEnabled = true;

export function setFormOcrEnabled(enabled: boolean) {
  formOcrEnabled = enabled;
}

/** Minimum number of fillable fields on screen before the button shows. */
export const FORM_SCAN_MIN_FIELDS = 2;

const FORM_OCR_TIMEOUT_MS = 95000;
const MAX_IMAGE_EDGE = 2048;
const MAX_BASE64_CHARS = 7000000;
const MAX_OPTIONS_SENT = 200;
const MAX_FIELDS_SENT = 60;

/** Confidence at/above which a value is shown as "good" (green). */
export const HIGH_CONFIDENCE = 0.85;

export type FormScanResult = {
  key: string;
  value: string;
  option: string | null;
  confidence: number;
};

export type FormScanOutcome =
  | { ok: true; results: FormScanResult[]; keyToField: Map<string, ActiveField> }
  | { ok: false; message: string };

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
      85,
    );
    if (resized?.uri) {
      path = resized.uri;
    }
  } catch {
    // Resize is best-effort; fall back to the original image.
  }
  return RNFS.readFile(path.replace(/^file:\/\//, ''), 'base64');
}

export function optionText(opt: DropdownOption): string {
  return String(opt?.label ?? opt?.value ?? '').trim();
}

/** Sends one photo of the whole form plus the on-screen field list. */
export async function scanFormFromServer(
  uri: string,
  fields: ActiveField[],
): Promise<FormScanOutcome> {
  if (!formOcrEnabled) {
    return { ok: false, message: 'Form scan is turned off.' };
  }
  const usable = fields.slice(0, MAX_FIELDS_SENT);
  const keyToField = new Map<string, ActiveField>();
  const payloadFields = usable.map((f, i) => {
    const key = `f${i + 1}`;
    keyToField.set(key, f);
    const isDropdown = f.type === 'dropdown';
    const opts = isDropdown && f.getOptions ? f.getOptions() : [];
    return {
      key,
      label: String(f.label || '').slice(0, 120),
      type: isDropdown ? 'dropdown' : 'text',
      multiline: !!f.multiline,
      maxLength: f.maxLength,
      // Very long lists (e.g. employees) are matched on the device instead.
      options:
        isDropdown && opts.length > 0 && opts.length <= MAX_OPTIONS_SENT
          ? opts.map(o => optionText(o).slice(0, 80)).filter(Boolean)
          : undefined,
    };
  });

  try {
    const imageBase64 = await toBase64(uri);
    if (!imageBase64) {
      return { ok: false, message: 'Could not read the photo.' };
    }
    if (imageBase64.length > MAX_BASE64_CHARS) {
      return { ok: false, message: 'The photo is too large. Please retake it.' };
    }
    const response = await api.post(
      '/ocr/form',
      { imageBase64, fields: payloadFields },
      { timeout: FORM_OCR_TIMEOUT_MS },
    );
    const data = response?.data;
    if (data?.success !== true || !Array.isArray(data?.fields)) {
      return {
        ok: false,
        message: data?.message || 'Could not read the form. Please try again.',
      };
    }
    const results: FormScanResult[] = data.fields
      .filter((r: any) => r && keyToField.has(String(r.key)))
      .map((r: any) => ({
        key: String(r.key),
        value: typeof r.value === 'string' ? r.value : '',
        option: typeof r.option === 'string' && r.option ? r.option : null,
        confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
      }));
    return { ok: true, results, keyToField };
  } catch (e: any) {
    const status = e?.response?.status;
    if (e?.code === 'ECONNABORTED') {
      return { ok: false, message: 'Reading the form took too long. Please try again.' };
    }
    return {
      ok: false,
      message: status
        ? `Form scan failed (HTTP ${status}). Please try again.`
        : 'Could not reach the server. Check your connection and try again.',
    };
  }
}

// ---------------------------------------------------------------------------
// Dropdown matching for the form scan.
// Rule: the value WRITTEN by the user wins. An option is only selected when it
// matches that written value; otherwise the field stays unresolved.
// (Kept separate from findBestDropdownMatch so the single-field flow is untouched.)
// ---------------------------------------------------------------------------

const norm = (v: any) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export type DropdownMatch = {
  option: DropdownOption | null;
  /** exact = written value equals an option; partial = needs a look; none = unresolved */
  kind: 'exact' | 'partial' | 'none';
};

export function matchWrittenOption(
  options: DropdownOption[],
  written: string,
  suggested: string | null,
): DropdownMatch {
  const w = norm(written);
  if (!w || !options?.length) {
    return { option: null, kind: 'none' };
  }

  // 1) Written value equals an option label or value.
  const exact = options.find(o => norm(o.label) === w || norm(o.value) === w);
  if (exact) {
    return { option: exact, kind: 'exact' };
  }

  const related = (o: DropdownOption) => {
    const l = norm(o.label);
    const v = norm(o.value);
    if (w.length >= 2 && (l.includes(w) || (v && v.includes(w)))) return true;
    if (l.length >= 3 && w.includes(l)) return true;
    // shared word prefix of 3+ chars, e.g. "Mech" vs "Mechanical"
    const wt = w.split(' ').filter(t => t.length >= 3);
    const lt = l.split(' ').filter(t => t.length >= 3);
    return wt.some(a => lt.some(b => a.startsWith(b) || b.startsWith(a)));
  };

  // 2) Gemini's suggestion, only if it really is an option AND relates to the written text.
  if (suggested) {
    const s = norm(suggested);
    const sug = options.find(o => norm(o.label) === s || norm(o.value) === s);
    if (sug && related(sug)) {
      return { option: sug, kind: 'partial' };
    }
  }

  // 3) Exactly one option relates to the written value.
  const hits = options.filter(related);
  if (hits.length === 1) {
    return { option: hits[0], kind: 'partial' };
  }
  return { option: null, kind: 'none' };
}
