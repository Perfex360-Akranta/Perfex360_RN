import React, {useState, useRef,useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
//import FunctionalLocationFilter from './FunctionalLocationFilter';
import FunctionalLocationView from '../FunctionLocation/FunctionalLocationView';
import DatePicker from '../forms/DatePicker';
import MonthPicker from '../forms/MonthPicker';

import { get } from '../../services/axiosService';
import { useGrid } from '../../context/GridProvider';
import { GridFilterProps } from '../../types/GridFilters';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';


interface DashboardParams {
    flid :string;
    fromDate : Date ;
    toDate : Date ;
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

interface GridFilterParms {
  data: DashboardParams;
  visible?: boolean;
  onSelect?: (value: any) => void;
  onClose?: () => void;
  validate?: FunctionalLocationValidate;
}
export default function DashboardFilter({
  data,
  visible,
  onClose,
  onSelect,
  validate,
}: GridFilterParms) {


  


const [form, setForm] = useState<DashboardParams>(data);
const [showDateWise, setShowDateWise] = useState(false);
const [showMonthWise, setShowMonthWise] = useState(false);

const [resultSet, setResultSet] = useState<any>({});


useEffect(() => {
  if (visible) {
    setForm(data);
  }
}, [visible, data]);

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
    setResultSet(result);

    setForm(prev => ({
      ...prev,
      flid: result.flid ?? '',
    }));
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  if (form.flid) {
    loadFunctionalLocation(undefined, form.flid);
  }
 
}, []);

  const updateField = (
    field: string,
    value: any
  ) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const DashboardFilter_onSubmit =  () => {
    
    
  onSelect?.(form);
  onClose?.();
                
};

const FunctionalLocation_SuccessCallback = (
    result: any
  ) => {
    setForm(prev => ({
          ...prev,   
          flid: result.flid ?? '',
        }));
  };


 


  

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      

      <View style={styles.overlay}>
        <View style={styles.container}>
<TouchableOpacity
  style={styles.closeBtn}
  onPress={onClose}
>
  {/* <Text style={styles.closeText}>✕</Text> */}
  <MaterialIcons name="close" size={24} color="white"/>
</TouchableOpacity>
        
<FunctionalLocationView
  flid = {form.flid}
  visible={true}
  validate={{
    isCell: false
  }}
  onSelect={(value:any) => {
    //updateField('flid', value);
    FunctionalLocation_SuccessCallback(value);
  }}
/> 

 <View style={{ flexDirection: 'row',alignItems: 'center' }}>
 
<DatePicker
        label="From Date"
       shared={true}
        value={form.fromDate}
        onChange={v =>
          updateField('fromDate', v)
        }
      />
      <DatePicker
        label="To Date"
        value={form.toDate}
        shared={true}
        onChange={v =>
          updateField('toDate', v)
        }
      />
</View> 

 
     


          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
              //   if(onSelect){
              //     onSelect(form.flid);
              //   }
              //  if(onClose){
              //   onClose();
              //  }
              DashboardFilter_onSubmit();
                
              }}
            >
              <Text>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
            >
              <Text>Close</Text>
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
    //width: 26,
    //height: 26,
    borderRadius: 10,
    backgroundColor: 'red',
    //justifyContent: 'flex-end',
    // alignItems: 'right',
    //marginLeft: 10,
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