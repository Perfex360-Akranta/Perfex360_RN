import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import AppDropdown from '../../components/forms/AppDropdown';
import { post } from '../../services/axiosService';
import { useGrid } from '../../context/GridProvider';
import PcsLossEntry from './PcsLossEntry';

export type PcsEntryContext = {
  flid: string;
  elementid: string;
  cellid: string;
  sectionid: string;
  machineid: string;
  shift: string;
  entryDate: Date;
};

export type PcsProductionProps = {
  entry?: PcsEntryContext;
  editRow?: any | null;
  onClose?: () => void;
  onSaved?: () => void;
};

type PcsProductionRouteParams = {
  entry?: PcsEntryContext;
  editRow?: any;
};

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i + 1);
  return { label: hour, value: hour };
});

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
  const lowerMap: Record<string, any> = {};
  Object.keys(row).forEach(name => {
    lowerMap[name.toLowerCase().replace(/_/g, '')] = row[name];
  });
  for (const key of keys) {
    const value = lowerMap[key.toLowerCase().replace(/_/g, '')];
    if (value !== undefined && value !== null && value !== '' && value !== '{}') {
      return String(value);
    }
  }
  return '';
};

const displayMetric = (value: string) => {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? '0' : trimmed;
};

const PcsProduction: React.FC<PcsProductionProps> = ({
  entry: entryProp,
  editRow: editRowProp,
  onClose,
  onSaved,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: PcsProductionRouteParams }, 'params'>>();
  const { currentUser } = useGrid();

  const entry = entryProp ?? route.params?.entry;
  const editRow = editRowProp ?? route.params?.editRow ?? null;
  const isEdit = Boolean(editRow);

  const [hour, setHour] = useState('');
  const [product, setProduct] = useState('');
  const [model, setModel] = useState('');
  const [man, setMan] = useState('');
  const [rnt, setRnt] = useState('');
  const [batchQty, setBatchQty] = useState('');
  const [weightPiece, setWeightPiece] = useState('');
  const [planQty, setPlanQty] = useState('');
  const [prdQty, setPrdQty] = useState('');
  const [rwkQty, setRwkQty] = useState('');
  const [rejQty, setRejQty] = useState('');
  const [stopage, setStopage] = useState('');
  const [charges, setCharges] = useState('');
  const [remarks, setRemarks] = useState('');
  const [availTime, setAvailTime] = useState('0');
  const [prodTime, setProdTime] = useState('0');
  const [lossTime, setLossTime] = useState('0');
  const [unrepTime, setUnrepTime] = useState('0');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lossEntryEnabled] = useState(true);
  const [showLossEntry, setShowLossEntry] = useState(false);

  useEffect(() => {
    if (!editRow) {
      setHour('');
      setProduct('');
      setModel('');
      setMan('');
      setRnt('');
      setBatchQty('');
      setWeightPiece('');
      setPlanQty('');
      setPrdQty('');
      setRwkQty('');
      setRejQty('');
      setStopage('');
      setCharges('');
      setRemarks('');
      setAvailTime('0');
      setProdTime('0');
      setLossTime('0');
      setUnrepTime('0');
      return;
    }

    setHour(firstValue(editRow, ['hour', 'pcsdhour', 'shifthour']));
    setProduct(firstValue(editRow, ['productid', 'product', 'prdtid']));
    setModel(firstValue(editRow, ['modelid', 'model', 'mdlid']));
    setMan(firstValue(editRow, ['man', 'manid', 'operatorid', 'empid']));
    setRnt(firstValue(editRow, ['rnt', 'rntqty']));
    setBatchQty(firstValue(editRow, ['batchqty', 'batch']));
    setWeightPiece(firstValue(editRow, ['weightpiece', 'weight', 'wtpc']));
    setPlanQty(firstValue(editRow, ['planqty', 'plnqty']));
    setPrdQty(firstValue(editRow, ['prdqty', 'prodqty', 'producedqty']));
    setRwkQty(firstValue(editRow, ['rwkqty', 'reworkqty']));
    setRejQty(firstValue(editRow, ['rejqty', 'rejectqty']));
    setStopage(firstValue(editRow, ['stopage', 'stopageMin', 'stopagemin']));
    setCharges(firstValue(editRow, ['charges']));
    setRemarks(firstValue(editRow, ['remarks']));
    setAvailTime(firstValue(editRow, ['availtime', 'availtm']) || '0');
    setProdTime(firstValue(editRow, ['prodtime', 'prodtm']) || '0');
    setLossTime(firstValue(editRow, ['losstime', 'losstm']) || '0');
    setUnrepTime(firstValue(editRow, ['unreptime', 'unreptm']) || '0');
  }, [editRow]);

  const productParams = useMemo(
    () => ({
      cellid: entry?.cellid ?? '',
      flid: entry?.flid ?? '',
    }),
    [entry?.cellid, entry?.flid],
  );

  const modelParams = useMemo(
    () => ({
      productid: product,
      cellid: entry?.cellid ?? '',
    }),
    [product, entry?.cellid],
  );

  const closeScreen = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigation.goBack();
  };

  const recordKeyId = () =>
    firstValue(editRow, ['keyid', 'pcsdkeyid', 'pcskeyid', 'bdmskeyid']);

  const validate = () => {
    if (!hour) {
      Alert.alert('Missing field', 'Hour is required.');
      return false;
    }
    if (!product) {
      Alert.alert('Missing field', 'Product is required.');
      return false;
    }
    if (!model) {
      Alert.alert('Missing field', 'Model is required.');
      return false;
    }
    if (!man) {
      Alert.alert('Missing field', 'Man is required.');
      return false;
    }
    if (!prdQty.trim()) {
      Alert.alert('Missing field', 'Prd Qty is required.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const payload = {
      keyid: recordKeyId() || undefined,
      flid: entry?.flid ?? '',
      cellid: entry?.cellid ?? '',
      shift: entry?.shift ?? '',
      entrydate: entry?.entryDate ?? new Date(),
      hour,
      productid: product,
      modelid: model,
      man,
      rnt,
      batchqty: batchQty,
      weightpiece: weightPiece,
      planqty: planQty,
      prdqty: prdQty,
      rwkqty: rwkQty,
      rejqty: rejQty,
      stopage,
      charges,
      remarks: remarks.trim(),
      bookedby: currentUser?.employeeId ?? '',
    };

    try {
      setSaving(true);
      await post('pcs/mobile/production/save', payload);
      Alert.alert('Success', 'Production entry saved.');
      onSaved?.();
      closeScreen();
    } catch (error: any) {
      console.error('PCS production save error:', error);
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
      Alert.alert('Missing record', 'This production row cannot be deleted yet.');
      return;
    }

    Alert.alert('Delete', 'Delete this production entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await post('pcs/mobile/production/delete', { keyid });
            Alert.alert('Deleted', 'Production entry deleted.');
            onSaved?.();
            closeScreen();
          } catch (error: any) {
            console.error('PCS production delete error:', error);
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

  const handleLossEntry = () => {
    if (!hour) {
      Alert.alert('Missing field', 'Select Hour before opening Loss Entry.');
      return;
    }
    setShowLossEntry(true);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeHeader}>
        <View
          style={[
            styles.titleBar,
            Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 12 } : null,
          ]}
        >
          <Text style={styles.titleText}>{isEdit ? 'Edit Production' : 'New Production'}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={closeScreen}>
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Avail. Time</Text>
          <TextInput
            style={styles.metricInput}
            value={displayMetric(availTime)}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Prod. Time</Text>
          <TextInput
            style={styles.metricInput}
            value={displayMetric(prodTime)}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Loss Time</Text>
          <TextInput
            style={styles.metricInput}
            value={displayMetric(lossTime)}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Unrep. Time</Text>
          <TextInput
            style={styles.metricInput}
            value={displayMetric(unrepTime)}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <AppDropdown
            label="Hour"
            manditory={true}
            value={hour}
            endpoint=""
            dataset={HOUR_OPTIONS}
            onChange={setHour}
          />

          <AppDropdown
            key={`product-${entry?.cellid ?? 'none'}`}
            label="Product"
            manditory={true}
            value={product}
            endpoint="commonFilter/product"
            params={productParams}
            onChange={val => {
              setProduct(val);
              setModel('');
            }}
          />

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <AppDropdown
                key={`model-${product || 'none'}`}
                label="Model"
                manditory={true}
                value={model}
                endpoint="commonFilter/model"
                params={modelParams}
                onChange={setModel}
              />
            </View>
            <View style={styles.tripleCol}>
              <AppDropdown
                label="Man"
                manditory={true}
                value={man}
                endpoint="commonFilter/employee"
                params={{ cellid: entry?.cellid ?? '' }}
                onChange={setMan}
              />
            </View>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>RNT</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={rnt}
                editable={false}
                placeholder="0"
                placeholderTextColor="#7AA7BE"
              />
            </View>
          </View>

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>Batch Qty</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={batchQty}
                editable={false}
                placeholder="0"
                placeholderTextColor="#7AA7BE"
              />
            </View>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>Weight/Piece</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={weightPiece}
                editable={false}
                placeholder="0"
                placeholderTextColor="#7AA7BE"
              />
            </View>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>Plan Qty</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={planQty}
                editable={false}
                placeholder="0"
                placeholderTextColor="#7AA7BE"
              />
            </View>
          </View>

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>
                Prd Qty <Text style={styles.star}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={prdQty}
                onChangeText={setPrdQty}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>Rwk Qty</Text>
              <TextInput
                style={styles.input}
                value={rwkQty}
                onChangeText={setRwkQty}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.tripleCol}>
              <Text style={styles.fieldLabel}>Rej Qty</Text>
              <TextInput
                style={styles.input}
                value={rejQty}
                onChangeText={setRejQty}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.doubleRow}>
            <View style={styles.doubleCol}>
              <Text style={styles.fieldLabel}>Stopage(Min.)</Text>
              <TextInput
                style={styles.input}
                value={stopage}
                onChangeText={setStopage}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.doubleCol}>
              <Text style={styles.fieldLabel}>Charges</Text>
              <TextInput
                style={styles.input}
                value={charges}
                onChangeText={setCharges}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Remarks</Text>
          <TextInput
            style={styles.textArea}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
            placeholder="Remarks"
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
            {lossEntryEnabled ? (
              <TouchableOpacity
                style={[styles.btn, styles.lossBtn]}
                onPress={handleLossEntry}
                disabled={saving || deleting}
              >
                <Text style={styles.btnText}>Loss Entry</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showLossEntry} animationType="slide" onRequestClose={() => setShowLossEntry(false)}>
        <PcsLossEntry
          hour={hour}
          entry={entry}
          onClose={() => setShowLossEntry(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EAF6FB',
    zIndex: 20,
  },
  safeHeader: {
    backgroundColor: '#0D5DB8',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#D7EEF8',
    borderBottomWidth: 1,
    borderBottomColor: '#9EC9DE',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F4C75',
    marginBottom: 4,
  },
  metricInput: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#C5E8F5',
    borderWidth: 1,
    borderColor: '#8EC5DC',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  form: {
    padding: 12,
    paddingBottom: 32,
  },
  tripleRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tripleCol: {
    flex: 1,
    marginHorizontal: 3,
  },
  doubleRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  doubleCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  star: {
    color: '#DC2626',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#7EB6D0',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  disabledInput: {
    backgroundColor: '#C5E8F5',
    color: '#334155',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#7EB6D0',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1E293B',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 18,
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
  lossBtn: {
    backgroundColor: '#0D5DB8',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

export default PcsProduction;
