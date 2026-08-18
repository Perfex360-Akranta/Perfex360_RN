//import React from 'react';
import React, {useState, useRef,useEffect} from 'react';
import {View,TouchableOpacity,StyleSheet} from 'react-native';
//import Icon from 'react-native-vector-icons/MaterialIcons';
import  MaterialIcons  from '@react-native-vector-icons/material-icons';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//import {useNavigation} from '@react-navigation/native';

//import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
//import Ionicons from '@react-native-vector-icons/ionicons';

import GridFilters from './GridFilters';


import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useGrid } from '../../context/GridProvider';
type HomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface FooterProps {
  //filter: GridFilterProps;
  columns : any[];
  // onLocationChange?: (result: any) => void;

  // onFilterChange?: (gridFilter: GridFilterProps) => void;

  // onRefresh?: () => void;
}

export default function Footer({
  //filter,
  columns,
  // onLocationChange,
  // onFilterChange,
  // onRefresh,
}: FooterProps){

  const { filter, setFilter } = useGrid(); 

    const [showGridFilters, setShowGridFilters] = useState(false);
    
 const navigation = useNavigation<HomeNavigationProp>();


const Refresh = ( ) => {
    let updateFilter ={ ... filter,
      columnFilters:[],
      reload: new Date(),};
      setFilter(updateFilter);
  };

 return(
<View style={styles.footer}>



<TouchableOpacity
onPress={()=> setShowGridFilters(true)}
style={styles.dateButton}
>
<MaterialIcons name="calendar-month" size={24} color="#1565C0" />
</TouchableOpacity>
{/* <GridFilters  
visible={showGridFilters} onClose={() => setShowGridFilters(false)}  
/> */}
{showGridFilters && (
  <GridFilters
    visible={showGridFilters}
    onClose={() => setShowGridFilters(false)}
  />
)}


  <TouchableOpacity
onPress={()=> navigation.navigate('ColumnFilter', {
  columns: columns,
  savedFilter:undefined,
})}
//style={styles.filterButton}
style={[
    styles.filterButton,
    (filter.columnFilters?.length ?? 0) > 0 && styles.filterActive
]}
>
<MaterialIcons name="filter-alt" size={24} color={(filter.columnFilters?.length ?? 0) > 0 ? "#EF6C00" : "#2E7D32" } />
</TouchableOpacity>  

{/* <TouchableOpacity style={styles.filterButton}>
<MaterialIcons name="filter-list" size={24} color="#2E7D32" />
</TouchableOpacity> */}

<TouchableOpacity style={styles.sortButton}>
<MaterialIcons name="sort" size={24} color="#8E24AA" />
</TouchableOpacity>

<TouchableOpacity onPress={Refresh} style={styles.refreshButton}>
<MaterialIcons name="refresh" size={24} color="#009688"/>
</TouchableOpacity>

</View>
 )
}

const styles=StyleSheet.create({

footer:{
height:60,
backgroundColor:'#fff',
flexDirection:'row',
justifyContent:'space-around',
alignItems:'center',
elevation:8,
},

 dateButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#D0E2FF',
    elevation: 4,
  },

  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    elevation: 4,
  },

  advancedButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    elevation: 4,
  },

   sortButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E1BEE7',
    elevation: 4,
  },

  refreshButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#B2EBF2',
    elevation: 4,
  },

  filterActive:{
    backgroundColor:'#FFF3E0',
    borderColor:'#FB8C00',
}

});