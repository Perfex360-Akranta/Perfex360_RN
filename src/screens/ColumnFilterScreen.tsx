import React, { useState , useRef , useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView 
} from 'react-native';

import { useNavigation, useRoute ,useFocusEffect } from '@react-navigation/native';
//import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useGrid } from '../context/GridProvider';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ColumnFilter {
  id: number;
  columnKey: string;
  columnName: string;
  columnType: string;
  condition: string;
  value: string;
}



type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ColumnFilter'
>;


export default function ColumnFilterScreen() {

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();

  const { filter, setFilter } = useGrid(); 


  const columns = route.params?.columns || [];




const savedFilter = route.params?.savedFilter;
   const [filters, setFilters] = useState<ColumnFilter[]>(filter.columnFilters || []);
    //const filters = filter.columnFilters ?? [];


useFocusEffect(
  React.useCallback(() => {
    if (savedFilter) {
      setFilters(prev => {
        const index = prev.findIndex(x => x.id === savedFilter.id);

        if (index >= 0) {
          const list = [...prev];
          list[index] = savedFilter;
          return list;
        }

        return [
          ...prev,
          {
            ...savedFilter,
          },
        ];
      });

      navigation.setParams({
        savedFilter: undefined,
      });
    }
  }, [savedFilter])
);

useEffect(() => {
    console.log("ColumnFilter Mounted");

    return () => {
        console.log("ColumnFilter Unmounted");
    };
}, []);

useEffect(() => {
    console.log("Route params 1", route.params);
}, [route.params]);



  const addFilter = () => {
console.log("Add clicked");
    navigation.navigate('AddColumnFilter', {

      columns,

      onSave: (filter: ColumnFilter) => {

        setFilters(prev => [

          ...prev,

          {
            ...filter,
            //id: Date.now(),
          },

        ]);

      },
     });

  };

  const editFilter = (item: ColumnFilter) => {
  console.log("edit clicked");
  try {
    navigation.navigate('AddColumnFilter', {

      columns,

      filter: item,
      
       onSave: (filter: ColumnFilter) => {

        setFilters(prev =>
          prev.map(x =>
            x.id === item.id
              ? {
                  ...filter,
                  id: item.id,
                }
              : x,
          ),
        );

      },

    });

      console.log("Navigation success");
    } catch (e) {
        console.log("Navigation error", e);
    }

  };

  const deleteFilter = (id: number) => {
console.log("Delete clicked");
    Alert.alert(
      'Delete Filter',
      'Do you want to delete this filter?',
      [
        {
          text: 'No',
        },
        {
          text: 'Yes',
          onPress: () => {

          setFilters(prev =>
              prev.filter(x => x.id !== id),
            ); 
  //           setFilter({
  //   ...filter,
  //   columnFilters: filter.columnFilters?.filter(x => x.id !== id),
  // });

          },
        },
      ],
    );

  };



  const applyFilter = () => {
//console.log("Apply clicked");

  let updatedFilter = { ...filter, columnFilters:filters , reload:new Date() };
   setFilter(updatedFilter); 
navigation.goBack();
  };



  const clearAll = () => {

    setFilters([]);
  // setFilter(prev => ({
  //       ...prev,
  //       columnFilters: [],
  //   }));
};



  const CardItem = ({ item }: { item: ColumnFilter }) => (

    <View style={styles.card}>

      <View 
     style={{ flex: 1 }}
      >

        <Text style={styles.column}>
          {item.columnName}
        </Text>

        <Text style={styles.condition}>
          {item.condition}
        </Text>

        <Text style={styles.value}>
          {item.value}
        </Text>

      </View>

      <TouchableOpacity
        onPress={() => editFilter(item)}
      >

        <MaterialIcons
          name="edit"
          color="#2196F3"
          size={24}
        />

      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginLeft: 15 }}
        onPress={() => deleteFilter(item.id)}
      >

        <MaterialIcons
          name="delete"
          color="red"
          size={24}
        />

      </TouchableOpacity>

    </View>

  );

  return (

    <View 
    style={styles.container} 
       >

      <View  
   
 >
      <TouchableOpacity
        style={styles.addButton}
        onPress={addFilter}
      >

        <MaterialIcons
          name="add"
          color="#fff"
          size={25}
        />

        <Text style={styles.buttonText}>
          Add Filter
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearAll}
      >

        <Text style={styles.buttonText}>
          Clear All
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={applyFilter}
      >

        <Text style={styles.buttonText}>
          Apply
        </Text>

      </TouchableOpacity>
</View>

 {/* <View style={{ flex: 1 }}> 
       <FlatList
      //ref={flatListRef}
      scrollEnabled={true}
      //  style={{ borderWidth: 2,
      //   borderColor: 'red',  backgroundColor: 'yellow', }}
        data={filters}

        //renderItem={renderItem}
       // renderItem={({ item }) => <CardItem item={item} />}
//         renderItem={({ item }) => (
//     <Text>{item.columnName}</Text>
// )}

renderItem={({ item }) => (
    <View
        style={{
            height: 60,
            backgroundColor: 'white',
            margin: 10,
        }}
    >
        <Text>{item.columnName}</Text>
    </View>
)}
//keyExtractor={(_, index) => index.toString()}
        keyExtractor={item => item.id.toString()}

        contentContainerStyle={{ paddingBottom: 220 }}

        ListEmptyComponent={() => (

          <View style={styles.empty}>

            <Text>No Filters Added</Text>

          </View>

        )}

      /> 
 </View>  */}

 <ScrollView>
  {filters?.map(item => (
    <CardItem
      key={item.id}
      item={item}
    />
  ))}
</ScrollView>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#F5F5F5',

    padding: 15,

  },

  card: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#fff',
    //backgroundColor: 'yellow',

    marginBottom: 10,

    padding: 15,

    borderRadius: 8,

    elevation: 2,

  },

  column: {

    fontWeight: 'bold',

    fontSize: 16,

  },

  condition: {

    color: '#777',

    marginTop: 5,

  },

  value: {

    color: '#333',

    marginTop: 5,

  },

  empty: {

    alignItems: 'center',

    marginTop: 80,

  },

  addButton: {

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#2196F3',

    padding: 15,

    borderRadius: 8,

    marginTop: 10,

  },

  clearButton: {

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#FF9800',

    padding: 15,

    borderRadius: 8,

    marginTop: 10,

  },

  applyButton: {

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#4CAF50',

    padding: 15,

    borderRadius: 8,

    marginTop: 10,

  },

  buttonText: {

    color: '#fff',

    fontWeight: 'bold',

    marginLeft: 5,

  },

});