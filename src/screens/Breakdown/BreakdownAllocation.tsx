import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { useRoute, RouteProp } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import AppDropdown from '../../components/forms/AppDropdown';
import DatePicker from '../../components/forms/DatePicker';
import TimePickerInput from '../../components/forms/TimePickerInput';
import EquipmentHeader from '../../components/QRscanner/EquipmentHeader';
import EquipmentScanner from '../../components/QRscanner/EquipmentScanner';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';
import { parseDate, toApiDateString } from '../../utils/DateFormat';
import { saveBreakdownAllocation } from '../../services/api/BreakdownBookingApi';
import { BreakdownAllocationPayload } from '../../types/breakdown';

const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const parseDateTime = (value: any): Date | null => {
  if (!value || value === '{}') {
    return null;
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  const str = String(value).trim();
  const withTime = str.match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (withTime) {
    const monthIndex = MONTHS[withTime[2].toUpperCase()];
    if (monthIndex === undefined) {
      return parseDate(str);
    }
    const parsedWithTime = new Date(
      Number(withTime[3]),
      monthIndex,
      Number(withTime[1]),
      Number(withTime[4] ?? 0),
      Number(withTime[5] ?? 0),
      Number(withTime[6] ?? 0),
    );
    const year = parsedWithTime.getFullYear();
    if (year <= 1801 || year >= 2100) {
      return null;
    }
    return parsedWithTime;
  }

  const fromDdMonYyyy = parseDate(str);
  if (fromDdMonYyyy) {
    return fromDdMonYyyy;
  }

  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  const year = parsed.getFullYear();
  if (year <= 1801 || year >= 2100) {
    return null;
  }
  return parsed;
};

const applyDatePart = (current: Date, next: Date) => {
  const merged = new Date(current);
  merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
  return merged;
};

const applyTimePart = (current: Date, next: Date) => {
  const merged = new Date(current);
  merged.setHours(next.getHours(), next.getMinutes(), next.getSeconds(), 0);
  return merged;
};

const firstValue = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== '' && value !== '{}') {
      return value;
    }
  }
  return '';
};

type BreakdownAllocationRouteParams = {
  equipmentNo?: string;
};

const BreakdownAllocation: React.FC = () => {
  const route = useRoute<RouteProp<{ params: BreakdownAllocationRouteParams }, 'params'>>();
  const { currentUser } = useGrid();
  const cardsRef = useRef<any>(null);

  const [equipmentNo, setEquipmentNo] = useState(route.params?.equipmentNo);
  const [machineid, setMachineid] = useState<string | null>(null);
  const [flid, setFlid] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [sectionId, setSectionId] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const scannerNavigation = useMemo(
    () => ({
      navigate: (arg: any) => {
        const params = arg?.params ?? arg;
        const scanned = params?.equipmentNo ?? params?.scannedId;
        if (scanned) {
          setMachineid(null);
          setFlid(null);
          setEquipmentNo(String(scanned));
          setShowScanner(false);
        }
      },
      goBack: () => setShowScanner(false),
    }),
    [],
  );

  const conditionParams = useMemo(() => {
    if (!machineid) {
      return null;
    }

    return {
      FLID: '',
      MACHINEID: machineid,
      ASSEMBLYID: '',
      BOOKEDBY: currentUser?.employeeId ?? '',
    };
  }, [machineid, currentUser?.employeeId]);

  const closeEdit = () => {
    setShowEdit(false);
    setSaving(false);
  };

  const openScanner = () => setShowScanner(true);

  const handleEquipmentLoaded = (details: {
    machineid: string;
    flid: string;
  }) => {
    setMachineid(details.machineid ?? null);
    setFlid(details.flid ?? null);
  };

  const handleEdit = (record: GridEditProps) => {
    const row = record.row;
    console.log(row);

    const now = new Date();
    setSelectedRow(row);
    setSectionId(String(firstValue(row, ['sectionid', 'sectionId', 'mainsection', 'dmtid'])));
    setStartDate(
      parseDateTime(firstValue(row, ['startdate', 'starttime', 'fromdate', 'allocatedfrom', 'startdt'])) ?? now,
    );
    setEndDate(
      parseDateTime(firstValue(row, ['enddate', 'endtime', 'todate', 'allocatedto', 'enddt'])) ?? now,
    );
    setPickerKey(prev => prev + 1);
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!sectionId) {
        Alert.alert('Missing field', 'Please select a Section.');
        return;
    }
    if (endDate.getTime() < startDate.getTime()) {
        Alert.alert('Invalid date', 'End date/time must be after start date/time.');
        return;
    }

    const keyid = String(firstValue(selectedRow, ['bdmskeyid', 'keyid', 'BDMSKEYID']));
    if (!keyid) {
        Alert.alert('Missing record', 'Breakdown id was not found on the selected card.');
        return;
    }

    const payload: BreakdownAllocationPayload = {
        keyid,
        wno: String(firstValue(selectedRow, ['wono', 'wno']) || ''),
        sectionid: sectionId,
        startdate: toApiDateString(startDate),
        enddate: toApiDateString(endDate),
        bookedby: currentUser?.employeeId ?? '',
    };

    try {
        setSaving(true);
        await saveBreakdownAllocation(payload);
        Alert.alert('Success', 'Allocation details saved.');
        cardsRef.current?.reload();
        closeEdit();
    } catch (error: any) {
        console.error('Breakdown allocation save error:', error);
        Alert.alert(
            'Save Failed',
            error?.response?.data?.message || error?.message || 'Unable to save.',
        );
    } finally {
        setSaving(false);
    }
};

  return (
    <View style={{ flex: 1 }}>
      <EquipmentHeader
        equipmentNo={equipmentNo}
        onScanPress={openScanner}
        title="Equipment"
        onEquipmentLoaded={handleEquipmentLoaded}
      />

      {conditionParams == null ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
          <Text style={styles.emptyTitle}>No equipment scanned</Text>
          <Text style={styles.emptyText}>
            Tap the scanner icon to scan a machine's QR code and view its
            allocations.
          </Text>
          <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
            <Text style={styles.scanCtaText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Cards
          key={machineid ?? 'no-machine'}
          procedureName="bdm_fn_breakdownallocation_rn_sb"
          isEdit={true}
          onEdit={handleEdit}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerWrap}>
          <TouchableOpacity
            style={styles.scannerCloseBtn}
            onPress={() => setShowScanner(false)}>
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {showScanner ? (
            <EquipmentScanner
              navigation={scannerNavigation}
              route={{ params: { returnTo: 'BreakdownEntry' } }}
            />
          ) : null}
        </View>
      </Modal>

      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={closeEdit}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={closeEdit}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.title}>Breakdown Allocation</Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <AppDropdown
                label="Maint.Section"
                manditory={true}
                value={sectionId}
                endpoint="commonFilter/trade"
                onChange={val => setSectionId(val)}
              />

              <Text style={styles.fieldLabel}>Start Date / Time</Text>
              <View style={styles.dateTimeRow}>
                <View style={styles.dateCol}>
                  <DatePicker
                    label="Date"
                    value={startDate}
                    onChange={(date: Date) => setStartDate(prev => applyDatePart(prev, date))}
                  />
                </View>
                <View style={styles.timeCol}>
                  <TimePickerInput
                    key={`start-time-${pickerKey}`}
                    label="Time"
                    value={startDate}
                    onChange={(time: Date) => setStartDate(prev => applyTimePart(prev, time))}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>End Date / Time</Text>
              <View style={styles.dateTimeRow}>
                <View style={styles.dateCol}>
                  <DatePicker
                    label="Date"
                    value={endDate}
                    onChange={(date: Date) => setEndDate(prev => applyDatePart(prev, date))}
                  />
                </View>
                <View style={styles.timeCol}>
                  <TimePickerInput
                    key={`end-time-${pickerKey}`}
                    label="Time"
                    value={endDate}
                    onChange={(time: Date) => setEndDate(prev => applyTimePart(prev, time))}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#e2d9d5',
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
  },
  dateCol: {
    flex: 1,
    marginRight: 8,
  },
  timeCol: {
    flex: 1,
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F8FAFC',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  scanCta: {
    marginTop: 20,
    backgroundColor: '#0D5DB8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  scanCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  scannerWrap: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BreakdownAllocation;
