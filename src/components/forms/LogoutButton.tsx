// components/LogoutButton.tsx

import React from 'react';
import { TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNavigation } from '@react-navigation/native';
import { removeToken } from '../../services/storage/tokenStorage';
import { removeUser } from '../../services/storage/userStorage';
import { useAppTheme } from '../../theme/ThemeContext';
type Props = {
  variant?: 'icon' | 'menu';
  onDone?: () => void;
};
export default function LogoutButton({
  variant = 'icon',
  onDone,
}: Props) {
  const navigation = useNavigation<any>();
const { colors } = useAppTheme();

  const logoutBtn = () => {

    onDone?.();

    Alert.alert(
      'Logout',
      'Do you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
           style: 'destructive',
          onPress: async () => {
            // removeToken();
            // removeUser();
             await Promise.all([removeToken(), removeUser()]);

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  // return (
  //   <TouchableOpacity onPress={logoutBtn}>
  //     <MaterialIcons
  //       name="logout"
  //       size={24}
  //       color="#d71919"
  //     />
  //   </TouchableOpacity>
  // );

  if (variant === 'menu') {
    return (
      <TouchableOpacity
        onPress={logoutBtn}
        style={styles.menuItem}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <MaterialIcons name="logout" size={22} color="#D71919" />
        <Text style={[styles.menuText, { color: '#D71919' }]}>
          Logout
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={logoutBtn}
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel="Logout"
    >
      <MaterialIcons name="logout" size={24} color="#D71919" />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
});