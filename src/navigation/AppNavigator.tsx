import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {DrawerActions} from '@react-navigation/native';

import HomeScreen from '../screens/home/HomeScreen';
import AbnormalityFormScreen from '../screens/abnormality/AbnormalityFormScreen';
import AbnormalityView from '../screens/abnormality/AbnormalityView';
import ColumnFilterScreen from '../components/grid/ColumnFilterScreen';
import AddColumnFilterScreen from '../components/grid/AddColumnFilterScreen';
import LoginScreen from '../screens/login/LoginScreen';
import AbnormalityCompletion from '../screens/abnormality/AbnormalityCompletion';
import AbnormalityAllocation from '../screens/abnormality/AbnormalityAllocation';
import LogoutButton from '../components/forms/LogoutButton';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Image, TouchableOpacity, View } from 'react-native';
import MenuScreen from '../screens/menu/MenuScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SuggestionFormScreen from '../screens/suggestion/SuggestionFormScreen';
import SuggestionModification from '../screens/suggestion/SuggestionModification';
import SuggestionView from '../screens/suggestion/SuggestionView';
import SuggestionAcceptReject from '../screens/suggestion/SuggestionAcceptReject';

export type RootStackParamList = {
  Login:undefined;
  Home: undefined;
  Menu:undefined;
  dashboard:undefined;
  AbnForm: undefined;
  AbnView: undefined;
  AbnComp: undefined;
  AbnAllocation:undefined;

  Suggestion: { editRecord?: any } | undefined;
  SuggestionModification: undefined;
  SuggestionView: undefined;
  SuggestionAcceptReject: undefined;

  ColumnFilter: {
    columns: any[];
    savedFilter:any;
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
        name="dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
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
        name="Suggestion"
        component={SuggestionFormScreen}
        options={{ title: 'Kaizen Suggestion' }}
      />

      <Stack.Screen
        name="SuggestionModification"
        component={SuggestionModification}
        options={{ title: 'Suggestion Modification' }}
      />

      <Stack.Screen
        name="SuggestionView"
        component={SuggestionView}
        options={{ title: 'Suggestion View' }}
      />

       <Stack.Screen
        name="SuggestionAcceptReject"
        component={SuggestionAcceptReject}
        options={{ title: 'Suggestion Accept/Reject' }}
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