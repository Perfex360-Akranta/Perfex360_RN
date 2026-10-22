import AssistTextInput from '../forms/AssistTextInput';
import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FieldAssistBar from '../assist/FieldAssistBar';
import { getApiConfig, saveApiConfig } from '../../utils/ApiConfigStore';
import { setApiConfig } from '../../context/ApiConfig';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ServerConfigModal({
  visible,
  onClose,
}: Props) {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [app, setApp] = useState('');

  useEffect(() => {
    if (visible) {
      loadConfig();
    }
  }, [visible]);

  const loadConfig = async () => {
    // const savedIp = (await AsyncStorage.getItem('API_IP')) ?? '';

    // const savedPort = (await AsyncStorage.getItem('API_PORT'))  ?? '';

    const result = await getApiConfig();

    setIp(result.ip);
    setPort(result.port);
    setApp(result.app);
  };

  const saveConfig = async () => {

    await saveApiConfig(ip,port,app);
    // await AsyncStorage.setItem('API_IP', ip);
    // await AsyncStorage.setItem('API_PORT', port);
   setApiConfig(ip,port,app);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade">

      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>
            Server Settings
          </Text>

          <AssistTextInput
            style={styles.input}
            placeholder="IP Address"
            value={ip}
            onChangeText={setIp}
          />

          <AssistTextInput
            style={styles.input}
            placeholder="Port"
            keyboardType="numeric"
            value={port}
            onChangeText={setPort}
          />

           <AssistTextInput
            style={styles.input}
            placeholder="App"
            value={app}
            onChangeText={setApp}
          />

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={saveConfig}>
              <Text>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>
        {visible ? <FieldAssistBar hosted /> : null}
      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 5,
  },
});