import React, {useState, useRef,useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import AppDropdown from '../forms/AppDropdown';
import DatePicker from '../forms/DatePicker';
 import { UpdateAbnAllocation } from '../../services/api/abnormalityApi';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { formatLocalDateTime } from '../../utils/DateFormat';

export interface EditModel {
  keyid: string;
  responsibleid?: string;
  tradeid?: string;
  effectivedate?: Date | null;
}


interface AbnormalityAllocationModelProps {
  record: EditModel;
  visible?: boolean;
  onSelect?: () => void;
  onClose?: () => void;
}
export default function AbnormalityAllocationModel({
  record,
  visible,
  onClose,
  onSelect,
}: AbnormalityAllocationModelProps) {


  

const [disable, setDisable] = useState<boolean>(false);
const [editData, setEditData] = useState<EditModel>({
  keyid: record.keyid ?? '',
  responsibleid: record.responsibleid ?? '',
  tradeid: record.tradeid ??  '',
  effectivedate: new Date(),
});

useEffect(() => {
  console.log('Record:', record);
}, [record]);

useEffect(() => {
  setEditData(prev => ({
     ...prev,
    keyid: record.keyid ?? '',
    responsibleid: record.responsibleid ?? '',
  tradeid: record.tradeid ??  '',
    effectivedate: record.effectivedate
      ? new Date(record.effectivedate)
      : new Date(),
  }));
}, [record]);
// useEffect(() => {
//   loadUser();
// }, []);

// const loadUser = async () => {
//   const user = await getUser();
//  console.log('user:', user);
//   if (user) {
//     console.log('user:', user);
//     setEditData(prev => ({
//       ...prev,
//       completedby: user.employeeId,
//     }));
//   }
// };
  
  const updateField = (
    field: string,
    value: any
  ) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };

   const status_onSelect = (
    value: any
  ) => {
    if(value == 'P'){
        setDisable(true);
    }else{
        setDisable(false);
    }
  };



  const submitForm = async () => {
    
   
    console.log('Update Started:',editData);
      
    //const request = [editData];
    const request = [{...editData, effectivedate : formatLocalDateTime(editData.effectivedate ?? null)}];

    const responseData = await UpdateAbnAllocation(request);
     console.log('responseData:',responseData);
    
      if(responseData){
        onSelect?.();
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
            Abnormality Allocation
          </Text>


<View style={{ marginBottom: 15 }}>
<DatePicker
        label="Proposed Target Date"
       disable={disable}
        value={editData.effectivedate}
        onChange={v =>
          updateField('effectivedate', v)
        }
      />
</View>
<AppDropdown
  label="Maintenance Section"
  //data={employeeList}
  value={editData.tradeid ?? ''}
  endpoint="commonFilter/abnForm/Combo_Trade"
  onChange={(value:any) =>{
  //status_onSelect(value);
  updateField('tradeid', value);
   }
   
   }
/>

<AppDropdown
  label="Responsibility"
  //data={employeeList}
  disable={disable}
  value={editData.responsibleid ?? ''}
  endpoint="commonFilter/employee"
  onChange={(value:any) =>
    updateField('responsibleid', value)
  }
/>


          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
             submitForm();
                
              }}
            >
              <Text>Submit</Text>
            </TouchableOpacity>

            

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

  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 100,
    marginBottom: 15,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top'
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