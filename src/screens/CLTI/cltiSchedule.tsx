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
import EquipmentHeaderNew from '../../components/QRscanner/EquipmentHeaderNEW';
import { EquipmentFnlnDetails } from '../../types/workorder';
import EquipmentScanner from '../../components/QRscanner/EquipmentScanner';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';
import { ClitCalendarSavePayload } from '../../types/CLTIschedule';
import { saveClitSchedule, ensureClitCalendar } from '../../services/api/CLTIschedule';

type RouteParams = {
    equipmentNo?: string;
};

const STATUS_GREEN = '#C8E6C9';
const STATUS_YELLOW = '#FFF59D';
const BLANK = '\u00A0';

const HOW_ICON_MAP: Array<{ match: string[]; icon: string }> = [
    { match: ['eye', 'see', 'visual'], icon: 'visibility' },
    { match: ['ear', 'hear', 'sound'], icon: 'hearing' },
    { match: ['nose', 'smell'], icon: 'air' },
    { match: ['oral', 'mouth', 'tongue', 'taste'], icon: 'record-voice-over' },
    { match: ['hand', 'touch'], icon: 'pan-tool' },
];

const firstValue = (row: any, keys: string[]) => {
    if (!row) {
        return '';
    }

    const lowerMap: Record<string, any> = {};
    Object.keys(row).forEach(key => {
        lowerMap[key.toLowerCase()] = row[key];
    });

    for (const key of keys) {
        const value = lowerMap[key.toLowerCase()];
        if (value !== undefined && value !== null && value !== '' && value !== '{}') {
            return value;
        }
    }
    return '';
};

const pickByKeyPattern = (row: any, pattern: RegExp, exclude?: RegExp) => {
    if (!row) {
        return '';
    }
    for (const key of Object.keys(row)) {
        if (!pattern.test(key)) {
            continue;
        }
        if (exclude && exclude.test(key)) {
            continue;
        }
        const value = row[key];
        if (value !== undefined && value !== null && value !== '' && value !== '{}') {
            return String(value);
        }
    }
    return '';
};

const recordId = (row: any) => {
    if (!row) {
        return '';
    }

    return String(
        firstValue(row, [
            'keyid', // CLCA_KEYID
            'clcakeyid',
            'clca_keyid',
            'clitkeyid',
            'jhkeyid',
            'activityid',
        ]) ||
        pickByKeyPattern(
            row,
            /^keyid$|clca.?keyid|clitkeyid|activityid/i,
            /item|name|desc|how|class|srl|serial|time|sched|ref/i,
        ) ||
        '',
    );
};

const formatHowAction = (field: string, value: any) => {
    if (field.toLowerCase() !== 'howaction') {
        return undefined;
    }
    const v = String(value ?? '').trim().toLowerCase();
    if (!v || v === '{}') {
        return undefined;
    }
    const hit = HOW_ICON_MAP.find(m => m.match.some(k => v.includes(k)));
    return hit ? { icon: hit.icon, iconColor: '#0D5DB8', text: '' } : undefined;
};

const formatCardField = (field: string, value: any, _item: any) => {
    if (field.toLowerCase() === 'howaction') {
        return formatHowAction(field, value);
    }

    if (/^m_\d+$/i.test(field)) {
        const raw = String(value ?? '');
        const sep = raw.indexOf('|');
        const n = parseInt(sep >= 0 ? raw.slice(0, sep) : raw, 10);
        const remarks = sep >= 0 ? raw.slice(sep + 1).trim() : '';
        const text = remarks || BLANK;

        if (n === 1) { return { text, backgroundColor: STATUS_GREEN }; }
        if (n === -1) { return { text, backgroundColor: STATUS_YELLOW }; }
        return { text };
    }

    return undefined;
};

const CltiSchedule: React.FC = () => {
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { currentUser } = useGrid();
    const cardsRef = useRef<any>(null);

    const [equipmentNo, setEquipmentNo] = useState(route.params?.equipmentNo);
    const [machineid, setMachineid] = useState<string | null>(null);
    const [flid, setFlid] = useState<string | null>(null);
    const [factoryId, setFactoryId] = useState<string | null>(null);
    const [sectionId, setSectionId] = useState<string | null>(null);
    const [cellId, setCellId] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [appliedParams, setAppliedParams] = useState<Record<string, any> | null>(null);

    const [showEdit, setShowEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [shift, setShift] = useState('');
    const [notOk, setNotOk] = useState(false);
    const [observation, setObservation] = useState('');

    const scannerNavigation = useMemo(
        () => ({
            navigate: (arg: any) => {
                const params = arg?.params ?? arg;
                const scanned = params?.equipmentNo ?? params?.scannedId;
                if (scanned) {
                    setMachineid(null);
                    setFlid(null);
                    setFactoryId(null);
                    setSectionId(null);
                    setCellId(null);
                    setShift('');
                    setAppliedParams(null);
                    setEquipmentNo(String(scanned));
                    setShowScanner(false);
                }
            },
            goBack: () => setShowScanner(false),
        }),
        [],
    );

    const handleView = async () => {
        if (!machineid) {
            Alert.alert('Equipment is required', 'Please scan an equipment QR code first.');
            return;
        }
        if (!shift) {
            Alert.alert('Missing field', 'Select the Shift.');
            return;
        }

        try {
            setViewLoading(true);
            const res = await ensureClitCalendar({
                factoryId: factoryId ?? '',
                sectionId: sectionId ?? '',
                cellId: cellId ?? '',
                machineId: machineid,
            });
            console.log('CLIT ENSURE RESPONSE:', res);
            if (String(res?.stnd?.result || '').toLowerCase() !== 'success') {
                Alert.alert('Calendar not ready', res?.stnd?.message || 'Unable to prepare the calendar.');
                return;
            }
        } catch (error: any) {
            console.error('CLIT calendar ensure error:', error);
            Alert.alert(
                'Calendar not ready',
                error?.response?.data?.stnd?.message || error?.message || 'Unable to prepare the calendar.',
            );
            return;
        } finally {
            setViewLoading(false);
        }

        setAppliedParams({
            FLID: flid ?? '',
            EQFNLN: flid ?? '',
            MACHINEID: machineid,
            MACHINENO: equipmentNo,
            SHIFT: shift,
            FACTORYID: factoryId ?? '',
            SECTIONID: sectionId ?? '',
            CELLID: cellId ?? '',
        });
    };

    const closeEdit = () => {
        setShowEdit(false);
        setSaving(false);
    };

    const openScanner = () => setShowScanner(true);

    const handleEquipmentLoaded = (details: EquipmentFnlnDetails) => {
        setMachineid(String(details?.machineid || details?.equipmentNo || equipmentNo || '') || null);
        setFlid(details?.fnlnKeyid ?? null);
        setFactoryId(details?.sbutKeyid ?? null);
        setSectionId(details?.sectKeyid ?? null);
        setCellId(details?.cellKeyid ?? null);
        setShift('');
        setAppliedParams(null);
    };

    const handleEdit = (record: GridEditProps) => {
        const row = record.row;
        console.log('CLIT EDIT ROW:', row);
        setSelectedRow(row);
        const notOkFlag = String(
            firstValue(row, ['notok', 'notokay', 'ngflag', 'isnotok']) || '',
        )
            .trim()
            .toUpperCase();
        setNotOk(notOkFlag === 'Y' || notOkFlag === 'TRUE' || notOkFlag === '1' || notOkFlag === 'NOT OK');
        setObservation(String(firstValue(row, ['observation', 'observations', 'remarks']) || ''));
        setShowEdit(true);
    };

    const handleNotOkToggle = () => setNotOk(prev => !prev);

    const handleSave = async () => {
        if (!shift) {
            Alert.alert('Missing field', 'Select the Shift.');
            return;
        }
        if (!machineid) {
            Alert.alert('Equipment is required', 'Please scan an equipment QR code first.');
            return;
        }
        if (!currentUser?.employeeId) {
            Alert.alert('Missing field', 'createdBy is required.');
            return;
        }
        if (notOk && !observation.trim()) {
            Alert.alert('Missing field', 'Enter the Observation when Not OK is checked.');
            return;
        }

        const activityId = recordId(selectedRow);
        const saveCellId = String(
            firstValue(selectedRow, ['cellid', 'cell_id', 'clca_cellid', 'cellkeyid']) || cellId || '',
        );
        const saveMachineId = String(
            firstValue(selectedRow, ['machineid', 'machine_id', 'clca_machineid']) || machineid || '',
        );
        const saveShiftId = String(
            shift ||
            firstValue(selectedRow, ['planshiftid', 'shiftid', 'clca_planshiftid', 'actualshiftid']) ||
            '',
        );

        if (!activityId) {
            Alert.alert('Missing record', 'Activity id was not found on the selected card.');
            return;
        }
        if (!saveCellId) {
            Alert.alert('Missing field', 'Cell id was not found for this equipment.');
            return;
        }
        if (!saveMachineId) {
            Alert.alert('Equipment is required', 'Please scan an equipment QR code first.');
            return;
        }
        if (!saveShiftId) {
            Alert.alert('Missing field', 'Select the Shift.');
            return;
        }

        // NOTE: tagClass removed no need any longer,also commented in types
        const payload: ClitCalendarSavePayload = {
            activity: [activityId],
            cellId: saveCellId,
            machineId: saveMachineId,
            shiftId: saveShiftId,
            status: notOk ? 'Not OK' : 'OK',
            observation: notOk ? observation.trim() : '',
            createdBy: currentUser.employeeId,
        };

        console.log('CLIT SAVE ROW KEYS:', selectedRow ? Object.keys(selectedRow) : []);
        console.log('CLIT SAVE PAYLOAD:', payload);

        try {
            setSaving(true);
            const response = await saveClitSchedule(payload);
            const result = String(response?.stnd?.result || '').toLowerCase();
            const message = response?.stnd?.message;

            if (result === 'error') {
                Alert.alert('Save Failed', message || 'Unable to save.');
                return;
            }
            if (result === 'no records updated') {
                Alert.alert('Save Failed', 'No matching CLIT schedule record was updated.');
                return;
            }

            cardsRef.current?.reload();
            closeEdit();
            Alert.alert('Success', 'CLIT schedule saved.');
        } catch (error: any) {
            console.error('CLIT schedule save error:', error);
            Alert.alert(
                'Save Failed',
                error?.response?.data?.stnd?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Unable to save.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <EquipmentHeaderNew
                equipmentNo={equipmentNo}
                onScanPress={openScanner}
                title="Equipment"
                onEquipmentLoaded={handleEquipmentLoaded}
            />

            {!equipmentNo || !machineid ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
                    <Text style={styles.emptyTitle}>No equipment scanned</Text>
                    <Text style={styles.emptyText}>
                        Tap the scanner icon to scan a machine's QR code, then select Shift and tap View.
                    </Text>
                    <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
                        <Text style={styles.scanCtaText}>Scan QR</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.shiftBar}>
                        <View style={styles.shiftDropdown}>
                            <AppDropdown
                                key={`shift-${factoryId ?? 'no-factory'}`}
                                label="Shift"
                                manditory={true}
                                value={shift}
                                endpoint="commonFilter/Shift"
                                params={{ factoryId: factoryId ?? '' }}
                                onChange={value => {
                                    setShift(value);
                                    setAppliedParams(null);
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.viewBtn, viewLoading && styles.disabledBtn]}
                            onPress={handleView}
                            disabled={viewLoading}
                        >
                            <Text style={styles.viewBtnText}>{viewLoading ? 'Loading...' : 'View'}</Text>
                        </TouchableOpacity>
                    </View>

                    {appliedParams == null ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>Select Shift</Text>
                            <Text style={styles.emptyText}>
                                Choose a shift and tap View to load CLIT standards.
                            </Text>
                        </View>
                    ) : (
                        <Cards
                            key={`${machineid}-${appliedParams.SHIFT}`}
                            procedureName="jhn_fn_getschedulearray_new_rn_sb"
                            isEdit={true}
                            onEdit={handleEdit}
                            ref={cardsRef}
                            conditionParams={appliedParams}
                            formatField={formatCardField}
                        />
                    )}
                </>
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

                        <Text style={styles.title}>CLIT Schedule</Text>

                        <ScrollView keyboardShouldPersistTaps="handled">
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={handleNotOkToggle}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, notOk && styles.checkboxChecked]}>
                                    {notOk && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>Not OK</Text>
                            </TouchableOpacity>

                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Observation</Text>
                                <TextInput
                                    style={[styles.textArea, !notOk && styles.textAreaDisabled]}
                                    value={observation}
                                    onChangeText={setObservation}
                                    multiline
                                    numberOfLines={4}
                                    editable={notOk}
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
    inputGroup: { marginTop: 8 },
    textArea: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1E293B',
        minHeight: 90,
        textAlignVertical: 'top',
        backgroundColor: '#FFFFFF',
    },
    textAreaDisabled: {
        backgroundColor: '#F1F5F9',
        color: '#94A3B8',
    },
    shiftBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    shiftDropdown: { flex: 1, marginRight: 8 },
    viewBtn: {
        height: 38,
        marginBottom: 12,
        backgroundColor: '#0D5DB8',
        borderRadius: 8,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
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

export default CltiSchedule;