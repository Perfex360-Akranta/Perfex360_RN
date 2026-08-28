import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export default function QrIdsScreen({navigation, route}: any) {
  const [ids, setIds] = useState<string[]>([]);
  const scannedId = route?.params?.scannedId as string | undefined;

  useEffect(() => {
    if (!scannedId) {
      return;
    }

    setIds(prev => (prev.includes(scannedId) ? prev : [...prev, scannedId]));
    navigation.setParams({scannedId: undefined});
  }, [navigation, scannedId]);

  const openScanner = () => {
    navigation.navigate('QrCodeScanner', {returnTo: 'QrIds'});
  };

  const removeId = (index: number) => {
    setIds(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>QR IDs</Text>
          <Text style={styles.subtitle}>Scan and collect multiple IDs</Text>
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
          <MaterialIcons name="qr-code-scanner" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {ids.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="qr-code-scanner" size={40} color="#0D5DB8" />
            <Text style={styles.emptyTitle}>No IDs yet</Text>
            <Text style={styles.emptyText}>
              Tap the scanner icon to scan a QR code inside the square frame.
            </Text>
          </View>
        ) : (
          ids.map((id, index) => (
            <View key={`${id}-${index}`} style={styles.idCard}>
              <View style={styles.idTextWrap}>
                <Text style={styles.idLabel}>ID {index + 1}</Text>
                <Text style={styles.idValue}>{id}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeId(index)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <MaterialIcons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF5FF',
  },
  headerRow: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D5DB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  idLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  idValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#0D5DB8',
  },
});
