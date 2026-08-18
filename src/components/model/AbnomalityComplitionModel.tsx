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
 import { UpdateAbnCompletion } from '../../services/api/abnormalityApi';
import { useGrid } from '../../context/GridProvider';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { formatLocalDateTime } from '../../utils/DateFormat';

export interface EditModel {
  keyid: string;
  countermeasure?: string;
  status?: string;
  completedby?: string;
  remarks?: string;
  woendtime?: Date | null;
}



interface AbnormalityCompletionModelProps {
  record: EditModel;
  visible?: boolean;
  onSelect?: () => void;
  onClose?: () => void;
}
export default function AbnormalityCompletionModel({
  record,
  visible,
  onClose,
  onSelect,
}: AbnormalityCompletionModelProps) {


  const { currentUser} = useGrid();

const [disable, setDisable] = useState<boolean>(true);
const [editData, setEditData] = useState<EditModel>({
  keyid: record.keyid ?? '',
  countermeasure: record.countermeasure ?? '',
  status: record.status ??  '',
  completedby: currentUser.employeeId ?? '',
  remarks: record.remarks ?? '',
  woendtime: new Date(),
});

useEffect(() => {
  console.log('Record:', record);
}, [record]);

useEffect(() => {
  setEditData(prev => ({
     ...prev,
    keyid: record.keyid ?? '',
    countermeasure: record.countermeasure ?? '',
    status: record.status ?? '',
    //completedby: record.completedby ?? '',
    remarks: record.remarks ?? '',
    woendtime: record.woendtime
      ? new Date(record.woendtime)
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
    
    const payLoad = { ...editData ,woendtime : formatLocalDateTime(editData.woendtime ?? null)}
   
    console.log('Update Started:',payLoad);

    const responseData = await UpdateAbnCompletion(payLoad);
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
            Abnormality Completion
          </Text>

<AppDropdown
  label="Status"
  //data={employeeList}
  value={editData.status ?? ''}
  endpoint="dropdown/abnStatus"
   onChange={(value:any) =>{
    status_onSelect(value);
  updateField('status', value);
   }
   
   }
/>

<AppDropdown
  label="Completed By"
  //data={employeeList}
  disable={disable}
  value={editData.completedby ?? ''}
  endpoint="commonFilter/employee"
  onChange={(value:any) =>
    updateField('completedby', value)
  }
/>
<View style={{ marginBottom: 15 }}>
<DatePicker
        label="Completed Date"
       disable={disable}
        value={editData.woendtime}
        onChange={v =>
          updateField('woendtime', v)
        }
      />
</View>

       <Text>Counter Measure</Text>
      
            <TextInput
              multiline
              numberOfLines={5}
              editable={!disable}
              style={styles.textArea}
              value={editData.countermeasure}
              onChangeText={v =>
                updateField('countermeasure', v)
              }
            />


             <Text>Remarks</Text>
            
                  <TextInput
                    multiline
                    numberOfLines={5}
                   editable={!disable}
                    style={styles.textArea}
                    value={editData.remarks}
                    onChangeText={v =>
                      updateField('remarks', v)
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