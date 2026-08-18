import React, { useEffect, useState , useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
   TouchableOpacity,
} from 'react-native';

import AbnormalityCompletionModel from '../../components/model/AbnomalityComplitionModel';
import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
export interface EditModel {
  keyid: string;
  countermeasure?: string;
  status?: string;
  completedby?: string;
  remarks?: string;
  woendtime?: Date | null;
}


const AbnormalityCompletion: React.FC = () => {
  
  const { currentUser, currentRole} = useGrid();
  const [loading, setLoading] = useState<boolean>(true);

  const [showAbnCompletion, setShowAbnCompletion] = useState<boolean>(false);
  const cardsRef = useRef<any>(null);
// const userDetails =  getUser();

const [editData, setEditData] = useState<EditModel>({
  keyid:  '',
  countermeasure: '',
  status:  '',
  completedby :'',
  remarks:  '',
  woendtime: new Date(),
});



const handleEdit = (
  row: any,
  metaRow: any,
  headerRow: any
) => {

console.log(row);
    let updatedForm = { ...editData };
  setEditData({
    keyid: row.tagno,
    countermeasure: row.countermeasure == '{}' ? '' : row.countermeasure,
    status: 'P',
    //completedby: row.COMPLETEDBY,
    remarks: row.remarks == '{}' ? '' : row.remarks,
    woendtime: row.WOENDTIME
      ? new Date(row.WOENDTIME)
      : new Date()
  });

  setShowAbnCompletion(true);
};


  return (
    <View style={{ flex: 1 }}>
      <Cards 
      procedureName='jhn_fn_getsqlforfillspread_rn1_sb' 
      isEdit={true} 
      onEdit={handleEdit} 
      ref={cardsRef} 
      conditionParams={{
    DRILLFLAG: '',
    ELEMENTID: 'CMP0000001',
    ROLELEVELNO: currentRole.roleLevel,
    STATUS: 'P',
    ABNVIEWTYPE: 'I',
    RESPONSIBILITY: currentUser.employeeId,
    DETECTEDBY: currentUser.employeeId,
    EXCEL: 'NOEXCEL',
    STATUSNEW: 'P',
  }} />
      <AbnormalityCompletionModel
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

export default AbnormalityCompletion;