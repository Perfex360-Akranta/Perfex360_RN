import AssistTextInput from './AssistTextInput';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  label?: string;
  value?: Date | null;
  shared?:boolean;
  disable?:boolean;
  onChange?: (date: Date) => void;
}

const DatePicker = ({
  label,
  value ,
  shared = false ,
  disable = false,
  onChange,
}: Props) => {

  const { colors, resolvedMode } = useAppTheme();

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);


     useEffect(() => {
      if (!value) {
    setSelectedDate(undefined);
    return;
  }

  const defaultDates = [
    new Date(1801, 0, 1).getTime(), // 01-Jan-1801
    new Date(2100, 11, 31).getTime(), // 31-Dec-2100
  ];

  setSelectedDate(
    defaultDates.includes(value.getTime()) ? undefined : value
  );
    }, [value]);

  const formatDate = (date: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${String(date.getDate()).padStart(
      2,
      '0',
    )}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  const handleChange = (
    event: any,
    date?: Date,
  ) => {
    setShowPicker(false);

    if (date) {
      setSelectedDate(date);

      if (onChange) {
        onChange(date);
      }
    }
  };

  return (
    <View style={shared ? styles.sharedContainer : styles.container}>
      
      {label && (<Text style={[styles.label,{ color: colors.text },]}>
        {label}
      </Text> )}

      <TouchableOpacity disabled={disable} activeOpacity={0.7}
        onPress={() => setShowPicker(true)}>
        <AssistTextInput
          editable={false}
          value={selectedDate ? formatDate(selectedDate) : ''}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            disable && [
              styles.inputDisabled,
              {
                backgroundColor: colors.disabled,
                borderColor: colors.border,
              },
            ],
          ]}
          pointerEvents="none"
          placeholder="Select date"
          placeholderTextColor={colors.textMuted}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate ? selectedDate : new Date() }
          mode="date"
          display="default"
          onValueChange={handleChange}
          themeVariant={resolvedMode}
          accentColor={colors.primary}
          // onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  sharedContainer: {
    flex: 1,
  marginHorizontal: 5,
  marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: '600',
    fontSize: 13,
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 5,
  //   padding: 5,
  //   marginRight:10,
  //   backgroundColor: '#fff',
  // },
   input: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 5,
    marginRight: 10,
    fontSize: 13,
    minHeight: 38,
  },
  inputDisabled: {
  backgroundColor: '#f2f2f2',
  borderColor: '#d0d0d0',
  opacity: 0.7,
},
});

export default DatePicker;