import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import DatePicker from '../../components/forms/DatePicker';
import TimePickerInput from '../../components/forms/TimePickerInput';
import AppDropdown from '../../components/forms/AppDropdown';
import CheckBox from '@react-native-community/checkbox';
import FunctionalLocationView from '../../components/FunctionLocation/FunctionalLocationView';
import { saveAbnormality } from '../../services/api/abnormalityApi';
import { useGrid } from '../../context/GridProvider';
import { formatLocalDateTime, getCurrentDateTime, PASS_NULL_DATETIME } from '../../utils/DateFormat';


interface AbnormalityForm {
  keyid : string;
  date : Date;
  refdoctype : string;
  refdocid: string;
  detectiondate: Date ;
  detectedby: string;
  equipmentid: string;
  sectionid: string;
  cellid: string;
  assemblyid: string;
  shiftid: string;
  tradeid: string;
  woreceiveddate: Date | null ; 
  responsetime: number ; 
  worktime: number ;
  wostarttime: Date | null ;
  woendtime: Date | null ;
  downtime: number ;
  description: string;
  typeid: string;
  whyabnhappened: string;
  whatcause: string;
  tagclassid: string;
  categoryid: string;
  impactid: string;
  countermeasure: string;
  preventivemeasure: string; 
  status: string;
  targetdate: Date | null;
  targetremarks: string;
  completedby: string;
  womasterid: string;
  wodetailid: string;
  feedbackid: string;
  feedbackdate: Date | null;
  remarks: string;
  blockdiagramref: string; 
  revisionno: string;
  priority: string; 
  detailedesc: string;
  subtype: string;
  contaminant: string;
  mode: string;
  factoryid: string;
  pillar: string; 
  safetypatrol: string; 
  relatedto: string; 
  mould: string;
  flid: string;
  elementid: string;
  pillarid: string; 
  repeatedabn: string; 
  afeemid: string;
  effectivedate : Date | null ;
  notifysap: string; 
  shutdownmaint: string; 
  tentativedate: Date | null; 
  shutdownid: string;
  accecpatncerequired: string;
  accecptdate: Date | null;
  accecpted: string;
  others: string;
  repotheres: string;
  responsibleid: string;
  multipleabn: string;
  tempfield4: string;
  tempfield5: string;
  tempfield6: string;
  tempfield7: string;
  tempfield8: string;
  tempfield9: string;
  tempfield10: string;		
  active: string;
  createdby: string;
  createdon : Date ;
  modifiedon: Date ;

}



export default function AbnormalityFormScreen() {

  const { currentUser, currentRole} = useGrid();
const [isDetectedBy, setDetectedBy] = useState(false);
const [isResponsibility, setResponsibility] = useState(false);
const [isExpectedDate, setExpectedDate] = useState(false);
const [isProposedDate, setProposedDate] = useState(false);
const [isProposedDateDisable, setProposedDateDisable] = useState(true);
const [showFunctionalLocation, setShowFunctionalLocation] = useState(false);


const defaultValues : AbnormalityForm = {
   keyid : '',
  date : new Date(),
  refdoctype : '',
  refdocid: '',
  detectiondate: new Date(),
  detectedby: currentUser.employeeId ?? '',
  equipmentid: '',
  sectionid: '',
  cellid: '',
  assemblyid: '',
  shiftid: '',
  tradeid: '',
  woreceiveddate: null, 
  responsetime: 0, 
  worktime: 0,
  wostarttime: null,
  woendtime: null,
  downtime: 0,
  description: '',
  typeid: '',
  whyabnhappened: '',
  whatcause: '',
  tagclassid: '',
  categoryid: '',
  impactid: '',
  countermeasure: '',
  preventivemeasure: '', 
  status: 'P',
  targetdate: new Date(),
  targetremarks: '',
  completedby: '',
  womasterid: '',
  wodetailid: '',
  feedbackid: '',
  feedbackdate: null,
  remarks: '',
  blockdiagramref: '', 
  revisionno: '',
  priority: '', 
  detailedesc: '',
  subtype: '',
  contaminant: '',
  mode: '',
  factoryid: '',
  pillar: '', 
  safetypatrol: '', 
  relatedto: '', 
  mould: '',
  flid: currentRole.flid ?? '',
  elementid: '',
  pillarid: '', 
  repeatedabn: '', 
  afeemid: '',
  effectivedate : null,
  notifysap: '', 
  shutdownmaint: '', 
  tentativedate: null, 
  shutdownid: '',
  accecpatncerequired: '',
  accecptdate: null,
  accecpted: '',
  others: '',
  repotheres: '',
  responsibleid: '',
  multipleabn: '',
  tempfield4: '-',
  tempfield5: '-',
  tempfield6: '-',
  tempfield7: '-',
  tempfield8: '-',
  tempfield9: '-',
  tempfield10: '-',		
  active: 'Y',
  createdby: currentUser.employeeId ?? '',
  createdon : new Date(),
  modifiedon: new Date(),
  }
   const [form, setForm] = useState<AbnormalityForm>(defaultValues);
  // const [form, setForm] = useState<AbnormalityForm>({
  //  keyid : '',
  // date : new Date(),
  // refdoctype : '',
  // refdocid: '',
  // detectiondate: new Date(),
  // detectedby: currentUser.employeeId ?? '',
  // equipmentid: '',
  // sectionid: '',
  // cellid: '',
  // assemblyid: '',
  // shiftid: '',
  // tradeid: '',
  // woreceiveddate: null, 
  // responsetime: 0, 
  // worktime: 0,
  // wostarttime: null,
  // woendtime: null,
  // downtime: 0,
  // description: '',
  // typeid: '',
  // whyabnhappened: '',
  // whatcause: '',
  // tagclassid: '',
  // categoryid: '',
  // impactid: '',
  // countermeasure: '',
  // preventivemeasure: '', 
  // status: 'P',
  // targetdate: new Date(),
  // targetremarks: '',
  // completedby: '',
  // womasterid: '',
  // wodetailid: '',
  // feedbackid: '',
  // feedbackdate: null,
  // remarks: '',
  // blockdiagramref: '', 
  // revisionno: '',
  // priority: '', 
  // detailedesc: '',
  // subtype: '',
  // contaminant: '',
  // mode: '',
  // factoryid: '',
  // pillar: '', 
  // safetypatrol: '', 
  // relatedto: '', 
  // mould: '',
  // flid: currentRole.flid ?? '',
  // elementid: '',
  // pillarid: '', 
  // repeatedabn: '', 
  // afeemid: '',
  // effectivedate : null,
  // notifysap: '', 
  // shutdownmaint: '', 
  // tentativedate: null, 
  // shutdownid: '',
  // accecpatncerequired: '',
  // accecptdate: null,
  // accecpted: '',
  // others: '',
  // repotheres: '',
  // responsibleid: '',
  // multipleabn: '',
  // tempfield4: '-',
  // tempfield5: '-',
  // tempfield6: '-',
  // tempfield7: '-',
  // tempfield8: '-',
  // tempfield9: '-',
  // tempfield10: '-',		
  // active: 'Y',
  // createdby: currentUser.employeeId ?? '',
  // createdon : new Date(),
  // modifiedon: new Date(),
  // });

  

const handleDetectedByChange = (newValue:any) => {
    setDetectedBy(newValue);
    console.log('Checkbox value:', newValue);

    // Call your method here
    //myMethod(newValue);
  };

  const handleResponsibilityChange = (newValue:any) => {
    setResponsibility(newValue);
    console.log('Checkbox value:', newValue);

    // Call your method here
    //myMethod(newValue);
  };

  const submitForm = async () => {
    

    const payload = { 
      ...form , 
      date : formatLocalDateTime(form.date),
      detectiondate : formatLocalDateTime(form.detectiondate),
      targetdate : formatLocalDateTime(form.targetdate),
      effectivedate :  form.effectivedate ? formatLocalDateTime(form.effectivedate) : PASS_NULL_DATETIME,
      tentativedate :  form.tentativedate ? formatLocalDateTime(form.tentativedate) : PASS_NULL_DATETIME,
      accecptdate :  form.accecptdate ? formatLocalDateTime(form.accecptdate) : PASS_NULL_DATETIME,
      feedbackdate : PASS_NULL_DATETIME,
      woreceiveddate : PASS_NULL_DATETIME,
      wostarttime : form.wostarttime ? formatLocalDateTime(form.wostarttime) : getCurrentDateTime(),
      woendtime : form.status == 'P' ? PASS_NULL_DATETIME : getCurrentDateTime(),
      createdon : form.createdon ? formatLocalDateTime(form.createdon) : getCurrentDateTime(),
      modifiedon :getCurrentDateTime(),
    }
   
    console.log('save Started:',payload);

    const responseData = await saveAbnormality(payload);
     console.log('responseData:',responseData);

      Alert.alert(
      'Success',
      'Abnormality saved successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            setForm(defaultValues);
          },
        },
      ],
    );


    
  };

  


  

  const updateField = (
    field: string,
    value: any
  ) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const FunctionalLocation_SuccessCallback = (
    result: any
  ) => {
    setForm(prev => ({
          ...prev,
          sectionid: result.sectionId ?? '',
          cellid: result.cellId ?? '',
          equipmentid: result.machineId ?? '',
          flid: result.flid ?? '',
          elementid: result.elementId ?? '',
        }));
  };

 

  return (
    <ScrollView style={styles.container}>

      {/* <Text style={styles.heading}>
        Abnormality Identification
      </Text> */}

<FunctionalLocationView
  flid = {form.flid}
  visible={true}
  validate={{
    isCell: true
  }}
  onSelect={(value:any) => {
    //updateField('flid', value);
    FunctionalLocation_SuccessCallback(value);
  }}
/>

<View style={{ flexDirection: 'row' }}>
    <View>
      <Text>Tag No</Text>
      <TextInput
        style={styles.SharedInput}
        value={form.keyid}
        editable={false}
        onChangeText={v =>
          updateField('keyid', v)
        }
      />
      </View>
 <View>
      <Text>Ref Doc ID</Text>
      <TextInput
         style={styles.SharedInput}
        value={form.refdocid}
        editable={false}
        onChangeText={v =>
          updateField('refdocid', v)
        }
      />
      </View>
</View>


<View style={{ flexDirection: 'row' }}>
<DatePicker
        label="Detected Date"
       
        value={form.detectiondate}
        onChange={v =>
          updateField('detectiondate', v)
        }
      />

      <TimePickerInput
//   label="Detected Time"
  value={form.detectiondate ?? new Date()}
  onChange={(time) =>
    updateField('detectiondate', time)
  }
/></View>

<View style={{ flexDirection: 'row',alignItems: 'center' }}>
    <Text style={styles.label}>Detected By</Text>
    <CheckBox
  value={isDetectedBy}
  disabled={false}
  onValueChange={handleDetectedByChange}
/><Text style={styles.label}>OTHERS</Text>
</View>
<AppDropdown
  //label="Detected By"
  //data={employeeList}
  value={form.detectedby}
  endpoint="commonFilter/employee"
  onChange={(value:any) =>
    updateField('detectedby', value)
  }
/>

<AppDropdown
  label="Equipment"
  //data={employeeList}
  value={form.equipmentid}
  endpoint="commonFilter/machineCombo"
  onChange={(value:any) =>
    updateField('equipmentid', value)
  }
/>
      <Text>Abnormality Description</Text>

      <TextInput
        multiline
        numberOfLines={5}
        style={styles.textArea}
        value={form.description}
        onChangeText={v =>
          updateField('description', v)
        }
      />

      <AppDropdown
  label="Abnormality Type"
  //data={employeeList}
  value={form.typeid}
  endpoint="commonFilter/abnForm/Combo_Type"
  onChange={(value:any) =>
    updateField('typeid', value)
  }
/>

<AppDropdown
  label="Sub Type"
  //data={employeeList}
  value={form.subtype}
  endpoint="commonFilter/abnForm/Combo_SubType"
  onChange={(value:any) =>
    updateField('subtype', value)
  }
/>

{/* <AppDropdown
  label="Abnormality Type"
  data={employeeList}
  value={form.detectedBy}
  onChange={(value:any) =>
    updateField('detectedBy', value)
  }
/> */}

<AppDropdown
  label="Tag Class"
  //data={employeeList}
  value={form.tagclassid}
  endpoint="commonFilter/abnForm/Combo_TagClass"
  onChange={(value:any) =>
    updateField('tagclassid', value)
  }
/>

<AppDropdown
  label="Abnormality Impact"
  //data={employeeList}
  value={form.impactid}
  endpoint="commonFilter/abnForm/Combo_Impact"
  onChange={(value:any) =>
    updateField('impactid', value)
  }
/>

<AppDropdown
  label="Status"
  value={form.status}
  endpoint="commonFilter/abnForm/Combo_Status"
  onChange={(value:any) =>
    updateField('status', value)
  }
/>
<View style={{ flexDirection: 'row',alignItems: 'center' }}>
    <CheckBox
  value={isExpectedDate}
  disabled={false}
  onValueChange={v => setExpectedDate(v)}
/><Text style={styles.label}>Expected Date</Text>
</View>
<DatePicker
        //label="Expected Date"
       disable={!isExpectedDate}
        value={form.targetdate}
        onChange={v =>
          updateField('targetdate', v)
        }
      />
<View style={{ flexDirection: 'row',alignItems: 'center' }}>
    <CheckBox
  value={isProposedDate}
  disabled={isProposedDateDisable}
  onValueChange={v => setProposedDate(v)}
/><Text style={styles.label}>Proposed Date</Text>
</View>
      <DatePicker
        //label="Proposed Date"
       disable={!isProposedDate}
        value={form.effectivedate}
        onChange={v =>
          updateField('effectivedate', v)
        }
      />

<AppDropdown
  label="Maintenance Section"
  value={form.tradeid}
  endpoint="commonFilter/abnForm/Combo_Trade"
  onChange={(value:any) =>
    updateField('tradeid', value)
  }
/>
<View style={{ flexDirection: 'row',alignItems: 'center' }}>
    <Text style={styles.label}>Responsiblity</Text>
    <CheckBox
  value={isResponsibility}
  disabled={false}
  onValueChange={handleResponsibilityChange}
/><Text style={styles.label}>OTHERS</Text>
</View>
<AppDropdown
  //label="Responsiblity"
  //data={employeeList}
  value={form.responsibleid}
  endpoint="commonFilter/employee"
  onChange={(value:any) =>
    updateField('responsibleid', value)
  }
/>

<Text>Counter Measure</Text>

      <TextInput
        multiline
        numberOfLines={4}
        style={styles.textArea}
        value={form.countermeasure}
        onChangeText={v =>
          updateField('countermeasure', v)
        }
      />


      <Text>Remarks</Text>

      <TextInput
        multiline
        numberOfLines={4}
        style={styles.textArea}
        value={form.remarks}
        onChangeText={v =>
          updateField('remarks', v)
        }
      />

      <AppDropdown
  label="Abnormality Category"
  value={form.categoryid}
  endpoint="commonFilter/abnForm/Combo_Category"
  onChange={(value:any) =>
    updateField('categoryid', value)
  }
/>

      <TouchableOpacity style={styles.button} onPress={submitForm}>
        <Text style={styles.buttonText}>
          Save
        </Text>
      </TouchableOpacity>

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
    fontWeight: '600',
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
     marginRight:10,
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
  button: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 5,
    marginBottom:50
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center'
  }
});