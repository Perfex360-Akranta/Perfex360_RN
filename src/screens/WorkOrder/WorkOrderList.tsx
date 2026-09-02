// import React, { useMemo, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import MaterialIcons from '@react-native-vector-icons/material-icons';

// import Cards from '../../components/grid/Cards';
// import { useGrid } from '../../context/GridProvider';

// type WorkOrderListRouteParams = {
//   equipmentNo?: string;
// };

// const WorkOrderList: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const route =
//     useRoute<RouteProp<{ params: WorkOrderListRouteParams }, 'params'>>();
//   const cardsRef = useRef<any>(null);

//   const { currentRole } = useGrid();
//   const equipmentNo = route.params?.equipmentNo;

//   const handleEdit = (row: any, metaRow: any, headerRow: any) => {
//     console.log('WORK ORDER ROW:', row);


//   };

//   const openScanner = () => {
//     navigation.navigate('QrCodeScanner', { returnTo: 'WorkOrderList' });
//   };

//   const conditionParams = useMemo(() => {
//     if (!equipmentNo) {
//       return null;
//     }

//     return {
//       FLID: 'FNL000000001',
//       DRILLFLAG: ' ',
//       ELEMENTID: 'CMP0000001',
//       ROLELEVELNO: currentRole?.roleLevel ?? '',


//       EQUIPMENTFLAG: 'Y',
//       EQUIPMENTNO: equipmentNo,

//       SECTIONID: '',
//       MACHINEID: '',
//       ASSEMBLYID: '',
//       TRADEID: '',

//       FROMDATEWO: 'Aug-2026',
//       TODATEWO: 'Aug-2026',
//     };
//   }, [equipmentNo, currentRole]);

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
//         <MaterialIcons name="qr-code-scanner" size={24} color="#FFFFFF" />
//       </TouchableOpacity>

//       {conditionParams == null ? (
//         <View style={styles.emptyState}>
//           <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
//           <Text style={styles.emptyTitle}>No equipment scanned</Text>
//           <Text style={styles.emptyText}>
//             Tap the scanner icon to scan a machine's QR code and view its
//             work orders.
//           </Text>
//           <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
//             <Text style={styles.scanCtaText}>Scan QR</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <Cards

//           key={equipmentNo}
//           procedureName="getpmworkordrersforcomp_rn_sb"
//           isEdit={true}
//           onEdit={handleEdit}
//           ref={cardsRef}
//           conditionParams={conditionParams}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scanButton: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     zIndex: 10,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#0D5DB8',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//   },
//   emptyState: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//   },
//   emptyTitle: {
//     marginTop: 16,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   emptyText: {
//     marginTop: 8,
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 14,
//   },
//   scanCta: {
//     marginTop: 20,
//     backgroundColor: '#0D5DB8',
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//   },
//   scanCtaText: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//     fontSize: 15,
//   },
// });


// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import MaterialIcons from '@react-native-vector-icons/material-icons';

// import Cards from '../../components/grid/Cards';
// import { useGrid } from '../../context/GridProvider';

// type WorkOrderListRouteParams = {
//   equipmentNo?: string;
// };


// const WorkOrderList: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const route =
//     useRoute<RouteProp<{ params: WorkOrderListRouteParams }, 'params'>>();
//   const cardsRef = useRef<any>(null);

//   const { currentRole } = useGrid();
//   const equipmentNo = route.params?.equipmentNo;

//   const [machineName, setMachineName] = useState<string | null>(null);

//   useEffect(() => {
//     setMachineName(equipmentNo ?? null);
//   }, [equipmentNo]);

//   const handleEdit = (row: any, metaRow: any, headerRow: any) => {
//     console.log('WORK ORDER ROW:', row);


//   };

//   const openScanner = () => {
//     navigation.navigate('QrCodeScanner', { returnTo: 'WorkOrderList' });
//   };

//   const conditionParams = useMemo(() => {
//     if (!equipmentNo) {
//       return null;
//     }

//     return {
//       FLID: 'FNL000000001',
//       DRILLFLAG: ' ',
//       ELEMENTID: 'CMP0000001',
//       ROLELEVELNO: currentRole?.roleLevel ?? '',


//       EQUIPMENTFLAG: 'Y',
//       EQUIPMENTNO: equipmentNo,

//       SECTIONID: '',
//       MACHINEID: '',
//       ASSEMBLYID: '',
//       TRADEID: '',

//       FROMDATEWO: 'Aug-2026',
//       TODATEWO: 'Aug-2026',
//     };
//   }, [equipmentNo, currentRole]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerTextWrap}>
//           <Text style={styles.headerLabel}>Equipment</Text>
//           <Text style={styles.headerValue} numberOfLines={1}>
//             {machineName ?? 'No equipment selected'}
//           </Text>
//         </View>

//         <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
//           <MaterialIcons name="qr-code-scanner" size={22} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>

//       {conditionParams == null ? (
//         <View style={styles.emptyState}>
//           <MaterialIcons name="qr-code-scanner" size={48} color="#0D5DB8" />
//           <Text style={styles.emptyTitle}>No equipment scanned</Text>
//           <Text style={styles.emptyText}>
//             Tap the scanner icon to scan a machine's QR code and view its
//             work orders.
//           </Text>
//           <TouchableOpacity style={styles.scanCta} onPress={openScanner}>
//             <Text style={styles.scanCtaText}>Scan QR</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <Cards

//           key={equipmentNo}
//           procedureName="getpmworkordrersforcomp_rn_sb"
//           isEdit={true}
//           onEdit={handleEdit}
//           ref={cardsRef}
//           conditionParams={conditionParams}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   headerTextWrap: {
//     flex: 1,
//     marginRight: 12,
//   },
//   headerLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#999',
//     textTransform: 'uppercase',
//   },
//   headerValue: {
//     marginTop: 2,
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   scanButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#0D5DB8',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//   },
//   emptyState: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//   },
//   emptyTitle: {
//     marginTop: 16,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   emptyText: {
//     marginTop: 8,
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 14,
//   },
//   scanCta: {
//     marginTop: 20,
//     backgroundColor: '#0D5DB8',
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//   },
//   scanCtaText: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//     fontSize: 15,
//   },
// });

// export default WorkOrderList;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import Cards from '../../components/grid/Cards';
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

  const [machineName, setMachineName] = useState<string | null>(null);

  useEffect(() => {
    setMachineName(equipmentNo ?? null);
  }, [equipmentNo]);

  const handleEdit = (record : GridEditProps) => {
    const row = record.row;
    console.log('WORK ORDER ROW:', row);

    // CHANGED: navigate to the completion screen with the tapped row's
    // work order number.
    navigation.navigate('WorkOrderCompletion', {
      workorderno: row.workorderno,
    });
  };

  const openScanner = () => {
    navigation.navigate('QrCodeScanner', { returnTo: 'WorkOrderList' });
  };

  const conditionParams = useMemo(() => {
    if (!equipmentNo) {
      return null;
    }

    return {
      FLID: 'FNL000000001',
      DRILLFLAG: ' ',
      ELEMENTID: 'CMP0000001',
      ROLELEVELNO: currentRole?.roleLevel ?? '',


      EQUIPMENTFLAG: 'Y',
      EQUIPMENTNO: equipmentNo,

      SECTIONID: '',
      MACHINEID: '',
      ASSEMBLYID: '',
      TRADEID: '',

      FROMDATEWO: 'Aug-2026',
      TODATEWO: 'Aug-2026',
    };
  }, [equipmentNo, currentRole]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerLabel}>Equipment</Text>
          <Text style={styles.headerValue} numberOfLines={1}>
            {machineName ?? 'No equipment selected'}
          </Text>
        </View>

        <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
          <MaterialIcons name="qr-code-scanner" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
  },
  headerValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D5DB8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
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