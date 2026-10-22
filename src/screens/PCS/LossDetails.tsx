import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';

import AppDropdown from '../../components/forms/AppDropdown';
import { post } from '../../services/axiosService';
import { useGrid } from '../../context/GridProvider';
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i + 1);
  return { label: hour, value: hour };
});

type LossEntryContext = {
  flid: string;
  elementid: string;
  cellid: string;
  sectionid: string;
  machineid: string;
  shift: string;
  entryDate: Date;
};

const firstValue = (row: any, keys: string[]) => {
  if (!row) {
    return '';
  }
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== '' && value !== '{}') {
      return String(value);
    }
  }
  return '';
};

type LossDetailsProps = {
  visible: boolean;
  hour: string;
  entry?: LossEntryContext;
  editRow?: any | null;
  onClose: () => void;
  onSaved?: () => void;
};

const LossDetails: React.FC<LossDetailsProps> = ({
  visible,
  hour,
  entry,
  editRow,
  onClose,
  onSaved,
}) => {
  const { currentUser } = useGrid();
  const [subLoss, setSubLoss] = useState('');
  const [lossName, setLossName] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!editRow) {
      setSubLoss('');
      setLossName('');
      setLossReason('');
      setRemarks('');
      return;
    }
    setSubLoss(firstValue(editRow, ['sublossid', 'subloss', 'sublosskeyid']));
    setLossName(firstValue(editRow, ['lossnameid', 'lossname', 'lossid']));
    setLossReason(firstValue(editRow, ['lossreasonid', 'lossreason', 'reasonid']));
    setRemarks(firstValue(editRow, ['remarks']));
  }, [visible, editRow]);

  const subLossParams = useMemo(
    () => ({
      cellid: entry?.cellid ?? '',
      flid: entry?.flid ?? '',
    }),
    [entry?.cellid, entry?.flid],
  );

  const lossNameParams = useMemo(
    () => ({
      sublossid: subLoss,
      cellid: entry?.cellid ?? '',
    }),
    [subLoss, entry?.cellid],
  );

  const lossReasonParams = useMemo(
    () => ({
      lossnameid: lossName,
      sublossid: subLoss,
    }),
    [lossName, subLoss],
  );

  const recordKeyId = () =>
    firstValue(editRow, ['keyid', 'pcslkeyid', 'losskeyid']);

  const handleSave = async () => {
    if (!hour) {
      Alert.alert('Missing field', 'Hour is required.');
      return;
    }
    if (!subLoss) {
      Alert.alert('Missing field', 'Sub Loss is required.');
      return;
    }

    const payload = {
      keyid: recordKeyId() || undefined,
      flid: entry?.flid ?? '',
      cellid: entry?.cellid ?? '',
      shift: entry?.shift ?? '',
      entrydate: entry?.entryDate ?? new Date(),
      hour,
      sublossid: subLoss,
      lossnameid: lossName,
      lossreasonid: lossReason,
      remarks: remarks.trim(),
      bookedby: currentUser?.employeeId ?? '',
    };

    try {
      setSaving(true);
      await post('pcs/mobile/loss/save', payload);
      Alert.alert('Success', 'Loss details saved.');
      onSaved?.();
      onClose();
    } catch (error: any) {
      console.error('PCS loss save error:', error);
      Alert.alert(
        'Save Failed',
        error?.response?.data?.message || error?.message || 'Unable to save.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    const keyid = recordKeyId();
    if (!keyid) {
      Alert.alert('Missing record', 'This loss row cannot be deleted yet.');
      return;
    }

    Alert.alert('Delete', 'Delete this loss entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await post('pcs/mobile/loss/delete', { keyid });
            Alert.alert('Deleted', 'Loss entry deleted.');
            onSaved?.();
            onClose();
          } catch (error: any) {
            console.error('PCS loss delete error:', error);
            Alert.alert(
              'Delete Failed',
              error?.response?.data?.message || error?.message || 'Unable to delete.',
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Loss Details</Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <AppDropdown
              label="Hour"
              manditory={true}
              value={hour}
              endpoint=""
              dataset={HOUR_OPTIONS}
              disable={true}
              onChange={() => { }}
            />

            <AppDropdown
              key={`subloss-${entry?.cellid ?? 'none'}`}
              label="Sub Loss"
              manditory={true}
              value={subLoss}
              endpoint="commonFilter/pcs/subloss"
              params={subLossParams}
              onChange={val => {
                setSubLoss(val);
                setLossName('');
                setLossReason('');
              }}
            />

            <AppDropdown
              key={`lossname-${subLoss || 'none'}`}
              label="Loss Name"
              value={lossName}
              endpoint="commonFilter/pcs/lossname"
              params={lossNameParams}
              onChange={val => {
                setLossName(val);
                setLossReason('');
              }}
            />

            <Text style={styles.fieldLabel}>Loss Reason</Text>
            <TextInput
              style={styles.textArea}
              value={lossReason}
              onChangeText={setLossReason}
              multiline
              numberOfLines={4}
              placeholder="Enter Loss Reason"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>Remarks</Text>
            <TextInput
              style={styles.textArea}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              placeholder="Remarks (Optional)"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.saveBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving || deleting}
              >
                <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.deleteBtn, deleting && styles.disabledBtn]}
                onPress={handleDelete}
                disabled={saving || deleting}
              >
                <Text style={styles.btnText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '92%',
    maxHeight: '88%',
    backgroundColor: '#EAF6FB',
    borderRadius: 10,
    padding: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C75',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#7EB6D0',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1E293B',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#2E7D32',
  },
  deleteBtn: {
    backgroundColor: '#C62828',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

export default LossDetails;
