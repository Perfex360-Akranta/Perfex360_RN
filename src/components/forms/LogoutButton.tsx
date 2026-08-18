// components/LogoutButton.tsx

import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNavigation } from '@react-navigation/native';
import { removeToken } from '../../services/storage/tokenStorage';
import { removeUser } from '../../services/storage/userStorage';

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
            removeToken();
            removeUser();

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