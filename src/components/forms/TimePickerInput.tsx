import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  label?: string;
  value?: Date;
  onChange?: (time: Date) => void;
}

const TimePickerInput = ({
  label,
  value = new Date(),
  onChange,
}: Props) => {
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
    
      <Text style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}>
        <TextInput
          editable={false}
          value={formatTime(selectedTime)}
          style={styles.input}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleChange}
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
});

export default TimePickerInput;