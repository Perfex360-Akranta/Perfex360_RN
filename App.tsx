

import { NavigationContainer } from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import AppNavigator from './src/navigation/AppNavigator';
import { GridProvider } from './src/context/GridProvider';
import { FieldAssistProvider } from './src/context/FieldAssistContext';
import { VoiceGuideProvider } from './src/context/VoiceGuideContext';
import FieldAssistBar from './src/components/assist/FieldAssistBar';
//import { enableScreens } from 'react-native-screens';
import MenuScreen from './src/screens/menu/MenuScreen';
import { getApiConfig } from './src/utils/ApiConfigStore';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setApiConfig } from './src/context/ApiConfig';
import { setupAuthInterceptor } from './src/services/axios/authInterceptor';
import { ThemeProvider } from './src/theme/ThemeContext';
//enableScreens(true);
const Drawer = createDrawerNavigator();



function App() {
  
useEffect(() => {
    const load = async () => {
      try {
        const config = await getApiConfig();

        setApiConfig(
            config.ip,
            config.port,
            config.app
        );
        setupAuthInterceptor();

      
      } catch (error) {

        console.error(
          'Error loading API configuration:',
          error
        );

      }
    };

    load();
}, []);


  return (
    <SafeAreaProvider>
    <GridProvider>
    <FieldAssistProvider>
    <VoiceGuideProvider>
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Main"
        drawerContent={(props) => <MenuScreen {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
        }}>
        <Drawer.Screen
          name="Main"
          component={AppNavigator}
        />
      </Drawer.Navigator>
      {/* <AppNavigator /> */}
    </NavigationContainer>
    <FieldAssistBar />
    </VoiceGuideProvider>
    </FieldAssistProvider>
    </GridProvider>
    </SafeAreaProvider>
  );
}



export default App;
