import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import { Keyboard, InteractionManager } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useGrid } from '../context/GridProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Column {
  key: string;
  label: string;
  type: string;
}

interface ColumnFilter {
  id:number | null;
  columnKey: string;
  columnName: string;
  columnType: string;
  condition: string;
  value: string;
}

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddColumnFilter'
>;

export default function AddColumnFilterScreen() {

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<any>>();

  const { filter, setFilter } = useGrid();

  const columns: Column[] = route.params?.columns || [];
  const editFilter: ColumnFilter | null = route.params?.filter || null;
  const onSave = route.params?.onSave;

  const [columnKey, setColumnKey] = useState('');
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('');

  const [condition, setCondition] = useState('');

  const [value, setValue] = useState('');

  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => {

    if (editFilter) {

      setColumnKey(editFilter.columnKey);
      setColumnName(editFilter.columnName);
      setColumnType(editFilter.columnType);
      setCondition(editFilter.condition);
      setValue(editFilter.value);

      loadConditions(editFilter.columnType);
    }

  }, []);

  

  const loadConditions = (type: string) => {

    let list: string[] = [];

    switch (type) {

      case 'NUMBER':

        list = [
          '=',
          '>',
          '<',
          '>=',
          '<=',
          '!='
        ];

        break;

      case 'DATE':

        list = [
          '=',
          'Before',
          'After'
        ];

        break;

      default:

        list = [
          'Contains',
          'Equals',
          'Starts With',
          'Ends With'
        ];
    }

    setConditions(list);

    setCondition(list[0]);

  };

  const onColumnChanged = (key: string) => {

    setColumnKey(key);

    const col = columns.find(x => x.key === key);

    if (!col) {
      return;
    }

    setColumnName(col.label);

    setColumnType(col.type);

    loadConditions(col.type);

  };

  const saveFilter = () => {

    if (!columnKey) {

      Alert.alert('Select Column');

      return;
    }

    if (!condition) {

      Alert.alert('Select Condition');

      return;
    }

    if (!value.trim()) {

      Alert.alert('Enter Value');

      return;
    }

     const newFilter = {
    id: editFilter?.id ?? Date.now(),
    columnKey,
    columnName,
    columnType,
    condition,
    value,
  };

//   const list = [...(filter.columnFilters ?? [])];

//   const index = list.findIndex(x => x.id === newFilter.id);

//   if (index >= 0) {
//     list[index] = newFilter;
//   } else {
//     list.push(newFilter);
//   }

//   setFilter(prev => {
//   const list = [...(prev.columnFilters ?? [])];
//   const index = list.findIndex(x => x.id === newFilter.id);
//   if (index >= 0) list[index] = newFilter;
//   else list.push(newFilter);
//   return { ...prev, columnFilters: list };
// });

onSave?.(newFilter);

navigation.goBack();

// let navigated = false;
//   const goBackOnce = () => {
//     if (navigated) return;
//     navigated = true;
//     navigation.goBack();
//   };

//   const sub = Keyboard.addListener('keyboardDidHide', () => {
//     sub.remove();
//     goBackOnce();
//   });

//   Keyboard.dismiss();

//   // fallback in case keyboard was never open / event doesn't fire
//   setTimeout(() => {
//     sub.remove();
//     goBackOnce();
//   }, 300);
 //Keyboard.dismiss();
//  const goBackNow = () => navigation.goBack();

//   if (Keyboard.isVisible?.()) {
//     const sub = Keyboard.addListener('keyboardDidHide', () => {
//       sub.remove();
//       goBackNow();
//     });
//     Keyboard.dismiss();
//   } else {
//     goBackNow();
//   }

  // InteractionManager.runAfterInteractions(() => {
  //   navigation.goBack();
  // });
//   setTimeout(() => {
//   navigation.goBack();
// }, 100);
// requestAnimationFrame(() => {
//     navigation.goBack();
//   });
//navigation.goBack();
 

  };

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>

      <Text style={styles.title}>
        Add Column Filter
      </Text>

      <Text style={styles.label}>
        Column
      </Text>

      <View style={styles.pickerContainer}>

        <Picker
          selectedValue={columnKey}
          onValueChange={onColumnChanged}>

          <Picker.Item
            label="Select Column"
            value=""
          />

          {columns.map(col => (

            <Picker.Item
              key={col.key}
              label={col.label}
              value={col.key}
            />

          ))}

        </Picker>

      </View>

      <Text style={styles.label}>
        Condition
      </Text>

      <View style={styles.pickerContainer}>

        <Picker
          selectedValue={condition}
          onValueChange={setCondition}>

          {conditions.map(item => (

            <Picker.Item
              key={item}
              label={item}
              value={item}
            />

          ))}

        </Picker>

      </View>

      <Text style={styles.label}>
        Value
      </Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        style={styles.input}
        placeholder="Enter Value"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveFilter}>

        <Text style={styles.saveText}>
          Save
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}>

        <Text style={styles.cancelText}>
          Cancel
        </Text>

      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#fff',

    padding: 15,

  },

  title: {

    fontSize: 22,

    fontWeight: 'bold',

    marginBottom: 20,

  },

  label: {

    fontWeight: '600',

    marginTop: 15,

    marginBottom: 5,

  },

  pickerContainer: {

    borderWidth: 1,

    borderColor: '#ccc',

    borderRadius: 5,

  },

  input: {

    borderWidth: 1,

    borderColor: '#ccc',

    borderRadius: 5,

    paddingHorizontal: 10,

    height: 45,

  },

  saveButton: {

    backgroundColor: '#2196F3',

    marginTop: 30,

    padding: 14,

    borderRadius: 5,

    alignItems: 'center',

  },

  saveText: {

    color: '#fff',

    fontWeight: 'bold',

    fontSize: 16,

  },

  cancelButton: {

    marginTop: 10,

    padding: 14,

    borderRadius: 5,

    alignItems: 'center',

    backgroundColor: '#999',

  },

  cancelText: {

    color: '#fff',

    fontWeight: 'bold',

  },

});