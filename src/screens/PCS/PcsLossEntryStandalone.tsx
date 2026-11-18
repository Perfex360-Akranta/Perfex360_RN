// // import React, { useMemo, useRef, useState } from 'react';
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { post } from '../../services/axiosService';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Platform,
// } from 'react-native';
// import MaterialIcons from '@react-native-vector-icons/material-icons/static';
// import { useNavigation } from '@react-navigation/native';

// import FunctionalLocationView from '../../components/FunctionLocation/FunctionalLocationView';
// import DatePicker from '../../components/forms/DatePicker';
// import AppDropdown from '../../components/forms/AppDropdown';
// import Cards from '../../components/grid/Cards';
// import { useGrid } from '../../context/GridProvider';
// import { GridEditProps } from '../../types/GridFilters';
// import { HOUR_OPTIONS, PcsLossEntryContext } from './PcsLossEntry';
// import LossDetails from './LossDetails';
// import { getShiftTotalMinutes } from '../../services/api/LossEntryApi';

// const formatCondDate = (date: Date) => {
//   const months = [
//     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
//   ];
//   return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
// };

// const PcsLossEntryStandalone: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const { currentRole, setFilter } = useGrid();
//   const cardsRef = useRef<any>(null);

//   const [flid, setFlid] = useState(currentRole?.flid ?? '');
//   const [elementid, setElementid] = useState('');
//   const [cellid, setCellid] = useState('');
//   const [sectionid, setSectionid] = useState('');
//   const [machineid, setMachineid] = useState('');
//   const [sbuId, setSbuId] = useState('');
//   const [entryDate, setEntryDate] = useState(new Date());
//   const [shift, setShift] = useState('');
//   const [hour, setHour] = useState('');
//   const [hourOptions, setHourOptions] = useState<{ label: string; value: string }[]>([]);

//   useEffect(() => {
//     if (!shift) {
//       setHourOptions([]);
//       return;
//     }
//     const loadHours = async () => {
//       try {
//         const res = await post('commonFilter/shiftMinutes', { shiftId: shift });
//         const total = Number(res?.totalShifttime) || 0;
//         const count = Math.ceil(total / 60);
//         const list: { label: string; value: string }[] = [];
//         for (let i = 1; i <= count; i++) {
//           list.push({ label: String(i), value: String(i) });
//         }
//         if (count > 0) {
//           list.push({ label: 'H+', value: String(count + 1) });
//         }
//         setHourOptions(list);
//       } catch (error) {
//         console.error('Failed to load shift minutes:', error);
//         setHourOptions([]);
//       }
//     };
//     loadHours();
//   }, [shift]);
//   const [showDetails, setShowDetails] = useState(false);
//   const [editRow, setEditRow] = useState<any | null>(null);

//   const jhSelected = Boolean(cellid);

//   const entryContext: PcsLossEntryContext = {
//     flid,
//     elementid,
//     cellid,
//     sectionid,
//     machineid,
//     shift,
//     entryDate,
//   };

//   const conditionParams = useMemo(() => {
//     if (!jhSelected || !shift || !hour) {
//       return null;
//     }
//     return {
//       FLID: flid,
//       CELLID: cellid,
//       SHIFT: shift,
//       HOUR: hour,
//       ENTRYDATE: formatCondDate(entryDate),
//       FROMDATE: formatCondDate(entryDate),
//       TODATE: formatCondDate(entryDate),
//     };
//   }, [jhSelected, flid, cellid, shift, hour, entryDate]);

//   const handleLocationSelect = (result: any) => {
//     const nextFlid = String(result?.flid ?? '');
//     const nextCell = String(result?.cellId ?? '');
//     const nextSbuId = String(result?.sbuId ?? '');
//     setFlid(nextFlid);
//     setElementid(String(result?.elementId ?? ''));
//     setCellid(nextCell);
//     setSectionid(String(result?.sectionId ?? ''));
//     setMachineid(String(result?.machineId ?? ''));
//     if (nextSbuId !== sbuId) {
//       setShift('');
//     }
//     setSbuId(nextSbuId);
//     if (nextFlid) {
//       setFilter(prev => ({ ...prev, flid: nextFlid, sbuId: nextSbuId }));
//     }
//   };

//   const openFreshDetails = () => {
//     if (!jhSelected) {
//       Alert.alert('JH is required', 'Select Functional Location down to JH before adding a loss entry.');
//       return;
//     }
//     if (!shift) {
//       Alert.alert('Missing field', 'Select a Shift.');
//       return;
//     }
//     if (!hour) {
//       Alert.alert('Missing field', 'Select Hour before adding a loss entry.');
//       return;
//     }
//     setEditRow(null);
//     setShowDetails(true);
//   };

//   const handleEdit = (record: GridEditProps) => {
//     setEditRow(record.row);
//     setShowDetails(true);
//   };

//   const closeDetails = () => {
//     setShowDetails(false);
//     setEditRow(null);
//     cardsRef.current?.reload();
//   };

//   return (
//     <View style={styles.screen}>
//       {/* <SafeAreaView style={styles.safeHeader}>
//         <View
//           style={[
//             styles.titleBar,
//             Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 12 } : null,
//           ]}
//         >
//           <Text style={styles.titleText}>Loss Entry</Text>
//           <TouchableOpacity
//             style={styles.closeBtn}
//             onPress={() => navigation.goBack?.()}
//           >
//             <MaterialIcons name="close" size={22} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView> */}

//       <View style={styles.headerBlock}>
//         <FunctionalLocationView
//           flid={flid}
//           visible={true}
//           validate={{ isCell: true }}
//           onSelect={handleLocationSelect}
//         />
//         <Text style={styles.jhHint}>
//           JH <Text style={styles.star}>*</Text>
//           {jhSelected ? ' selected' : ' — select Functional Location down to JH'}
//         </Text>

//         <View style={styles.filterRow}>
//           <View style={styles.filterField}>
//             {/* <DatePicker label="Date" value={entryDate} onChange={setEntryDate} /> */}
//             <DatePicker label="Date" value={entryDate} onChange={d => { setEntryDate(d); setHour(''); }} />
//           </View>
//           <View style={styles.filterField}>
//             <AppDropdown
//               key={`shift-${sbuId || 'no-sbu'}`}
//               label="Shift"
//               manditory={true}
//               value={shift}
//               endpoint="commonFilter/Shift"
//               params={{ factoryId: sbuId }}
//               //onChange={setShift}
//               onChange={value => { setShift(value); setHour(''); }}
//             />
//           </View>
//         </View>

//         <View style={styles.filterRow}>
//           <View style={styles.hourField}>
//             {/* <AppDropdown
//               label="Hour"
//               manditory={true}
//               value={hour}
//               endpoint=""
//               dataset={HOUR_OPTIONS}
//               onChange={setHour}
//             /> */}
//             <AppDropdown
//               label="Hour"
//               manditory={true}
//               value={hour}
//               endpoint=""
//               dataset={hourOptions}
//               onChange={setHour}
//             />
//           </View>
//           <TouchableOpacity style={styles.addBtn} onPress={openFreshDetails}>
//             <MaterialIcons name="add" size={26} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {conditionParams == null ? (
//         <View style={styles.emptyState}>
//           <MaterialIcons name="event-note" size={48} color="#0D5DB8" />
//           <Text style={styles.emptyTitle}>Select JH, shift and hour</Text>
//           <Text style={styles.emptyText}>
//             Loss entry cards load after Functional Location (JH), Date, Shift and Hour are selected.
//             Tap + to add a new loss.
//           </Text>
//         </View>
//       ) : (
//         <Cards
//           key={`${flid}-${cellid}-${shift}-${hour}-${formatCondDate(entryDate)}`}
//           procedureName="pcs_fn_pcslossentry_rn_sb"
//           isEdit={true}
//           onEdit={handleEdit}
//           ref={cardsRef}
//           conditionParams={conditionParams}
//         />
//       )}

//       <LossDetails
//         visible={showDetails}
//         hour={hour}
//         entry={entryContext}
//         editRow={editRow}
//         onClose={closeDetails}
//         onSaved={closeDetails}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: '#EAF6FB',
//   },
//   safeHeader: {
//     backgroundColor: '#0D5DB8',
//   },
//   titleBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//   },
//   titleText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   closeBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: 'rgba(0,0,0,0.25)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerBlock: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 12,
//     paddingTop: 10,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8F0',
//   },
//   jhHint: {
//     marginTop: 6,
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#475569',
//   },
//   star: {
//     color: '#DC2626',
//   },
//   filterRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginTop: 4,
//   },
//   filterField: {
//     flex: 1,
//     marginRight: 8,
//   },
//   hourField: {
//     flex: 1,
//     marginRight: 8,
//   },
//   addBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 8,
//     backgroundColor: '#0D5DB8',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 4,
//   },
//   emptyState: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//   },
//   emptyTitle: {
//     marginTop: 12,
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   emptyText: {
//     marginTop: 8,
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 14,
//   },
// });

// export default PcsLossEntryStandalone;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { useNavigation } from '@react-navigation/native';

import FunctionalLocationView from '../../components/FunctionLocation/FunctionalLocationView';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';
import { PcsLossEntryContext } from './PcsLossEntry';
import LossDetails from './LossDetails';
import { getShiftTotalMinutes } from '../../services/api/LossEntryApi';

const formatCondDate = (date: Date) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

const PcsLossEntryStandalone: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentRole, setFilter } = useGrid();
  const cardsRef = useRef<any>(null);

  const [flid, setFlid] = useState(currentRole?.flid ?? '');
  const [elementid, setElementid] = useState('');
  const [cellid, setCellid] = useState('');
  const [sectionid, setSectionid] = useState('');
  const [machineid, setMachineid] = useState('');
  const [sbuId, setSbuId] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());
  const [shift, setShift] = useState('');
  const [hour, setHour] = useState('');
  const [hourOptions, setHourOptions] = useState<{ label: string; value: string }[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const jhSelected = Boolean(cellid);

  // Build the Hour list from the shift length, the same way the JSP does:
  // 1..ceil(totalMinutes / 60), plus one extra "H+" option.
  useEffect(() => {
    if (!shift) {
      setHourOptions([]);
      return;
    }

    let cancelled = false;

    const loadHours = async () => {
      try {
        const total = await getShiftTotalMinutes(shift);
        const count = Math.ceil(total / 60);
        const list: { label: string; value: string }[] = [];
        for (let i = 1; i <= count; i++) {
          list.push({ label: String(i), value: String(i) });
        }
        if (count > 0) {
          list.push({ label: 'H+', value: String(count + 1) });
        }
        if (!cancelled) {
          setHourOptions(list);
        }
      } catch (error) {
        console.error('Failed to load shift minutes:', error);
        if (!cancelled) {
          setHourOptions([]);
        }
      }
    };

    loadHours();

    return () => {
      cancelled = true;
    };
  }, [shift]);

  const entryContext: PcsLossEntryContext = {
    flid,
    elementid,
    cellid,
    sectionid,
    machineid,
    shift,
    entryDate,
  };

  const conditionParams = useMemo(() => {
    if (!jhSelected || !shift || !hour) {
      return null;
    }
    return {
      FLID: flid,
      CELLID: cellid,
      SHIFT: shift,
      HOUR: hour,
      ENTRYDATE: formatCondDate(entryDate),
      FROMDATE: formatCondDate(entryDate),
      TODATE: formatCondDate(entryDate),
    };
  }, [jhSelected, flid, cellid, shift, hour, entryDate]);

  const handleLocationSelect = (result: any) => {
    const nextFlid = String(result?.flid ?? '');
    const nextCell = String(result?.cellId ?? '');
    const nextSbuId = String(result?.sbuId ?? '');
    setFlid(nextFlid);
    setElementid(String(result?.elementId ?? ''));
    setCellid(nextCell);
    setSectionid(String(result?.sectionId ?? ''));
    setMachineid(String(result?.machineId ?? ''));
    if (nextSbuId !== sbuId) {
      setShift('');
      setHour('');
    }
    setSbuId(nextSbuId);
    if (nextFlid) {
      setFilter(prev => ({ ...prev, flid: nextFlid, sbuId: nextSbuId }));
    }
  };

  const openFreshDetails = () => {
    if (!jhSelected) {
      Alert.alert('JH is required', 'Select Functional Location down to JH before adding a loss entry.');
      return;
    }
    if (!shift) {
      Alert.alert('Missing field', 'Select a Shift.');
      return;
    }
    if (!hour) {
      Alert.alert('Missing field', 'Select Hour before adding a loss entry.');
      return;
    }
    setEditRow(null);
    setShowDetails(true);
  };

  const handleEdit = (record: GridEditProps) => {
    setEditRow(record.row);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setEditRow(null);
    cardsRef.current?.reload();
  };

  return (
    <View style={styles.screen}>
      {/* <SafeAreaView style={styles.safeHeader}>
        <View
          style={[
            styles.titleBar,
            Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 12 } : null,
          ]}
        >
          <Text style={styles.titleText}>Loss Entry</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack?.()}
          >
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView> */}

      <View style={styles.headerBlock}>
        <FunctionalLocationView
          flid={flid}
          visible={true}
          validate={{ isCell: true }}
          onSelect={handleLocationSelect}
        />
        <Text style={styles.jhHint}>
          JH <Text style={styles.star}>*</Text>
          {jhSelected ? ' selected' : ' — select Functional Location down to JH'}
        </Text>

        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <DatePicker
              label="Date"
              value={entryDate}
              onChange={d => {
                setEntryDate(d);
                setHour('');
              }}
            />
          </View>
          <View style={styles.filterField}>
            <AppDropdown
              key={`shift-${sbuId || 'no-sbu'}`}
              label="Shift"
              manditory={true}
              value={shift}
              endpoint="commonFilter/Shift"
              params={{ factoryId: sbuId }}
              onChange={value => {
                setShift(value);
                setHour('');
              }}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.hourField}>
            <AppDropdown
              label="Hour"
              manditory={true}
              value={hour}
              endpoint=""
              dataset={hourOptions}
              onChange={setHour}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openFreshDetails}>
            <MaterialIcons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {conditionParams == null ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-note" size={48} color="#0D5DB8" />
          <Text style={styles.emptyTitle}>Select JH, shift and hour</Text>
          <Text style={styles.emptyText}>
            Loss entry cards load after Functional Location (JH), Date, Shift and Hour are selected.
            Tap + to add a new loss.
          </Text>
        </View>
      ) : (
        <Cards
          key={`${flid}-${cellid}-${shift}-${hour}-${formatCondDate(entryDate)}`}
          procedureName="pcs_fn_lossentrygrid_rn_sb"
          isEdit={true}
          onEdit={handleEdit}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}

      <LossDetails
        visible={showDetails}
        hour={hour}
        entry={entryContext}
        editRow={editRow}
        onClose={closeDetails}
        onSaved={closeDetails}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EAF6FB',
  },
  safeHeader: {
    backgroundColor: '#0D5DB8',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  jhHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  star: {
    color: '#DC2626',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  filterField: {
    flex: 1,
    marginRight: 8,
  },
  hourField: {
    flex: 1,
    marginRight: 8,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0D5DB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default PcsLossEntryStandalone;