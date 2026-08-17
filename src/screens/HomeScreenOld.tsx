import React ,{useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getUser } from '../utils/Storage';
import { getUserDetails } from '../services/LoginService';
import { useGrid } from '../context/GridProvider';

type HomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();

  const { setCurrentUser, setCurrentRole} = useGrid();

  useEffect(() => {
    loadUserDetails();
  }, []);
  
  const loadUserDetails = async () => {
    const user = await getUser();
   console.log('user:', user);
    if (user) {
      console.log('user:', user);
      const result = await getUserDetails(user.userId);
      if(result.user.userKeyId){
        console.log('userid:', result.user.userKeyId);
        setCurrentUser({
            userId: result.user.userKeyId,
            userName: result.user.username,
            loginId: result.user.loginId,
            employeeId: result.user.employeeId,
        });
      }
      if(result.activeRole){
        console.log('role:', result.activeRole);
        setCurrentRole(result.activeRole);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfex Dashboard</Text>

      <View style={styles.button}>
        <Button
          title="Create"
          onPress={() => navigation.navigate('AbnForm')}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="Allocation"
          onPress={() => navigation.navigate('AbnAllocation')}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="Completion"
          onPress={() => navigation.navigate('AbnComp')}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="View"
          onPress={() => navigation.navigate('AbnView')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    marginVertical: 10,
  },
});