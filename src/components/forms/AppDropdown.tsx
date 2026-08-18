
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';

import {getDropdownData} from '../../services/api/dropdownApi';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';

interface DropdownItem {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  manditory?: boolean;
  dataset?: DropdownItem[];
  value: string;
  endpoint: string;
  params?: any;
  disable?: boolean;
  onChange?: (value: string) => void;
}

const AppDropdown = forwardRef(({
  label,
  manditory,
  dataset,
  value,
  endpoint,
  params,
  disable = false,
  onChange,
}: Props, ref) => {

  const [data, setData] = useState<DropdownItem[]>([]);

  const loadData = async (requestParams?: any) => {
    try {
      const result = await getDropdownData(
        endpoint,
        requestParams,
      );

      setData(result || []);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  useImperativeHandle(ref, () => ({
    reload: (requestParams?: any) => {
      loadData(requestParams);
    },
  }));

  useEffect(() => {
    if (dataset) {
      setData(dataset);
    } else {
      loadData(params);
    }
  }, [dataset]);

  const handleClear = () => {
    onChange?.('');
  };

  return (
    <View style={styles.container}>

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

      <View style={styles.dropdownWrapper}>

        <Dropdown
          maxHeight={400}
          style={[
            styles.dropdown,
            disable && styles.dropdownDisabled,
            value && !disable && styles.dropdownSelected,
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

          onChange={item => {
            onChange?.(item.value);
          }}

          renderRightIcon={() => (
            <View style={styles.rightIcons}>

              {value && !disable && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.6}>
                  <MaterialIcons
                    name="close"
                    size={17}
                    color="#777"
                  />
                </TouchableOpacity>
              )}

              <MaterialIcons
                name="keyboard-arrow-down"
                size={21}
                color={disable ? '#aaa' : '#555'}
              />

            </View>
          )}
        />

      </View>

    </View>
  );
});

const styles = StyleSheet.create({

  container: {
    marginBottom: 12,
  },

  label: {
    marginBottom: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  mandatoryLabel: {
    color: '#d32f2f',
  },

  dropdownWrapper: {
    position: 'relative',
  },

  dropdown: {
    height: 38,
    minHeight: 38,

    borderWidth: 1,
    borderColor: '#d0d5dd',

    borderRadius: 7,

    paddingLeft: 10,
    paddingRight: 8,

    backgroundColor: '#fff',
  },

  dropdownSelected: {
    borderColor: '#8aa4c8',
    backgroundColor: '#fcfdff',
  },

  dropdownDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d5d5d5',
    opacity: 0.8,
  },

  placeholderStyle: {
    fontSize: 13,
    color: '#9ca3af',
  },

  selectedTextStyle: {
    fontSize: 13,
    color: '#1f2937',
  },

  disabledText: {
    color: '#9ca3af',
  },

  itemTextStyle: {
    fontSize: 13,
    color: '#333',
  },

  dropdownContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },

  itemContainer: {
    paddingVertical: 0,
    minHeight: 0,
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  clearButton: {
    width: 24,
    height: 24,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
});

export default AppDropdown;

