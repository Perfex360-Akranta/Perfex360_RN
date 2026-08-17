import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
   TouchableOpacity,
} from 'react-native';

import { functionCall } from '../services/FunctionCallService';
import Footer from '../components/forms/footer';

interface ApiRow {
  [key: string]: any;
}

const DynamicCardScreen: React.FC = () => {
  const [data, setData] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metaRow, setMetaRow] = useState<any>({});
const [headerRow, setHeaderRow] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const parseMeta = (metaStr: string) => {
  const result: any = {};

  if (!metaStr) {
    return result;
  }

  metaStr.split('#').forEach(part => {
    const idx = part.indexOf('=');

    if (idx > -1) {
      const key = part.substring(0, idx);
      const value = part.substring(idx + 1);

      result[key] = value;
    }
  });

  return result;
};

//   const buildConditionParam = (): string => {
//   const params: string[] = [];

//   params.push('FLID=FNL000000001');
//   params.push('FROMDATE=01-Jan-1801');
//   params.push('TODATE=31-Dec-2100');
//   params.push('FROMMONTH=Mar-2012');
//   params.push('TOMONTH=Jun-2026');
//   params.push('ISMONTHWISE=Y');
//   params.push('DRILLFLAG=');
//   params.push('ELEMENTID=CMP0000001');
//   params.push('ROLELEVELNO=10000');
//   params.push(`TAGID=${selectedTagClass ?? ''}`);
//   params.push('STATUS=P');
//   params.push('ABNVIEWTYPE=I');
//   params.push('DETECTEDBY=EMP00001');
//   params.push('EXCEL=NOEXCEL');
//   params.push('STATUSNEW=');

//   return params.join(';') + ';';
// };

// const buildCommonParam = (): string => {
//   const fromRow = (currentPage - 1) * pageSize + 1;
//   const toRow = currentPage * pageSize;

//   const params: string[] = [];

//   params.push('FILTERCOND=');
//   params.push('ISTOTALCNT=Y');
//   params.push(`FROMTOROW=${fromRow} AND ${toRow}`);
//   params.push(`GRIDFILTER=${gridFilter ?? ''}`);
//   params.push('ISGETCOL=N');

//   return params.join(';') + ';';
// };

const buildConditionParam = (): string => {
  const params: string[] = [];

  params.push('FLID=FNL000000001');
  params.push('FROMDATE=01-Jan-1801');
  params.push('TODATE=31-Dec-2100');
  params.push('FROMMONTH=Mar-2012');
  params.push('TOMONTH=Jun-2026');
  params.push('ISMONTHWISE=Y');
  params.push('DRILLFLAG=');
  params.push('ELEMENTID=CMP0000001');
  params.push('ROLELEVELNO=10000');
  //params.push(`TAGID=${selectedTagClass ?? ''}`);
  params.push('STATUS=P');
  params.push('ABNVIEWTYPE=I');
  params.push('DETECTEDBY=EMP00001');
  params.push('EXCEL=NOEXCEL');
  params.push('STATUSNEW=');

  return params.join(';') + ';';
};

const buildCommonParam = (): string => {
//   const fromRow = (currentPage - 1) * pageSize + 1;
//   const toRow = currentPage * pageSize;

  const params: string[] = [];

  params.push('FILTERCOND=');
  params.push('ISTOTALCNT=Y');
  params.push(`FROMTOROW=1 AND 100`);
  params.push(`GRIDFILTER=`);
  params.push('ISGETCOL=N');

  return params.join(';') + ';';
};

  const loadData = async () => {
    try {

        const request = {
      vconditionparam: buildConditionParam(),
      vcommonparam: buildCommonParam(),
    };
      const response = await functionCall('jhn_fn_getsqlforfillspread_rn_sb',request)

      // If API returns array directly
      //setData(response);
         console.log('Response', response);

    //setData(response.cur || []);

    const rows = response.cur || [];

if (rows.length >= 2) {
  setMetaRow(rows[0]);
  setHeaderRow(rows[1]);

  setData(rows.slice(3));
}

      // If API returns { rows: [...] }
      // setData(response.data.rows);

    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const CardItem = ({ item }: { item: ApiRow }) => {
  const [expanded, setExpanded] = useState(false);

  const mandatoryFields: string[] = [];
  const moreFields: string[] = [];

  Object.keys(metaRow).forEach(field => {
    const meta = parseMeta(metaRow[field]);

    if (meta.HD === 'T') {
      return;
    }

    if (meta.MD === 'TRUE') {
      mandatoryFields.push(field);
    } else {
      moreFields.push(field);
    }
  });

  return (
    <View style={styles.card}>
      {/* Mandatory Fields */}

      {mandatoryFields.map(field => (
        <View style={styles.row} key={field}>
          <Text style={styles.label}>
            {headerRow[field] || field}
          </Text>

          <Text style={styles.value}>
            {item[field] ?? '-'}
          </Text>
        </View>
      ))}

      {/* View More Fields */}

      {expanded &&
        moreFields.map(field => (
          <View style={styles.row} key={field}>
            <Text style={styles.label}>
              {headerRow[field] || field}
            </Text>

            <Text style={styles.value}>
              {item[field] ?? '-'}
            </Text>
          </View>
        ))}

      {moreFields.length > 0 && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>
            {expanded ? 'View Less' : 'View More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

  const renderCard = ({ item }: { item: ApiRow }) => {
    return (
      <View style={styles.card}>
        {Object.entries(item).map(([key, value]) => (
          <View style={styles.row} key={key}>
            <Text style={styles.label}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </Text>

            <Text style={styles.value}>
              {value !== null && value !== undefined
                ? String(value)
                : '-'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    <FlatList
      data={data}
      //renderItem={renderCard}
      renderItem={({ item }) => <CardItem item={item} />}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContainer}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
    />
 {/* <Footer /> */}
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

export default DynamicCardScreen;