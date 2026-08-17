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
import FunctionalLocationView from './FunctionalLocationView';
import DatePicker from './DatePicker';
import MonthPicker from './MonthPicker';
import AppDropdown from './AppDropdown';
import { getData } from '../../services/axiosService';
import { useGrid } from '../../context/GridProvider';
import { GridFilterProps } from '../../types/GridFilters';

// interface FunctionalLocation {
//   companyId?: string;
//   locationId?: string;
//   sbuId?: string;
//   pbuId?: string ;
//   sectionId?: string;
//   cellId?: string;
//   machineId?: string;
//   flid: string;
//   elementId?:string;
//   monthWise?:string;
//   fromDate?: Date | null;
//   toDate?:Date | null;
//   fromMonth?: Date | null;
//   toMonth?: Date | null;
//   reload ?
// }

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
  data?: GridFilterProps;
  visible?: boolean;
  onSelect?: (value: any) => void;
  onClose?: () => void;
  validate?: FunctionalLocationValidate;
}
export default function GridFilters({
  data,
  visible,
  onClose,
  onSelect,
  validate,
}: GridFilterParms) {


  
const { filter, setFilter } = useGrid(); 

const [form, setForm] = useState<GridFilterProps>(filter);
const [showFunctionalLocation, setShowFunctionalLocation] = useState(false);
const [showDateWise, setShowDateWise] = useState(false);
const [showMonthWise, setShowMonthWise] = useState(false);

const [resultSet, setResultSet] = useState<any>({});


useEffect(() => {
  if (visible) {
    setForm(filter);
  }
}, [visible, filter]);

const loadFunctionalLocation = async (
  originalId?: string,
  flid?: string
) => {
  try {
    const result = await getData(
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
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  if (form.flid) {
    loadFunctionalLocation(undefined, filter.flid);
  }
  if(form.monthWise){
    if(form.monthWise == 'Y'){
        setShowMonthWise(true);
    }else if(form.monthWise == 'N'){
        setShowDateWise(true);
    }else{
        setShowMonthWise(true);
        const today = new Date();

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
        setForm({
      ...form,
      fromMonth: previousMonth,
      toMonth : today
    });
    }
  }else{
        setShowMonthWise(true);
        const today = new Date();

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
        setForm({
      ...form,
      monthWise: 'Y',
      fromMonth: previousMonth,
      toMonth : today
    });
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

  const GridFilter_onSubmit =  () => {
    let updatedForm = { ...form };
    if(showDateWise){
        updatedForm ={
      ...updatedForm,
       monthWise: 'N'
    };
    }else if(showMonthWise){
       updatedForm ={
      ...updatedForm,
       monthWise: 'Y'
    }; 
    }else{
        const today = new Date();

const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // Jan=0, Feb=1, Apr=3

// Financial year starts in April
const financialYear =
  currentMonth >= 3 ? currentYear : currentYear - 1;

// Start of Financial Year (01-Apr)
const fromMonth = new Date(financialYear, 3, 1);

// Current Month Start (01-current month)
const toMonth = new Date(currentYear, currentMonth, 1);

updatedForm = {
      ...updatedForm,
      monthWise: 'Y',
      fromMonth: fromMonth,
      toMonth : toMonth
    };
    }

     updatedForm ={
      ...updatedForm,
       reload :new Date()
    };
    setForm(updatedForm);
 setFilter(updatedForm);
  //onSelect?.(updatedForm);
  onClose?.();
                
};

const FunctionalLocation_SuccessCallback = (
    result: any
  ) => {
    setForm(prev => ({
          ...prev,
          companyId: result.companyId ?? '',
          locationId: result.locationId ?? '',
          sbuId: result.sbuId ?? '',
          pbuId: result.pbuId ?? '',
          sectionid: result.sectionId ?? '',
          cellid: result.cellId ?? '',
          equipmentid: result.machineId ?? '',
          flid: result.flid ?? '',
          elementid: result.elementId ?? '',
        }));
  };


  const DateWise_onCheck = (
    value: boolean
  ) => {
      setShowDateWise(value);

    const today = new Date();

// Start of previous month
const fromDate = new Date(
  today.getFullYear(),
  today.getMonth() ,
  1
);

// End of current month
const toDate = new Date(
  today.getFullYear(),
  today.getMonth() + 1,
  0
);
      if(value == true ){
        setShowMonthWise(false);
        setFilter({
      ...filter,
      fromMonth: undefined,
      toMonth : undefined,
      fromDate: fromDate,
      toDate : toDate
    });
      }else{
        setFilter({
      ...filter,
      fromDate: undefined,
      toDate : undefined
    });
      }
  };

  const MonthWise_onCheck = (
    value: boolean
  ) => {
      setShowMonthWise(value);
      const today = new Date();

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
      if(value == true ){
        setShowDateWise(false);
        setFilter({
      ...filter,
      fromMonth: previousMonth,
      toMonth:today,
      fromDate: undefined,
      toDate : undefined
    });
      }else{
        setFilter({
      ...filter,
      fromMonth: undefined,
      toMonth : undefined
    });
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
<TouchableOpacity
  style={styles.closeButton}
  onPress={onClose}
>
  <Text style={styles.closeText}>✕</Text>
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
     <CheckBox
  value={showDateWise}
  onValueChange={v => DateWise_onCheck(v) }
/>  
<DatePicker
        label="From Date"
       disable={!showDateWise}
       shared={true}
        value={filter.fromDate}
        onChange={v =>
          updateField('fromDate', v)
        }
      />
      <DatePicker
        label="To Date"
       disable={!showDateWise}
        value={filter.toDate}
        shared={true}
        onChange={v =>
          updateField('toDate', v)
        }
      />
</View> 

 <View style={{ flexDirection: 'row',alignItems: 'center' }}>
     <CheckBox
  value={showMonthWise}
  onValueChange={v => MonthWise_onCheck(v)}
/>  
<MonthPicker
        label="From Month"
       disable={!showMonthWise}
        value={filter.fromMonth}
        onChange={v =>
          updateField('fromMonth', v)
        }
      />
      <MonthPicker
        label="To Month"
       disable={!showMonthWise}
        value={filter.toMonth}
        onChange={v =>
          updateField('toMonth', v)
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
              GridFilter_onSubmit();
                
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