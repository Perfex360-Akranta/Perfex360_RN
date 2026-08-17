import React, {useState} from 'react';
import {ScrollView} from 'react-native';

import TextField from '../components/forms/TextField';

const EmployeeFormScreen = () => {
  const [name, setName] = useState('');

  return (
    <ScrollView style={{padding: 20}}>
      <TextField
        label="Employee Name"
        value={name}
        onChangeText={setName}
      />
    </ScrollView>
  );
};

export default EmployeeFormScreen;