//import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
   TouchableOpacity,
} from 'react-native';
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

import { functionCall } from '../../services/api/functionCallApi';
import Footer from './footer';
import { DynamicGridProps, GridFilterProps } from '../../types/GridFilters';
import { Column } from '../../types/GridFilters';
import { useGrid } from '../../context/GridProvider';


interface ApiRow {
  [key: string]: any;
}


// const DynamicCards: React.FC<DynamicGridWrapperProps> = ({
//   procedureName,
//   conditionParams = {},
//   commonParams = {},
//   footer,
//   onRowPress,
//   isEdit = false,
//   onEdit,
// }) => {

  const Cards = forwardRef(({
  procedureName,
  conditionParams = {},
  commonParams = {},
  footer,
  onRowPress,
  isEdit = false,
  onEdit,
}:DynamicGridProps,ref) => {


   

 const [flid, setFlid] = useState("FNL000000001");
  const [data, setData] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metaRow, setMetaRow] = useState<any>({});
const [headerRow, setHeaderRow] = useState<any>({});
const [columns, setColumns] = useState<Column[]>([]);



const toMonth = new Date();

    const fromMonth = new Date();
    fromMonth.setMonth(fromMonth.getMonth() - 1);

    const { filter, setFilter, currentUser, currentRole } = useGrid(); 

// const [filter, setFilter] = useState<GridFilterProps>({
//     flid : "FNL000000001",
//     fromDate: new Date(1801, 0, 1),
//   toDate: new Date(2100, 11, 31),
//   fromMonth: fromMonth,// new Date(2026, 5, 1), // Jun = 5
//   toMonth: toMonth ,// new Date(2026, 6, 1),   // Jul = 6
//     monthWise:'Y',
//     columnFilters:[],
//     conditionParams:conditionParams
// });

const formatDate = (date: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${String(date.getDate()).padStart(
      2,
      '0',
    )}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  const formatMonth = (date: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${months[date.getMonth()]}-${date.getFullYear()}`;
  };


  

  useEffect(() => {
  setFilter(prev => ({
    ...prev,
    flid: currentRole.flid ?? '',
    fromDate: new Date(1801, 0, 1),
    toDate: new Date(2100, 11, 31),
    fromMonth:fromMonth,
    toMonth:toMonth,
    monthWise: 'Y',
    columnFilters:[],
    conditionParams:conditionParams,
    reload: new Date(),
  }));

  //loadData();

}, []);

useEffect(() => {
    loadData();
  }, [filter.reload]);

// useEffect(() => {
//   console.log("Footer Mounted");

//   return () => {
//     console.log("Footer Unmounted");
//   };
// }, []);




  useImperativeHandle(ref, () => ({
      reload: () => {
        loadData();
      },
    }));

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

const buildGridFilter = () => {

    if (!filter.columnFilters?.length) {
        return "";
    }

    return filter.columnFilters
        .map(f => {

            switch (f.condition) {

                case "Contains":
                    return ` AND ${f.columnKey} LIKE '%${f.value}%'`;

                case "Equals":
                    return ` AND ${f.columnKey}='${f.value}'`;

                case "Starts With":
                    return ` AND ${f.columnKey} LIKE '${f.value}%'`;

                case "Ends With":
                    return ` AND  ${f.columnKey} LIKE '%${f.value}'`;

                case ">":
                    return ` AND  ${f.columnKey}>${f.value}`;

                case "<":
                    return ` AND ${f.columnKey}<${f.value}`;

                default:
                    return "";
            }

        })
        .filter(Boolean)
        .join(" ");

};

const buildConditionParam = (): string => {
  const params: string[] = [];
 if(filter.flid){
    params.push('FLID='+filter.flid);
 }
  

  params.push('FROMDATE='+ formatDate(filter.fromDate ?? new Date(1801, 0, 1)));
  params.push('TODATE='+ formatDate(filter.toDate ?? new Date(2100, 11, 31)));
  params.push('FROMMONTH='+ formatMonth(filter.fromMonth ?? new Date(1801, 0, 1)));
  params.push('TOMONTH='+ formatMonth(filter.toMonth ?? new Date(2100, 11, 31)));
  params.push('ISMONTHWISE='+filter.monthWise);


  Object.entries(conditionParams).forEach(([key, value]) => {
  params.push(`${key}=${value ?? ''}`);
});

  return params.join(';') + ';';
};

const buildCommonParam = (): string => {
//   const fromRow = (currentPage - 1) * pageSize + 1;
//   const toRow = currentPage * pageSize;

  const params: string[] = [];

  params.push('FILTERCOND=');
  params.push('ISTOTALCNT=Y');
  params.push(`FROMTOROW=1 AND 100`);
  params.push(`GRIDFILTER=${buildGridFilter()}`);
  params.push('ISGETCOL=N');

  return params.join(';') + ';';
};

  const loadData = async () => {
    try {

        const request = {
      vconditionparam: buildConditionParam(),
      vcommonparam: buildCommonParam(),
    };
      const response = await functionCall(procedureName,request)

      // If API returns array directly
      //setData(response);
         console.log('Response', response);

    //setData(response.cur || []);

    const rows = response.cur || [];

if (rows.length >= 2) {
  setMetaRow(rows[0]);
  setHeaderRow(rows[1]);
 const cols: Column[] = Object.keys(rows[0])
    .filter(key => {
      const meta = parseMeta(rows[0][key]);
      return meta.HD !== 'T';
    })
    .map(key => {
      const meta = parseMeta(rows[0][key]);

      return {
        key:meta.IND,
        label: rows[1][key] || key,
        type: meta.DT || 'TEXT',
      };
    });

  setColumns(cols);

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

    if (meta.MT === 'TRUE') {
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
<View style={isEdit ? styles.buttonContainer : ''}>

  {isEdit && (
<TouchableOpacity
          onPress={() =>
        onEdit?.(
            item,
            metaRow,
            headerRow
        )
    }
          style={styles.editBtn}>
          <Text style={styles.editText}>
             Edit
          </Text>
        </TouchableOpacity> )}
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
    </View>
  );
};

  // const renderCard = ({ item }: { item: ApiRow }) => {
  //   return (
  //     <View style={styles.card}>
  //       {Object.entries(item).map(([key, value]) => (
  //         <View style={styles.row} key={key}>
  //           <Text style={styles.label}>
  //             {key.replace(/_/g, ' ').toUpperCase()}
  //           </Text>

  //           <Text style={styles.value}>
  //             {value !== null && value !== undefined
  //               ? String(value)
  //               : '-'}
  //           </Text>
  //         </View>
  //       ))}
  //     </View>
  //   );
  // };

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
 <Footer  columns={columns} />
    </View>
  );
});

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

  buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
editBtn: {
  backgroundColor: '#007AFF',
  paddingHorizontal: 15,
  paddingVertical: 8,
  borderRadius: 5,
},

editText: {
  color: '#fff',
  fontWeight: 'bold',
},

  EditBtn: {
  marginTop: 10,
  alignSelf: 'flex-start',
},
  viewMoreBtn: {
  marginTop: 10,
  alignSelf: 'flex-end',
},

viewMoreText: {
  color: '#007AFF',
  fontWeight: 'bold',
},
EditText: {
  color: '#007AFF',
  fontWeight: 'bold',
},
});

export default Cards;