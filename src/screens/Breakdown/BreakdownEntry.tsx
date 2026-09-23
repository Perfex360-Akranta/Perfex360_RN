// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TextInput,
//     TouchableOpacity,
//     ScrollView,
//     Alert,
// } from 'react-native';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// import EquipmentHeader from '../../components/QRscanner/EquipmentHeader';
// import DatePicker from '../../components/forms/DatePicker';
// import AppDropdown from '../../components/forms/AppDropdown';
// import TimePickerInput from '../../components/forms/TimePickerInput';
// import { toApiDateString } from '../../utils/DateFormat';
// import { useGrid } from '../../context/GridProvider';

// type BreakdownEntryRouteParams = {
//     equipmentNo?: string;
// };

// // const PRIORITY_OPTIONS = [
// //     { label: 'Very High', value: 'VERY HIGH' },
// //     { label: 'High', value: 'HIGH' },
// //     { label: 'Medium', value: 'MEDIUM' },
// //     { label: 'Low', value: 'LOW' },
// // ];

// const BreakdownEntry: React.FC = () => {
//     const navigation = useNavigation<any>();
//     const route = useRoute<RouteProp<{ params: BreakdownEntryRouteParams }, 'params'>>();
//     const equipmentNo = route.params?.equipmentNo;

//     const { currentUser, currentRole } = useGrid();

//     // Resolved from EquipmentHeader once equipment is scanned/loaded
//     const [machineid, setMachineid] = useState<string | null>(null);
//     const [flid, setFlid] = useState<string | null>(null);

//     const [problemDescription, setProblemDescription] = useState('');
//     const [priority, setPriority] = useState('');

//     const [occurredOnEditable, setOccurredOnEditable] = useState(false);
//     const [occurredOn, setOccurredOn] = useState<Date>(new Date());

//     const [assemblyStation, setAssemblyStation] = useState('');
//     const [subStation, setSubStation] = useState('');

//     const [saving, setSaving] = useState(false);

//     const openScanner = () => {
//         navigation.navigate('EquipmentScanner', { returnTo: 'BreakdownEntry' });
//     };

//     const handleEquipmentLoaded = (details: { machineid: string; flid: string }) => {
//         setMachineid(details.machineid ?? null);
//         setFlid(details.flid ?? null);
//     };

//     const handleAssemblyChange = (val: string) => {
//         setAssemblyStation(val);
//         setSubStation(''); // reset dependent dropdown when parent changes
//     };

//     const handleSave = async () => {
//         if (!equipmentNo) {
//             Alert.alert('Missing equipment', 'Please scan an equipment QR code first.');
//             return;
//         }
//         if (!problemDescription.trim()) {
//             Alert.alert('Missing field', 'Problem Description is required.');
//             return;
//         }
//         if (!priority) {
//             Alert.alert('Missing field', 'Please select a Priority.');
//             return;
//         }
//         if (!assemblyStation) {
//             Alert.alert('Missing field', 'Please select an Assembly / Station.');
//             return;
//         }

//         try {
//             setSaving(true);

//             // TODO: wire actual save API once backend endpoint is confirmed
//             const payload = {
//                 equipmentNo,
//                 machineid,
//                 flid,
//                 problemDescription: problemDescription.trim(),
//                 priority,
//                 occurredOn: toApiDateString(occurredOn),
//                 assemblyStation,
//                 subStation,
//                 bookedBy: currentUser?.employeeId ?? '',
//                 roleid: currentRole?.roleId ?? '',
//             };

//             console.log('Saving breakdown entry with payload:', payload);
//             // const response = await saveBreakdownEntry(payload);

//             Alert.alert('Success', 'Breakdown entry saved successfully.');
//             navigation.goBack();
//         } catch (error: any) {
//             console.error('Breakdown entry save error:', error);
//             Alert.alert('Save Failed', error?.response?.data?.message || error?.message || 'Unable to save.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <EquipmentHeader
//                 equipmentNo={equipmentNo}
//                 onScanPress={openScanner}
//                 title="Equipment"
//                 onEquipmentLoaded={handleEquipmentLoaded}
//             />

//             {!equipmentNo ? (
//                 <View style={styles.emptyState}>
//                     <Text style={styles.emptyTitle}>No equipment scanned</Text>
//                     <Text style={styles.emptyText}>
//                         Tap the scanner icon to scan a machine's QR code and start a breakdown entry.
//                     </Text>
//                 </View>
//             ) : (
//                 <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
//                     <View style={styles.inputGroup}>
//                         <Text style={styles.inputLabel}>
//                             Problem Description <Text style={styles.mandatoryStar}>*</Text>
//                         </Text>
//                         <TextInput
//                             style={styles.textArea}
//                             value={problemDescription}
//                             onChangeText={setProblemDescription}
//                             multiline
//                             numberOfLines={4}
//                             placeholder="Describe the problem..."
//                             placeholderTextColor="#999999"
//                         />
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.inputLabel}>
//                             Booked By <Text style={styles.mandatoryStar}>*</Text>
//                         </Text>
//                         <AppDropdown
//                             label=""
//                             manditory={true}
//                             value={currentUser?.employeeId ?? ''}
//                             endpoint="commonFilter/employee"
//                             onChange={() => { }}
//                             disable={true}
//                         />
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.inputLabel}>
//                             Priority <Text style={styles.mandatoryStar}>*</Text>
//                         </Text>
//                         <AppDropdown
//                             label=""
//                             manditory={true}
//                             value={priority}
//                             endpoint="commonFilter/priority"
//                             onChange={val => setPriority(val)}
//                         />
//                     </View>

//                     <TouchableOpacity
//                         style={styles.checkboxRow}
//                         onPress={() => setOccurredOnEditable(prev => !prev)}
//                         activeOpacity={0.7}
//                     >
//                         <View style={[styles.checkbox, occurredOnEditable && styles.checkboxChecked]}>
//                             {occurredOnEditable && <Text style={styles.checkmark}>✓</Text>}
//                         </View>
//                         <Text style={styles.checkboxLabel}>Occurred On</Text>
//                     </TouchableOpacity>

//                     <View style={styles.occurredOnRow}>
//                         <View style={styles.occurredOnDate}>
//                             <DatePicker
//                                 label="Date"
//                                 value={occurredOn}
//                                 onChange={(date: Date) => setOccurredOn(date)}
//                                 disable={!occurredOnEditable}
//                             />
//                         </View>
//                         <View style={styles.occurredOnTime}>
//                             <TimePickerInput
//                                 label="Time"
//                                 value={occurredOn}
//                                 onChange={(time: Date) => setOccurredOn(time)}
//                             //disable={!occurredOnEditable}
//                             />
//                         </View>
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.inputLabel}>
//                             Assembly / Station <Text style={styles.mandatoryStar}>*</Text>
//                         </Text>
//                         <AppDropdown
//                             key={machineid ?? 'no-machine'}
//                             label=""
//                             manditory={true}
//                             value={assemblyStation}
//                             endpoint="commonFilter/assembly"
//                             params={{ machineid }}
//                             onChange={handleAssemblyChange}
//                         />
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.inputLabel}>Sub Assembly</Text>
//                         <AppDropdown
//                             key={assemblyStation || 'no-assembly'}
//                             label=""
//                             manditory={false}
//                             value={subStation}
//                             endpoint="commonFilter/subAssembly"
//                             params={{ assemblyKeyId: assemblyStation }}
//                             onChange={val => setSubStation(val)}
//                         />
//                     </View>

//                     <TouchableOpacity
//                         style={[styles.saveBtn, saving && styles.disabledBtn]}
//                         onPress={handleSave}
//                         disabled={saving}
//                     >
//                         <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
//                     </TouchableOpacity>
//                 </ScrollView>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F8FAFC' },
//     emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
//     emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
//     emptyText: { marginTop: 8, textAlign: 'center', color: '#666', fontSize: 14 },
//     formBody: { padding: 16 },
//     inputGroup: { marginTop: 12 },
//     inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
//     mandatoryStar: { color: '#DC2626', fontWeight: '700' },
//     textArea: {
//         borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
//         fontSize: 14, color: '#1E293B', minHeight: 90, textAlignVertical: 'top', backgroundColor: '#FFFFFF',
//     },
//     checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
//     checkbox: {
//         width: 20, height: 20, borderWidth: 1.5, borderColor: '#1976D2', borderRadius: 4,
//         alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: '#FFFFFF',
//     },
//     checkboxChecked: { backgroundColor: '#1976D2' },
//     checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
//     checkboxLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
//     occurredOnRow: { flexDirection: 'row', marginTop: 8 },
//     occurredOnDate: { flex: 1, marginRight: 8 },
//     occurredOnTime: { flex: 1 },
//     disabledField: {
//         borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
//         backgroundColor: '#F1F5F9', marginTop: 8,
//     },
//     disabledFieldText: { fontSize: 14, color: '#64748B' },
//     saveBtn: {
//         marginTop: 24, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 14, alignItems: 'center',
//     },
//     saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
//     disabledBtn: { opacity: 0.6 },
// });

// export default BreakdownEntry;



import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import EquipmentHeader from '../../components/QRscanner/EquipmentHeader';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import TimePickerInput from '../../components/forms/TimePickerInput';
import { toApiDateString } from '../../utils/DateFormat';
import { useGrid } from '../../context/GridProvider';
import { saveBreakdownBooking } from '../../services/api/BreakdownBookingApi';
import { BreakdownBookingPayload } from '../../types/breakdown';

type BreakdownEntryRouteParams = {
    equipmentNo?: string;
};

const BreakdownEntry: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<{ params: BreakdownEntryRouteParams }, 'params'>>();
    const equipmentNo = route.params?.equipmentNo;

    const { currentUser, currentRole } = useGrid();

    const [machineid, setMachineid] = useState<string | null>(null);
    const [flid, setFlid] = useState<string | null>(null);

    const [problemDescription, setProblemDescription] = useState('');
    const [priority, setPriority] = useState('');

    const [occurredOnEditable, setOccurredOnEditable] = useState(false);
    const [occurredOn, setOccurredOn] = useState<Date>(new Date());

    const [assemblyStation, setAssemblyStation] = useState('');
    const [subStation, setSubStation] = useState('');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setMachineid(null);
        setFlid(null);
        setAssemblyStation('');
        setSubStation('');
    }, [equipmentNo]);

    const openScanner = () => {
        navigation.navigate('EquipmentScanner', { returnTo: 'BreakdownEntry' });
    };

    const handleEquipmentLoaded = (details: {
        equipmentNo?: string;
        equipmentName?: string;
        machineid: string;
        flid: string;
    }) => {
        setMachineid(details.machineid ?? null);
        setFlid(details.flid ?? null);
    };

    const handleAssemblyChange = (val: string) => {
        setAssemblyStation(val);
        setSubStation('');
    };

    const handleSave = async () => {
        if (!equipmentNo) {
            Alert.alert('Equipment is required', 'Please scan an equipment QR code before saving.');
            return;
        }
        if (!problemDescription.trim()) {
            Alert.alert('Missing field', 'Problem Description is required.');
            return;
        }
        if (!priority) {
            Alert.alert('Missing field', 'Please select a Priority.');
            return;
        }
        if (!assemblyStation) {
            Alert.alert('Missing field', 'Please select an Assembly / Station.');
            return;
        }
        if (!machineid) {
            Alert.alert('Missing equipment', 'Equipment details are still loading — try again in a moment.');
            return;
        }

        try {
            setSaving(true);

            const payload: BreakdownBookingPayload = {
                machineid,
                flid: flid ?? '',
                problemDescription: problemDescription.trim(),
                priority,
                occurredOn: toApiDateString(occurredOn),
                assemblyid: assemblyStation,
                subassemblyid: subStation || '{}',
                bookedby: currentUser?.employeeId ?? '',
                roleid: currentRole?.roleId ?? '',
            };

            await saveBreakdownBooking(payload);

            Alert.alert('Success', 'Breakdown entry saved successfully.');
            navigation.goBack();
        } catch (error: any) {
            console.error('Breakdown entry save error:', error);
            Alert.alert('Save Failed', error?.response?.data?.message || error?.message || 'Unable to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <EquipmentHeader
                equipmentNo={equipmentNo}
                onScanPress={openScanner}
                title="Equipment"
                onEquipmentLoaded={handleEquipmentLoaded}
            />

            <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Problem Description <Text style={styles.mandatoryStar}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.textArea}
                            value={problemDescription}
                            onChangeText={setProblemDescription}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe the problem..."
                            placeholderTextColor="#999999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Booked By <Text style={styles.mandatoryStar}>*</Text>
                        </Text>
                        <AppDropdown
                            label=""
                            manditory={true}
                            value={currentUser?.employeeId ?? ''}
                            endpoint="commonFilter/employee"
                            onChange={() => { }}
                            disable={true}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Priority <Text style={styles.mandatoryStar}>*</Text>
                        </Text>
                        <AppDropdown
                            label=""
                            manditory={true}
                            value={priority}
                            endpoint="commonFilter/priority"
                            onChange={val => setPriority(val)}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setOccurredOnEditable(prev => !prev)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, occurredOnEditable && styles.checkboxChecked]}>
                            {occurredOnEditable && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>Occurred On</Text>
                    </TouchableOpacity>

                    <View style={styles.occurredOnRow}>
                        <View style={styles.occurredOnDate}>
                            <DatePicker
                                label="Date"
                                value={occurredOn}
                                onChange={(date: Date) => setOccurredOn(date)}
                                disable={!occurredOnEditable}
                            />
                        </View>
                        <View style={styles.occurredOnTime}>
                            <TimePickerInput
                                label="Time"
                                value={occurredOn}
                                onChange={(time: Date) => setOccurredOn(time)}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Assembly / Station <Text style={styles.mandatoryStar}>*</Text>
                        </Text>
                        <AppDropdown
                            key={machineid ?? 'no-machine'}
                            label=""
                            manditory={true}
                            value={assemblyStation}
                            endpoint="commonFilter/assembly"
                            params={{ machineid }}
                            onChange={handleAssemblyChange}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Sub Assembly</Text>
                        <AppDropdown
                            key={assemblyStation || 'no-assembly'}
                            label=""
                            manditory={false}
                            value={subStation}
                            endpoint="commonFilter/subAssembly"
                            params={{ assemblyKeyId: assemblyStation }}
                            onChange={val => setSubStation(val)}
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
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    emptyText: { marginTop: 8, textAlign: 'center', color: '#666', fontSize: 14 },
    formBody: { padding: 16 },
    inputGroup: { marginTop: 12 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
    mandatoryStar: { color: '#DC2626', fontWeight: '700' },
    textArea: {
        borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
        fontSize: 14, color: '#1E293B', minHeight: 90, textAlignVertical: 'top', backgroundColor: '#FFFFFF',
    },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    checkbox: {
        width: 20, height: 20, borderWidth: 1.5, borderColor: '#1976D2', borderRadius: 4,
        alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: '#FFFFFF',
    },
    checkboxChecked: { backgroundColor: '#1976D2' },
    checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    checkboxLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
    occurredOnRow: { flexDirection: 'row', marginTop: 8 },
    occurredOnDate: { flex: 1, marginRight: 8 },
    occurredOnTime: { flex: 1 },
    saveBtn: {
        marginTop: 24, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 14, alignItems: 'center',
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    disabledBtn: { opacity: 0.6 },
});

export default BreakdownEntry;