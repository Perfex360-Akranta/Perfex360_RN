import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import EquipmentHeader from '../../components/QRscanner/EquipmentHeader';
import EquipmentScanner from '../../components/QRscanner/EquipmentScanner';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import TimePickerInput from '../../components/forms/TimePickerInput';
import { toApiDateString } from '../../utils/DateFormat';
import { useGrid } from '../../context/GridProvider';
import { getDropdownData } from '../../services/api/dropdownApi';
import { saveGeneralMaintenanceBooking } from '../../services/api/GenMaintenanceBookingApi';
import { GenmaintenanceBookingPayload } from '../../types/genmaintenance';

type BookingRouteParams = {
    equipmentNo?: string;
};

const ACTIVITY_TYPE_OPTIONS = [
    { label: 'OTHERS', value: 'O' },
    { label: 'UNSCHEDULED(WITHOUT WO)', value: 'U' },
    { label: 'EQUIPMENT UNDER TRIAL', value: 'M' },
];

const applyDatePart = (current: Date, next: Date) => {
    const merged = new Date(current);
    merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
    return merged;
};

const toApiDateTimeString = (value: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
};

const applyTimePart = (current: Date, next: Date) => {
    const merged = new Date(current);
    merged.setHours(next.getHours(), next.getMinutes(), next.getSeconds(), 0);
    return merged;
};

const startOfDay = (value: Date) => {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
};

const isFutureCalendarDate = (value: Date) => startOfDay(value).getTime() > startOfDay(new Date()).getTime();

const isFutureDateTime = (value: Date) => value.getTime() > Date.now();

const formatAtTime = (value: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
};

const toShiftOptions = (result: any): { label: string; value: string }[] => {
    if (!Array.isArray(result)) {
        return [];
    }

    return result
        .map((item: any) => ({
            label: String(item?.label ?? item?.LABEL ?? ''),
            value: String(item?.value ?? item?.VALUE ?? item?.id ?? ''),
        }))
        .filter(item => item.value && item.value !== '{}');
};

const GeneralMaintenanceBooking: React.FC = () => {
    const route = useRoute<RouteProp<{ params: BookingRouteParams }, 'params'>>();
    const { currentUser, currentRole } = useGrid();

    const [equipmentNo, setEquipmentNo] = useState(route.params?.equipmentNo);
    const [machineid, setMachineid] = useState<string | null>(null);
    const [flid, setFlid] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const [shiftDate, setShiftDate] = useState<Date>(new Date());
    const [shift, setShift] = useState('');
    const [shiftOptions, setShiftOptions] = useState<{ label: string; value: string }[]>([]);
    const [occurredOn, setOccurredOn] = useState<Date>(new Date());
    const [timePickerKey, setTimePickerKey] = useState(0);

    const [othersAssembly, setOthersAssembly] = useState(false);
    const [assemblyStation, setAssemblyStation] = useState('');
    const [partLocation, setPartLocation] = useState('');
    const [activityType, setActivityType] = useState('');
    const [trade, setTrade] = useState('');
    const [machineCondition, setMachineCondition] = useState('');
    const [spareReplaced, setSpareReplaced] = useState<'Y' | 'N' | 'W' | ''>('');

    const [problem, setProblem] = useState('');
    const [actionTaken, setActionTaken] = useState('');
    const [rootCause, setRootCause] = useState('');
    const [counterMeasure, setCounterMeasure] = useState('');

    const [targetDate, setTargetDate] = useState<Date>(new Date());
    const [priority, setPriority] = useState('');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (route.params?.equipmentNo) {
            setEquipmentNo(route.params.equipmentNo);
        }
    }, [route.params?.equipmentNo]);

    useEffect(() => {
        setMachineid(null);
        setFlid(null);
        setAssemblyStation('');
        setOthersAssembly(false);
    }, [equipmentNo]);

    useEffect(() => {
        let cancelled = false;

        const loadShift = async () => {
            try {
                const result = await getDropdownData('commonFilter/gmntShiftCombo', {
                    atTime: formatAtTime(occurredOn),
                });
                const options = toShiftOptions(result);
                if (cancelled) {
                    return;
                }
                setShiftOptions(options);
                setShift(options[0]?.value ?? '');
            } catch (error) {
                console.error('Failed to load GM shift:', error);
                if (!cancelled) {
                    setShiftOptions([]);
                    setShift('');
                }
            }
        };

        loadShift();
        return () => {
            cancelled = true;
        };
    }, [occurredOn]);

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

    const openScanner = () => setShowScanner(true);

    const handleEquipmentLoaded = (details: {
        equipmentNo?: string;
        equipmentName?: string;
        machineid: string;
        flid: string;
    }) => {
        setMachineid(details.machineid ?? null);
        setFlid(details.flid ?? null);
    };



    const handleOccurredDateChange = (date: Date) => {
        const next = applyDatePart(occurredOn, date);
        if (isFutureCalendarDate(next) || isFutureDateTime(next)) {
            Alert.alert('Invalid date', 'Occurred date/time cannot be later than the current time.');
            return;
        }
        setOccurredOn(next);
        setShiftDate(applyDatePart(shiftDate, date));
    };

    const handleOccurredTimeChange = (time: Date) => {
        const next = applyTimePart(occurredOn, time);
        if (isFutureDateTime(next)) {
            Alert.alert('Invalid time', 'Occurred time cannot be later than the current time.');
            setTimePickerKey(prev => prev + 1);
            return;
        }
        setOccurredOn(next);
    };

    const resetForm = () => {
        const now = new Date();
        setShiftDate(now);
        setOccurredOn(now);
        setTimePickerKey(prev => prev + 1);
        setOthersAssembly(false);
        setAssemblyStation('');
        setPartLocation('');
        setActivityType('');
        setTrade('');
        setMachineCondition('');
        setSpareReplaced('');
        setProblem('');
        setActionTaken('');
        setRootCause('');
        setCounterMeasure('');
        setTargetDate(now);
        setPriority('');
        setEquipmentNo(undefined);
        setMachineid(null);
        setFlid(null);
    };

    const handleSave = async () => {
        if (!equipmentNo || !machineid) {
            Alert.alert('Equipment is required', 'Please scan an equipment QR code before saving.');
            return;
        }
        if (!shiftDate) {
            Alert.alert('Missing field', 'Select the Shift Date.');
            return;
        }
        if (!shift) {
            Alert.alert('Missing field', 'Select the Shift.');
            return;
        }
        if (!occurredOn) {
            Alert.alert('Missing field', 'Select the Occurred Date.');
            return;
        }
        if (isFutureCalendarDate(occurredOn) || isFutureDateTime(occurredOn)) {
            Alert.alert('Invalid time', 'Occurred time cannot be later than the current time.');
            return;
        }
        if (!activityType) {
            Alert.alert('Missing field', 'Select the Activity Type.');
            return;
        }
        if (!trade) {
            Alert.alert('Missing field', 'Select the Maintenance Section.');
            return;
        }
        if (!spareReplaced) {
            Alert.alert('Missing field', 'Select the Spare Replaced.');
            return;
        }
        if (!problem.trim()) {
            Alert.alert('Missing field', 'Enter the Problem.');
            return;
        }
        if (!priority) {
            Alert.alert('Missing field', 'Select the Priority.');
            return;
        }

        try {
            setSaving(true);

            const payload: GenmaintenanceBookingPayload = {
                machineid,
                flid: flid ?? '',
                shiftdate: toApiDateString(shiftDate),
                shift,
                occureddate: toApiDateString(occurredOn),
                occurredTime: formatAtTime(occurredOn),
                stationid: assemblyStation || '',
                partlocation: partLocation.trim().toUpperCase(),
                activitytype: activityType,
                trade,
                mchcondition: machineCondition,
                isSpares: spareReplaced,
                problem: problem.trim().toUpperCase(),
                action: actionTaken.trim().toUpperCase(),
                rootcause: rootCause.trim().toUpperCase(),
                countermeasure: counterMeasure.trim().toUpperCase(),
                status: 'P',
                targetdate: toApiDateString(targetDate),
                priority,
                workhours: 0,
                downtime: 0,
                responsetime: 0,
                bookedby: currentUser?.employeeId ?? '',
                roleid: currentRole?.roleId ?? '',
            };

            await saveGeneralMaintenanceBooking(payload);

            Alert.alert('Success', 'General maintenance saved as Pending.');
            resetForm();
        } catch (error: any) {
            console.error('General maintenance save error:', error);
            Alert.alert(
                'Save Failed',
                error?.response?.data?.message || error?.message || 'Unable to save.',
            );
        } finally {
            setSaving(false);
        }
    };

    const assemblyParams = othersAssembly
        ? { machineNotToShown: machineid }
        : { machineid };

    return (
        <View style={styles.container}>
            <EquipmentHeader
                equipmentNo={equipmentNo}
                onScanPress={openScanner}
                title="Equipment"
                onEquipmentLoaded={handleEquipmentLoaded}
            />

            {!equipmentNo ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
                    <Text style={styles.emptyTitle}>No equipment scanned</Text>
                    <Text style={styles.emptyText}>
                        Tap the scanner icon to scan a machine's QR code. The header will update with the equipment number and name.
                    </Text>
                    <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
                        <Text style={styles.scanCtaText}>Scan QR</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
                    <View style={styles.labelWithCheckboxRow}>
                        <Text style={styles.inputLabel}>Assembly / Station</Text>
                        <TouchableOpacity
                            style={styles.inlineCheckboxRow}
                            onPress={() => {
                                setOthersAssembly(prev => !prev);
                                setAssemblyStation('');
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, othersAssembly && styles.checkboxChecked]}>
                                {othersAssembly && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>Others</Text>
                        </TouchableOpacity>
                    </View>

                    <AppDropdown
                        key={`${machineid ?? 'no-machine'}-${othersAssembly ? 'other' : 'own'}`}
                        label=""
                        manditory={false}
                        value={assemblyStation}
                        endpoint="commonFilter/assembly"
                        params={assemblyParams}
                        onChange={setAssemblyStation}
                    />
                    {/* <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => {
                            setOthersAssembly(prev => !prev);
                            setAssemblyStation('');
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, othersAssembly && styles.checkboxChecked]}>
                            {othersAssembly && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>Others</Text>
                    </TouchableOpacity>

                    <AppDropdown
                        key={`${machineid ?? 'no-machine'}-${othersAssembly ? 'other' : 'own'}`}
                        label="Assembly / Station"
                        manditory={false}
                        value={assemblyStation}
                        endpoint="commonFilter/assembly"
                        params={assemblyParams}
                        onChange={setAssemblyStation}
                    /> */}

                    <Text style={styles.sectionLabel}>
                        Shift Date / Shift <Text style={styles.mandatoryStar}>*</Text>
                    </Text>
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <DatePicker
                                label="Shift Date"
                                value={shiftDate}
                                onChange={(date: Date) => setShiftDate(applyDatePart(shiftDate, date))}
                            />
                        </View>
                        <View style={styles.flex}>
                            <AppDropdown
                                key={`shift-${shiftOptions.map(item => item.value).join('-')}`}
                                label="Shift"
                                manditory={true}
                                value={shift}
                                endpoint=""
                                dataset={shiftOptions}
                                onChange={setShift}
                                disable={true}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>
                        Occurred Date <Text style={styles.mandatoryStar}>*</Text>
                    </Text>
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <DatePicker
                                label="Date"
                                value={occurredOn}
                                onChange={handleOccurredDateChange}
                            />
                        </View>
                        <View style={styles.flex}>
                            <TimePickerInput
                                key={`occ-time-${timePickerKey}`}
                                label="Time"
                                value={occurredOn}
                                onChange={handleOccurredTimeChange}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Part Location</Text>
                        <TextInput
                            style={styles.textInput}
                            value={partLocation}
                            onChangeText={text => setPartLocation(text.toUpperCase())}
                            placeholder="Part location"
                            placeholderTextColor="#999999"
                            autoCapitalize="characters"
                        />
                    </View>

                    <AppDropdown
                        label="Activity Type"
                        manditory={true}
                        value={activityType}
                        endpoint=""
                        dataset={ACTIVITY_TYPE_OPTIONS}
                        onChange={setActivityType}
                    />

                    <AppDropdown
                        label="Maintenance Section"
                        manditory={true}
                        value={trade}
                        endpoint="commonFilter/trade"
                        onChange={setTrade}
                    />

                    <AppDropdown
                        label="Machine Condition"
                        manditory={false}
                        value={machineCondition}
                        endpoint="commonFilter/selectMachineCondition"
                        onChange={setMachineCondition}
                    />

                    <Text style={styles.sectionLabel}>
                        Spare Replaced <Text style={styles.mandatoryStar}>*</Text>
                    </Text>
                    <View style={styles.spareRow}>
                        {([
                            { id: 'Y', label: 'Yes' },
                            { id: 'N', label: 'No' },
                            { id: 'W', label: 'Waiting' },
                        ] as const).map(option => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.spareOption}
                                onPress={() => setSpareReplaced(option.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, spareReplaced === option.id && styles.checkboxChecked]}>
                                    {spareReplaced === option.id && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Problem <Text style={styles.mandatoryStar}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.textArea}
                            value={problem}
                            onChangeText={text => setProblem(text.toUpperCase())}
                            multiline
                            numberOfLines={3}
                            placeholder="Describe the problem..."
                            placeholderTextColor="#999999"
                            autoCapitalize="characters"
                            maxLength={500}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Action Taken</Text>
                        <TextInput
                            style={styles.textArea}
                            value={actionTaken}
                            onChangeText={text => setActionTaken(text.toUpperCase())}
                            multiline
                            numberOfLines={3}
                            placeholder="Action taken"
                            placeholderTextColor="#999999"
                            autoCapitalize="characters"
                            maxLength={500}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Root Cause</Text>
                        <TextInput
                            style={styles.textArea}
                            value={rootCause}
                            onChangeText={text => setRootCause(text.toUpperCase())}
                            multiline
                            numberOfLines={3}
                            placeholder="Root cause"
                            placeholderTextColor="#999999"
                            autoCapitalize="characters"
                            maxLength={500}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Counter Measure</Text>
                        <TextInput
                            style={styles.textArea}
                            value={counterMeasure}
                            onChangeText={text => setCounterMeasure(text.toUpperCase())}
                            multiline
                            numberOfLines={3}
                            placeholder="Counter measure"
                            placeholderTextColor="#999999"
                            autoCapitalize="characters"
                            maxLength={500}
                        />
                    </View>

                    <DatePicker
                        label="Target Date"
                        value={targetDate}
                        onChange={(date: Date) => setTargetDate(applyDatePart(targetDate, date))}
                    />

                    <AppDropdown
                        label="Priority"
                        manditory={true}
                        value={priority}
                        endpoint="commonFilter/priority"
                        onChange={setPriority}
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.disabledBtn]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            <Modal
                visible={showScanner}
                animationType="slide"
                onRequestClose={() => setShowScanner(false)}
            >
                <View style={styles.scannerWrap}>
                    <TouchableOpacity
                        style={styles.scannerCloseBtn}
                        onPress={() => setShowScanner(false)}
                    >
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    emptyText: { marginTop: 8, textAlign: 'center', color: '#666', fontSize: 14 },
    scanCta: {
        marginTop: 16,
        backgroundColor: '#0D5DB8',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    scanCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    formBody: { padding: 16, paddingBottom: 40 },
    row: { flexDirection: 'row', gap: 8 },
    flex: { flex: 1 },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 4 },
    inputGroup: { marginTop: 4, marginBottom: 12 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
    mandatoryStar: { color: '#DC2626', fontWeight: '700' },
    textInput: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1E293B',
        backgroundColor: '#FFFFFF',
    },
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
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 8 },
    spareRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    spareOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: '#1976D2',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: { backgroundColor: '#1976D2' },
    checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    checkboxLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
    saveBtn: {
        marginTop: 16,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    disabledBtn: { opacity: 0.6 },
    scannerWrap: { flex: 1, backgroundColor: '#000' },
    scannerCloseBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelWithCheckboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 6,
    },
    inlineCheckboxRow: { flexDirection: 'row', alignItems: 'center' }
});

export default GeneralMaintenanceBooking;
