import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveField, useFieldAssist } from '../../context/FieldAssistContext';
import { ImageSource, pickImage } from '../../services/assist/imageText';
import {
  FORM_SCAN_MIN_FIELDS,
  formOcrEnabled,
  scanFormFromServer,
} from '../../services/assist/formOcr';
import FormScanReviewModal, { buildReviewRows, ReviewRow } from './FormScanReviewModal';
import { useFeatureToggles } from '../../context/FeatureToggleContext';

const nextFrame = () =>
  new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

type Snapshot = { field: ActiveField; prev: string };

/** Writes one value; lets the parent re-render first so its onChange closure is fresh. */
async function writeValue(field: ActiveField, value: string, option?: any) {
  await nextFrame();
  if (option && field.onSelectOption) {
    field.onSelectOption(option.value, option.label);
  } else {
    field.setText(value);
  }
}

async function rollback(snapshot: Snapshot[]) {
  for (const s of [...snapshot].reverse()) {
    try {
      await writeValue(s.field, s.prev);
    } catch {
      // best effort
    }
  }
}

/**
 * Standalone "Scan form" button: one photo fills many fields after review.
 * Separate from FieldAssistBar and single-field OCR; import and place
 * directly on screens where full-form scanning is needed (like VoiceControlButton).
 */
export default function FormScanButton({
  hosted = true,
  inline = false,
}: {
  hosted?: boolean;
  inline?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { isFeatureEnabled } = useFeatureToggles();
  const scanFormEnabled = isFeatureEnabled('scanForm');
  const { getFormFields, formFieldVersion, busy, listening } = useFieldAssist();
  const mountedAt = useRef(Date.now()).current;
  const [scanning, setScanning] = useState(false);
  const [rows, setRows] = useState<ReviewRow[] | null>(null);

  // Inside a modal, prefer the fields that mounted with the modal.
  const collect = useCallback(() => {
    if (hosted) {
      const recent = getFormFields(mountedAt - 1500);
      if (recent.length > 0) return recent;
    }
    return getFormFields();
  }, [hosted, getFormFields, mountedAt]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fieldCount = useMemo(() => collect().length, [collect, formFieldVersion]);

  const run = useCallback(
    async (source: ImageSource) => {
      const targets = collect();
      if (!targets.length) return;
      let uri: string | null = null;
      try {
        uri = await pickImage(source);
      } catch (e: any) {
        Alert.alert('Scan form', e?.message || 'Could not open the camera.');
        return;
      }
      if (!uri) return;

      setScanning(true);
      const out = await scanFormFromServer(uri, targets);
      setScanning(false);

      if (!out.ok) {
        Alert.alert('Scan form', out.message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => start() },
        ]);
        return;
      }
      const built = buildReviewRows(out.results, out.keyToField);
      if (!built.some(r => r.status !== 'missing')) {
        Alert.alert(
          'Nothing found',
          'No field values could be read from that photo. Make sure the labels and handwriting are in frame and well lit.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => start() },
          ],
        );
        return;
      }
      setRows(built);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collect],
  );

  const start = useCallback(() => {
    Alert.alert('Scan whole form', 'Take one clear photo of the filled form.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Gallery', onPress: () => run('library') },
      { text: 'Camera', onPress: () => run('camera') },
    ]);
  }, [run]);

  const apply = useCallback(async (selected: ReviewRow[]) => {
    setRows(null);
    const snapshot: Snapshot[] = [];
    try {
      for (const r of selected) {
        snapshot.push({ field: r.field, prev: String(r.field.getValue?.() ?? '') });
        if (r.isDropdown && r.option) {
          await writeValue(r.field, String(r.option.value), r.option);
        } else {
          await writeValue(r.field, r.text.trim());
        }
      }
    } catch {
      await rollback(snapshot);
      Alert.alert('Scan form', 'Something went wrong, so no fields were changed.');
      return;
    }

    // Verify every value stuck (protects against stale form-state closures).
    await nextFrame();
    const failed = selected.filter(r => {
      const now = String(r.field.getValue?.() ?? '');
      const want = r.isDropdown && r.option ? String(r.option.value) : r.text.trim();
      return now !== want;
    });
    for (const r of failed) {
      await writeValue(
        r.field,
        r.isDropdown && r.option ? String(r.option.value) : r.text.trim(),
        r.isDropdown ? r.option : undefined,
      );
    }

    const done = selected.length - failed.length;
    Alert.alert(
      'Form filled',
      `${selected.length} field${selected.length === 1 ? '' : 's'} updated${
        failed.length ? ` (${failed.length} needed a second try)` : ''
      }. Please check the values before submitting.`,
      [
        { text: 'Undo', style: 'destructive', onPress: () => rollback(snapshot) },
        { text: 'OK' },
      ],
    );
    return done;
  }, []);

  if (!scanFormEnabled) {
    return null;
  }

  const hidden =
    !scanFormEnabled || !formOcrEnabled || fieldCount < FORM_SCAN_MIN_FIELDS || (!scanning && (busy !== null || listening));

  const button = (
    <TouchableOpacity
      style={styles.fab}
      onPress={start}
      disabled={scanning}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Scan the whole form with one photo">
      {scanning ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <MaterialIcons name="document-scanner" size={18} color="#FFFFFF" />
      )}
      <Text style={styles.fabText}>{scanning ? 'Reading…' : 'Scan form'}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      {!hidden ? (
        inline ? (
          <View style={styles.inlineWrap}>{button}</View>
        ) : (
          <View
            pointerEvents="box-none"
            style={[styles.wrap, { bottom: 90 + insets.bottom }]}>
            {button}
          </View>
        )
      ) : null}
      {rows ? (
        <FormScanReviewModal
          visible
          rows={rows}
          onCancel={() => setRows(null)}
          onRetake={() => {
            setRows(null);
            start();
          }}
          onApply={apply}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  inlineWrap: {
    alignItems: 'flex-start',
  },
  wrap: {
    position: 'absolute',
    left: 16,
    bottom: 90,
    zIndex: 50,
    elevation: 8,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0054A6',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
