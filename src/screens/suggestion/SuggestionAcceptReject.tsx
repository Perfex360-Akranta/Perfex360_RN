import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { updateKaizenWorkflowStatus } from '../../services/api/kaizenSuggestionApi';
import { parseDate, toApiDateString } from '../../utils/DateFormat';

export interface SuggestionEditModel {
  keyid: string;
  suggestionno?: string;
  suggestion?: string;
  createddate?: string;
  approvedby?: string;
  approvedbyid?: string;
  targetdate?: Date | null;
  responsibility?: string;
  responsibilityid?: string;
  mocno?: string;
  mocrequired?: string;
  mocitem?: string;
  implementcost?: string;
  suggestedby?: string;
  nonjhesp?: string;
  espnames?: string;
  status?: string;
  functionalloc?: string;
  themename?: string;
  remarks?: string;
}

interface ModelProps {
  record: SuggestionEditModel;
  visible: boolean;
  currentUserId: string;
  onClose: () => void;
  onSelect: () => void;
}

const ACCEPT_REJECT_OPTIONS = [
  { label: 'Accepted', value: 'V' },
  { label: 'Rejected', value: 'R' },
  { label: 'Rework', value: 'E' },
];

const SuggestionAcceptRejectModel: React.FC<ModelProps> = ({
  record,
  visible,
  currentUserId,
  onClose,
  onSelect,
}) => {
  const [remarks, setRemarks] = useState('');
  const [acceptReject, setAcceptReject] = useState<'V' | 'R' | 'E' | ''>('');
  const [mocRequired, setMocRequired] = useState(false);
  const [mocItem, setMocItem] = useState('');
  const [implementCost, setImplementCost] = useState('');
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [dateResetKey, setDateResetKey] = useState(0);
  const [approvedById, setApprovedById] = useState('');
  const [responsibilityId, setResponsibilityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isResponsibilityMandatory = acceptReject === 'V';

  useEffect(() => {
    if (!visible) return;

    setRemarks(record.remarks ?? '');
    setAcceptReject('');
    setMocRequired(record.mocrequired === 'Y');
    setMocItem(record.mocitem ?? '');
    setImplementCost(record.implementcost ?? '');
    setTargetDate(record.targetdate ?? new Date());
    setApprovedById(record.approvedbyid || currentUserId);
    setResponsibilityId('');
    setDateResetKey(prev => prev + 1);
  }, [visible, record.keyid]);

    const validateForm = (): boolean => {
    if (!acceptReject) {
      Alert.alert('Validation', 'Accept/Reject is required');
      return false;
    }

    if ((acceptReject === 'R' || acceptReject === 'E') && !remarks.trim()) {
      Alert.alert('Validation', 'Remarks are required');
      return false;
    }

    if (!targetDate) {
      Alert.alert('Validation', 'Target Date is required');
      return false;
    }

    if (mocRequired && !mocItem) {
      Alert.alert('Validation', 'MOC Item is required');
      return false;
    }

    if (isResponsibilityMandatory && !responsibilityId) {
      Alert.alert('Validation', 'Responsibility is required');
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        kznKeyId: record.keyid,
        wfStatus: acceptReject,
        kaizen: record.suggestion ?? '',
        acrejby: approvedById || currentUserId,
        implementCost: implementCost || '0',
        targetDate: toApiDateString(targetDate) || null,
        mocRequired: mocRequired ? 'Y' : 'N',
        responsibility: responsibilityId,
        verifyRemarks: remarks.trim(),
        mocitem: mocRequired ? mocItem : '',
      };


       const responseData = await updateKaizenWorkflowStatus(payload);
      console.log('updateKaizenWorkflowStatus response:', responseData);

      if (responseData !== 'SUCCESS') {
        Alert.alert('Failed', responseData || 'No record was updated. Please try again.');
        return;
      }

      const statusMessages: Record<string, string> = {
        V: 'Suggestion accepted',
        R: 'Suggestion rejected',
        E: 'Suggestion sent for rework',
      };
      Alert.alert('Success', statusMessages[acceptReject] ?? 'Suggestion updated');

      onSelect();
    } catch (error: any) {
      Alert.alert(
        'Failed',
        error?.response?.data?.message || error?.message || 'Something went wrong',
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('DEBUG targetDate:', targetDate, targetDate?.toString());
  }, [targetDate]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Kaizen Suggestion</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.fieldLabel}>Suggestion</Text>
            <TextInput
              style={styles.readonlyBox}
              value={record.suggestion || ''}
              editable={false}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Remarks</Text>
            <TextInput
              style={styles.textArea}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              placeholder="Enter remarks"
            />

            <AppDropdown
              label="Accept/Reject"
              manditory={true}
              dataset={ACCEPT_REJECT_OPTIONS}
              value={acceptReject}
              endpoint=""
              onChange={(value: string) => setAcceptReject(value as 'V' | 'R' | 'E')} />
            {/* <Text style={styles.fieldLabel}>* Accept/Reject</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={acceptReject} onValueChange={v => setAcceptReject(v)}>
                <Picker.Item label="Accepted" value="V" />
                <Picker.Item label="Rejected" value="R" />
              </Picker>
            </View> */}




            <View style={styles.checkboxRow}>
              <CheckBox
                value={mocRequired}
                disabled={false}
                onValueChange={setMocRequired}
              />
              <Text style={styles.label}>MOC Required</Text>
            </View>

            <AppDropdown
              label="MOC Item"
              manditory={mocRequired}
              value={mocItem}
              endpoint="commonFilter/mocItem"
              disable={!mocRequired}
              onChange={(value: any) => setMocItem(value)}
            />

            <Text style={styles.fieldLabel}>Implementation Cost</Text>
            <TextInput
              style={styles.input}
              value={implementCost}
              onChangeText={setImplementCost}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={[styles.label, styles.mandatoryLabel]}>Target Date *</Text>
            <DatePicker
              key={dateResetKey}
              value={targetDate}
              onChange={v => setTargetDate(v)}
            />

            {/* <AppDropdown
              label="Approved by"
              value={approvedById}
              endpoint="commonFilter/employee"
              onChange={(value: any) => setApprovedById(value)}
            /> */}
            <AppDropdown
              label="Responsibility"
              manditory={isResponsibilityMandatory}
              value={responsibilityId}
              endpoint="commonFilter/employee"
              onChange={(value: any) => setResponsibilityId(value)}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.disabledBtn]}
              onPress={submit}
              disabled={submitting}>
              <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const SuggestionAcceptReject: React.FC = () => {
  const { currentUser, currentRole } = useGrid();
  const cardsRef = useRef<any>(null);
  // const isJhLeader = currentRole.roleLevel === 1200;
  const isJhLeader = currentRole.roleCode === 'JH LEADER' || currentRole.roleCode === 'DMT LEADER';
  console.log('DEBUG AcceptReject:', { roleLevel: currentRole.roleLevel, roleCode: currentRole.roleCode, roleName: currentRole.roleName, flid: currentRole.flid, isJhLeader });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editData, setEditData] = useState<SuggestionEditModel>({
    keyid: '',
  });

  const handleEdit = (row: any, metaRow: any, headerRow: any) => {
    setEditData({
      keyid: row.keyid,
      suggestionno: row.suggestionno,
      suggestion: row.kaizen,
      createddate: row.dates,
      approvedby: row.cmbapprovedby,
      approvedbyid: row.cmbapprovedbyid,
      //targetdate: row.target ? new Date(row.target) : null,
      targetdate: parseDate(row.target),
      responsibility: row.resposibility,
      responsibilityid: row.resposibilityid,
      mocno: row.moc_rfc_keyid,
      mocrequired: row.kzbn_mocrequired,
      mocitem: row.mocitem,
      implementcost: row.implementcost,
      suggestedby: row.suggestedby,
      nonjhesp: row.nonjhesp,
      espnames: row.espnames,
      status: row.status,
      functionalloc: row.functionalloc,
      themename: row.themename,
      remarks: row.remarks === '{}' ? '' : row.remarks,
    });
    setShowModal(true);
  };


  if (!isJhLeader) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Cards
        procedureName="jhn_fn_kaizenacceptedverify_rn_sb"
        isEdit={true}
        onEdit={handleEdit}
        ref={cardsRef}
        conditionParams={{
          KZNBANKTYPE: 'A',
          ROLELEVELNO: currentRole.roleLevel,
          CHK_DETECTBY: currentUser.employeeId,
          FLID: currentRole.flid,
        }}
      />

      <SuggestionAcceptRejectModel
        record={editData}
        visible={showModal}
        currentUserId={currentUser.employeeId ?? ''}
        onClose={() => setShowModal(false)}
        onSelect={() => {
          cardsRef.current?.reload();
          setShowModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { fontSize: 18, color: '#999', paddingHorizontal: 6 },
  label: { fontWeight: '600' },
  mandatoryLabel: {
    color: 'red',
  },
  fieldLabel: { fontWeight: '600', fontSize: 13, marginTop: 12, marginBottom: 4, color: '#333' },
  readonlyBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 70,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtn: {
    backgroundColor: '#27AE60',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  disabledBtn: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default SuggestionAcceptReject;