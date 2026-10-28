import AssistTextInput from '../../components/forms/AssistTextInput';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import CheckBox from '@react-native-community/checkbox';
import FunctionalLocationView from '../../components/FunctionLocation/FunctionalLocationView';
import { saveSuggestion, getSuggestionById } from '../../services/api/kaizenSuggestionApi';
import { useGrid } from '../../context/GridProvider';
import { get } from '../../services/axiosService';
import { toApiDateString } from '../../utils/DateFormat';
import { useVoiceGuide } from '../../context/VoiceGuideContext';
import { VoiceGuidedField } from '../../components/assist/VoiceGuidedField';
import { speak } from '../../services/assist/voiceGuide';
import {
  useVoiceControl,
  useRegisterVoiceControl,
  useRegisterVoiceAction,
} from '../../context/VoiceControlContext';
import VoiceControlButton from '../../components/assist/VoiceControlButton';
// NOTE: spelling must match the real file name (the provider imports 'Voicecommands')
import { parseSpokenDate } from '../../services/assist/Voicecommands';
import FunctionLocationScanner from '../../components/QRscanner/FunctionLocationScanner';
import SuggestionImageUpload, { PickedImage } from '../../components/forms/SuggestionImageUpload';
import { fromByteArray } from 'base64-js';
import { getSuggestionImage, uploadSuggestionImage } from '../../services/api/suggestionImageApi';
import FocusHighlight from '../../components/assist/FocusHighlight';
import { useFocusChain } from '../../services/assist/useFocusChain';

interface SuggestionForm {
  keyid: string;
  flid: string;
  elementid: string;
  date: Date;
  kaizen: string;
  benefit: string;
  targetdate: Date;
  pqcdsme: string;
  suggestedby: string;
  responsibility: string;
  completedon: Date;
  status: string;
  accrejremarks: string;
  acrejby: string;
  implementedby: string;
  verifyremarks: string;
  impremarks: string;
  compremarks: string;
  acceptrejon: Date;
  implementedon: Date;
  verifiedon: Date;
  verifiedby: string;
  completedby: string;
  ehsrelated: string;
  ehsstatus: string;
  refdoctype: string;
  refdocno: string;
  others: string;
  implementcost: number;
  approvalflag: string;
  mocrequired: string;
  active: string;
  createdby: string;
  createdon: Date;
  modifiedon: Date;
  espsname: string;
  mocitem: string;
  tempfield2: string;
  tempfield3: string;
  nonjhesp: string;
}

const FOCUS_GUIDE_ENABLED = true; // set to false to turn the highlight off completely
const FOCUS_AUTO_ACTIVATE = true; // false = highlight only, you say "enter ..." yourself
const AUTO_STEPS = ['suggestion', 'themeCategory', 'suggestedBy', 'espNames', 'imageUpload'];

// ---- theme: same palette as the PCS Production screen (header excluded) ----
const BLUE = '#1976D2'; // buttons, highlight, selected chips
const T = {
  bg: '#EAF6FB',
  card: '#FFFFFF',
  cardBorder: '#BFE0EE',
  inputBorder: '#7EB6D0',
  label: '#334155',
  title: '#0F4C75',
  text: '#1E293B',
  star: '#DC2626',
};

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionHead}>
      <MaterialIcons name={icon as any} size={18} color={T.title} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function SuggestionFormScreen({ navigation, route }: any) {

  const insets = useSafeAreaInsets();
  const { currentUser, currentRole } = useGrid();
  const editRecord = route?.params?.editRecord;
  const originalId = route?.params?.originalId;
  const [isOthers, setIsOthers] = useState(false);
  const [isNonJhEsp, setIsNonJhEsp] = useState(false);
  const [isMailForApproval, setMailForApproval] = useState(true);

  const [isBenefitP, setBenefitP] = useState(false);
  const [isBenefitQ, setBenefitQ] = useState(false);
  const [isBenefitC, setBenefitC] = useState(false);
  const [isBenefitD, setBenefitD] = useState(false);
  const [isBenefitS, setBenefitS] = useState(false);
  const [isBenefitM, setBenefitM] = useState(false);
  const [isBenefitE, setBenefitE] = useState(false);
  const [dateResetKey, setDateResetKey] = useState(0);
  const [isJhSelected, setIsJhSelected] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState('');
  const suggestedByRef = useRef<any>(null);
  const functionalLocationRef = useRef<any>(null);
  const themeCategoryRef = useRef<any>(null);
  const imageUploadRef = useRef<any>(null);
  const resumeAfterPickerRef = useRef(false);
  const jhElementRef = useRef('');
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [suggestionImage, setSuggestionImage] = useState<PickedImage | null>(null);
  const [existingImageUri, setExistingImageUri] = useState<string | null>(null);

  // hide the floating save bar while the keyboard is open, so it never covers what you type
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const openScanner = () => {
    navigation.navigate('EquipmentScanner', { returnTo: 'Suggestion' });
  };
  const { announceFailure } = useVoiceGuide();

  // Voice control starts OFF. The user switches it on with the mic button.
  const { startListening, stopListening, listening, activeControlId, activateControl } = useVoiceControl();
  const listeningRef = useRef(listening);
  listeningRef.current = listening;
  const resumeVoiceRef = useRef(false);

  useEffect(() => {
    // the scanner is a separate screen: pause voice while it is open, resume after
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const [form, setForm] = useState<SuggestionForm>({
    keyid: '',
    flid: currentRole.flid ?? '',
    elementid: '',
    date: new Date(),
    kaizen: '',
    benefit: '',
    targetdate: new Date(),
    pqcdsme: '',
    suggestedby: '',
    responsibility: '',
    completedon: new Date(),
    status: '-',
    accrejremarks: '',
    acrejby: '',
    implementedby: '',
    verifyremarks: '',
    impremarks: '',
    compremarks: '',
    acceptrejon: new Date(),
    implementedon: new Date(),
    verifiedon: new Date(),
    verifiedby: '',
    completedby: '',
    ehsrelated: 'N',
    ehsstatus: '',
    refdoctype: '',
    refdocno: '',
    others: 'N',
    implementcost: 0,
    approvalflag: '',
    mocrequired: 'N',
    active: 'Y',
    createdby: currentUser.employeeId ?? '',
    createdon: new Date(),
    modifiedon: new Date(),
    espsname: '',
    mocitem: '',
    tempfield2: '',
    tempfield3: '',
    nonjhesp: 'N',
  });

  const handleOthersChange = (newValue: any) => {
    setIsOthers(newValue);
    console.log('Others value:', newValue);

    updateField('suggestedby', '');

    setTimeout(() => {
      suggestedByRef.current?.reload({
        cellId: selectedCellId,
        others: newValue ? 'Y' : undefined,
      });
    }, 0);
  };

  const handleNonJhEspChange = (newValue: any) => {
    setIsNonJhEsp(newValue);
    console.log('Non JH Esp value:', newValue);
  };

  const [saving, setSaving] = useState(false);
  const [savingFlag, setSavingFlag] = useState<'Y' | 'N' | null>(null);

  const onSavePress = (confirmMessage: string, successMessage: string, approvalFlag: 'Y' | 'N') => {
    if (!validateForm()) {
      return;
    }

    Alert.alert(
      'Confirm Save',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => performSave(successMessage, approvalFlag) },
      ]
    );
  };

  const validateForm = (): boolean => {
    const fail = (msg: string) => {
      speak(msg);
      Alert.alert('Validation', msg);
      return false;
    };

    if (!form.elementid || !isJhSelected) return fail('Please scan the QR code to select JH first');
    if (!form.kaizen.trim()) return fail('Suggestion is required');
    if (!form.suggestedby) return fail('Suggested By is required');

    return true;
  };

  const performSave = async (
    successMessage: string,
    approvalFlag: 'Y' | 'N',
    spokenSuccess?: string,
  ) => {
    console.log('SUBMIT PRESSED');

    const pqcdsme =
      (isBenefitP ? 'P' : '') +
      (isBenefitQ ? 'Q' : '') +
      (isBenefitC ? 'C' : '') +
      (isBenefitD ? 'D' : '') +
      (isBenefitS ? 'S' : '') +
      (isBenefitM ? 'M' : '') +
      (isBenefitE ? 'E' : '');

    const payload = {
      ...form,
      pqcdsme,
      others: isOthers ? 'Y' : 'N',
      nonjhesp: isNonJhEsp ? 'Y' : 'N',
      mailForApproval: isMailForApproval ? 'Y' : 'N',
      responsibility: form.suggestedby,
      date: toApiDateString(form.date),
      targetdate: toApiDateString(form.targetdate),
      completedon: toApiDateString(form.completedon),
      acceptrejon: toApiDateString(form.acceptrejon),
      implementedon: toApiDateString(form.implementedon),
      verifiedon: toApiDateString(form.verifiedon),
      createdon: toApiDateString(form.createdon),
      modifiedon: toApiDateString(new Date()),
    };

    console.log('save Started:', payload);

    try {
      setSaving(true);
      setSavingFlag(approvalFlag);
      const responseData = await saveSuggestion(payload);
      console.log('responseData:', responseData);
      // Upload the selected image (if any) against the saved suggestion
      if (suggestionImage && responseData?.keyid) {
        try {
          const employeeId = currentUser.employeeId;

          if (!employeeId) {
            throw new Error('Employee ID is missing.');
          }

          await uploadSuggestionImage(
            responseData.keyid,
            suggestionImage,
            'KSB',
            suggestionImage.type
          );
        } catch (imageError) {
          console.log('image upload error:', imageError);
          Alert.alert(
            'Image Upload Failed',
            'The suggestion was saved, but the image could not be uploaded.'
          );
        }
      }
      const spoken = speak(spokenSuccess ?? 'Suggestion completed successfully');
      Alert.alert('Success', successMessage);

      if (editRecord) {
        await spoken; // let the announcement finish before the screen unmounts
        navigation.goBack();
      } else {
        resetForm();
      }
    } catch (error: any) {
      console.log('save error:', error);
      await announceFailure(error?.response?.data?.message || error?.message || 'Something went wrong');
      Alert.alert(
        'Save Failed',
        error?.response?.data?.message || error?.message || 'Something went wrong'
      );
    } finally {
      setSaving(false);
      setSavingFlag(null);
    }
  };

  const updateField = (
    field: string,
    value: any
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseThemeCategoryValue = (combined: string) => {
    const [id, code] = (combined || '').split('~');
    return { id: id ?? '', code: code ?? '' };
  };

  const clearBenefitArea = () => {
    setBenefitP(false);
    setBenefitQ(false);
    setBenefitC(false);
    setBenefitD(false);
    setBenefitS(false);
    setBenefitM(false);
    setBenefitE(false);
  };

  const applyBenefitAreaFromCode = (code: string) => {
    clearBenefitArea();
    switch (code) {
      case 'P': setBenefitP(true); break;
      case 'Q': setBenefitQ(true); break;
      case 'C': setBenefitC(true); break;
      case 'D': setBenefitD(true); break;
      case 'S': setBenefitS(true); break;
      case 'M': setBenefitM(true); break;
      case 'E': setBenefitE(true); break;
      default: break;
    }
  };

  const recallCategory = async (keyid: string) => {
    try {
      const result = await get(`kznbnk/categoryRecall/${keyid}`);
      console.log('Category recall result:', result);
      return result?.[0] ?? null;
    } catch (error) {
      console.log('Category recall error:', error);
      return null;
    }
  };

  const FunctionalLocation_SuccessCallback = (
    result: any
  ) => {
    if (result?.cellId) {
      if (jhElementRef.current === result.elementId) {
        return; // same JH reported again
      }
      jhElementRef.current = result.elementId;
    } else if (jhElementRef.current) {
      console.log('FL result ignored (no JH), keeping', jhElementRef.current);
      return;
    }

    console.log('FL result:', result);
    console.log('FL elementId:', result.elementId);
    console.log('FL flid:', result.flid);
    setForm(prev => ({
      ...prev,
      flid: result.flid ?? '',
      elementid: result.elementId ?? '',
    }));
    setSelectedCellId(result.cellId ?? '');
    setIsJhSelected(result.cellId ? true : false);

    if (!isEditLoading) {
      updateField('suggestedby', '');
    }

    suggestedByRef.current?.reload({
      cellId: result.cellId ?? '',
      others: isOthers ? 'Y' : undefined,
    });

    console.log('isJhSelected set to:', result.cellId ? true : false);
  };

  const resetForm = () => {
    setForm({
      keyid: '',
      flid: currentRole.flid ?? '',
      elementid: '',
      date: new Date(),
      kaizen: '',
      benefit: '',
      targetdate: new Date(),
      pqcdsme: '',
      suggestedby: '',
      responsibility: '',
      completedon: new Date(),
      status: '-',
      accrejremarks: '',
      acrejby: '',
      implementedby: '',
      verifyremarks: '',
      impremarks: '',
      compremarks: '',
      acceptrejon: new Date(),
      implementedon: new Date(),
      verifiedon: new Date(),
      verifiedby: '',
      completedby: '',
      ehsrelated: 'N',
      ehsstatus: '',
      refdoctype: '',
      refdocno: '',
      others: 'N',
      implementcost: 0,
      approvalflag: '',
      mocrequired: 'N',
      active: 'Y',
      createdby: currentUser.employeeId ?? '',
      createdon: new Date(),
      modifiedon: new Date(),
      espsname: '',
      mocitem: '',
      tempfield2: '',
      tempfield3: '',
      nonjhesp: 'N',
    });
    setIsOthers(false);
    setIsNonJhEsp(false);
    setMailForApproval(true);
    clearBenefitArea();
    setDateResetKey(prev => prev + 1);
    setIsJhSelected(false);
    setSelectedCellId('');
    jhElementRef.current = '';
    focus.reset();
    setSuggestionImage(null);
    setExistingImageUri(null);
  };

  useEffect(() => {
    if (editRecord?.keyid) {
      loadFullSuggestion(editRecord.keyid);
    }
  }, [editRecord]);

  const loadFullSuggestion = async (keyid: string) => {
    try {
      setIsEditLoading(true);
      const existing = await getSuggestionById(keyid);
      console.log('Full suggestion loaded:', existing);

      const resolvedBenefit = existing.benefit ?? '';

      setForm(prev => ({
        ...prev,
        keyid: existing.keyid ?? '',
        flid: existing.flid ?? '',
        elementid: existing.elementid ?? '',
        date: existing.date ? new Date(existing.date) : new Date(),
        kaizen: existing.kaizen ?? '',
        benefit: resolvedBenefit,
        suggestedby: existing.suggestedby ?? '',
        espsname: existing.espsname ?? '',
        status: existing.status || '-',
        createdby: existing.createdby ?? prev.createdby,
        createdon: existing.createdon ? new Date(existing.createdon) : prev.createdon,
      }));

      setSelectedCellId((existing.elementid ?? '').split('-').pop() ?? '');
      setIsJhSelected(!!existing.elementid);
      jhElementRef.current = existing.elementid ?? '';

      clearBenefitArea();
      const codes = (existing.pqcdsme ?? '').split('');
      codes.forEach((c: string) => applyBenefitAreaFromCode(c));

      setIsOthers(existing.others === 'Y');
      setIsNonJhEsp(existing.nonjhesp === 'Y');
      setMailForApproval(existing.mailForApproval === 'Y');
      try {
        const imageBytes = await getSuggestionImage(
          keyid,
          'KSB',
          'KSB', // Must match the imageType stored during upload
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
      setTimeout(() => setIsEditLoading(false), 500);
    }
  };

  // ---------------- Guided focus highlight ----------------
  const focus = useFocusChain(
    [
      { id: 'qrScanner', required: true, done: isJhSelected },
      { id: 'suggestion', required: true, done: !!form.kaizen.trim() },
      { id: 'themeCategory', required: false, done: !!form.benefit },
      { id: 'suggestedBy', required: true, done: !!form.suggestedby },
      { id: 'espNames', required: false, done: !!form.espsname.trim() },
      { id: 'imageUpload', required: false, done: !!suggestionImage || !!existingImageUri },
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

  useEffect(() => {
    if (!FOCUS_AUTO_ACTIVATE || !listening) {
      return;
    }
    const id = focus.activeId;
    if (id && AUTO_STEPS.includes(id)) {
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

  // ---------------- Voice control registration ----------------
  const dropdownDef = (
    id: string,
    label: string,
    aliases: string[],
    ref: React.MutableRefObject<any>,
    keywords: string[] = [],
  ) => ({
    id, label, aliases, keywords,
    kind: 'dropdown' as const,
    open: () => ref.current?.open?.(),
    close: () => ref.current?.close?.(),
    getOptions: () => ref.current?.getOptions?.() ?? [],
    select: (v: string) => ref.current?.select?.(v),
  });

  useRegisterVoiceControl({
    id: 'qrScanner',
    label: 'QR scanner',
    aliases: ['scanner', 'qr scanner', 'scan qr', 'scan', 'qr code', 'qr', 'functional location', 'location'],
    keywords: ['q r', 'cure', 'queue are', 'skanner', 'scanning', 'barcode', 'camera', 'function', 'functional', 'funtion', 'loca'],
    kind: 'panel',
    open: openScanner,
    close: () => 'Use the back button to close the scanner',
    confirm: () => 'Nothing to confirm',
  });

  useRegisterVoiceControl(
    dropdownDef(
      'themeCategory',
      'theme category',
      ['theme category', 'theme', 'category'],
      themeCategoryRef,
      [
        'team', 'deme', 'eme', 'me', 'teme', 'them', 'thee', 'seem', 'dream',
        'catogory', 'categori', 'categories', 'cat', 'gory', 'ory', 'catee', 'categoty',
        'team category', 'deme category', 'me category', 'theme categories',
      ],
    ),
  );

  useRegisterVoiceControl(
    dropdownDef(
      'suggestedBy',
      'suggested by',
      ['suggested by', 'suggested', 'employee', 'by', 'emp'],
      suggestedByRef,
      ['suggester', 'suggestor', 'by', 'employees', 'name', 'empoye'],
    ),
  );

  useRegisterVoiceControl({
    id: 'suggestion',
    label: 'suggestion',
    aliases: ['suggestion', 'kaizen'],
    keywords: ['suggestions', 'idea', 'ideas', 'kaizen suggestion', 'seggesti', 'suggon', 'sug', 'kyson', 'son'],
    kind: 'text',
    getText: () => form.kaizen,
    setText: v => updateField('kaizen', v),
  });

  useRegisterVoiceControl({
    id: 'espNames',
    label: 'ESP names',
    aliases: ['esp names', 'esp name', 'esp'],
    keywords: ['espn', 'esb', 'e s p', 'sp', 'names', 'name', 'espnames'],
    kind: 'text',
    getText: () => form.espsname,
    setText: v => updateField('espsname', v),
  });

  useRegisterVoiceControl({
    id: 'date',
    label: 'date',
    aliases: ['date'],
    keywords: ['data', 'dated', 'day'],
    kind: 'custom',
    prompt: 'Say today, yesterday, or a number of days ago',
    handleValue: spoken => {
      const d = parseSpokenDate(spoken);
      if (!d) return null;
      updateField('date', d);
      return `Date set to ${d.toDateString()}`;
    },
  });

  useRegisterVoiceControl({
    id: 'others',
    label: 'others',
    aliases: ['others', 'other'],
    keywords: ['otherwise'],
    kind: 'checkbox',
    setChecked: c => handleOthersChange(c),
  });

  useRegisterVoiceControl({
    id: 'nonJhEsp',
    label: 'non JH ESP',
    aliases: ['non jh esp', 'non jh', 'non esp'],
    keywords: ['non', 'none', 'nonjh'],
    kind: 'checkbox',
    setChecked: c => handleNonJhEspChange(c),
  });

  useRegisterVoiceControl({
    id: 'mailForApproval',
    label: 'mail for approval',
    aliases: ['mail for approval', 'mail', 'approval mail'],
    keywords: ['email', 'e mail', 'male', 'approval', 'approve'],
    kind: 'checkbox',
    setChecked: c => setMailForApproval(c),
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
        setTimeout(() => imageUploadRef.current?.open?.(), 1200); // let the reply finish first
        return 'Opening upload image';
      }

      if (/^(no|nope|nah|not now|no thanks|no thank you|later)$/.test(t)) {
        focus.skip();
        return 'Okay, no image';
      }

      return null; // not understood: the app repeats the question
    },
  });

  const voiceSave = async (approvalFlag: 'Y' | 'N') => {
    if (!validateForm()) {
      return;
    }
    await performSave(
      approvalFlag === 'Y' ? 'Suggestion saved and sent to leader' : 'Data saved successfully',
      approvalFlag,
      approvalFlag === 'Y'
        ? 'Suggestion sent to leader successfully'
        : 'Suggestion saved successfully',
    );
  };
  useRegisterVoiceAction('save', () => voiceSave('N'));
  useRegisterVoiceAction('saveAndSend', () => voiceSave('Y'));

  const benefitChips = [
    { label: 'P', checked: isBenefitP },
    { label: 'Q', checked: isBenefitQ },
    { label: 'C', checked: isBenefitC },
    { label: 'D', checked: isBenefitD },
    { label: 'S', checked: isBenefitS },
    { label: 'M', checked: isBenefitM },
    { label: 'E', checked: isBenefitE },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}
        keyboardShouldPersistTaps="handled">

        {/* ---------- Functional location (QR) ---------- */}
        <FocusHighlight {...fh('qrScanner')}>
          <VoiceGuidedField
            id="functionalLocation"
            label="scan the  QR code"
            type="dropdown"
            isMandatory={true}
            order={1}
            getValue={() => form.elementid}
            screenName="Suggestion Form"
          >
            {/* <FunctionalLocationView
              ref={functionalLocationRef}
              flid={form.flid}
              visible={true}
              validate={{
                isCell: true
              }}
              onSelect={(value: any) => {
                FunctionalLocation_SuccessCallback(value);
              }}
            /> */}
            <FunctionLocationScanner
              originalid={originalId}
              flid={form.flid}
              onScanPress={openScanner}
              title="JH"
              onFunctionLoaded={FunctionalLocation_SuccessCallback}
            />
          </VoiceGuidedField>
        </FocusHighlight>

        {/* ---------- Suggestion details ---------- */}
        <View style={styles.card}>
          <SectionTitle icon="edit" title="Suggestion Details" />

          <FocusHighlight {...fh('suggestion')}>
            <VoiceGuidedField
              id="suggestion"
              label="enter suggestion"
              type="text"
              isMandatory={true}
              order={2}
              getValue={() => form.kaizen}
              screenName="Suggestion Form"
            >
              <Text style={styles.label}>
                Suggestion <Text style={styles.star}>*</Text>
              </Text>

              <AssistTextInput
                multiline
                numberOfLines={5}
                style={styles.textArea}
                value={form.kaizen}
                onChangeText={v =>
                  updateField('kaizen', v)
                }
              />
            </VoiceGuidedField>
          </FocusHighlight>

          <FocusHighlight {...fh('themeCategory')}>
            <VoiceGuidedField
              id="themeCategory"
              label="select theme category"
              type="dropdown"
              isMandatory={false}
              order={3}
              getValue={() => form.benefit}
              screenName="Suggestion Form"
            >
              <View>
                <AppDropdown
                  ref={themeCategoryRef}
                  label="Theme Category"
                  value={form.benefit}
                  endpoint="commonFilter/kaizen/kaizenactegoryfillcombo"
                  onChange={(value: any) => {
                    const applyRecall = async () => {
                      const recall = await recallCategory(value);
                      updateField('benefit', value);
                      if (recall?.code) {
                        applyBenefitAreaFromCode(recall.code);
                      }
                    };

                    if (form.keyid) {
                      Alert.alert(
                        'Confirm',
                        'Do you want to change the Benefit Area and Theme Category?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'OK', onPress: applyRecall },
                        ]
                      );
                    } else {
                      applyRecall();
                    }
                  }}
                />
              </View>
            </VoiceGuidedField>
          </FocusHighlight>

          <Text style={[styles.label, { marginTop: 4 }]}>Benefit Area</Text>
          <View style={styles.chipRow}>
            {benefitChips.map(item => (
              <View key={item.label} style={[styles.chip, item.checked && styles.chipOn]}>
                <Text style={[styles.chipText, item.checked && styles.chipTextOn]}>{item.label}</Text>
              </View>
            ))}
          </View>

          <FocusHighlight {...fh('suggestedBy')}>
            <VoiceGuidedField
              id="suggestedBy"
              label="select suggested by"
              type="dropdown"
              isMandatory={true}
              order={4}
              getValue={() => form.suggestedby}
              screenName="Suggestion Form"
            >
              <View style={styles.suggestedHead}>
                <Text style={styles.label}>
                  Suggested By <Text style={styles.star}>*</Text>
                </Text>

                <View style={styles.checkRow}>
                  <CheckBox
                    value={isOthers}
                    disabled={false}
                    tintColors={{ true: BLUE, false: T.inputBorder }}
                    onValueChange={handleOthersChange}
                  /><Text style={styles.checkLabel}>OTHERS</Text>
                </View>
              </View>

              <AppDropdown
                ref={suggestedByRef}
                manditory={true}
                value={form.suggestedby}
                endpoint="commonFilter/employee"
                params={{
                  cellId: selectedCellId,
                  others: isOthers ? 'Y' : undefined,
                }}
                onChange={(value: any) =>
                  updateField('suggestedby', value)
                }
              />
            </VoiceGuidedField>
          </FocusHighlight>
        </View>

        {/* ---------- Other details ---------- */}
        <View style={styles.card}>
          <SectionTitle icon="tune" title="Other Details" />

          <VoiceGuidedField
            id="date"
            label="select date"
            type="dropdown"
            isMandatory={false}
            order={5}
            getValue={() => form.date.toISOString()}
            screenName="Suggestion Form"
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <DatePicker
                key={dateResetKey}
                label="Date"
                value={form.date}
                onChange={v => {
                  const selected = new Date(v);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);

                  if (selected > today) {
                    Alert.alert('Invalid Date', 'Future date not accepted');
                    updateField('date', new Date());
                    setDateResetKey(prev => prev + 1);
                    return;
                  }

                  updateField('date', v);
                }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginLeft: 20, marginBottom: 12 }}>
                <CheckBox
                  value={isNonJhEsp}
                  disabled={false}
                  tintColors={{ true: BLUE, false: T.inputBorder }}
                  onValueChange={handleNonJhEspChange}
                /><Text style={styles.checkLabel}>Non JH Esp</Text>
              </View>

              {/* <View style={styles.floatingVoiceButton}>
                <VoiceControlButton inline />
              </View> */}

            </View>
          </VoiceGuidedField>

          <FocusHighlight {...fh('espNames')}>
            <VoiceGuidedField
              id="espNames"
              label="enter ESP names"
              type="text"
              isMandatory={false}
              order={6}
              getValue={() => form.espsname}
              screenName="Suggestion Form"
            >
              <Text style={styles.label}>ESP Name's</Text>

              <AssistTextInput
                multiline
                numberOfLines={3}
                style={styles.textArea}
                value={form.espsname}
                onChangeText={v =>
                  updateField('espsname', v)
                }
              />
            </VoiceGuidedField>
          </FocusHighlight>

          <FocusHighlight {...fh('imageUpload')}>
            <SuggestionImageUpload
              ref={imageUploadRef}
              value={suggestionImage}
              existingImageUrl={existingImageUri}
              onChange={setSuggestionImage}
              onCameraVisibleChange={onImageCameraVisible}
            />
          </FocusHighlight>

          <View style={[styles.checkRow, { marginTop: 14 }]}>
            <CheckBox
              value={isMailForApproval}
              disabled={false}
              tintColors={{ true: BLUE, false: T.inputBorder }}
              onValueChange={setMailForApproval}
            /><Text style={styles.checkLabel}>Mail For Approval</Text>
          </View>
        </View>

      </ScrollView>

      {/* ---------- Floating save bar: stays put while the form scrolls behind it ---------- */}
      {!keyboardOpen && (
        <View style={[styles.floatBar, { paddingBottom: insets.bottom + 10 }]}>
          <FocusHighlight {...fh('save')}>
            <VoiceGuidedField
              id="saveButton"
              label="Tap the save button to save your records"
              type="button"
              isMandatory={false}
              order={7}
              getValue={() => ''}
              screenName="Suggestion Form"
            >
              <View style={styles.floatRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={saving}
                  style={[styles.btn, styles.btnSave, saving && styles.btnBusy]}
                  onPress={() =>
                    onSavePress('Do you want to save the suggestion?', 'Data saved successfully', 'N')
                  }>
                  {saving && savingFlag === 'N' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={saving}
                  style={[styles.btn, styles.btnSend, saving && styles.btnBusy]}
                  onPress={() =>
                    onSavePress(
                      'Submitting will send the suggestion to leader',
                      'Suggestion saved and sent to leader',
                      'Y'
                    )
                  }>
                  {saving && savingFlag === 'Y' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Save and Send to Leader</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.floatingVoiceButton}>
                <VoiceControlButton inline />
              </View>
              </View>
            </VoiceGuidedField>
          </FocusHighlight>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  // ---- section cards ----
  card: {
    backgroundColor: T.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 12,
    marginTop: 14,
    elevation: 2,
    shadowColor: '#0F4C75',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2EEF4',
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: T.title,
  },

  // ---- labels and inputs ----
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: T.label,
    marginBottom: 6,
    textAlign: 'left',
  },
  star: {
    color: T.star,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderColor: T.inputBorder,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 100,
    marginBottom: 10,
    textAlignVertical: 'top',
    fontSize: 14,
    color: T.text,
  },
  suggestedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: T.label,
  },

  // ---- benefit area chips ----
  chipRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chip: {
    flex: 1,
    height: 36,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.inputBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: T.label,
  },
  chipTextOn: {
    color: '#FFFFFF',
  },

  // ---- floating save bar ----
  floatBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderTopWidth: 1,
    borderTopColor: '#9EC9DE',
    paddingTop: 10,
    paddingHorizontal: 12,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  floatRow: {
    flexDirection: 'row',
  },
  btn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSave: {
    flex: 1,
    marginRight: 8,
  },
  btnSend: {
    flex: 1.7,
  },
  btnBusy: {
    opacity: 0.7,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingVoiceButton: {
  position: 'absolute',
  right: 16,
  bottom: 90,
  zIndex: 999,
  elevation: 10,
},
});