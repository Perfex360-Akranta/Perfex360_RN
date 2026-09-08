import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import Cards from '../../components/grid/Cards';
import EquipmentHeader from '../../components/QRscanner/EquipmentHeader';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';

type WorkOrderListRouteParams = {
  equipmentNo?: string;
};

const WorkOrderList: React.FC = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<{ params: WorkOrderListRouteParams }, 'params'>>();
  const cardsRef = useRef<any>(null);

  const { currentRole } = useGrid();
  const equipmentNo = route.params?.equipmentNo;

  const handleEdit = (record: GridEditProps) => {
    const row = record.row;
    console.log('WORK ORDER ROW:', row);

    navigation.navigate('WorkOrderCompletion', {
      workorderno: row.workorderno,
    });
  };

  const openScanner = () => {
    navigation.navigate('EquipmentScanner', { returnTo: 'WorkOrderList' });
  };

  const conditionParams = useMemo(() => {
    if (!equipmentNo) {
      return null;
    }

    return {
      ROLELEVELNO: currentRole?.roleLevel ?? '',
      EQUIPMENTFLAG: 'Y',
      EQUIPMENTNO: equipmentNo,
    };
  }, [equipmentNo, currentRole]);

  return (
    <View style={styles.container}>
      <EquipmentHeader equipmentNo={equipmentNo} onScanPress={openScanner} />

      {conditionParams == null ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
          <Text style={styles.emptyTitle}>No equipment scanned</Text>
          <Text style={styles.emptyText}>
            Tap the scanner icon to scan a machine's QR code and view its
            work orders.
          </Text>
          <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
            <Text style={styles.scanCtaText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Cards
          key={equipmentNo}
          procedureName="getpmworkordrersforcomp_rn_sb"
          isEdit={true}
          onEdit={handleEdit}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  scanCta: {
    marginTop: 20,
    backgroundColor: '#0D5DB8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  scanCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default WorkOrderList;