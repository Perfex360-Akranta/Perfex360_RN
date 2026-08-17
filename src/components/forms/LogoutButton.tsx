// components/LogoutButton.tsx

import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../utils/Storage';

export default function LogoutButton() {
  const navigation = useNavigation<any>();

  const logoutBtn = () => {
    Alert.alert(
      'Logout',
      'Do you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            logout();

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={logoutBtn}>
      <MaterialIcons
        name="logout"
        size={24}
        color="#d71919"
      />
    </TouchableOpacity>
  );
}