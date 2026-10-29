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
import {
  useVoiceControl,
  useRegisterVoiceControl,
  useRegisterVoiceAction,
} from '../../context/VoiceControlContext';
import FocusHighlight from '../../components/assist/FocusHighlight';
import { useFocusChain } from '../../services/assist/useFocusChain';
import { parseSpokenDate } from '../../services/assist/Voicecommands';
import { speak } from '../../services/assist/voiceGuide';
import { useVoiceGuide } from '../../context/VoiceGuideContext';

import { getSuggestionImage, uploadSuggestionImage } from '../../services/api/suggestionImageApi';
import { getOtgCaptureById, saveOtgCapture } from '../../services/api/OtgCaptureApi';
import { fromByteArray } from 'base64-js';
import FunctionalLocationScannerView, {
  FunctionalLocationScannerViewHandle,
} from '../../components/FunctionLocation/FunctionLocationScannerView';

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
  createdby: string;
  createdon: Date;
  modifiedby: string;
  modifiedon: Date;
}

const PRIORITIES = [
  { label: 'Low', value: 'L' },
  { label: 'Medium', value: 'M' },
  { label: 'High', value: 'H' },
  { label: 'Critical', value: 'C' },
];

const FOCUS_GUIDE_ENABLED = true;
const FOCUS_AUTO_ACTIVATE = true;
const AUTO_STEPS = ['title', 'description', 'imageUpload', 'type', 'employee'];
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
  const [isFlSelected, setIsFlSelected] = useState(false);

  const [captureImage, setCaptureImage] =
    useState<PickedImage | null>(null);
  const [existingImageUri, setExistingImageUri] =
    useState<string | null>(null);

  const functionalLocationRef = useRef<FunctionalLocationScannerViewHandle>(null);
  const employeeRef = useRef<any>(null);
  const selectedJhRef = useRef('');
  const imageUploadRef = useRef<any>(null);
  const resumeAfterPickerRef = useRef(false);
  const resumeAfterScannerRef = useRef(false);

  const {
    listening,
    startListening,
    stopListening,
    activeControlId,
    activateControl,
  } = useVoiceControl();
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
    createdby: currentUser?.employeeId ?? '',
    createdon: new Date(),
    modifiedby: currentUser?.employeeId ?? '',
    modifiedon: new Date(),
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
    functionalLocationRef.current?.openQrScanner();
  };

  // const functionalLocationSuccess = (result: any) => {
  //   setForm(previous => ({
  //     ...previous,
  //     flid: result?.flid ?? '',
  //   }));

  //   setSelectedFlidName(result?.flid ?? '');
  //   setSelectedCellId(result?.cellId ?? '');
  //   setIsFlSelected(true);
  // };
  const functionalLocationSuccess = (result: any) => {
    if (!result?.cellId) {

      if (result?.flid && result.flid !== currentRole?.flid && !editRecord) {
        speak('That is not a JH. Please scan a JH QR code');
        Alert.alert('JH required', 'Please scan a JH QR code or select a JH in the functional location.');
      }
      return;
    }
    if (selectedJhRef.current === result.elementId) {
      return; // same JH reported again
    }
    selectedJhRef.current = result.elementId;

    setForm(previous => ({ ...previous, flid: result.flid ?? '' }));
    setSelectedFlidName(result.flid ?? '');
    setSelectedCellId(result.cellId ?? '');
    setIsFlSelected(true);
    employeeRef.current?.reload?.({
      cellId: result.cellId ?? '',
      others: isOtherEmployee ? 'Y' : undefined,
    });
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
      createdby: currentUser?.employeeId ?? '',
      createdon: new Date(),
      modifiedby: currentUser?.employeeId ?? '',
      modifiedon: new Date(),
    });

    setSelectedFlidName('');
    setSelectedEmployeeName('');
    setSelectedCellId('');
    setIsFlSelected(false);
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
      status: sendToLeader ? 'Y' : 'N',
      entrydate: toApiDateString(form.entrydate),
      createdby: currentUser?.employeeId ?? '',
      modifiedby: currentUser?.employeeId ?? '',
      createdon: getCurrentDateTime(),
      modifiedon: getCurrentDateTime(),
    };

    try {
      setSaving(true);

      const response = await saveOtgCapture(payload);

      const savedKeyId =
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
        // title: existing.title,
        // description: existing.description,
        // empmKeyid: existing.empmKeyid,
        // remarks: existing.remarks,
        // type: existing.type,
        // priority: existing.priority,
        title: existing.title ?? '',
        description: existing.description ?? '',
        empmKeyid: existing.empmKeyid ?? '',
        remarks: existing.remarks ?? '',
        type: existing.type ?? '-',
        priority: existing.priority ?? 'M',
        status: existing.status || '-',
        createdby: existing.createdby ?? prev.createdby,
        createdon: existing.createdon ? new Date(existing.createdon) : prev.createdon,
        modifiedby: existing.modifiedby ?? prev.modifiedby,
        modifiedon: existing.modifiedon ? new Date(existing.modifiedon) : prev.modifiedon,
      }));

      setIsFlSelected(true);

      try {
        const imageBytes = await getSuggestionImage(
          keyid,
          'OTG',
          'OTG',
        );

        const base64 = fromByteArray(new Uint8Array(imageBytes));
        setExistingImageUri(`data:image/jpeg;base64,${base64}`);
      } catch (error: any) {
        setExistingImageUri(null);
        console.log('No existing suggestion image:', error?.message);
      }
    } catch (error) {
      console.log('load full suggestion error:', error);
      Alert.alert('Error', 'Could not load the suggestion for editing.');
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
        <Text style={{ color: '#D32F2F' }}> *</Text>
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

  // ---------------- Guided focus highlight ----------------
  const focus = useFocusChain(
    [
      { id: 'functionalLocation', required: true, done: isFlSelected },
      { id: 'title', required: true, done: !!form.title.trim() },
      { id: 'description', required: true, done: !!form.description.trim() },
      { id: 'imageUpload', required: false, done: !!captureImage || !!existingImageUri },
      { id: 'type', required: false, done: form.type !== '-' },
      { id: 'priority', required: false, done: !!form.priority },
      { id: 'employee', required: true, done: !!form.empmKeyid },
      { id: 'save', required: true, done: false },
    ],
    FOCUS_GUIDE_ENABLED && listening,
    activeControlId,
  );

  useRegisterVoiceAction('skip', () => {
    const result = focus.skip();
    if (result.ok) {
      return { skipped: true, say: 'Skipped' };
    }
    if (result.reason === 'required') {
      return {
        skipped: false,
        say: result.id === 'save' ? 'Nothing to skip. Say save' : 'This field is required',
      };
    }
    return { skipped: false, say: 'Nothing to skip' };
  });

  const focusOn = FOCUS_GUIDE_ENABLED && listening;
  const fh = (id: string) => ({
    active: focus.isActive(id),
    enabled: focusOn,
    badge: id === 'save' ? 'READY TO SAVE' : `STEP ${focus.index + 1} OF ${focus.total - 1}`,
  });

  const lastAnnouncedStepRef = useRef<string | null>(null);

  useEffect(() => {
    if (!listening) {
      lastAnnouncedStepRef.current = null;
      return;
    }
    const id = focus.activeId;
    if (!id) {
      return;
    }
    if (id !== 'functionalLocation') {
      lastAnnouncedStepRef.current = null; // so the prompt speaks again for the next entry
    }

    if (id === 'functionalLocation') {
      if (lastAnnouncedStepRef.current !== 'functionalLocation') {
        lastAnnouncedStepRef.current = 'functionalLocation';
        setTimeout(() => {
          speak('Please select functional location or scan QR. You can say open functional location or open QR scanner');
        }, 1600);
      }
      return;
    }

    if (FOCUS_AUTO_ACTIVATE && AUTO_STEPS.includes(id)) {
      activateControl(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.activeId, listening]);

  // pause voice while the camera is open, resume when it closes
  const onImageCameraVisible = (visible: boolean) => {
    if (visible) {
      resumeAfterPickerRef.current = listeningRef.current;
      if (listeningRef.current) {
        stopListening(true);
      }
    } else if (resumeAfterPickerRef.current) {
      resumeAfterPickerRef.current = false;
      startListening();
    }
  };

  const onScannerVisibleChange = (visible: boolean) => {
    if (visible) {
      resumeAfterScannerRef.current = listeningRef.current;
      if (listeningRef.current) {
        stopListening(true);
      }
    } else if (resumeAfterScannerRef.current) {
      resumeAfterScannerRef.current = false;
      startListening();
    }
  };

  // ---------------- Voice control registration ----------------
  const dropdownDef = (
    id: string,
    label: string,
    aliases: string[],
    ref: React.MutableRefObject<any>,
    keywords: string[] = [],
  ) => ({
    id,
    label,
    aliases,
    keywords,
    kind: 'dropdown' as const,
    open: () => ref.current?.open?.(),
    close: () => ref.current?.close?.(),
    getOptions: () => ref.current?.getOptions?.() ?? [],
    select: (v: string) => ref.current?.select?.(v),
  });

  useRegisterVoiceControl({
    id: 'functionalLocation',
    label: 'functional location',
    aliases: ['functional location', 'location', 'function location', 'functional location panel', 'location panel', 'hierarchy', 'filter'],
    keywords: ['function', 'functional', 'funtion', 'loca', 'location', 'hierarchy', 'panel', 'filter'],
    kind: 'panel',
    open: () => functionalLocationRef.current?.openFunctionalLocation(),
    close: () => {
      functionalLocationRef.current?.closeFunctionalLocation();
      return 'Functional location closed';
    },
    cancel: () => functionalLocationRef.current?.closeFunctionalLocation(),
    confirm: () => functionalLocationRef.current?.submitFunctionalLocation?.(),
    isOpen: () => !!functionalLocationRef.current?.isFunctionalLocationOpen?.(),
  });

  useRegisterVoiceControl({
    id: 'qrScanner',
    label: 'QR scanner',
    aliases: ['qr scanner', 'scanner', 'scan qr', 'scan', 'qr code', 'qr', 'open qr scanner', 'barcode scanner'],
    keywords: ['q r', 'cure', 'queue are', 'skanner', 'scanning', 'barcode'],
    kind: 'panel',
    open: () => functionalLocationRef.current?.openQrScanner(),
    close: () => {
      functionalLocationRef.current?.closeQrScanner();
      return 'Scanner closed';
    },
    cancel: () => functionalLocationRef.current?.closeQrScanner(),
    confirm: () => 'Point the camera at the QR code',
    isOpen: () => !!functionalLocationRef.current?.isQrScannerOpen?.(),
  });

  useRegisterVoiceControl({
    id: 'title',
    label: 'observation',
    aliases: ['observation', 'title', 'issue', 'problem'],
    keywords: ['observe', 'observation', 'obs', 'heading', 'title', 'issue'],
    kind: 'text',
    getText: () => form.title,
    setText: v => updateField('title', v),
  });

  useRegisterVoiceControl({
    id: 'description',
    label: 'description',
    aliases: ['description', 'suggestion', 'details', 'detail'],
    keywords: ['describe', 'desc', 'details', 'detail', 'suggestion', 'kaizen', 'remarks'],
    kind: 'text',
    getText: () => form.description,
    setText: v => updateField('description', v),
  });

  useRegisterVoiceControl({
    id: 'imageUpload',
    label: 'upload image',
    aliases: ['upload image', 'image', 'photo', 'picture', 'upload', 'attachment'],
    keywords: ['uploads', 'images', 'pic', 'pictures', 'photos', 'camera', 'attach'],
    kind: 'custom',
    prompt: 'Do you want to upload an image?',
    handleValue: spoken => {
      const t = spoken.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

      if (/^(yes|yeah|yep|yup|sure|ok|okay|upload|upload image|open|open camera|take photo|take picture|camera)( please)?$/.test(t)) {
        if (!imageUploadRef.current?.open) {
          return 'Please tap the upload image button';
        }
        resumeAfterPickerRef.current = true;
        setTimeout(() => imageUploadRef.current?.open?.(), 1200);
        return 'Opening upload image';
      }

      if (/^(no|nope|nah|not now|no thanks|no thank you|later)$/.test(t)) {
        focus.skip();
        return 'Okay, no image';
      }

      return null;
    },
  });

  useRegisterVoiceControl({
    id: 'type',
    label: 'type',
    aliases: ['type', 'category', 'capture type'],
    keywords: ['abnormality', 'lesson', 'one point lesson', 'suggestion', 'action plan', 'opl', 'abn', 'kzn', 'apl'],
    kind: 'custom',
    prompt: 'Select type: abnormality, one point lesson, suggestion, or action plan',
    handleValue: spoken => {
      const t = spoken.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      if (/abnormality|abn/.test(t)) {
        updateField('type', 'ABN');
        return 'Type set to Abnormality';
      }
      if (/one point lesson|point lesson|opl|lesson/.test(t)) {
        updateField('type', 'OPL');
        return 'Type set to One Point Lesson';
      }
      if (/suggestion|kaizen|kzn/.test(t)) {
        updateField('type', 'KZN');
        return 'Type set to Suggestion';
      }
      if (/action plan|plan|apl/.test(t)) {
        updateField('type', 'APL');
        return 'Type set to Action Plan';
      }
      return null;
    },
  });

  useRegisterVoiceControl({
    id: 'priority',
    label: 'priority',
    aliases: ['priority', 'urgency', 'level'],
    keywords: ['low', 'medium', 'high', 'critical', 'urgent'],
    kind: 'custom',
    prompt: 'Select priority: low, medium, high, or critical',
    handleValue: spoken => {
      const t = spoken.toLowerCase().replace(/[^a-z ]/g, ' ').trim();
      if (/^low$/.test(t)) {
        updateField('priority', 'L');
        return 'Priority set to Low';
      }
      if (/^medium$/.test(t)) {
        updateField('priority', 'M');
        return 'Priority set to Medium';
      }
      if (/^high$/.test(t)) {
        updateField('priority', 'H');
        return 'Priority set to High';
      }
      if (/^(critical|urgent)$/.test(t)) {
        updateField('priority', 'C');
        return 'Priority set to Critical';
      }
      return null;
    },
  });

  useRegisterVoiceControl({
    id: 'date',
    label: 'date',
    aliases: ['date', 'entry date'],
    keywords: ['data', 'dated', 'day'],
    kind: 'custom',
    prompt: 'Say today, yesterday, or a number of days ago',
    handleValue: spoken => {
      const d = parseSpokenDate(spoken);
      if (!d) return null;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (d > today) {
        return 'Future date is not allowed';
      }
      updateField('entrydate', d);
      return `Date set to ${d.toDateString()}`;
    },
  });

  useRegisterVoiceControl(
    dropdownDef(
      'employee',
      'employee',
      ['employee', 'assigned to', 'emp', 'person', 'worker'],
      employeeRef,
      ['worker', 'staff', 'operator', 'name', 'user'],
    ),
  );

  useRegisterVoiceControl({
    id: 'otherEmployee',
    label: 'other employee',
    aliases: ['other employee', 'others', 'other'],
    keywords: ['otherwise', 'other employee'],
    kind: 'checkbox',
    setChecked: c => {
      setIsOtherEmployee(c);
      updateField('empmKeyid', '');
      setSelectedEmployeeName('');
      setTimeout(() => {
        employeeRef.current?.reload?.({
          cellId: selectedCellId,
          others: c ? 'Y' : undefined,
        });
      }, 0);
    },
  });

  const voiceSave = async (sendToLeader: boolean) => {
    if (!validateForm()) {
      return;
    }
    await performSave(sendToLeader);
  };
  useRegisterVoiceAction('save', () => voiceSave(false));
  useRegisterVoiceAction('saveAndSend', () => voiceSave(true));

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
        <FocusHighlight {...fh('functionalLocation')}>
          <FunctionalLocationScannerView
            ref={functionalLocationRef}
            flid={form.flid}
            visible={true}
            validate={{
              isCell: true,
            }}
            onSelect={(value: any) => {
              functionalLocationSuccess(value);
            }}
            onScannerVisibleChange={onScannerVisibleChange}
          />
        </FocusHighlight>

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
        <FocusHighlight {...fh('title')}>
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
        </FocusHighlight>

        {/* Description */}
        <FocusHighlight {...fh('description')}>
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
        </FocusHighlight>

        {/* Image upload */}
        <FocusHighlight {...fh('imageUpload')}>
          <Label>Image</Label>
          <SuggestionImageUpload
            ref={imageUploadRef}
            value={captureImage}
            existingImageUrl={existingImageUri}
            onChange={setCaptureImage}
            onCameraVisibleChange={onImageCameraVisible}
          />
        </FocusHighlight>

        {/* Type */}
        <FocusHighlight {...fh('type')}>
          <Label>Type</Label>
          {renderChoice('type', [
            { label: 'Abnormality', value: 'ABN' },
            { label: 'One Point Lesson', value: 'OPL' },
            { label: 'Suggestion', value: 'KZN' },
            { label: 'Action Plan', value: 'APL' },
          ])}
        </FocusHighlight>

        {/* Priority */}
        <FocusHighlight {...fh('priority')}>
          <Label>Priority</Label>
          {renderChoice('priority', PRIORITIES)}
        </FocusHighlight>

        {/* Employee */}
        <FocusHighlight {...fh('employee')}>
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
        </FocusHighlight>

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
        <View style={{ flex: 1 }}>
          <FocusHighlight {...fh('save')}>
            <View style={styles.footerRow}>
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
          </FocusHighlight>
        </View>
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
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
