import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';
import {getDropdownData, getDropdownData1} from '../../services/axiosService';

interface DropdownItem {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  manditory?:boolean;
  dataset?: DropdownItem[];
  value: string;
  endpoint: string;
  params?: any;
  disable?:boolean;
  onChange?: (value: string) => void;
}

const ApiDropdown1 = forwardRef(({
  label,
  manditory,
  dataset,
  value,
  endpoint,
  params,
  disable= false,
  onChange,
}: Props, ref) => {
  const [data, setData] = useState([]);

  const loadData = async (params?: any) => {
    try {
      const result =
        await getDropdownData1(
          endpoint,
          params,
        );

      setData(result);
    } catch (error) {
      console.log(error);
    }
  };

  useImperativeHandle(ref, () => ({
    reload: (params?: any) => {
      loadData(params);
    },
  }));

  useEffect(() => {
    loadData(params);
  }, []);

  return (
    <View style={styles.container}>
        {/* {label && (
          <Text style={styles.label}>{label}</Text>
        )} */}
        {label && (
  <Text
    style={[
      styles.label,
      manditory && styles.mandatoryLabel,
    ]}>
    {label}
    {manditory && ' *'}
  </Text>
)}
    
          <Dropdown
            //style={styles.dropdown}
            maxHeight={400}
            style={[
    styles.dropdown,
    disable && styles.dropdownDisabled,
  ]}
  placeholderStyle={[
    styles.placeholderStyle,
    disable && styles.disabledText,
  ]}
  selectedTextStyle={[
    styles.selectedTextStyle,
    disable && styles.disabledText,
  ]}
  itemTextStyle={styles.itemTextStyle}
  containerStyle={styles.dropdownContainer}
  itemContainerStyle={styles.itemContainer}
            data={data}
            labelField="label"
            valueField="value"
            disable={disable}
            search={!disable}
            placeholder="Select"
            value={value}
            onChange={item => onChange?.(item.value)}
          />
        </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: '600',
  },
mandatoryLabel: {
  color: 'red',
},
   mandatory: {
    color: 'red',
    fontWeight: 'bold',
  },
//   dropdown: {
//     height: 45,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     paddingHorizontal: 10,
//   },

   dropdown: {
    height: 32,
    minHeight: 32,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    paddingHorizontal: 5,
  },
  dropdownDisabled: {
  backgroundColor: '#f2f2f2',
  borderColor: '#d0d0d0',
  opacity: 0.7, // Makes the entire control look disabled
},

disabledText: {
  color: '#8c8c8c',
},

  placeholderStyle: {
    fontSize: 13,
  },

  selectedTextStyle: {
    fontSize: 13,
  },

  itemTextStyle: {
    fontSize: 13,
  },
   dropdownContainer: {
    borderRadius: 4,
  },

  itemContainer: {
    paddingVertical: 0, // default is larger
    minHeight: 0,
  },
});

export default ApiDropdown1;