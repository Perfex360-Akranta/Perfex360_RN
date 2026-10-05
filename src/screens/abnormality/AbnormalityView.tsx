import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Cards from '../../components/grid/Cards';
import { CardFormatMethod } from '../../types/GridFilters';



const AbnormalityView: React.FC = () => {
  
  //const [loading, setLoading] = useState<boolean>(true);
 
const formatAbnField: CardFormatMethod = (
  key,
  value,
  item
) => {
 
  if (key.toUpperCase() === 'TAGNO') {
    if (String(item['TAGCLASS'.toLowerCase()]).toUpperCase() === 'RED') {
      
        return {
          textColor: '#B91C1C',
        };
    }
  }

  if (key.toLowerCase() === 'detecteddate') {
    if (String(item['STATUS'.toLowerCase()]).toUpperCase() === 'COMPLETED') {
      
        return {
          textColor: '#007AFF',
        };
    }
  }

  // No special formatting; use the default display
  return undefined;
};


  return (
    <View style={{ flex: 1 }}>
      <Cards  procedureName='abn_fn_abnormalityview_rn_sb' formatField={formatAbnField} />
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

export default AbnormalityView;