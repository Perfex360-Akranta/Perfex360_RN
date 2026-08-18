import React, {useState, useRef,useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FunctionalLocationFilter from './FunctionalLocationFilter';
import { get } from '../../services/axiosService';
import MaterialIcons from '@react-native-vector-icons/material-icons';
interface FunctionalLocation {
  companyId: string;
  company?: string;
  locationId: string;
  location?: string;
  sbuId: string;
  sbu?: string;
  pbuId: string;
  pbu?: string;
  sectionId: string;
  section?: string;
  cellId: string;
  cell?: string;
  machineId: string;
  machine?: string;
  flid: string;
  elementId : string;
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

interface FunctionalLocationViewProps {
  flid: string;
  visible?: boolean;
  onSelect?: (value: any) => void;
  validate?: FunctionalLocationValidate;
}
export default function FunctionalLocationView({
  flid,
  visible,
  onSelect,
  validate
}: FunctionalLocationViewProps) {


  const [showFunctionalLocation, setShowFunctionalLocation] = useState(false);
  //const [functionalLocation, setFunctionalLocation] = useState("COMPANY");


const [form, setForm] = useState<FunctionalLocation>({
    companyId: '',
  locationId: '',
  sbuId: '',
  pbuId: '' ,
  sectionId: '',
  cellId: '',
  machineId: '',
  flid: flid,
  elementId : '',
  });

  


  const updateField = (
    field: string,
    value: any
  ) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const loadFunctionalLocation = async (
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
        if(onSelect){
          onSelect(result);
        }
       
        setForm(prev => ({
          ...prev,
          companyId: result.companyId ?? '',
          company: result.companyLabel ?? '',
          locationId: result.locationId ?? '',
          location: result.locationLabel ?? '',
          sbuId: result.sbuId ?? '',
          sbu: result.sbuLabel ?? '',
          pbuId: result.pbuId ?? '',
          pbu: result.pbuLabel ?? '',
          sectionId: result.sectionId ?? '',
          section: result.sectionLabel ?? '',
          cellId: result.cellId ?? '',
          cell: result.cellLabel ?? '',
          machineId: result.machineId ?? '',
          machine: result.machineLabel ?? '',
          flid: result.flid ?? '',
          elementId: result.elementId ?? '',
        }));
      } catch (error) {
        console.log(error);
      }
    };


    const FunctionalLocation_successCallback = async (
     result: any
    ) => {
      try {
        
        if(onSelect){
          onSelect(result);
        }
       
        setForm(prev => ({
          ...prev,
          companyId: result.companyId ?? '',
          company: result.companyLabel ?? '',
          locationId: result.locationId ?? '',
          location: result.locationLabel ?? '',
          sbuId: result.sbuId ?? '',
          sbu: result.sbuLabel ?? '',
          pbuId: result.pbuId ?? '',
          pbu: result.pbuLabel ?? '',
          sectionId: result.sectionId ?? '',
          section: result.sectionLabel ?? '',
          cellId: result.cellId ?? '',
          cell: result.cellLabel ?? '',
          machineId: result.machineId ?? '',
          machine: result.machineLabel ?? '',
          flid: result.flid ?? '',
          elementId: result.elementId ?? '',
        }));
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    if (flid) {
      loadFunctionalLocation(undefined, flid);
    }
  }, [flid]);

  return (
    <View >
    <View style={{ flexDirection: 'row',alignItems: 'center' }}>
          <Text style={styles.label}>Functional Location</Text>
          <TouchableOpacity
      style={styles.arrowButton}
      onPress={() => setShowFunctionalLocation(true)}
    >
       <MaterialIcons
        name="arrow-forward"
        size={20}
        color="#FFFFFF"
    />
      {/* <Text>➜</Text> */}
    </TouchableOpacity>
    </View>
    <FunctionalLocationFilter
      flid = {form.flid}
      visible={showFunctionalLocation}
      onClose={() => setShowFunctionalLocation(false)}
      onSelect={(value:any) => {
        //updateField('flid', value);
        //loadFunctionalLocation(undefined, value);
        FunctionalLocation_successCallback(value);
      }}
      validate={validate}
    />
    <View style={styles.hierarchyContainer}>

  {form.company && (
    <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
      <Text style={styles.link}>{form.company}</Text>
    </TouchableOpacity>
  )}

  {form.location && (
    <>
      <Text style={styles.separator}> / </Text>
      <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
        <Text style={styles.link}>{form.location}</Text>
      </TouchableOpacity>
    </>
  )}

  {form.sbu && (
    <>
      <Text style={styles.separator}> / </Text>
      <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
        <Text style={styles.link}>{form.sbu}</Text>
      </TouchableOpacity>
    </>
  )}

  {form.pbu && (
    <>
      <Text style={styles.separator}> / </Text>
      <TouchableOpacity onPress={() =>setShowFunctionalLocation(true)}>
        <Text style={styles.link}>{form.pbu}</Text>
      </TouchableOpacity>
    </>
  )}

  {form.section && (
    <>
      <Text style={styles.separator}> / </Text>
      <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
        <Text style={styles.link}>{form.section}</Text>
      </TouchableOpacity>
    </>
  )}

  {form.cell && (
    <>
      <Text style={styles.separator}> / </Text>
      <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
        <Text style={styles.link}>{form.cell}</Text>
      </TouchableOpacity>
    </>
  )}

  {form.machine && (
    <>
      <Text style={styles.separator}> / </Text>
      <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
        <Text style={styles.link}>{form.machine}</Text>
      </TouchableOpacity>
    </>
  )}

</View>
          {/* <TextInput
            style={styles.input}
            readOnly={true}
            value={functionalLocation}
          /> */}
          </View>
  );
}



const styles = StyleSheet.create({

 arrowButton: {
    width: 25,
    height: 25,
    marginLeft:5,
    borderRadius: 10,
    backgroundColor: '#1976D2',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  hierarchyContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  marginTop: 8,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  backgroundColor: '#fff',
},

link: {
  color: '#1976D2',
  textDecorationLine: 'underline',
  fontWeight: '600',
},

separator: {
  color: '#666',
  marginHorizontal: 3,
},

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
    // fontSize: 14,
    // color: '#333',
    // marginBottom: 5,
    marginBottom: 0,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 5,
    padding: 10
  },
  // input: {
  //   height: 40,
  //   borderWidth: 1,
  //   borderColor: '#4aa3df',
  //   borderRadius: 3,
  //   paddingHorizontal: 10,
  //   backgroundColor: '#fff',
  // },

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

  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
  },

  closeText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
  },
});