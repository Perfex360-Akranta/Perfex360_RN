

import { NavigationContainer } from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import AppNavigator from './src/navigation/AppNavigator';
import { GridProvider } from './src/context/GridProvider';
//import { enableScreens } from 'react-native-screens';
import MenuScreen from './src/screens/MenuScreen';
import { getApiConfig } from './src/utils/ApiConfigStore';
import { useEffect } from 'react';
import { setApiConfig } from './src/context/ApiConfig';
//enableScreens(true);
const Drawer = createDrawerNavigator();
function App() {
useEffect(() => {
    const load = async () => {
        const config = await getApiConfig();

        setApiConfig(
            config.ip,
            config.port,
            config.app
        );
    };

    load();
}, []);


  return (
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
  );
}

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
    
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

export default App;
