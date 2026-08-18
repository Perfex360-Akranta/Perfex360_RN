import React, {useState, useRef,useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import AppDropdown from '../forms/AppDropdown';
import { get } from '../../services/axiosService';
import { useGrid } from '../../context/GridProvider';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';

interface FunctionalLocation {
  companyId: string;
  locationId: string;
  sbuId: string;
  pbuId: string ;
  sectionId: string;
  cellId: string;
  machineId: string;
  flid: string;
}

interface FunctionalLocationValidate {
  isCompany?: boolean;
  isLocation?: boolean;
  isSbu?: boolean;
  isPbu?: boolean;
  isSection?: boolean;
  isCell?: boolean;
  isMachine?: boolean;
}

interface FunctionalLocationDisable {
  isCompany?: boolean;
  isLocation?: boolean;
  isSbu?: boolean;
  isPbu?: boolean;
  isSection?: boolean;
  isCell?: boolean;
  isMachine?: boolean;
}

interface FunctionalLocationViewProps {
  flid: string;
  visible?: boolean;
  onSelect?: (value: any) => void;
  onClose?: () => void;
  validate?: FunctionalLocationValidate;
}
export default function FunctionalLocationFilter({
  flid,
  visible,
  onClose,
  onSelect,
  validate,
}: FunctionalLocationViewProps) {

  const locationRef = useRef<any>(null);
  const sbuRef = useRef<any>(null);
  const pbuRef = useRef<any>(null);
  const sectionRef = useRef<any>(null);
  const cellRef = useRef<any>(null);
  const machineRef = useRef<any>(null);

  const { currentRole } = useGrid(); 
  


const [form, setForm] = useState<FunctionalLocation>({
    companyId: '',
  locationId: '',
  sbuId: '',
  pbuId: '' ,
  sectionId: '',
  cellId: '',
  machineId: '',
  flid: flid,
  });

  const [disableFields, setDisableFields] = useState<FunctionalLocationDisable>();

  const [resultSet, setResultSet] = useState<any>({});

const loadFunctionalLocation = async (
  originalId?: string,
  flid?: string,
  first? : boolean
) => {
  try {
    const result = await get(
      'dropdown/functional-location/hierarchy',
      {
        flid : flid,
        originalId : originalId
    }
    );
    setResultSet(result);

    setForm(prev => ({
      ...prev,
      companyId: result.companyId ?? '',
      locationId: result.locationId ?? '',
      sbuId: result.sbuId ?? '',
      pbuId: result.pbuId ?? '',
      sectionId: result.sectionId ?? '',
      cellId: result.cellId ?? '',
      machineId: result.machineId ?? '',
      flid: result.flid ?? '',
    }));
 if(first){
  if(result.machineId){
      machine_onSelect(result.machineId);
    }else if(result.cellId){
      cell_onSelect(result.cellId);
    }else if(result.sectionId){
      section_onSelect(result.sectionId);
    }else if(result.pbuId){
      pbu_onSelect(result.pbuId);
    }else if(result.sbuId){
      sbu_onSelect(result.sbuId);
    }
 }
    
  } catch (error) {
    console.log(error);
  }
};

const loadFunctionalLocationDisable = async (
  originalId?: string,
  flid?: string
) => {
  try {
    const result = await get(
      'dropdown/functional-location/hierarchy',
      {
        flid : flid,
        originalId : originalId
    }
    );
    

    setDisableFields(prev => ({
      ...prev,
      isCompany: result.companyId ? true : false,
      isLocation: result.locationId ? true : false,
      isSbu: result.sbuId ? true : false,
      isPbu: result.pbuId ? true : false,
      isSection: result.sectionId ? true : false,
      isCell: result.cellId ? true : false,
      isMachine: result.machineId ? true : false,
    }));
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  if (flid) {
    loadFunctionalLocation(undefined, flid,true);
  }
  loadFunctionalLocationDisable(undefined,currentRole.flid);
}, [visible]);

  const updateField = (
    field: string,
    value: any
  ) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const functionalLocation_onSubmit =  () => {
  const validations = [
    { required: validate?.isCompany, value: form.companyId, label: 'Company' },
    { required: validate?.isLocation, value: form.locationId, label: 'Location' },
    { required: validate?.isSbu, value: form.sbuId, label: 'SBU' },
    { required: validate?.isPbu, value: form.pbuId, label: 'PBU' },
    { required: validate?.isSection, value: form.sectionId, label: 'DMT' },
    { required: validate?.isCell, value: form.cellId, label: 'JH' },
    { required: validate?.isMachine, value: form.machineId, label: 'Equipment' },
  ];

  for (const item of validations) {
    if ((item.required ?? false) && !item.value) {
      Alert.alert('Validation', `Please select ${item.label}`);
      return;
    }
  }

  //onSelect?.(form.flid);
  onSelect?.(resultSet);
  onClose?.();
                
};

 const location_onSelect = (
    value: any
  ) => {
    if(value){
loadFunctionalLocation(value, undefined);
    sbuRef.current?.reload({
        locationId: value,
        companyId: form.companyId,
    });
    pbuRef.current?.reload({
        locationId: value,
        companyId: form.companyId,
    });
    sectionRef.current?.reload({
        locationId: value,
    });
    cellRef.current?.reload({
        locationId: value,
    });
    machineRef.current?.reload({
        locationId: value,
    });
    
    }else{
      loadFunctionalLocation(form.companyId, undefined);
       sbuRef.current?.reload({
        companyId: form.companyId,
    });
    pbuRef.current?.reload({
       companyId: form.companyId,
    });
    sectionRef.current?.reload({
       companyId: form.companyId,
    });
    cellRef.current?.reload({
        companyId: form.companyId,
    });
    machineRef.current?.reload({
        companyId: form.companyId,
    });
  }
  };

  const sbu_onSelect = (
    value: any
  ) => {
    if(value){
loadFunctionalLocation(value, undefined);
    pbuRef.current?.reload({
        sbuId: value,
        companyId: form.companyId,
    });
    sectionRef.current?.reload({
        sbuId: value,
    });
    cellRef.current?.reload({
        sbuId: value,
    });
    machineRef.current?.reload({
        sbuId: value,
    });
    }else{
      loadFunctionalLocation(form.locationId, undefined);
    pbuRef.current?.reload({
        locationId: form.locationId,
        companyId: form.companyId,
    });
    sectionRef.current?.reload({
        locationId: form.locationId,
    });
    cellRef.current?.reload({
        locationId: form.locationId,
    });
    machineRef.current?.reload({
        locationId: form.locationId,
    });
    }
    
  };

  const pbu_onSelect = (
    value: any
  ) => {
    if(value){
    loadFunctionalLocation(value, undefined);
    sectionRef.current?.reload({
        pbuId: value,
    });
    cellRef.current?.reload({
        pbuId: value,
    });
    machineRef.current?.reload({
        pbuId: value,
    });
    }else{
      loadFunctionalLocation(form.sbuId, undefined);
    sectionRef.current?.reload({
        sbuId: form.sbuId,
    });
    cellRef.current?.reload({
        sbuId: form.sbuId,
    });
    machineRef.current?.reload({
        sbuId: form.sbuId,
    });
    }
    
  };

  const section_onSelect = (
    value: any
  ) => {
    if(value){
    loadFunctionalLocation(value, undefined);
    cellRef.current?.reload({
        sectionId: value,
    });
    machineRef.current?.reload({
        sectionId: value,
    });
    }else{
      loadFunctionalLocation(form.pbuId, undefined);
    cellRef.current?.reload({
        pbuId: form.pbuId,
    });
    machineRef.current?.reload({
         pbuId: form.pbuId,
    });
    }
    
  };

  const cell_onSelect = (
    value: any
  ) => {
    if(value){
 loadFunctionalLocation(value, undefined);
    machineRef.current?.reload({
        cellId: value,
    });
    }else{
       loadFunctionalLocation(form.sectionId, undefined);
    machineRef.current?.reload({
        sectionId: form.sectionId,
    });
    }
   
  };

    const machine_onSelect = (
    value: any
  ) => {
    if(value){
loadFunctionalLocation(value, undefined);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      

      <View style={styles.overlay}>
        <View style={styles.container}>
{/* <TouchableOpacity
  style={styles.closeButton}
  onPress={onClose}
>
  <Text style={styles.closeText}>✕</Text>
</TouchableOpacity> */}

<TouchableOpacity
  style={styles.closeBtn}
  onPress={onClose}
>
  {/* <Text style={styles.closeText}>✕</Text> */}
  <MaterialIcons name="close" size={24} color="white"/>
</TouchableOpacity>
          <Text style={styles.title}>
            Functional Location
          </Text>

<AppDropdown
  label="Company"
  manditory={validate?.isCompany ?? false}
  disable={disableFields?.isCompany}
  value={form.companyId}
  endpoint="commonFilter/companyCombo"
   onChange={(value:any) =>
    updateField('companyId', value)
   }
/>

<AppDropdown
ref={locationRef}
  label="Location"
  manditory={validate?.isLocation ?? false}
  disable={disableFields?.isLocation}
  value={form.locationId}
  endpoint="commonFilter/location"
   onChange={(value:any) =>{
    updateField('locationId', value);
    location_onSelect(value);
   }
   }
/>

<AppDropdown
  ref={sbuRef}
  label="SBU"
  manditory={validate?.isSbu ?? false}
  disable={disableFields?.isSbu}
  value={form.sbuId}
  endpoint="commonFilter/sbuCombo"
   onChange={(value:any) => { 
    updateField('sbuId', value);
    sbu_onSelect(value);
   }
    
   }
/>

<AppDropdown
  ref={pbuRef}
  label="PBU"
  manditory={validate?.isPbu ?? false}
  disable={disableFields?.isPbu}
  value={form.pbuId}
  endpoint="commonFilter/pbuCombo"
   onChange={(value:any) =>{
    updateField('pbuId', value);
    pbu_onSelect(value);
   }
    
   }
/>

<AppDropdown
ref={sectionRef}
  label="DMT"
  manditory={validate?.isSection ?? false}
  disable={disableFields?.isSection}
  value={form.sectionId}
  endpoint="commonFilter/sectionCombo"
   onChange={(value:any) => {
    updateField('sectionId', value);
    section_onSelect(value);
   }
    
   }
/>

<AppDropdown
ref={cellRef}
  label="JH"
  manditory={validate?.isCell ?? false}
  disable={disableFields?.isCell}
  value={form.cellId}
  endpoint="commonFilter/cellCombo"
   onChange={(value:any) => {
    updateField('cellId', value);
    cell_onSelect(value);
   }
    
   }
/>

 
<AppDropdown
ref={machineRef}
  label="Equipment"
  manditory={validate?.isMachine ?? false}
  disable={disableFields?.isMachine}
  value={form.machineId}
  endpoint="commonFilter/machineCombo"
   onChange={(value:any) => {
    updateField('machineId', value);
    machine_onSelect(value);
   }
    
   }
/>

          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
              functionalLocation_onSubmit();  
              }}
            >
              <Text>OK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
               loadFunctionalLocation(undefined,currentRole.flid);
              }}
            >
              <Text>Clear</Text>
            </TouchableOpacity>
             {/* <TouchableOpacity
              style={styles.button}
              onPress={onClose}
            >
              <Text>Close</Text>
            </TouchableOpacity> */}

          </View>

        </View>
      </View>
    </Modal>
  );
}

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   container: {
//     margin: 20,
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 6,
//   },
// });

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },

    closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#e2d9d5',
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },

  fieldContainer: {
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },

  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: '#4aa3df',
    borderRadius: 3,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },

  placeholderStyle: {
    fontSize: 13,
    color: '#999',
  },

  selectedTextStyle: {
    fontSize: 13,
    color: '#000',
  },

  itemTextStyle: {
    fontSize: 13,
  },

  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#4aa3df',
    borderRadius: 3,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  button: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    elevation: 2,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },

  // closeButton: {
  //   position: 'absolute',
  //   right: 10,
  //   top: 10,
  //   zIndex: 10,
  // },

  // closeText: {
  //   fontSize: 18,
  //   color: 'red',
  //   fontWeight: 'bold',
  // },

  closeButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 100,
  padding: 5,
},

closeText: {
  fontSize: 26,
  fontWeight: 'bold',
  color: 'red',
},
});