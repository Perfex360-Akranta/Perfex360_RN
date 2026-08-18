import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import CheckBox from '@react-native-community/checkbox';
import FunctionalLocationView from '../../components/FunctionLocation/FunctionalLocationView';
import { saveSuggestion, getSuggestionById } from '../../services/api/kaizenSuggestionApi';
import { useGrid } from '../../context/GridProvider';
import { get } from '../../services/axiosService';
import { toApiDateString } from '../../utils/DateFormat';

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

  const { currentUser, currentRole } = useGrid();
  const editRecord = route?.params?.editRecord;
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
  const [isEditLoading, setIsEditLoading] = useState(false);



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
    if (!form.elementid) {
      Alert.alert('Validation', 'JH is required');
      return false;
    }

    if (!form.kaizen.trim()) {
      Alert.alert('Validation', 'Suggestion is required');
      return false;
    }

    if (!form.suggestedby) {
      Alert.alert('Validation', 'Suggested By is required');
      return false;
    }

    return true;
  };


  const performSave = async (successMessage: string, approvalFlag: 'Y' | 'N') => {
    console.log('SUBMIT PRESSED');

    const pqcdsme =
      (isBenefitP ? 'P' : '') +
      (isBenefitQ ? 'Q' : '') +
      (isBenefitC ? 'C' : '') +
      (isBenefitD ? 'D' : '') +
      (isBenefitS ? 'S' : '') +
      (isBenefitM ? 'M' : '') +
      (isBenefitE ? 'E' : '');



    // const payload = {
    //   ...form,
    //   benefit: themeCategoryId,
    //   pqcdsme,
    //   others: isOthers ? 'Y' : 'N',
    //   nonjhesp: isNonJhEsp ? 'Y' : 'N',
    //   mailForApproval: isMailForApproval ? 'Y' : 'N',
    //   responsibility: form.suggestedby,
    //   modifiedon: new Date(),
    // };
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
      Alert.alert('Success', successMessage);

      if (editRecord) {
        navigation.goBack();
      } else {
        resetForm();
      }
    } catch (error: any) {
      console.log('save error:', error);
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

//change
  const recallCategory = async (keyid: string) => {
    try {
      const result = await get(`kznbnk/categoryRecall/${keyid}`);
      console.log('Category recall result:', result);
      return result?.[0] ?? null;
    } catch (error) {
      console.log('Category recall error:', error);
      return null;
    }
  }


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
    } catch (error) {
      console.log('load full suggestion error:', error);
      Alert.alert('Error', 'Could not load the suggestion for editing.');
    } finally {
      setTimeout(() => setIsEditLoading(false), 500);
    }
  };

  // const FunctionalLocation_SuccessCallback = (
  //   result: any
  // ) => {
  //   console.log('FL result:', result);
  //   setForm(prev => ({
  //     ...prev,
  //     sectionid: result.sectionId ?? '',
  //     cellid: result.cellId ?? '',
  //     equipmentid: result.machineId ?? '',
  //     flid: result.flid ?? '',
  //     elementid: result.elementId ?? '',
  //   }));
  //   setSelectedCellId(result.cellId ?? '');
  //   setIsJhSelected(result.cellId ? true : false);
  //   console.log('isJhSelected set to:', result.cellId ? true : false);
  // };

  return (
    <ScrollView style={styles.container}>

      {/* <Text style={styles.heading}>
        Suggestion
      </Text> */}

      <FunctionalLocationView
        flid={form.flid}
        visible={true}
        validate={{
          isCell: true
        }}
        onSelect={(value: any) => {
          //updateField('flid', value);
          FunctionalLocation_SuccessCallback(value);
        }}
      />

      <Text style={styles.mandatoryLabel}>*Suggestion</Text>

      <TextInput
        multiline
        numberOfLines={5}
        style={styles.textArea}
        value={form.kaizen}
        onChangeText={v =>
          updateField('kaizen', v)
        }
      />
{/* change */}
      <View>
        <AppDropdown
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

      {/* <View>
        <AppDropdown
          label="Theme Category"
          value={form.benefit}
          endpoint="commonFilter/kaizen/kaizenactegoryfillcombo"
          onChange={(value: any) => {
            updateField('benefit', value);
            const { code } = parseThemeCategoryValue(value);
            applyBenefitAreaFromCode(code);
          }}
        />
      </View> */}

      <View style={{ marginTop: 5 }}>
        <Text style={styles.label}>Benefit Area</Text>
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
                  styles.customCheckbox,
                  item.checked && styles.customCheckboxChecked,
                ]}>
                {item.checked && <Text style={styles.customCheckmark}>✓</Text>}
              </View>
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* <View>
        <AppDropdown
          label="Suggested By"
          manditory={!isOthers}
          value={form.suggestedby}
          endpoint="dropdown/abnormality-employees"
          disable={isOthers}
          onChange={(value: any) =>
            updateField('suggestedby', value)
          }

        />

        <CheckBox
          value={isOthers}
          disabled={false}
          onValueChange={handleOthersChange}
        /><Text style={styles.label}>OTHERS</Text>
        <CheckBox
          value={isNonJhEsp}
          disabled={false}
          onValueChange={handleNonJhEspChange}
        /><Text style={styles.label}>Non JH Esp</Text>
      </View> */}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
        <Text style={styles.mandatoryLabel}>Suggested By *</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox
            value={isOthers}
            disabled={false}
            onValueChange={handleOthersChange}
          /><Text style={styles.label}>OTHERS</Text>
          {/* <CheckBox
            value={isNonJhEsp}
            disabled={false}
            onValueChange={handleNonJhEspChange}
          /><Text style={styles.label}>Non JH Esp</Text> */}
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
            onValueChange={handleNonJhEspChange}
          /><Text style={styles.label}>Non JH Esp</Text>
        </View>

      </View>


      <Text>ESP Name's</Text>

      <TextInput
        multiline
        numberOfLines={3}
        style={styles.textArea}
        value={form.espsname}
        onChangeText={v =>
          updateField('espsname', v)
        }
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 12 }}>
        <CheckBox
          value={isMailForApproval}
          disabled={false}
          onValueChange={setMailForApproval}
        /><Text style={styles.label}>Mail For Approval</Text>
      </View>

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



    </ScrollView>
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