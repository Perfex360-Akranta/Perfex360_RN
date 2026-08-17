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
  disable?:boolean;
  onChange?: (date: Date) => void;
}

const MonthPicker = ({
  label,
  value ,
  disable = false,
  onChange,
}: Props) => {
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
      
      {label && (<Text style={styles.label}>
        {label}
      </Text> )}

      <TouchableOpacity disabled={disable}
        onPress={() => setShowPicker(true)}>
        <TextInput
          editable={false}
          value={selectedDate ? formatDate(selectedDate) : ''}
          style={styles.input}
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
});

export default MonthPicker;