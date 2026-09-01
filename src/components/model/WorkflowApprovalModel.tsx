import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    Platform,
} from 'react-native';
import DatePicker from '../forms/DatePicker';

import AppDropdown from '../forms/AppDropdown';
import { updateKaizenWorkflowStatus } from '../../services/api/kaizenSuggestionApi';
import { useGrid } from '../../context/GridProvider';
import { toApiDateString } from '../../utils/DateFormat';


import { saveWorkFlowApproval } from '../../services/api/WorkflowApi';
import { WorkFlowApprovalSavePayload } from '../../types/workflow';

export interface WorkflowApprovalRow {
    hdnWrinKeyid?: string;
    txtRoleName?: string;
    txtEmpName?: string;
    selWrinStatus?: string;
    dteWrinDate?: string;
    txtWrinRemarks?: string;
    enableRow?: string | boolean | number;
    enabl?: string;
    [key: string]: any;
}

export interface WorkflowApprovalModelProps {
    visible?: boolean;
    record?: any;
    row?: WorkflowApprovalRow;
    onClose?: () => void;
    onSuccess?: () => void;
}

const STATUS_OPTIONS = [
    { label: 'Accepted', value: 'A' },
    { label: 'Rework', value: 'E' },
    { label: 'Rejected', value: 'R' },
    { label: 'Pending', value: 'P' },
];


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

const WorkflowApprovalModel: React.FC<WorkflowApprovalModelProps> = ({
    visible = true,
    record,
    row,
    onClose,
    onSuccess,
}) => {
    const { currentUser, currentRole } = useGrid();

    useEffect(() => {
        console.log('WorkflowApprovalModel row keys:', row ? Object.keys(row) : null);
        console.log('WorkflowApprovalModel row:', row);
    }, [row]);

    const refId =
        record?.refId ||
        record?.keyid ||
        record?.KEYID ||
        record?.kznkeyid ||
        record?.KZNKEYID ||
        record?.kznno ||
        record?.KZNNO ||
        record?.suggestionno ||
        record?.imprvno ||
        record?.IMPRVNO ||
        row?.hdnWrinKeyid ||
        '';

    const kaizenTitle =
        record?.kaizen ||
        record?.themename ||
        record?.suggestion ||
        record?.THEMENAME ||
        record?.SUGGESTION ||
        '';

    const roleName =
        row?.txtRoleName ??
        row?.ROLENAME ??
        row?.rolename ??
        row?.ROLE_NAME ??
        row?.role_name ??
        row?.ROLE ??
        findField(row, ['role']) ??
        'Approver';

    const empName =
        row?.txtEmpName ??
        row?.EMPNAME ??
        row?.empname ??
        row?.EMP_NAME ??
        row?.emp_name ??
        row?.EMPLOYEE_NAME ??
        row?.employee_name ??
        findField(row, ['emp', 'name']) ??
        '-';

    const enabled = (() => {
        const val =
            row?.enabl ??
            row?.ENABL ??
            row?.enableRow ??
            row?.ENABLEROW ??
            row?.ENABLE_ROW ??
            row?.chkMakeEditable ??
            row?.enable;
        return val === true || val === 'Y' || val === 'y' || val === '1' || val === 1 || val === 'TRUE' || val === 'true';
    })();

    const [isEditing, setIsEditing] = useState<boolean>(enabled);
    const [saving, setSaving] = useState<boolean>(false);

    const [status, setStatus] = useState<string>(() => {
        const initial = row?.selWrinStatus ?? row?.STATUS ?? row?.status ?? 'P';
        return initial === 'P' || !initial ? 'A' : initial;
    });

    const [remarks, setRemarks] = useState<string>(
        row?.txtWrinRemarks ?? row?.REMARKS ?? row?.remarks ?? ''
    );

    const dateVal = row?.dteWrinDate ?? row?.DATE ?? row?.date ?? row?.WRINDATE ?? '';

    // Editable approval date — defaults to today, changeable via the picker.
    const [approvalDate, setApprovalDate] = useState<Date>(new Date());


    const getStatusBadge = (s?: string) => {
        switch (s?.toUpperCase()) {
            case 'A': case 'V': case 'ACCEPT': case 'ACCEPTED': case 'APPROVED':
                return { label: 'Accepted', bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' };
            case 'R': case 'REJECT': case 'REJECTED':
                return { label: 'Rejected', bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' };
            case 'E': case 'REWORK':
                return { label: 'Rework', bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' };
            case 'P': case 'PENDING': default:
                return { label: s && s !== 'P' ? s : 'Pending', bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' };
        }
    };

    const formatDateDisplay = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const displayDateText = isEditing ? approvalDate.toLocaleDateString() : formatDateDisplay(dateVal);

    const badge = getStatusBadge(status);

    const handleSave = async () => {
        try {
            setSaving(true);

            const nowStr = toApiDateString(new Date());

            const payload: WorkFlowApprovalSavePayload = {
                workFlowInfo: {
                    keyid: row?.wrin_keyid || undefined,
                    wrml_keyid: row?.wrml_keyid ?? '',
                    ref_id: refId,
                    ref_type: record?.refType ?? '',
                    role_id: row?.role_keyid ?? currentRole?.roleId ?? '',
                    status,
                    employee_id: currentUser?.employeeId ?? '',
                    date: toApiDateString(approvalDate),
                    remarks: remarks.trim(),
                    wrkd_keyid: row?.wrkd_keyid ?? '',
                    tempfield2: '-',
                    tempfield3: '-',
                    tempfield4: '-',
                    tempfield5: '-',
                    createdby: currentUser?.employeeId ?? '',
                    createdon: nowStr,
                    modifiedon: nowStr,
                },
                lastLevel: 'N',
                nextRoleName: '',
                nextRoleId: '',
                nextEmpId: '',
            };
            console.log('Saving workflow approval with payload:', payload);
            const response = await saveWorkFlowApproval(payload);
            console.log('Workflow save response:', response);
            Alert.alert('Success', 'Workflow approval updated successfully.');
            setIsEditing(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Workflow save error:', error);
            Alert.alert('Save Failed', error?.response?.data?.message || error?.message || 'Unable to save workflow approval.');
        } finally {
            setSaving(false);
        }
    };

    const content = (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Workflow Approval</Text>
                    {kaizenTitle ? <Text style={styles.headerSubtitle} numberOfLines={1}>{kaizenTitle}</Text> : null}
                </View>
                {onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.stepCard}>
                <View style={styles.stepCardHeader}>
                    <Text style={styles.roleNameText}>{roleName}</Text>
                    {!isEditing && (
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                            <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.stepCardBody}>
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Approver:</Text>
                        <Text style={styles.dataValue}>{empName}</Text>
                    </View>

                    {isEditing ? (
                        <View style={styles.inputGroup}>
                            <DatePicker
                                label="Date"
                                value={approvalDate}
                                onChange={(date: Date) => setApprovalDate(date)}
                            />
                        </View>
                    ) : (
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>Date:</Text>
                            <Text style={styles.dataValue}>{displayDateText}</Text>
                        </View>
                    )}

                    {isEditing && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Approval Status *</Text>
                            <AppDropdown
                                label=""
                                manditory={true}
                                dataset={STATUS_OPTIONS}
                                value={status}
                                endpoint=""
                                onChange={val => setStatus(val)}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Remarks</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.remarksInput}
                                value={remarks}
                                multiline
                                numberOfLines={3}
                                placeholder="Enter approval remarks..."
                                placeholderTextColor="#999999"
                                onChangeText={setRemarks}
                            />
                        ) : (
                            <Text style={styles.remarksText}>{remarks || '-'}</Text>
                        )}
                    </View>
                </View>

                {enabled && (
                    <View style={styles.stepCardFooter}>
                        {isEditing ? (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose} disabled={saving}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.saveBtn, saving && styles.disabledBtn]} onPress={handleSave} disabled={saving}>
                                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Approval'}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => setIsEditing(true)}>
                                <Text style={styles.editBtnText}>Edit Approval</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
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
    stepCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    roleNameText: { fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    statusBadgeText: { fontSize: 12, fontWeight: '700' },
    stepCardBody: { padding: 12 },
    dataRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dataLabel: { width: 90, fontSize: 12, fontWeight: '600', color: '#64748B' },
    dataValue: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500' },
    inputGroup: { marginTop: 8 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
    remarksInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#1E293B', minHeight: 60, textAlignVertical: 'top', backgroundColor: '#F8FAFC' },
    remarksText: { fontSize: 13, color: '#334155', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
    stepCardFooter: { paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FAFAFA' },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    editBtn: { backgroundColor: '#E3F2FD', alignSelf: 'flex-end' },
    editBtnText: { color: '#1976D2', fontWeight: '700', fontSize: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 12 },
    saveBtn: { backgroundColor: '#2E7D32' },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    disabledBtn: { opacity: 0.6 },
});

export default WorkflowApprovalModel;