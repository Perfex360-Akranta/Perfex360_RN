import AssistTextInput from './AssistTextInput';
import React, {useState} from 'react';
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
  value?: Date;
  disable?:boolean;
  onChange?: (time: Date) => void;
}

const TimePickerInput = ({
  label,
  value = new Date(),
  disable = false,
  onChange,
}: Props) => {

  const { colors, resolvedMode } = useAppTheme(); 

  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] =
    useState<Date>(value);

  const formatTime = (date: Date) => {
    const hours = String(
      date.getHours(),
    ).padStart(2, '0');

    const minutes = String(
      date.getMinutes(),
    ).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  const handleChange = (
    event: any,
    time?: Date,
  ) => {
    setShowPicker(false);

    if (time) {
      setSelectedTime(time);

      onChange?.(time);
    }
  };

  return (
    <View style={styles.container}>
    
      <Text style={[styles.label,{ color: colors.text },]}>
        {label}
      </Text>

      <TouchableOpacity disabled={disable}  activeOpacity={0.7}
        onPress={() => setShowPicker(true)}>
        <AssistTextInput
          editable={false}
          value={formatTime(selectedTime)}
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
          value={selectedTime}
          mode="time"
          is24Hour={true}
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

export default TimePickerInput;