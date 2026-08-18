
import React, {useState, useRef,useEffect} from 'react';
import {View,TouchableOpacity,StyleSheet} from 'react-native';
import  MaterialIcons  from '@react-native-vector-icons/material-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import DashboardFilter from './DashboardFilter';

type HomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface DashboardParams {
    flid :string;
    fromDate : Date ;
    toDate : Date ;
}

interface FooterProps {
  filter: DashboardParams;
  onFilterChange?: (DashboardParams: DashboardParams) => void;
  onRefresh?: () => void;
}

export default function DashboardFooter({
  filter,
  onFilterChange,
  onRefresh,
}: FooterProps){

  const [showGridFilters, setShowGridFilters] = useState(false);
    

 return(
<View style={styles.footer}>



<TouchableOpacity
onPress={()=> setShowGridFilters(true)}
style={styles.filterButton}
>
<MaterialIcons name="filter-alt" size={24} color="#2E7D32" />
</TouchableOpacity>
 
{showGridFilters && (
 <DashboardFilter  data={filter}  onSelect={(filter: DashboardParams) => {
  onFilterChange?.(filter);
 }}
visible={showGridFilters}   onClose={() => setShowGridFilters(false)}  
/> 
)}


<TouchableOpacity  style={styles.refreshButton}>
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