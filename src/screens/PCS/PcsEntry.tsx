import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';

import FunctionalLocationView from '../../components/FunctionLocation/FunctionalLocationView';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';
import PcsProduction, { PcsEntryContext } from './PcsProduction';

const formatCondDate = (date: Date) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

const PcsEntry: React.FC = () => {
  const { currentRole, setFilter } = useGrid();
  const cardsRef = useRef<any>(null);

  const [flid, setFlid] = useState(currentRole?.flid ?? '');
  const [elementid, setElementid] = useState('');
  const [cellid, setCellid] = useState('');
  const [sectionid, setSectionid] = useState('');
  const [machineid, setMachineid] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());
  const [shift, setShift] = useState('');
  const [showProduction, setShowProduction] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const jhSelected = Boolean(cellid);

  const conditionParams = useMemo(() => {
    if (!jhSelected || !shift) {
      return null;
    }
    return {
      FLID: flid,
      CELLID: cellid,
      SHIFT: shift,
      ENTRYDATE: formatCondDate(entryDate),
      FROMDATE: formatCondDate(entryDate),
      TODATE: formatCondDate(entryDate),
    };
  }, [jhSelected, flid, cellid, shift, entryDate]);

  const entryContext: PcsEntryContext = {
    flid,
    elementid,
    cellid,
    sectionid,
    machineid,
    shift,
    entryDate,
  };

  const handleLocationSelect = (result: any) => {
    const nextFlid = String(result?.flid ?? '');
    const nextCell = String(result?.cellId ?? '');
    setFlid(nextFlid);
    setElementid(String(result?.elementId ?? ''));
    setCellid(nextCell);
    setSectionid(String(result?.sectionId ?? ''));
    setMachineid(String(result?.machineId ?? ''));
    if (nextFlid) {
      setFilter(prev => ({ ...prev, flid: nextFlid }));
    }
  };

  const openFreshProduction = () => {
    if (!jhSelected) {
      Alert.alert('JH is required', 'Select Functional Location down to JH before adding an entry.');
      return;
    }
    if (!shift) {
      Alert.alert('Missing field', 'Select a Shift.');
      return;
    }
    setEditRow(null);
    setShowProduction(true);
  };

  const handleEdit = (record: GridEditProps) => {
    setEditRow(record.row);
    setShowProduction(true);
  };

  const closeProduction = () => {
    setShowProduction(false);
    setEditRow(null);
    cardsRef.current?.reload();
  };

  return (
    <View style={styles.container}>
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
              onChange={setEntryDate}
            />
          </View>
          <View style={styles.filterField}>
            <AppDropdown
              label="Shift"
              manditory={true}
              value={shift}
              endpoint="commonFilter/Shift"
              onChange={setShift}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openFreshProduction}>
            <MaterialIcons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {conditionParams == null ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="precision-manufacturing" size={48} color="#0D5DB8" />
          <Text style={styles.emptyTitle}>Select JH, date and shift</Text>
          <Text style={styles.emptyText}>
            PCS production cards load after Functional Location (JH), Date and Shift are selected.
          </Text>
        </View>
      ) : (
        <Cards
          key={`${flid}-${cellid}-${shift}-${formatCondDate(entryDate)}`}
          procedureName="pcs_fn_pcsentry_rn_sb"
          isEdit={true}
          onEdit={handleEdit}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}

      <Modal
        visible={showProduction}
        animationType="slide"
        onRequestClose={closeProduction}
      >
        <View style={styles.productionWrap}>
          <View style={styles.productionHeader}>
            <Text style={styles.productionTitle}>
              {editRow ? 'Edit Production' : 'New Production'}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={closeProduction}>
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <PcsProduction
            entry={entryContext}
            editRow={editRow}
            onClose={closeProduction}
            onSaved={closeProduction}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  productionWrap: {
    flex: 1,
    backgroundColor: '#EAF6FB',
  },
  productionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D5DB8',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  productionTitle: {
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
});

export default PcsEntry;
