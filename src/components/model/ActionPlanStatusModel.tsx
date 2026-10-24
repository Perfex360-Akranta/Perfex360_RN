import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import DatePicker from '../forms/DatePicker';
import AppDropdown from '../forms/AppDropdown';
import { UpdateActionPlanCompletion } from '../../services/api/ActionPlan';
import { useGrid } from '../../context/GridProvider';
import { formatLocalDateTime } from '../../utils/DateFormat';

export interface ActionPlanRecord {
  keyid: string;
  aplmkeyid?: string;
  // read-only
  actionplan?: string;
  maintask?: string;
  targetdate?: string;
  // editable
  responsibilityby?: string; // employee id
  status?: string; // P / W / C
  countermeasure?: string;
  completedon?: Date | null;
  remarks?: string;
}

interface Props {
  record: ActionPlanRecord;
  visible?: boolean;
  onClose?: () => void;
  onSelect?: () => void; // called after a successful save
}

const OPTIONS = [
  { id: 'P', text: 'Pending' },
  { id: 'W', text: 'Work in Progress' },
  { id: 'C', text: 'Completed' },
];

// "17-Jun-2017" -> Date (null if empty / invalid)
const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const months: any = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const [d, m, y] = value.split('-');
  const month = months[(m || '').toLowerCase()];
  if (!d || month === undefined || !y) return null;
  return new Date(Number(y), month, Number(d));
};

const ReadOnlyField = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.readOnly}>
      <Text style={styles.readOnlyText}>{value || '-'}</Text>
    </View>
  </View>
);

export default function ActionPlanStatusModel({ record, visible, onClose, onSelect }: Props) {
  const { currentUser } = useGrid();
  const [responsibilityby, setResponsibilityby] = useState<string>(record.responsibilityby ?? '');
  const [status, setStatus] = useState<string>(record.status ?? 'P');
  const [countermeasure, setCountermeasure] = useState<string>(record.countermeasure ?? '');
  const [completedon, setCompletedon] = useState<Date | null>(record.completedon ?? new Date());
  const [remarks, setRemarks] = useState<string>(record.remarks ?? '');
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setResponsibilityby(record.responsibilityby ?? '');
    setStatus(record.status ?? 'P');
    setCountermeasure(record.countermeasure ?? '');
    setCompletedon(record.completedon ?? new Date());
    setRemarks(record.remarks ?? '');
    setOpen(false);
  }, [record]);

  const selectedText = OPTIONS.find(o => o.id === status)?.text ?? 'Select status';

  const submit = async () => {
    const isCompleted = status === 'C';

    // Matches ActionPlanCompDto on the backend (list of one item)
    const payload = [
      {
        keyid: record.keyid,
        aplmkeyid: record.aplmkeyid,
        responsibility: responsibilityby,
        countermeasure,
        status,
        completedby: isCompleted ? currentUser.employeeId : null,
        remarks,
        compleatedon: isCompleted ? formatLocalDateTime(completedon ?? null) : null,
        targetdate: formatLocalDateTime(parseDate(record.targetdate)),
      },
    ];

    try {
      const response = await UpdateActionPlanCompletion(payload);
      if (response) {
        onSelect?.();
      }
    } catch (error) {
      console.log('Action plan save failed:', error);
      Alert.alert('Error', 'Could not save the action plan.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Action Plan Completion</Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Read-only fields */}
            <ReadOnlyField label="Action Plan Point" value={record.actionplan} />
            <ReadOnlyField label="Main Task" value={record.maintask} />
            <ReadOnlyField label="Target Date" value={record.targetdate} />

            {/* Editable: Responsibility dropdown */}
            <AppDropdown
              label="Responsibility"
              value={responsibilityby}
              endpoint="commonFilter/employee"
              onChange={(value: any) => setResponsibilityby(value)}
            />

            {/* Editable: Status dropdown */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(!open)}>
                <Text style={styles.selectedText}>{selectedText}</Text>
                <MaterialIcons
                  name={open ? 'arrow-drop-up' : 'arrow-drop-down'}
                  size={26}
                  color="#333"
                />
              </TouchableOpacity>

              {open && (
                <View style={styles.list}>
                  {OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.item, status === opt.id && styles.itemActive]}
                      onPress={() => {
                        setStatus(opt.id);
                        setOpen(false);
                      }}>
                      <Text style={styles.itemText}>{opt.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Editable: Counter Measure */}
            <Text style={styles.label}>Counter Measure</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={countermeasure}
              onChangeText={setCountermeasure}
            />

            {/* Editable: Completed On */}
            <View style={{ marginBottom: 15 }}>
              <DatePicker
                label="Completed On"
                value={completedon}
                onChange={(v: any) => setCompletedon(v)}
              />
            </View>

            {/* Editable: Remarks */}
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={remarks}
              onChangeText={setRemarks}
            />

            <TouchableOpacity style={styles.button} onPress={submit}>
              <Text>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  closeBtn: {
    position: 'absolute', top: 10, right: 10, zIndex: 100, padding: 5,
    borderRadius: 10, backgroundColor: 'red', elevation: 4,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#000' },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 14, color: '#333', marginBottom: 5 },
  readOnly: {
    minHeight: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 3,
    paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#f2f2f2', justifyContent: 'center',
  },
  readOnlyText: { fontSize: 13, color: '#555' },
  dropdown: {
    height: 40, borderWidth: 1, borderColor: '#4aa3df', borderRadius: 3,
    paddingLeft: 10, paddingRight: 4, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectedText: { fontSize: 13, color: '#000' },
  list: { borderWidth: 1, borderColor: '#4aa3df', borderRadius: 3, marginTop: 2, backgroundColor: '#fff' },
  item: { paddingVertical: 10, paddingHorizontal: 10 },
  itemActive: { backgroundColor: '#e3f2fd' },
  itemText: { fontSize: 13, color: '#000' },
  textArea: {
    borderWidth: 1, borderColor: '#ccc', minHeight: 80, marginBottom: 15,
    borderRadius: 5, padding: 10, textAlignVertical: 'top',
  },
  button: {
    alignSelf: 'center', backgroundColor: '#e0e0e0', borderRadius: 5,
    paddingVertical: 10, paddingHorizontal: 20, marginTop: 10, marginBottom: 10, elevation: 2,
  },
});