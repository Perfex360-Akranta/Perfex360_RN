import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import DatePicker from '../forms/DatePicker';
import AppDropdown from '../forms/AppDropdown';

//import { saveWorkOrderCompletion } from '../../services/api/WorkOrderApi';
import { useGrid } from '../../context/GridProvider';
import { toApiDateString } from '../../utils/DateFormat';

export interface WorkOrderCompletionRow {
    keyid?: string;
    jobtype?: string;
    frequency?: string;
    assembly?: string;
    activity?: string;
    standards?: string;
    plannedduration?: string;
    [key: string]: any;
}

export interface WorkOrderCompletionModelProps {
    visible?: boolean;
    workorderno?: string;
    row?: WorkOrderCompletionRow;
    onClose?: () => void;
    onSuccess?: () => void;
}

const findField = (obj: any, patterns: string[]): string | undefined => {
    if (!obj) return undefined;
    const keys = Object.keys(obj);
    const key = keys.find(k => {
        const lower = k.toLowerCase();
        return patterns.every(p => lower.includes(p));
    });
    if (key && obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        return obj[key];
    }
    return undefined;
};

const WorkOrderCompletionModel: React.FC<WorkOrderCompletionModelProps> = ({
    visible = true,
    workorderno,
    row,
    onClose,
    onSuccess,
}) => {
    const { currentUser, currentRole } = useGrid();


    const jobType = row?.jobtype ?? row?.JOBTYPE ?? findField(row, ['job', 'type']) ?? '-';
    const frequency = row?.frequency ?? row?.FREQUENCY ?? findField(row, ['freq']) ?? '-';
    const activity = row?.activity ?? row?.ACTIVITY ?? findField(row, ['activity']) ?? '-';
    const standards = row?.standards ?? row?.STANDARDS ?? findField(row, ['standard']) ?? '-';
    const plannedDuration = row?.plannedduration ?? row?.PLANNEDDURATION ?? findField(row, ['planned', 'duration']) ?? '-';


    const [status, setStatus] = useState<boolean>(
        row?.status === true || row?.status === 'Y' || row?.STATUS === 'Y'
    );

    const [actualDuration, setActualDuration] = useState<string>(
        row?.actualduration ?? row?.ACTUALDURATION ?? ''
    );
    const [actionTaken, setActionTaken] = useState<string>(
        row?.actiontaken ?? row?.ACTIONTAKEN ?? ''
    );
    const [observation, setObservation] = useState<string>(
        row?.observation ?? row?.OBSERVATION ?? ''
    );
    const [responsibility, setResponsibility] = useState<string>(
        row?.responsibility ?? row?.RESPONSIBILITY ?? ''
    );
    const [targetDate, setTargetDate] = useState<Date>(() => {
        const raw = row?.targetdate ?? row?.TARGETDATE;
        const parsed = raw ? new Date(raw) : new Date();
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    });

    const [saving, setSaving] = useState<boolean>(false);


    useEffect(() => {
        if (status && !actionTaken) {
            setActionTaken('DONE');
        }
        if (!status) {
            setActionTaken('');
            setActualDuration('');
            setObservation('');
            setResponsibility('');
        }
    }, [status]);

    const handleSave = async () => {
        if (!status) {
            Alert.alert('Incomplete', 'Mark Status as complete before saving.');
            return;
        }
        if (!responsibility) {
            Alert.alert('Missing field', 'Please select a Responsibility.');
            return;
        }

        try {
            setSaving(true);

            const nowStr = toApiDateString(new Date());

            const payload = {
                keyid: row?.keyid ?? '',
                workorderno: workorderno ?? '',
                jobtype: row?.jobtype ?? row?.JOBTYPE ?? '',
                status: status ? 'Y' : 'N',
                actualduration: actualDuration,
                actiontaken: actionTaken,
                observation: observation.trim(),
                responsibility,
                targetdate: toApiDateString(targetDate),
                roleid: currentRole?.roleId ?? '',
                employeeid: currentUser?.employeeId ?? '',
                createdby: currentUser?.employeeId ?? '',
                createdon: nowStr,
                modifiedon: nowStr,
            };

            console.log('Saving work order completion with payload:', payload);
            //const response = await saveWorkOrderCompletion(payload);
            //console.log('Work order completion save response:', response);

            Alert.alert('Success', 'Work order activity updated successfully.');
            onSuccess?.();
        } catch (error: any) {
            console.error('Work order completion save error:', error);
            Alert.alert('Save Failed', error?.response?.data?.message || error?.message || 'Unable to save.');
        } finally {
            setSaving(false);
        }
    };

    const content = (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Activity Completion</Text>
                    {activity ? <Text style={styles.headerSubtitle} numberOfLines={1}>{activity}</Text> : null}
                </View>
                {onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.stepCard}>
                <View style={styles.stepCardBody}>
                    {/* Read-only context from the previous screen */}
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Job Type:</Text>
                        <Text style={styles.dataValue}>{jobType}</Text>
                    </View>
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Frequency:</Text>
                        <Text style={styles.dataValue}>{frequency}</Text>
                    </View>
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Activity:</Text>
                        <Text style={styles.dataValue}>{activity}</Text>
                    </View>
                    {standards !== '-' && (
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>Standards:</Text>
                            <Text style={styles.dataValue}>{standards}</Text>
                        </View>
                    )}
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Planned Dur.:</Text>
                        <Text style={styles.dataValue}>{plannedDuration}</Text>
                    </View>

                    {/* Status checkbox gates the rest of the fields */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setStatus(prev => !prev)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, status && styles.checkboxChecked]}>
                            {status && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>Status</Text>
                    </TouchableOpacity>

                    {status && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Actual Duration (Mins)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={actualDuration}
                                    keyboardType="numeric"
                                    placeholder="Enter minutes"
                                    placeholderTextColor="#999999"
                                    onChangeText={setActualDuration}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Action Taken</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={actionTaken}
                                    onChangeText={setActionTaken}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Observation</Text>
                                <TextInput
                                    style={styles.remarksInput}
                                    value={observation}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Enter observation..."
                                    placeholderTextColor="#999999"
                                    onChangeText={setObservation}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Responsibility</Text>
                                <AppDropdown
                                    label=""
                                    manditory={true}
                                    dataset={[]}
                                    value={responsibility}
                                    endpoint="enter the employee dropdown end point"
                                    onChange={val => setResponsibility(val)}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <DatePicker
                                    label="Target Date"
                                    value={targetDate}
                                    onChange={(date: Date) => setTargetDate(date)}
                                />
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.stepCardFooter}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose} disabled={saving}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.saveBtn, saving && styles.disabledBtn]} onPress={handleSave} disabled={saving}>
                            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalWrapper}>{content}</View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'center', padding: 16 },
    modalWrapper: { backgroundColor: '#FFFFFF', borderRadius: 14, maxHeight: '90%', overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
    cardContainer: { maxHeight: '100%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1976D2' },
    headerTitleContainer: { flex: 1, marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 12, color: '#E3F2FD', marginTop: 2 },
    closeButton: { padding: 6, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    closeText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', width: 20, textAlign: 'center' },
    stepCard: { margin: 14, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    stepCardBody: { padding: 12 },
    dataRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dataLabel: { width: 100, fontSize: 12, fontWeight: '600', color: '#64748B' },
    dataValue: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 },
    checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#1976D2', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: '#FFFFFF' },
    checkboxChecked: { backgroundColor: '#1976D2' },
    checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    checkboxLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
    inputGroup: { marginTop: 8 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
    textInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#1E293B', backgroundColor: '#F8FAFC' },
    remarksInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#1E293B', minHeight: 60, textAlignVertical: 'top', backgroundColor: '#F8FAFC' },
    stepCardFooter: { paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FAFAFA' },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 12 },
    saveBtn: { backgroundColor: '#2E7D32' },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    disabledBtn: { opacity: 0.6 },
});

export default WorkOrderCompletionModel;