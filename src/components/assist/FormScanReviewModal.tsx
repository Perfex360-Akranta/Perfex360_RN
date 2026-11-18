import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ActiveField, DropdownOption } from '../../context/FieldAssistContext';
import {
  FormScanResult,
  HIGH_CONFIDENCE,
  matchWrittenOption,
  optionText,
} from '../../services/assist/formOcr';

export type RowStatus = 'good' | 'check' | 'unresolved' | 'missing';

export type ReviewRow = {
  key: string;
  field: ActiveField;
  label: string;
  isDropdown: boolean;
  current: string;
  written: string;
  confidence: number;
  text: string;
  option: DropdownOption | null;
  status: RowStatus;
  apply: boolean;
};

function currentDisplay(field: ActiveField): string {
  const raw = String(field.getValue?.() ?? '').trim();
  if (!raw || field.type !== 'dropdown') return raw;
  const opts = field.getOptions ? field.getOptions() : [];
  const hit = opts.find(o => String(o.value) === raw);
  return hit ? optionText(hit) : raw;
}

/** Turns server results into review rows. Nothing is applied here. */
export function buildReviewRows(
  results: FormScanResult[],
  keyToField: Map<string, ActiveField>,
): ReviewRow[] {
  const byKey = new Map(results.map(r => [r.key, r]));
  const rows: ReviewRow[] = [];
  keyToField.forEach((field, key) => {
    const r = byKey.get(key);
    const written = (r?.value ?? '').trim();
    const confidence = r?.confidence ?? 0;
    const isDropdown = field.type === 'dropdown';
    const current = currentDisplay(field);
    let status: RowStatus;
    let option: DropdownOption | null = null;
    let text = '';

    if (!written) {
      status = 'missing';
    } else if (isDropdown) {
      const opts = field.getOptions ? field.getOptions() : [];
      const m = matchWrittenOption(opts, written, r?.option ?? null);
      option = m.option;
      status =
        m.kind === 'none'
          ? 'unresolved'
          : m.kind === 'exact' && confidence >= HIGH_CONFIDENCE
          ? 'good'
          : 'check';
    } else {
      text = field.multiline
        ? written.replace(/\r/g, '')
        : written.replace(/\s+/g, ' ');
      if (field.maxLength != null && text.length > field.maxLength) {
        text = text.slice(0, field.maxLength);
      }
      status = confidence >= HIGH_CONFIDENCE ? 'good' : 'check';
    }

    rows.push({
      key,
      field,
      label: String(field.label || 'Field'),
      isDropdown,
      current,
      written,
      confidence,
      text,
      option,
      status,
      // Never overwrite existing data by default; user can opt in per row.
      apply: (status === 'good' || status === 'check') && !current,
    });
  });
  return rows;
}

const canApply = (r: ReviewRow) =>
  r.isDropdown ? !!r.option : r.text.trim().length > 0;

const STATUS_META: Record<RowStatus, { label: string; color: string; bg: string }> = {
  good: { label: 'Clear', color: '#15803D', bg: '#DCFCE7' },
  check: { label: 'Please check', color: '#B45309', bg: '#FEF3C7' },
  unresolved: { label: 'No matching option', color: '#B91C1C', bg: '#FEE2E2' },
  missing: { label: 'Not found in photo', color: '#64748B', bg: '#F1F5F9' },
};

type Props = {
  visible: boolean;
  rows: ReviewRow[];
  onCancel: () => void;
  onRetake: () => void;
  onApply: (rows: ReviewRow[]) => void;
};

export default function FormScanReviewModal({
  visible,
  rows: initialRows,
  onCancel,
  onRetake,
  onApply,
}: Props) {
  const [rows, setRows] = useState<ReviewRow[]>(initialRows);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setRows(initialRows);
    setOpenPicker(null);
    setFilter('');
  }, [initialRows]);

  const update = (key: string, patch: Partial<ReviewRow>) =>
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));

  const selected = rows.filter(r => r.apply && canApply(r));
  const attention = rows.filter(
    r => r.status === 'check' || r.status === 'unresolved',
  ).length;
  const found = rows.filter(r => r.status !== 'missing').length;

  const pickerOptions = useMemo(() => {
    const row = rows.find(r => r.key === openPicker);
    if (!row?.field.getOptions) return [];
    const q = filter.trim().toLowerCase();
    return row.field
      .getOptions()
      .filter(o => !q || optionText(o).toLowerCase().includes(q))
      .slice(0, 50);
  }, [rows, openPicker, filter]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Review scanned values</Text>
            <Text style={styles.subtitle}>
              {found} of {rows.length} fields found
              {attention ? ` · ${attention} need attention` : ''}
            </Text>
          </View>

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {rows.map(r => {
              const meta = STATUS_META[r.status];
              const applicable = canApply(r);
              return (
                <View
                  key={r.key}
                  style={[styles.row, { borderColor: meta.bg, borderLeftColor: meta.color }]}>
                  <View style={styles.rowTop}>
                    <TouchableOpacity
                      onPress={() => applicable && update(r.key, { apply: !r.apply })}
                      disabled={!applicable}
                      style={styles.checkHit}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: r.apply && applicable, disabled: !applicable }}>
                      <MaterialIcons
                        name={r.apply && applicable ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={applicable ? '#0054A6' : '#CBD5E1'}
                      />
                    </TouchableOpacity>
                    <Text style={styles.label} numberOfLines={1}>
                      {r.label}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.badgeText, { color: meta.color }]}>
                        {meta.label}
                        {r.status !== 'missing' ? ` · ${Math.round(r.confidence * 100)}%` : ''}
                      </Text>
                    </View>
                  </View>

                  {r.current ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      Current: {r.current}
                    </Text>
                  ) : null}

                  {r.isDropdown ? (
                    <>
                      {r.written ? (
                        <Text style={styles.meta} numberOfLines={2}>
                          Written: “{r.written}”
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        style={[styles.select, !r.option && styles.selectEmpty]}
                        onPress={() => {
                          setFilter('');
                          setOpenPicker(openPicker === r.key ? null : r.key);
                        }}>
                        <Text
                          style={[styles.selectText, !r.option && styles.selectPlaceholder]}
                          numberOfLines={1}>
                          {r.option ? optionText(r.option) : 'Choose an option'}
                        </Text>
                        <MaterialIcons
                          name={openPicker === r.key ? 'expand-less' : 'expand-more'}
                          size={20}
                          color="#475569"
                        />
                      </TouchableOpacity>
                      {openPicker === r.key ? (
                        <View style={styles.picker}>
                          <TextInput
                            style={styles.filter}
                            placeholder="Search options"
                            placeholderTextColor="#94A3B8"
                            value={filter}
                            onChangeText={setFilter}
                          />
                          {pickerOptions.length === 0 ? (
                            <Text style={styles.meta}>No options</Text>
                          ) : (
                            pickerOptions.map((o, i) => (
                              <TouchableOpacity
                                key={`${String(o.value)}-${i}`}
                                style={styles.option}
                                onPress={() => {
                                  update(r.key, {
                                    option: o,
                                    apply: true,
                                    status: r.status === 'missing' ? 'check' : r.status === 'unresolved' ? 'check' : r.status,
                                  });
                                  setOpenPicker(null);
                                }}>
                                <Text style={styles.optionText}>{optionText(o)}</Text>
                              </TouchableOpacity>
                            ))
                          )}
                        </View>
                      ) : null}
                    </>
                  ) : (
                    <TextInput
                      style={[styles.input, r.field.multiline && styles.inputMulti]}
                      value={r.text}
                      multiline={!!r.field.multiline}
                      maxLength={r.field.maxLength}
                      placeholder={r.status === 'missing' ? 'Not found – type to fill' : ''}
                      placeholderTextColor="#94A3B8"
                      onChangeText={t =>
                        update(r.key, { text: t, apply: t.trim().length > 0 ? r.apply || !r.current : false })
                      }
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onRetake}>
              <MaterialIcons name="replay" size={16} color="#0054A6" />
              <Text style={styles.btnGhostText}> Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, !selected.length && styles.btnDisabled]}
              disabled={!selected.length}
              onPress={() => onApply(selected)}>
              <Text style={styles.btnPrimaryText}>Apply ({selected.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#475569', marginTop: 2 },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  row: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  checkHit: { paddingRight: 6 },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 12, color: '#64748B', marginTop: 4 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#0F172A',
  },
  inputMulti: { minHeight: 64, textAlignVertical: 'top' },
  select: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectEmpty: { borderColor: '#FCA5A5', backgroundColor: '#FFF7F7' },
  selectText: { flex: 1, fontSize: 14, color: '#0F172A' },
  selectPlaceholder: { color: '#B91C1C' },
  picker: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 6,
  },
  filter: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    fontSize: 13,
    color: '#0F172A',
  },
  option: { paddingVertical: 8, paddingHorizontal: 6 },
  optionText: { fontSize: 14, color: '#0F172A' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnGhost: { backgroundColor: '#EFF6FF' },
  btnGhostText: { color: '#0054A6', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#0054A6' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '700' },
  btnDisabled: { opacity: 0.45 },
});
