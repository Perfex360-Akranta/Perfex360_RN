import AssistTextInput from './AssistTextInput';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  label?: string;
  value?: Date | null;
  disable?:boolean;
  onChange?: (date: Date) => void;
}

const MonthPicker = ({
  label,
  value ,
  disable = false,
  onChange,
}: Props) => {

  const { colors, resolvedMode } = useAppTheme(); 

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

   useEffect(() => {
    setSelectedDate(value ?? undefined);
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

    return `${months[date.getMonth()]}-${date.getFullYear()}`;
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
    <View style={styles.container}>
      
      {label && (<Text style={[styles.label,{ color: colors.text },]}>
        {label}
      </Text> )}

      <TouchableOpacity disabled={disable} activeOpacity={0.7}
        onPress={() => setShowPicker(true)}>
        <AssistTextInput
          editable={false}
          value={selectedDate ? formatDate(selectedDate) : ''}
          // style={styles.input}
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //marginBottom: 15,
    flex: 1,
  marginHorizontal: 5,
  marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginRight:10,
    backgroundColor: '#fff',
  },
  inputDisabled: {
  backgroundColor: '#f2f2f2',
  borderColor: '#d0d0d0',
  opacity: 0.7,
},
});

export default MonthPicker;