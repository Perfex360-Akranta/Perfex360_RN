import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import  MaterialIcons  from '@react-native-vector-icons/material-icons';
import { useGrid } from '../../context/GridProvider';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import { getCurrentShift } from '../../services/api/authApi';

type CardItem = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  colors: [string, string];
  screen: string;
};

const cards : CardItem[] = [
  {
    title: 'DASHBOARD',
    subtitle: 'View Dashboard',
    icon: 'analytics',
    colors: ['#00B4DB', '#36D1DC'],
    screen: 'dashboard',
  },
  {
    title: 'IDENTIFICATION',
    subtitle: 'Create or identify a new abnormality',
    icon: 'search',
    colors: ['#2F80ED', '#56CCF2'],
    screen: 'AbnForm',
  },
  // {
  //   title: 'MODIFICATION',
  //   subtitle: 'View pending abnormalities',
  //   icon: 'build',
  //   colors: ['#F2994A', '#F2C94C'],
  //   screen: 'Modification',
  // },
  {
    title: 'ALLOCATION',
    subtitle: 'Allocate responsibility',
    icon: 'groups',
    colors: ['#27AE60', '#6FCF97'],
    screen: 'AbnAllocation',
  },
  {
    title: 'COMPLETION',
    subtitle: 'Complete action',
    icon: 'check-circle',
    colors: ['#8E44AD', '#D980FA'],
    screen: 'AbnComp',
  },
  {
    title: 'Abnormality View',
    subtitle: 'View  abnormalities',
    icon: 'visibility',
    colors: ['#F2994A', '#F2C94C'],
    screen: 'AbnView',
  },
  {
    title: 'SUGGESTION',
    subtitle: 'Raise a Kaizen suggestion',
    icon: 'lightbulb',
    colors: ['#fa0120', '#f6e6e4'],
    screen: 'Suggestion',
  },
  {
    title: 'SUGGESTION MODIFICATION',
    subtitle: 'Modify a submitted suggestion',
    icon: 'edit',
    colors: ['#e03c18', '#f1f4f7'],
    screen: 'SuggestionModification',
  },

  {
    title: 'SUGGESTION VIEW',
    subtitle: 'View submitted suggestions',
    icon: 'visibility',
    colors: ['#d15455', '#fef3ef'],
    screen: 'SuggestionView',
  },

  {
    title: 'SUGGESTION ACCEPT/REJECT',
    subtitle: 'Accept or reject pending suggestions',
    icon: 'fact-check',
    colors: ['#38e74e', '#e1fbdf'],
    screen: 'SuggestionAcceptReject',
  },
  
  // {
  //   title: 'MULTIPLE',
  //   subtitle: 'Create multiple abnormalities',
  //   icon: 'dashboard',
  //   colors: ['#FF4DB8', '#FF9FF3'],
  //   screen: 'Multiple',
  // },
  
];

export default function HomeScreen({navigation}: any) {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [shift, setShift] = useState('');
  const { currentUser, currentRole} = useGrid();

  const loadShift = async () => {
      try {
        const result = await getCurrentShift();
        setShift(result);
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      loadShift();
    }, []);
    

  return (
    <View style={styles.container}>

      {/* <LinearGradient
        colors={['#0D5DB8', '#4EA3F1']}
        style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }>
          <MaterialIcons
            name="menu"
            size={30}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.logo}>PERFEX</Text>

        <View style={{flexDirection:'row'}}>

          <TouchableOpacity>

            <MaterialIcons
              name="notifications"
              size={24}
              color="white"
            />

          </TouchableOpacity>

          <TouchableOpacity style={{marginLeft:15}}>

            <MaterialIcons
              name="account-circle"
              size={30}
              color="white"
            />

          </TouchableOpacity>

        </View>

      </LinearGradient> */}

      <ScrollView>

        <View style={styles.welcomeCard}>

          <Text style={styles.user}>
            Welcome
          </Text>

          <Text style={styles.company}>
            {currentUser.userName}
          </Text>

          <Text style={styles.company}>
            {currentRole.roleName} - {currentRole.fnlnDescription}
          </Text>

        </View>

        <View style={styles.filterCard}>

          {/* <Text style={styles.label}>
            Functional Location
          </Text>

          <TouchableOpacity style={styles.dropdown}>

            <Text>Company / Plant</Text>

          </TouchableOpacity> */}

          <View style={styles.row}>

            <DatePicker
        label="Date"
       disable={true}
        value={date}
      />

            <View style={styles.shift}>

             
              <AppDropdown
  label="Shift"
  disable={true}
  //data={employeeList}
  value={shift}
  endpoint="commonFilter/Shift"
  onChange={(value:any)=> setShift(value)}
/>

            </View>

          </View>

        </View>

        

        <View style={styles.grid}>

          {cards.map(item=>

            <TouchableOpacity
              key={item.title}
              onPress={()=>navigation.navigate(item.screen)}
              activeOpacity={0.9}>

              <LinearGradient
                colors={item.colors}
                style={styles.card}>

                <MaterialIcons
                  name={item.icon}
                  color="white"
                  size={36}
                />

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Text style={styles.cardSub}>
                  {item.subtitle}
                </Text>

              </LinearGradient>

            </TouchableOpacity>

          )}

        </View>

      </ScrollView>

    </View>
  );
}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:'#EAF5FF'
},

header:{
height:65,
paddingHorizontal:15,
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center'
},

logo:{
fontSize:24,
fontWeight:'bold',
color:'white'
},

welcomeCard:{
margin:15,
backgroundColor:'white',
padding:15,
borderRadius:12,
elevation:4
},

user:{
fontSize:18,
fontWeight:'700'
},

company:{
color:'#666',
marginTop:4
},

filterCard:{
marginHorizontal:15,
backgroundColor:'white',
borderRadius:12,
padding:15,
elevation:4
},

label:{
fontWeight:'700'
},

dropdown:{
marginTop:8,
borderWidth:1,
borderColor:'#ddd',
borderRadius:8,
padding:12
},

row:{
flexDirection:'row',
marginTop:15
},

date:{
flex:1,
borderWidth:1,
borderColor:'#ddd',
padding:12,
borderRadius:8,
marginRight:8
},

shift:{
flex:1,
//borderWidth:1,
//borderColor:'#ddd',
//borderRadius:8
},

grid:{
padding:15
},

card:{
borderRadius:18,
padding:20,
marginBottom:18
},

cardTitle:{
fontSize:20,
fontWeight:'700',
color:'white',
marginTop:10
},

cardSub:{
color:'white',
marginTop:6,
fontSize:14
}

});