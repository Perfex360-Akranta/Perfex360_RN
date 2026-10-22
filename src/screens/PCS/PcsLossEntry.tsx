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

import AppDropdown from '../../components/forms/AppDropdown';
import Cards from '../../components/grid/Cards';
import { GridEditProps } from '../../types/GridFilters';
import LossDetails from './LossDetails';

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i + 1);
  return { label: hour, value: hour };
});

export type PcsLossEntryContext = {
  flid: string;
  elementid: string;
  cellid: string;
  sectionid: string;
  machineid: string;
  shift: string;
  entryDate: Date;
};

const formatCondDate = (date?: Date) => {
  const value = date ?? new Date();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${String(value.getDate()).padStart(2, '0')}-${months[value.getMonth()]}-${value.getFullYear()}`;
};

export type PcsLossEntryProps = {
  hour?: string;
  entry?: PcsLossEntryContext;
  onClose?: () => void;
};

const PcsLossEntry: React.FC<PcsLossEntryProps> = ({
  hour: hourProp,
  entry,
  onClose,
}) => {
  const cardsRef = useRef<any>(null);
  const [hour, setHour] = useState(hourProp ?? '');
  const [showDetails, setShowDetails] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  useEffect(() => {
    setHour(hourProp ?? '');
  }, [hourProp]);

  const conditionParams = useMemo(() => {
    if (!hour) {
      return null;
    }
    return {
      FLID: entry?.flid ?? '',
      CELLID: entry?.cellid ?? '',
      SHIFT: entry?.shift ?? '',
      HOUR: hour,
      ENTRYDATE: formatCondDate(entry?.entryDate),
      FROMDATE: formatCondDate(entry?.entryDate),
      TODATE: formatCondDate(entry?.entryDate),
    };
  }, [hour, entry?.flid, entry?.cellid, entry?.shift, entry?.entryDate]);

  const openFreshDetails = () => {
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
      <SafeAreaView style={styles.safeHeader}>
        <View
          style={[
            styles.titleBar,
            Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 12 } : null,
          ]}
        >
          <Text style={styles.titleText}>Loss Entry</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.filterRow}>
        <View style={styles.hourField}>
          <AppDropdown
            label="Hour"
            manditory={true}
            value={hour}
            endpoint=""
            dataset={HOUR_OPTIONS}
            onChange={setHour}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openFreshDetails}>
          <MaterialIcons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {conditionParams == null ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-note" size={48} color="#0D5DB8" />
          <Text style={styles.emptyTitle}>Select Hour</Text>
          <Text style={styles.emptyText}>
            Loss entry cards load after Hour is selected. Tap + to add a new loss.
          </Text>
        </View>
      ) : (
        <Cards
          key={`${entry?.flid ?? ''}-${hour}`}
          procedureName="pcs_fn_pcslossentry_rn_sb"
          isEdit={true}
          onEdit={handleEdit}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}

      <LossDetails
        visible={showDetails}
        hour={hour}
        entry={entry}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D7EEF8',
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

export default PcsLossEntry;
