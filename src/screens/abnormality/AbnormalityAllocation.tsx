import React, { useEffect, useState , useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
   TouchableOpacity,
} from 'react-native';


import Cards from '../../components/grid/Cards';
import AbnormalityAllocationModel from '../../components/model/AbnormalityAllocationModel';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';
export interface EditModel {
  keyid: string;
  responsibleid?: string;
  tradeid?: string;
  effectivedate?: Date | null;
}


const AbnormalityAllocation: React.FC = () => {
  
  
const { currentUser, currentRole} = useGrid();
  const [showAbnCompletion, setShowAbnCompletion] = useState<boolean>(false);
  const cardsRef = useRef<any>(null);
// const userDetails =  getUser();

const [editData, setEditData] = useState<EditModel>({
  keyid:  '',
  responsibleid: '',
  tradeid :'',
  effectivedate: new Date(),
});

const parseDate = (dateStr: string): Date => {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const [day, month, year] = dateStr.split('-');

  return new Date(Number(year), months[month], Number(day));
};

const handleEdit = (record : GridEditProps) => {
 const row = record.row;
console.log(row);
    let updatedForm = { ...editData };
  setEditData({
    keyid: row.abnno,
    responsibleid: row.empid == '{}' ? '' : row.empid,
    tradeid: row.tradeid == '{}' ? '' : row.tradeid,
    effectivedate: row.effdt
      ? parseDate(row.effdt)
      : new Date()
  });

  setShowAbnCompletion(true);
};


  return (
    <View style={{ flex: 1 }}>
      <Cards 
      procedureName='abn_fn_allocation_rn_sb' 
      isEdit={true} 
      onEdit={handleEdit} 
      ref={cardsRef} 
      conditionParams={{
    DRILLFLAG: '',
    ELEMENTID: 'CMP0000001',
    ROLELEVELNO:currentRole.roleLevel,
    STATUS: 'P',
    ABNVIEWTYPE: 'I',
    RESPONSIBILITY: currentUser.employeeId,
    DETECTEDBY: currentUser.employeeId,
    EXCEL: 'NOEXCEL',
    STATUSNEW: 'P',
  }} />
      <AbnormalityAllocationModel
            record = {editData}
            visible={showAbnCompletion}
            onClose={() => setShowAbnCompletion(false)}
            onSelect={() => {
              cardsRef.current?.reload();
              setShowAbnCompletion(false);
            }}
            
          />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },

  label: {
    width: 130,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },

  value: {
    flex: 1,
    fontSize: 12,
    color: '#555',
  },
  viewMoreBtn: {
  marginTop: 10,
  alignSelf: 'flex-end',
},

viewMoreText: {
  color: '#007AFF',
  fontWeight: 'bold',
},
});

export default AbnormalityAllocation;