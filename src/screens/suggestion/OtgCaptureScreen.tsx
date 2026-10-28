
import AssistTextInput from '../../components/forms/AssistTextInput';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import CheckBox from '@react-native-community/checkbox';
import FunctionLocationScanner from '../../components/QRscanner/FunctionLocationScanner';
import SuggestionImageUpload, {
  PickedImage,
} from '../../components/forms/SuggestionImageUpload';
import VoiceControlButton from '../../components/assist/VoiceControlButton';
import { useGrid } from '../../context/GridProvider';
import { useAppTheme } from '../../theme/ThemeContext';
import { getCurrentDateTime, toApiDateString } from '../../utils/DateFormat';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { speak } from '../../services/assist/voiceGuide';
import { useVoiceGuide } from '../../context/VoiceGuideContext';

import {getSuggestionImage, uploadSuggestionImage,} from '../../services/api/suggestionImageApi';
import { getOtgCaptureById, saveOtgCapture } from '../../services/api/OtgCaptureApi';
import { fromByteArray } from 'base64-js';
import FunctionalLocationScannerView from '../../components/FunctionLocation/FunctionLocationScannerView';

interface OTGCaptureForm {
  keyid: string;
  title: string;
  description: string;
  remarks: string;
  flid: string;
  empmKeyid: string;
  entrydate: Date;
  priority: string;
  status: string;
  type: string;
  tempfield1: string;
  tempfield2: string;
  tempfield3: string;
  tempfield4: string;
  tempfield5: string;
  tempfield6: string;
  tempfield7: string;
  tempfield8: string;
  tempfield9: string;
  tempfield10: string;
  createdby:string;
  createdon:Date;
  modifiedby:string;
  modifiedon:Date;
}

const PRIORITIES = [
  { label: 'Low', value: 'L' },
  { label: 'Medium', value: 'M' },
  { label: 'High', value: 'H' },
  { label: 'Critical', value: 'C' },
];

// const STATUSES = [
//   { label: 'New', value: 'N' },
//   { label: 'In Progress', value: 'P' },
//   { label: 'Completed', value: 'C' },
// ];

export default function OTGCaptureFormScreen({
  navigation,
  route,
}: any) {
  const { colors } = useAppTheme();
  const { currentUser, currentRole } = useGrid();
  const { announceFailure } = useVoiceGuide();

  const editRecord = route?.params?.editRecord;
  const originalId = route?.params?.originalId;

  const [saving, setSaving] = useState(false);
  const [dateResetKey, setDateResetKey] = useState(0);
  const [isMailForApproval, setMailForApproval] = useState(true);
  const [isOtherEmployee, setIsOtherEmployee] = useState(false);

  const [selectedFlidName, setSelectedFlidName] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedCellId, setSelectedCellId] = useState('');

  const [captureImage, setCaptureImage] =
    useState<PickedImage | null>(null);
  const [existingImageUri, setExistingImageUri] =
    useState<string | null>(null);

  const employeeRef = useRef<any>(null);

  const { listening, startListening, stopListening } =
    useVoiceControl();
  const listeningRef = useRef(listening);
  const resumeVoiceRef = useRef(false);

  listeningRef.current = listening;

  const [form, setForm] = useState<OTGCaptureForm>({
    keyid: '',
    title: '',
    description: '',
    remarks: '',
    flid: currentRole?.flid ?? '',
    empmKeyid: currentUser?.employeeId ?? '',
    entrydate: new Date(),
    priority: 'M',
    status: 'N',
    type: '-',
    tempfield1: '-',
    tempfield2: '-',
    tempfield3: '-',
    tempfield4: '-',
    tempfield5: '-',
    tempfield6: '-',
    tempfield7: '-',
    tempfield8: '-',
    tempfield9: '-',
    tempfield10: '-',
    createdby:currentUser?.employeeId ?? '',
    createdon:new Date(),
    modifiedby:currentUser?.employeeId ?? '',
    modifiedon:new Date(),
  });

  useEffect(() => {
    const unsubBlur = navigation.addListener('blur', () => {
      resumeVoiceRef.current = listeningRef.current;
      stopListening(true);
    });

    const unsubFocus = navigation.addListener('focus', () => {
      if (resumeVoiceRef.current) {
        resumeVoiceRef.current = false;
        startListening();
      }
    });

    return () => {
      unsubBlur();
      unsubFocus();
      stopListening(true);
    };
  }, [navigation]);

  const updateField = (
    field: keyof OTGCaptureForm,
    value: any,
  ) => {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  const openScanner = () => {
    navigation.navigate('EquipmentScanner', {
      returnTo: 'OtgCapture',
    });
  };

  const functionalLocationSuccess = (result: any) => {
    setForm(previous => ({
      ...previous,
      flid: result?.flid ?? '',
    }));

    setSelectedFlidName(result?.flid ??'');

    setSelectedCellId(result?.cellId ?? '');
  };

  const handleEmployeeChange = (value: string) => {
    updateField('empmKeyid', value);
  };

  const validateForm = () => {
    const fail = (message: string) => {
      speak(message);
      Alert.alert('Validation', message);
      return false;
    };

    if (!form.flid) {
      return fail('Please scan or select the function location.');
    }

    if (!form.title.trim()) {
      return fail('Title is required.');
    }

    if (!form.description.trim()) {
      return fail('Description is required.');
    }

    if (!form.empmKeyid) {
      return fail('Please select an employee.');
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      keyid: '',
      title: '',
      description: '',
      remarks: '',
      flid: form.flid,
      empmKeyid: currentUser?.employeeId ?? '',
      entrydate: new Date(),
      priority: 'M',
      status: 'N',
      type: '-',
      tempfield1: '-',
      tempfield2: '-',
      tempfield3: '-',
      tempfield4: '-',
      tempfield5: '-',
      tempfield6: '-',
      tempfield7: '-',
      tempfield8: '-',
      tempfield9: '-',
      tempfield10: '-',
      createdby:currentUser?.employeeId ?? '',
    createdon:new Date(),
    modifiedby:currentUser?.employeeId ?? '',
    modifiedon:new Date(),
    });

    setSelectedFlidName('');
    setSelectedEmployeeName('');
    setSelectedCellId('');
    setCaptureImage(null);
    setExistingImageUri(null);
    setIsOtherEmployee(false);
    setMailForApproval(true);
    setDateResetKey(previous => previous + 1);
  };

  const performSave = async (sendToLeader: boolean) => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      ...form,
      status:sendToLeader ? 'Y' : 'N',
      entrydate: toApiDateString(form.entrydate),
      createdby: currentUser?.employeeId ?? '',
      modifiedby: currentUser?.employeeId ?? '',
      createdon:getCurrentDateTime(),
      modifiedon:getCurrentDateTime(),
    };

    try {
      setSaving(true);

      // Implement saveOTGCapture in the API service.
      const response = await saveOtgCapture(payload);

      const savedKeyId =
        response?.keyid ??
        response?.keyid ??
        form.keyid;

      if (captureImage && savedKeyId) {
        try {
          await uploadSuggestionImage(
            savedKeyId,
            captureImage,
            'OTG',
            'OTG',
          );
        } catch (imageError: any) {
          Alert.alert(
            'Image Upload Failed',
            'The capture was saved, but the image could not be uploaded.',
          );
        }
      }

      const successMessage = sendToLeader
        ? 'Capture saved and sent to leader.'
        : 'Capture saved successfully.';

      await speak(successMessage);
      Alert.alert('Success', successMessage);

      if (editRecord) {
        navigation.goBack();
      } else {
        resetForm();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Unable to save capture.';

      await announceFailure(message);
      Alert.alert('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
      if (editRecord?.keyid) {
        loadOtgc(editRecord.keyid);
      }
    }, [editRecord]);
  
    const loadOtgc = async (keyid: string) => {
      try {
        
        const existing = await getOtgCaptureById(keyid);
        console.log('Full Otg Capture loaded:', existing);
  
  
        setForm(prev => ({
          ...prev,
          keyid: existing.keyid ?? '',
          flid: existing.flid ?? '',
          entrydate: existing.entrydate ? new Date(existing.entrydate) : new Date(),
          title: existing.title,
          description:existing.description,
          empmKeyid:existing.empmKeyid,
          remarks:existing.remarks,
          type:existing.type,
          priority:existing.priority,
          status: existing.status || '-',
          createdby: existing.createdby ?? prev.createdby,
          createdon: existing.createdon ? new Date(existing.createdon) : prev.createdon,
          modifiedby: existing.modifiedby ?? prev.modifiedby,
          modifiedon: existing.modifiedon ? new Date(existing.modifiedon) : prev.modifiedon,
        }));
  
        
        try {
          const imageBytes = await getSuggestionImage(
            keyid,
            'OTG',
            'OTG', // Must match the imageType stored during upload
          );
  
          const base64 = fromByteArray(new Uint8Array(imageBytes));
          setExistingImageUri(`data:image/jpeg;base64,${base64}`);
        } catch (error: any) {
          // A suggestion may not have an image yet.
          setExistingImageUri(null);
          console.log('No existing suggestion image:', error?.message);
        }
      } catch (error) {
        console.log('load full suggestion error:', error);
        Alert.alert('Error', 'Could not load the suggestion for editing.');
      } finally {
        // setTimeout(() => setIsEditLoading(false), 500);
      }
    };

  const Label = ({
    children,
    required = false,
  }: {
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <Text style={[styles.label, { color: colors.text }]}>
      {children}
      {required && (
        <Text style={{ color:  '#D32F2F' }}> *</Text>
      )}
    </Text>
  );

  const renderChoice = (
    field: 'priority' | 'status' | 'type',
    options: { label: string; value: string }[],
  ) => (
    <View style={styles.choiceRow}>
      {options.map(option => {
        const selected = form[field] === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.choiceButton,
              {
                backgroundColor: selected
                  ? colors.primary
                  : colors.surface,
                borderColor: selected
                  ? colors.primary
                  : colors.border,
              },
            ]}
            onPress={() => updateField(field, option.value)}
          >
            <Text
              style={{
                color: selected ? '#FFFFFF' : colors.text,
                fontWeight: selected ? '700' : '500',
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        contentContainerStyle={{ paddingBottom: 115 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

       <FunctionalLocationScannerView
         flid = {form.flid}
         visible={true}
         validate={{
           isCell: true
         }}
         onSelect={(value:any) => {
           //updateField('flid', value);
           functionalLocationSuccess(value);
         }}
       /> 
        {/* <FunctionLocationScanner
          originalid={originalId}
          flid={form.flid}
          onScanPress={openScanner}
          title="Function Location"
          onFunctionLoaded={functionalLocationSuccess}
        /> */}

         {/* Entry date */}
        <View style={styles.dateContainer}>
          <DatePicker
            key={dateResetKey}
            label="Date"
            value={form.entrydate}
            onChange={(value: any) => {
              const selected = new Date(value);
              const today = new Date();
              today.setHours(23, 59, 59, 999);

              if (selected > today) {
                Alert.alert(
                  'Invalid Date',
                  'Future date is not accepted.',
                );
                updateField('entrydate', new Date());
                setDateResetKey(previous => previous + 1);
                return;
              }

              updateField('entrydate', selected);
            }}
          />
        </View>

        {/* Title */}
        <Label required>Observation</Label>
        <AssistTextInput
          value={form.title}
          onChangeText={(value: string) =>
            updateField('title', value)
          }
          placeholder="Enter Observation"
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />

        {/* Description */}
        <Label required>Description / Suggestion</Label>
        <AssistTextInput
          multiline
          numberOfLines={5}
          value={form.description}
          onChangeText={(value: string) =>
            updateField('description', value)
          }
          placeholder="Enter description"
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />

         {/* Image upload */}
        <Label>Image</Label>
        <SuggestionImageUpload
          value={captureImage}
          existingImageUrl={existingImageUri}
          onChange={setCaptureImage}
        />

        {/* Remarks */}
        {/* <Label>Remarks</Label>
        <AssistTextInput
          multiline
          numberOfLines={4}
          value={form.remarks}
          onChangeText={(value: string) =>
            updateField('remarks', value)
          }
          placeholder="Enter remarks"
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        /> */}

        
        <Label>Type</Label>
        {renderChoice('type', [
          { label: 'Abnormality', value: 'ABN' },
          { label: 'One Point Lesson', value: 'OPL' },
          { label: 'Suggestion', value: 'KZN' },
          { label: 'Action Plan', value: 'APL' },
        ])}

        {/* Priority */}
        <Label>Priority</Label>
        {renderChoice('priority', PRIORITIES)}

        {/* Status */}
        {/* <Label>Status</Label>
        {renderChoice('status', STATUSES)} */}

        {/* Employee */}
        <View style={styles.inlineHeading}>
          <Label required>Employee</Label>

          <View style={styles.otherRow}>
            <CheckBox
              value={isOtherEmployee}
              tintColors={{
                true: colors.primary,
                false: colors.border,
              }}
              onValueChange={value => {
                setIsOtherEmployee(value);
                updateField('empmKeyid', '');
                setSelectedEmployeeName('');

                setTimeout(() => {
                  employeeRef.current?.reload?.({
                    cellId: selectedCellId,
                    others: value ? 'Y' : undefined,
                  });
                }, 0);
              }}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              OTHERS
            </Text>
          </View>
        </View>

        <AppDropdown
          ref={employeeRef}
          label=""
          manditory={true}
          value={form.empmKeyid}
          endpoint="commonFilter/employee"
          params={{
            cellId: selectedCellId,
            others: isOtherEmployee ? 'Y' : undefined,
          }}
          onChange={(value: any) => {
            handleEmployeeChange(value);
          }}
        />

       

       

        {/* Approval */}
        {/* <View style={styles.approvalRow}>
          <CheckBox
            value={isMailForApproval}
            tintColors={{
              true: colors.primary,
              false: colors.border,
            }}
            onValueChange={setMailForApproval}
          />
          <Text style={[styles.approvalText, { color: colors.text }]}>
            Mail For Approval
          </Text>
        </View> */}

      </ScrollView>
      <View
  style={[
    styles.footer,
    {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
    },
  ]}
>
  <TouchableOpacity
    disabled={saving}
    style={[
      styles.footerButton,
      { backgroundColor: colors.primary },
      saving && { opacity: 0.6 },
    ]}
    onPress={() => {
      Alert.alert(
        'Confirm Save',
        'Do you want to save this capture?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => performSave(false) },
        ],
      );
    }}
  >
    <Text style={styles.buttonText}>
      {saving ? 'Saving...' : 'Save Draft'}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    disabled={saving}
    style={[
      styles.footerButton,
      { backgroundColor: colors.primary },
      saving && { opacity: 0.6 },
    ]}
    onPress={() => {
      Alert.alert(
        'Confirm Submission',
        'Do you want to save and send this capture to the leader?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => performSave(true) },
        ],
      );
    }}
  >
    <Text style={styles.buttonText}>
      {saving ? 'Saving...' : 'Save and Send to Leader'}
    </Text>
  </TouchableOpacity>
</View>

      {/* Existing floating microphone / voice controls */}
     <View style={styles.floatingVoiceButton}>
  <VoiceControlButton inline={true} />
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 19,
    marginBottom: 8,
  },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 3,
  },
  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 9,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 3,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  choiceButton: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    marginTop: 12,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 19,
    marginBottom: 10,
  },
  approvalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    minHeight: 62,
    borderRadius: 8,
    marginTop: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 17,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
footer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 15,
  paddingTop: 10,
  paddingBottom: 12,
  borderTopWidth: StyleSheet.hairlineWidth,
},
  footerButton: {
  flex: 1,
  minHeight: 56,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8,
},

buttonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
  textAlign: 'center',
},
floatingVoiceButton: {
  position: 'absolute',
  right: 16,
  bottom: 90,
  zIndex: 999,
  elevation: 10,
},
});
