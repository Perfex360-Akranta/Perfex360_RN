// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Alert,
// } from 'react-native';
// import MaterialIcons from '@react-native-vector-icons/material-icons/static';
// import { useRoute, RouteProp } from '@react-navigation/native';

// import Cards from '../../components/grid/Cards';
// import AppDropdown from '../../components/forms/AppDropdown';
// import DatePicker from '../../components/forms/DatePicker';
// import TimePickerInput from '../../components/forms/TimePickerInput';
// import EquipmentHeader from '../../components/QRscanner/EquipmentHeader';
// import EquipmentScanner from '../../components/QRscanner/EquipmentScanner';
// import { useGrid } from '../../context/GridProvider';
// import { GridEditProps } from '../../types/GridFilters';
// import { parseDate } from '../../utils/DateFormat';
// import { saveGeneralMaintenanceCompletion } from '../../services/api/GenMaintenanceBookingApi';
// import { GenmaintenanceCompletionPayload } from '../../types/genmaintenance';

// const MONTHS: Record<string, number> = {
//   JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
//   JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
// };

// const parseDateTime = (value: any): Date | null => {
//   if (!value || value === '{}') {
//     return null;
//   }
//   if (value instanceof Date && !isNaN(value.getTime())) {
//     return value;
//   }

//   const str = String(value).trim();
//   const withTime = str.match(
//     /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
//   );
//   if (withTime) {
//     const monthIndex = MONTHS[withTime[2].toUpperCase()];
//     if (monthIndex === undefined) {
//       return parseDate(str);
//     }
//     const parsedWithTime = new Date(
//       Number(withTime[3]),
//       monthIndex,
//       Number(withTime[1]),
//       Number(withTime[4] ?? 0),
//       Number(withTime[5] ?? 0),
//       Number(withTime[6] ?? 0),
//     );
//     const year = parsedWithTime.getFullYear();
//     if (year <= 1801 || year >= 2100) {
//       return null;
//     }
//     return parsedWithTime;
//   }

//   const fromDdMonYyyy = parseDate(str);
//   if (fromDdMonYyyy) {
//     return fromDdMonYyyy;
//   }

//   const parsed = new Date(str);
//   if (isNaN(parsed.getTime())) {
//     return null;
//   }
//   const year = parsed.getFullYear();
//   if (year <= 1801 || year >= 2100) {
//     return null;
//   }
//   return parsed;
// };

// const applyDatePart = (current: Date, next: Date) => {
//   const merged = new Date(current);
//   merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
//   return merged;
// };

// const applyTimePart = (current: Date, next: Date) => {
//   const merged = new Date(current);
//   merged.setHours(next.getHours(), next.getMinutes(), next.getSeconds(), 0);
//   return merged;
// };

// const firstValue = (row: any, keys: string[]) => {
//   for (const key of keys) {
//     const value = row?.[key];
//     if (value !== undefined && value !== null && value !== '' && value !== '{}') {
//       return value;
//     }
//   }
//   return '';
// };

// const toApiDateTimeString = (value: Date) => {
//   const pad = (n: number) => String(n).padStart(2, '0');
//   return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
// };

// type RouteParams = {
//   equipmentNo?: string;
// };

// const GeneralMaintenanceCompletion: React.FC = () => {
//   const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
//   const { currentUser } = useGrid();
//   const cardsRef = useRef<any>(null);

//   const [equipmentNo, setEquipmentNo] = useState(route.params?.equipmentNo);
//   const [machineid, setMachineid] = useState<string | null>(null);
//   const [showScanner, setShowScanner] = useState(false);

//   const [showEdit, setShowEdit] = useState(false);
//   const [pickerKey, setPickerKey] = useState(0);
//   const [saving, setSaving] = useState(false);
//   const [selectedRow, setSelectedRow] = useState<any>(null);
//   const [startDate, setStartDate] = useState<Date>(new Date());
//   const [endDate, setEndDate] = useState<Date>(new Date());
//   const [remarks, setRemarks] = useState('');

//   const scannerNavigation = useMemo(
//     () => ({
//       navigate: (arg: any) => {
//         const params = arg?.params ?? arg;
//         const scanned = params?.equipmentNo ?? params?.scannedId;
//         if (scanned) {
//           setMachineid(null);
//           setEquipmentNo(String(scanned));
//           setShowScanner(false);
//         }
//       },
//       goBack: () => setShowScanner(false),
//     }),
//     [],
//   );

//   useEffect(() => {
//     if (route.params?.equipmentNo) {
//       setEquipmentNo(route.params.equipmentNo);
//     }
//   }, [route.params?.equipmentNo]);

//   const conditionParams = useMemo(() => {
//     if (!equipmentNo) {
//       return null;
//     }
//     return {
//       FLID: '',
//       MACHINEID: machineid || equipmentNo,
//       MACHINENO: equipmentNo,
//     };
//   }, [equipmentNo, machineid]);

//   const closeEdit = () => {
//     setShowEdit(false);
//     setSaving(false);
//   };

//   const openScanner = () => setShowScanner(true);

//   const handleEquipmentLoaded = (details: {
//     machineid?: string;
//     flid?: string;
//     equipmentNo?: string;
//   }) => {
//     const nextMachineId = String(
//       details?.machineid || details?.equipmentNo || equipmentNo || '',
//     );
//     setMachineid(nextMachineId || null);
//   };

//   const handleEdit = (record: GridEditProps) => {
//     const row = record.row;
//     const now = new Date();
//     setSelectedRow(row);
//     setStartDate(parseDateTime(firstValue(row, ['startdate', 'workstartdate'])) ?? now);
//     setEndDate(parseDateTime(firstValue(row, ['enddate', 'workenddate'])) ?? now);
//     setRemarks(String(firstValue(row, ['remarks']) || ''));
//     setPickerKey(prev => prev + 1);
//     setShowEdit(true);
//   };

//   const handleSave = async () => {
//     const keyid = String(firstValue(selectedRow, ['gmntkeyid', 'keyid', 'GMNTKEYID', 'docno']));
//     if (!keyid) {
//       Alert.alert('Missing record', 'General maintenance id was not found on the selected card.');
//       return;
//     }
//     if (!currentUser?.employeeId) {
//       Alert.alert('Missing field', 'Completed By is required.');
//       return;
//     }
//     if (endDate.getTime() < startDate.getTime()) {
//       Alert.alert('Invalid time', 'Work End must be after Work Start.');
//       return;
//     }

//     const payload: GenmaintenanceCompletionPayload = {
//       keyid,
//       wno: String(firstValue(selectedRow, ['wono', 'wno']) || ''),
//       completedby: currentUser.employeeId,
//       wostartdate: toApiDateTimeString(startDate),
//       woenddate: toApiDateTimeString(endDate),
//       completeddate: toApiDateTimeString(endDate),
//       remarks: remarks.trim(),
//     };

//     try {
//       setSaving(true);
//       await saveGeneralMaintenanceCompletion(payload);
//       Alert.alert('Success', 'Completion details saved.');
//       cardsRef.current?.reload();
//       closeEdit();
//     } catch (error: any) {
//       console.error('General maintenance completion save error:', error);
//       Alert.alert(
//         'Save Failed',
//         error?.response?.data?.message || error?.message || 'Unable to save.',
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <EquipmentHeader
//         equipmentNo={equipmentNo}
//         onScanPress={openScanner}
//         title="Equipment"
//         onEquipmentLoaded={handleEquipmentLoaded}
//       />

//       {!equipmentNo || conditionParams == null ? (
//         <View style={styles.emptyState}>
//           <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
//           <Text style={styles.emptyTitle}>No equipment scanned</Text>
//           <Text style={styles.emptyText}>
//             Tap the scanner icon to scan a machine's QR code and view its pending general maintenance records.
//           </Text>
//           <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
//             <Text style={styles.scanCtaText}>Scan QR</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <Cards
//           key={`${machineid ?? 'pending'}-${equipmentNo}`}
//           procedureName="plm_fn_generalmaintmodify_rn_sb"
//           isEdit={true}
//           onEdit={handleEdit}
//           ref={cardsRef}
//           conditionParams={conditionParams}
//         />
//       )}

//       <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
//         <View style={styles.scannerWrap}>
//           <TouchableOpacity style={styles.scannerCloseBtn} onPress={() => setShowScanner(false)}>
//             <MaterialIcons name="close" size={22} color="#FFFFFF" />
//           </TouchableOpacity>
//           {showScanner ? (
//             <EquipmentScanner
//               navigation={scannerNavigation}
//               route={{ params: { returnTo: 'BreakdownEntry' } }}
//             />
//           ) : null}
//         </View>
//       </Modal>

//       <Modal visible={showEdit} transparent animationType="slide" onRequestClose={closeEdit}>
//         <View style={styles.overlay}>
//           <View style={styles.container}>
//             <TouchableOpacity style={styles.closeBtn} onPress={closeEdit}>
//               <MaterialIcons name="close" size={24} color="white" />
//             </TouchableOpacity>

//             <Text style={styles.title}>Completed Details</Text>

//             <ScrollView keyboardShouldPersistTaps="handled">
//               <AppDropdown
//                 label="Completed By"
//                 manditory={true}
//                 value={currentUser?.employeeId ?? ''}
//                 endpoint="commonFilter/employee"
//                 onChange={() => {}}
//                 disable={true}
//               />

//               <Text style={styles.fieldLabel}>Work Start</Text>
//               <View style={styles.dateTimeRow}>
//                 <View style={styles.dateCol}>
//                   <DatePicker
//                     label="Date"
//                     value={startDate}
//                     onChange={(date: Date) => setStartDate(prev => applyDatePart(prev, date))}
//                   />
//                 </View>
//                 <View style={styles.timeCol}>
//                   <TimePickerInput
//                     key={`start-time-${pickerKey}`}
//                     label="Time"
//                     value={startDate}
//                     onChange={(time: Date) => setStartDate(prev => applyTimePart(prev, time))}
//                   />
//                 </View>
//               </View>

//               <Text style={styles.fieldLabel}>Work End</Text>
//               <View style={styles.dateTimeRow}>
//                 <View style={styles.dateCol}>
//                   <DatePicker
//                     label="Date"
//                     value={endDate}
//                     onChange={(date: Date) => setEndDate(prev => applyDatePart(prev, date))}
//                   />
//                 </View>
//                 <View style={styles.timeCol}>
//                   <TimePickerInput
//                     key={`end-time-${pickerKey}`}
//                     label="Time"
//                     value={endDate}
//                     onChange={(time: Date) => setEndDate(prev => applyTimePart(prev, time))}
//                   />
//                 </View>
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.fieldLabel}>Remarks</Text>
//                 <TextInput
//                   style={styles.textArea}
//                   value={remarks}
//                   onChangeText={setRemarks}
//                   multiline
//                   numberOfLines={3}
//                   placeholder="Remarks"
//                   placeholderTextColor="#999999"
//                 />
//               </View>

//               <TouchableOpacity
//                 style={[styles.saveBtn, saving && styles.disabledBtn]}
//                 onPress={handleSave}
//                 disabled={saving}
//               >
//                 <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '90%',
//     maxHeight: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 20,
//     elevation: 5,
//   },
//   closeBtn: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 100,
//     padding: 5,
//     borderRadius: 10,
//     backgroundColor: 'red',
//     borderWidth: 1,
//     borderColor: '#e2d9d5',
//     elevation: 4,
//   },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#000' },
//   fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 4, marginBottom: 4 },
//   dateTimeRow: { flexDirection: 'row' },
//   dateCol: { flex: 1, marginRight: 8 },
//   timeCol: { flex: 1 },
//   inputGroup: { marginTop: 8 },
//   textArea: {
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 14,
//     color: '#1E293B',
//     minHeight: 80,
//     textAlignVertical: 'top',
//     backgroundColor: '#FFFFFF',
//   },
//   saveBtn: {
//     marginTop: 12,
//     backgroundColor: '#2E7D32',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
//   disabledBtn: { opacity: 0.6 },
//   emptyState: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//     backgroundColor: '#F8FAFC',
//   },
//   emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
//   emptyText: { marginTop: 8, textAlign: 'center', color: '#666', fontSize: 14 },
//   scanCta: {
//     marginTop: 20,
//     backgroundColor: '#0D5DB8',
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//   },
//   scanCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
//   scannerWrap: { flex: 1, backgroundColor: '#000' },
//   scannerCloseBtn: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     zIndex: 20,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default GeneralMaintenanceCompletion;


import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
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
import { parseDate } from '../../utils/DateFormat';
import { saveGeneralMaintenanceCompletion } from '../../services/api/GenMaintenanceBookingApi';
import { GenmaintenanceCompletionPayload } from '../../types/genmaintenance';

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

const toApiDateTimeString = (value: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
};

type RouteParams = {
    equipmentNo?: string;
};

const COMPLETED_STATUS = new Set(['C', 'COMPLETED', 'COMPLETE', 'CLOSED', 'DONE']);

const recordId = (row: any) =>
    String(firstValue(row, ['gmntkeyid', 'keyid', 'GMNTKEYID', 'docno']) || '');

const GeneralMaintenanceCompletion: React.FC = () => {
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { currentUser } = useGrid();
    const cardsRef = useRef<any>(null);
    const completedIdsRef = useRef<Set<string>>(new Set());

    const [equipmentNo, setEquipmentNo] = useState(route.params?.equipmentNo);
    const [machineid, setMachineid] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const [showEdit, setShowEdit] = useState(false);
    const [pickerKey, setPickerKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [remarks, setRemarks] = useState('');

    const scannerNavigation = useMemo(
        () => ({
            navigate: (arg: any) => {
                const params = arg?.params ?? arg;
                const scanned = params?.equipmentNo ?? params?.scannedId;
                if (scanned) {
                    completedIdsRef.current = new Set();
                    setMachineid(null);
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
            MACHINENO: equipmentNo,
            STATUS: 'P',
        };
    }, [equipmentNo, machineid]);

    const isPendingRecord = (row: any) => {
        const id = recordId(row);
        if (id && completedIdsRef.current.has(id)) {
            return false;
        }
        const status = String(
            firstValue(row, ['status', 'gmntstatus', 'gmstatus', 'completionstatus']) || '',
        ).trim().toUpperCase();
        if (COMPLETED_STATUS.has(status)) {
            return false;
        }
        const endFlag = String(
            firstValue(row, ['woendflag', 'completedflag', 'endflag']) || '',
        ).trim().toUpperCase();
        return endFlag !== 'Y' && endFlag !== 'C';
    };

    const closeEdit = () => {
        setShowEdit(false);
        setSaving(false);
    };

    const openScanner = () => setShowScanner(true);

    const handleEquipmentLoaded = (details: {
        machineid?: string;
        flid?: string;
        equipmentNo?: string;
    }) => {
        const nextMachineId = String(
            details?.machineid || details?.equipmentNo || equipmentNo || '',
        );
        setMachineid(nextMachineId || null);
    };

    const handleEdit = (record: GridEditProps) => {
        const row = record.row;
        const now = new Date();
        setSelectedRow(row);
        setStartDate(parseDateTime(firstValue(row, ['startdate', 'workstartdate'])) ?? now);
        setEndDate(parseDateTime(firstValue(row, ['enddate', 'workenddate'])) ?? now);
        setRemarks(String(firstValue(row, ['remarks']) || ''));
        setPickerKey(prev => prev + 1);
        setShowEdit(true);
    };

    const handleSave = async () => {
        const keyid = String(firstValue(selectedRow, ['gmntkeyid', 'keyid', 'GMNTKEYID', 'docno']));
        if (!keyid) {
            Alert.alert('Missing record', 'General maintenance id was not found on the selected card.');
            return;
        }
        if (!currentUser?.employeeId) {
            Alert.alert('Missing field', 'Completed By is required.');
            return;
        }
        if (endDate.getTime() < startDate.getTime()) {
            Alert.alert('Invalid time', 'Work End must be after Work Start.');
            return;
        }

        const payload: GenmaintenanceCompletionPayload = {
            keyid,
            wno: String(firstValue(selectedRow, ['wono', 'wno']) || ''),
            completedby: currentUser.employeeId,
            wostartdate: toApiDateTimeString(startDate),
            woenddate: toApiDateTimeString(endDate),
            completeddate: toApiDateTimeString(endDate),
            remarks: remarks.trim(),
        };

        try {
            setSaving(true);
            await saveGeneralMaintenanceCompletion(payload);
            completedIdsRef.current.add(keyid);
            cardsRef.current?.reload();
            closeEdit();
            Alert.alert('Success', 'Completion details saved.');
        } catch (error: any) {
            console.error('General maintenance completion save error:', error);
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
                        Tap the scanner icon to scan a machine's QR code and view its pending general maintenance records.
                    </Text>
                    <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
                        <Text style={styles.scanCtaText}>Scan QR</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Cards
                    key={machineid ?? 'no-machine'}
                    procedureName="plm_fn_generalmaintmodify_rn_sb"
                    isEdit={true}
                    onEdit={handleEdit}
                    ref={cardsRef}
                    conditionParams={conditionParams}
                    rowFilter={isPendingRecord}
                    listEmptyText="No pending general maintenance records."
                />
            )}

            <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
                <View style={styles.scannerWrap}>
                    <TouchableOpacity style={styles.scannerCloseBtn} onPress={() => setShowScanner(false)}>
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

                        <Text style={styles.title}>Completed Details</Text>

                        <ScrollView keyboardShouldPersistTaps="handled">
                            <AppDropdown
                                label="Completed By"
                                manditory={true}
                                value={currentUser?.employeeId ?? ''}
                                endpoint="commonFilter/employee"
                                onChange={() => { }}
                                disable={true}
                            />

                            <Text style={styles.fieldLabel}>Work Start</Text>
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

                            <Text style={styles.fieldLabel}>Work End</Text>
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Remarks</Text>
                                <TextInput
                                    style={styles.textArea}
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Remarks"
                                    placeholderTextColor="#999999"
                                />
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
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#000' },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 4, marginBottom: 4 },
    dateTimeRow: { flexDirection: 'row' },
    dateCol: { flex: 1, marginRight: 8 },
    timeCol: { flex: 1 },
    inputGroup: { marginTop: 8 },
    textArea: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1E293B',
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#FFFFFF',
    },
    saveBtn: {
        marginTop: 12,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    disabledBtn: { opacity: 0.6 },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#F8FAFC',
    },
    emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    emptyText: { marginTop: 8, textAlign: 'center', color: '#666', fontSize: 14 },
    scanCta: {
        marginTop: 20,
        backgroundColor: '#0D5DB8',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    scanCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    scannerWrap: { flex: 1, backgroundColor: '#000' },
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
    
export default GeneralMaintenanceCompletion;
