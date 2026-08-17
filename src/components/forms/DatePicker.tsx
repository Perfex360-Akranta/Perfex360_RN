import React, {useState, useEffect} from 'react';
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
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);


     useEffect(() => {
      //setSelectedDate(value ?? undefined);
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
      
      {label && (<Text style={styles.label}>
        {label}
      </Text> )}

      <TouchableOpacity disabled={disable}
        onPress={() => setShowPicker(true)}>
        <TextInput
          editable={false}
          value={selectedDate ? formatDate(selectedDate) : ''}
          style={[ styles.input ,disable && styles.inputDisabled]}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate ? selectedDate : new Date() }
          mode="date"
          display="default"
          onValueChange={handleChange}
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

export default DatePicker;