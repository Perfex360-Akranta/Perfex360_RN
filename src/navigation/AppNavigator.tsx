import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {DrawerActions} from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import AbnormalityFormScreen from '../screens/AbnormalityFormScreen';
//import DynamicCardScreen from './src/screens/AbnormalityModificationCardScreen';
import AbnormalityView from '../screens/AbnormalityView';
import ColumnFilterScreen from '../screens/ColumnFilterScreen';
import AddColumnFilterScreen from '../screens/AddColumnFilterScreen';
import { ColumnFilter } from '../types/GridFilters';
import LoginScreen from '../screens/LoginScreen';
import AbnormalityCompletion from '../screens/AbnormalityCompletion';
import AbnormalityAllocation from '../screens/AbnormalityAllocation';
import LogoutButton from '../components/forms/LogoutButton';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Image, TouchableOpacity, View } from 'react-native';
import MenuScreen from '../screens/MenuScreen';

export type RootStackParamList = {
  Login:undefined;
  Home: undefined;
  Menu:undefined;
  AbnForm: undefined;
  AbnView: undefined;
  AbnComp: undefined;
  AbnAllocation:undefined;
  //ColumnFilter:undefined;
  //AddColumnFilter:undefined;
  ColumnFilter: {
    columns: any[];
    //filters: any[];
    savedFilter:any;
    //onApply?: (filters: ColumnFilter[]) => void;
  };

  AddColumnFilter: {
    columns: any[];
    filter?: any;
    onSave?: (filter: any) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {

  return (
    <Stack.Navigator initialRouteName="Login"  screenOptions={({navigation}) => ({
       headerRight: () => <LogoutButton />,
         headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{marginLeft: 10}}>
            <MaterialIcons
              name="menu"
              size={28}
            />
          </TouchableOpacity>
        ),
  //      headerLeft: () => (
  //   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //     {navigation.canGoBack() && (
  //       <TouchableOpacity
  //         onPress={() => navigation.goBack()}
  //         style={{ marginLeft: 5 }}>
  //         <MaterialIcons
  //           name="arrow-back"
  //           size={28}
  //           color="#1511d3"
  //         />
  //       </TouchableOpacity>
  //     )}

  //     {/* <TouchableOpacity
  //       onPress={() => navigation.navigate('Menu')}
  //       style={{ marginLeft: navigation.canGoBack() ? 15 : 5,marginRight: 10 }}>
  //       <MaterialIcons
  //         name="menu"
  //         size={28}
  //         color="#1511d3"
  //       />
  //     </TouchableOpacity> */}
  //   </View>
  // ),
    //    headerLeft: () => (
    //   <TouchableOpacity
    //     onPress={() => navigation.navigate('Menu')}>
    //     <MaterialIcons
    //       name="menu"
    //       size={28}
    //       color="#1511d3"
    //       style={{marginRight:10,}}
    //     />
    //   </TouchableOpacity>
    // ),
  })}>
    <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown:false}}
    />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          headerTitle: () => (
      <Image
        source={require('../assets/perfex-logo.png')}
        style={{
          width: 200,
          height: 60,
          resizeMode: 'contain',
        }}
      />
    ),
    // title: 'Perfex360'  , 
     headerRight: () => <LogoutButton />, 
    }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={({ navigation }) => ({
    title: 'Menu',
    headerRight:() => null,
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialIcons
          name="arrow-back"
          size={28}
          color="#1511d3"
          style={{marginRight:10,}}
        />
      </TouchableOpacity>
    ),
  })}
      />
      <Stack.Screen
        name="AbnForm"
        component={AbnormalityFormScreen}
        options={{ title: 'Abnormality Identification' }}
      />
      <Stack.Screen
        name="AbnView"
        component={AbnormalityView}
        options={{ title: 'Abnormality View' }}
      />

      <Stack.Screen
        name="AbnAllocation"
        component={AbnormalityAllocation}
        options={{ title: 'Abnormality Allocation' }}
      />
      <Stack.Screen
        name="AbnComp"
        component={AbnormalityCompletion}
        options={{ title: 'Abnormality Completion' }}
      />

      <Stack.Screen
        name="ColumnFilter"
        component={ColumnFilterScreen}
        options={{ title: 'Column Filters' }}
      />

      <Stack.Screen
        name="AddColumnFilter"
        component={AddColumnFilterScreen}
        options={{ title: 'Add Filter' }}
      />
    </Stack.Navigator>
  );
}