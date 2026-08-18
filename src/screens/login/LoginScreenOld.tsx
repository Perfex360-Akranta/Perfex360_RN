import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
} from 'react-native';

import {login} from '../../services/api/AuthApi';
import {saveToken, saveUser} from '../../utils/Storage';

const LoginScreen = ({navigation}: any) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {

        if (!username || !password) {
            Alert.alert('Enter Username & Password');
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

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Login</Text>

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

            <Button
                title={loading ? 'Please Wait...' : 'Login'}
                onPress={onLogin}
            />

        </View>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center',
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        padding: 12,
        borderRadius: 8,
    },

});

export default LoginScreen;