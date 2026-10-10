

import { NavigationContainer } from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import AppNavigator from './src/navigation/AppNavigator';
import { GridProvider } from './src/context/GridProvider';
//import { enableScreens } from 'react-native-screens';
import MenuScreen from './src/screens/menu/MenuScreen';
import { getApiConfig } from './src/utils/ApiConfigStore';
import { useEffect } from 'react';
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
    <ThemeProvider>
    <GridProvider>
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
    </GridProvider>
    </ThemeProvider>
  );
}



export default App;
