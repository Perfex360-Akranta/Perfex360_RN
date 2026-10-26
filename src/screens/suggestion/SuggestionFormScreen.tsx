import AssistTextInput from '../../components/forms/AssistTextInput';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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
import { useAppTheme } from '../../theme/ThemeContext';


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

export default function SuggestionFormScreen({ navigation, route }: any) {

  const { colors } = useAppTheme();
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
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [suggestionImage, setSuggestionImage] = useState<PickedImage | null>(null);
  const [existingImageUri, setExistingImageUri] = useState<string | null>(null);

  const openScanner = () => {
    navigation.navigate('EquipmentScanner', { returnTo: 'Suggestion' });
  };
  const { announceFailure } = useVoiceGuide();

  // Voice control is switched on as soon as the screen opens (runs once) hari
  // const { startListening, stopListening } = useVoiceControl();
  // useEffect(() => {
  //   startListening();
  //   return () => {
  //     stopListening(true);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  // Voice control starts OFF. The user switches it on with the mic button.
  const { listening, startListening, stopListening } = useVoiceControl();
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

    if (!form.elementid) return fail('Please scan the JH QR code');
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
      ['suggested by', 'suggested', 'employee','by','emp'],
      suggestedByRef,
      ['suggester', 'suggestor', 'by', 'employees', 'name','empoye'],
    ),
  );

  useRegisterVoiceControl({
    id: 'suggestion',
    label: 'suggestion',
    aliases: ['suggestion', 'kaizen'],
    keywords: ['suggestions', 'idea', 'ideas', 'kaizen suggestion','seggesti','suggon','sug','kyson','son'],
    kind: 'text',
    getText: () => form.kaizen,
    setText: v => updateField('kaizen', v),
  });

  useRegisterVoiceControl({
    id: 'espNames',
    label: 'ESP names',
    aliases: ['esp names', 'esp name', 'esp'],
    keywords: ['espn', 'esb', 'e s p', 'sp', 'names', 'name','espnames'],
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}>

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

        <VoiceGuidedField
          id="suggestion"
          label="enter suggestion"
          type="text"
          isMandatory={true}
          order={2}
          getValue={() => form.kaizen}
          screenName="Suggestion Form"
        >
          <Text style={styles.mandatoryLabel}>*Suggestion</Text>

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

        <View style={{ marginTop: 5 }}>
          <Text style={[styles.label, { color: colors.text }]}>Benefit Area</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {[
              { label: 'P', checked: isBenefitP },
              { label: 'Q', checked: isBenefitQ },
              { label: 'C', checked: isBenefitC },
              { label: 'D', checked: isBenefitD },
              { label: 'S', checked: isBenefitS },
              { label: 'M', checked: isBenefitM },
              { label: 'E', checked: isBenefitE },
            ].map(item => (
              <View
                key={item.label}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.customCheckbox, { backgroundColor: colors.background, borderColor: colors.border },
                    item.checked && styles.customCheckboxChecked,
                  ]}>
                  {item.checked && <Text style={styles.customCheckmark}>✓</Text>}
                </View>
                <Text style={[{ color: colors.text }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <VoiceGuidedField
          id="suggestedBy"
          label="select suggested by"
          type="dropdown"
          isMandatory={true}
          order={4}
          getValue={() => form.suggestedby}
          screenName="Suggestion Form"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <Text style={styles.mandatoryLabel}>Suggested By *</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckBox
                value={isOthers}
                disabled={false}
                tintColors={{
                  true: colors.primary,
                  false: colors.border,
                }}
                onValueChange={handleOthersChange}
              /><Text style={[styles.label, { color: colors.text }]}>OTHERS</Text>
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
                tintColors={{
                  true: colors.primary,
                  false: colors.border,
                }}
                onValueChange={handleNonJhEspChange}
              /><Text style={[styles.label, { color: colors.text }]}>Non JH Esp</Text>
            </View>

          </View>
        </VoiceGuidedField>

        <VoiceGuidedField
          id="espNames"
          label="enter ESP names"
          type="text"
          isMandatory={false}
          order={6}
          getValue={() => form.espsname}
          screenName="Suggestion Form"
        >
          <Text style={[styles.label, { color: colors.text }]}>ESP Name's</Text>

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

        <SuggestionImageUpload value={suggestionImage} existingImageUrl={existingImageUri} onChange={setSuggestionImage} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 12 }}>
          <CheckBox
            value={isMailForApproval}
            disabled={false}
            onValueChange={setMailForApproval}
          /><Text style={styles.label}>Mail For Approval</Text>
        </View>

        <VoiceGuidedField
          id="saveButton"
          label="Tap the save button to save your records"
          type="button"
          isMandatory={false}
          order={7}
          getValue={() => ''}
          screenName="Suggestion Form"
        >
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.button, styles.buttonTop]}
              onPress={() =>
                onSavePress('Do you want to save the suggestion?', 'Data saved successfully', 'N')
              }>
              <Text style={styles.buttonText}>
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonBottom]}
              onPress={() =>
                onSavePress(
                  'Submitting will send the suggestion to leader',
                  'Suggestion saved and sent to leader',
                  'Y'
                )
              }>
              <Text style={styles.buttonText}>
                Save and Send to Leader
              </Text>
            </TouchableOpacity>
          </View>
        </VoiceGuidedField>

      </ScrollView>
      <VoiceControlButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  },
  label: {
    marginBottom: 0,
    textAlign: 'left',
    fontWeight: '600',
  },

  mandatoryLabel: {
    marginBottom: 0,
    fontWeight: '600',
    color: 'red',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 5,
    padding: 10
  },
  SharedInput: {
    width: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    marginRight: 10,
    borderRadius: 5,
    padding: 10
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 100,
    marginBottom: 15,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top'
  },
  buttonWrapper: {
    height: 110,
    position: 'relative',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center'
  },
  buttonTop: {
    top: 0,
  },
  buttonBottom: {
    top: 55,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#767577',
    borderRadius: 3,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  customCheckboxChecked: {
    backgroundColor: '#4EA3F1',
    borderColor: '#4EA3F1',
  },
  customCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
});