import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { getUserDetails, login } from '../../services/api/authApi';
import { saveUser } from '../../services/storage/userStorage';
import { saveToken } from '../../services/storage/tokenStorage';
import ServerConfigModal from '../../components/model/ServerConfigModel';
import { useGrid } from '../../context/GridProvider';

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
const [showServerModal, setShowServerModal] = useState(false);

const { setCurrentUser, setCurrentRole} = useGrid();

  const onLogin = async () => {
    if (!username || !password) {
      Alert.alert('Please enter Username and Password');
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        username,
        password,
      });

      await saveToken(result.token);
      await saveUser(result.user);
      await loadUserDetails(result.user);
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert(
        'Login Failed',
        e.response?.data?.message || 'Invalid Username or Password',
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (user:any) => {
     
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


  const onLogoPress =  () => {
    if(password == 'Akr'){
      setShowServerModal(true);
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/itc09.jpg')}
        resizeMode="cover"
        style={styles.background} blurRadius={1} >

        <View style={styles.overlay}>

<TouchableOpacity activeOpacity={1} onPress={onLogoPress}>
          <Image
            source={require('../../assets/perfex-logo.png')}
            style={styles.logo}
            
          />
</TouchableOpacity>
          <Text style={styles.heading}>
            Enable <Text style={{color:'#ff8c00'}}>Excellence</Text>
          </Text>

          <Text style={styles.subHeading}>
            Integrated. Intelligent. Impactful.
          </Text>

          <View style={styles.card}>

<ServerConfigModal
  visible={showServerModal}
  onClose={() => setShowServerModal(false)}
/>

            <Text style={styles.cardTitle}>
              Login to Perfex
            </Text>

            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />

            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={onLogin}>

              {loading ? (
                <ActivityIndicator color="#fff"/>
              ) : (
                <Text style={styles.loginText}>LOGIN</Text>
              )}

            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgot}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.footer}>
            © 2026 ITC Limited
          </Text>

        </View>
        
        <View style={styles.footerdeveloped}>
  <Text style={styles.footerText}>Developed by</Text>
<View style={styles.developerContainer}>
  <Image
    source={require('../../assets/akranta-logo.png')}
    style={styles.developerLogo}
  />
  </View>
</View>

      </ImageBackground>

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({

  container:{
    flex:1
  },

  background:{
    flex:1
  },

  overlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.35)',
    justifyContent:'center',
    alignItems:'center',
    padding:20
  },

  logo:{
    width:350,
    height:100,
    resizeMode:'contain',
    marginBottom:10
  },

  heading:{
    fontSize:30,
    color:'#fff',
    fontWeight:'700'
  },

  subHeading:{
    color:'#fff',
    marginBottom:30,
    fontSize:15
  },

  card:{
    width:'100%',
    backgroundColor:'#fff',
    borderRadius:20,
    padding:25,
    elevation:8
  },

  cardTitle:{
    fontSize:26,
    fontWeight:'700',
    color:'#003366',
    marginBottom:20,
    textAlign:'center'
  },

  input:{
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:12,
    paddingHorizontal:15,
    height:50,
    marginBottom:15
  },

  loginButton:{
    height:50,
    backgroundColor:'#0054A6',
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    marginTop:5
  },

  loginText:{
    color:'#fff',
    fontWeight:'700',
    fontSize:17
  },

  forgot:{
    color:'#0054A6',
    marginTop:20,
    textAlign:'center'
  },

  footer:{
    color:'#fff',
    marginTop:30
  },

  footerdeveloped: {
  position: 'absolute',
  bottom: 10,
  alignSelf: 'center',
},

footerText: {
  color: '#FFFFFF',
  fontSize: 13,
},

developerContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  //marginVertical: 15,
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  padding: 1,
  alignSelf: 'center',
},

developerLogo: {
  width: 120,
  height: 35,
  resizeMode: 'contain',
  marginTop: 5,
  opacity: 1,
  tintColor: undefined,
},

});