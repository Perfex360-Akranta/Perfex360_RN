import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from '@react-native-vector-icons/material-icons';
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

const cards: CardItem[] = [
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
  {
    title: 'KAIZEN APPROVAL',
    subtitle: 'View pending approvals',
    icon: 'approval',
    colors: ['#6787d1ff', '#e7ebf3ff'],
    screen: 'KaizenApproval',
  },
  // {
  //   title: 'QR CODE SCANNER',
  //   subtitle: 'Scan a QR code to fetch ID',
  //   icon: 'qr-code-scanner',
  //   colors: ['#1A2980', '#26D0CE'],
  //   screen: 'QrCodeScanner',
  // },
  // {
  //   title: 'QR IDS',
  //   subtitle: 'Scan and manage multiple QR IDs',
  //   icon: 'list',
  //   colors: ['#0F2027', '#2C5364'],
  //   screen: 'QrIds',
  // },
  {
    title: 'WORK ORDER',
    subtitle: 'List of Work Orders',
    icon: 'work-outline',
    colors: ['#0F2027', '#2C5364'],
    screen: 'WorkOrderList',
  },

  {
    title: 'BREAKDOWN Booking',
    subtitle: 'Create a Breakdown Entry',
    icon: 'warning-amber',
    colors: ['#ff334aff', '#f7e3e7ff'],
    screen: 'BreakdownEntry',
  },
  {
    title: 'BREAKDOWN ALLOCATION',
    subtitle: 'Breakdown Allocation',
    icon: 'task', 
    colors: ['#69ff33ff', '#e7e4f7ff'],
    screen: 'BreakdownAllocation',
  },
  {
    title: 'BREAKDOWN COMPLETION',
    subtitle: 'Breakdown Completion',
    icon: 'done', 
    colors: ['#ff8b22ff', '#f7e3e7ff'],
    screen: 'BreakdownCompletion',
  },
  {
    title: 'GENERAL MAINTENANCE',
    subtitle: 'Create a General Maintenance booking',
    icon: 'build',
    colors: ['#1565C0', '#90CAF9'],
    screen: 'GeneralMaintenanceBooking',
  },
  {
    title: 'GENERAL MAINTENANCE COMPLETION',
    subtitle: 'Complete a General Maintenance booking',
    icon: 'build',
    colors: ['#1565C0', '#90CAF9'],
    screen: 'GeneralMaintenanceCompletion',
  },

  // {
  //   title: 'MULTIPLE',
  //   subtitle: 'Create multiple abnormalities',
  //   icon: 'dashboard',
  //   colors: ['#FF4DB8', '#FF9FF3'],
  //   screen: 'Multiple',
  // },

];

export default function HomeScreen({ navigation }: any) {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [shift, setShift] = useState('');
  const { currentUser, currentRole } = useGrid();

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
                onChange={(value: any) => setShift(value)}
              />

            </View>

          </View>

        </View>



        <View style={styles.grid}>

          {cards.map(item =>

            <TouchableOpacity
              key={item.title}
              onPress={() => navigation.navigate(item.screen)}
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

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#EAF5FF'
  },

  header: {
    height: 65,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },

  welcomeCard: {
    margin: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 4
  },

  user: {
    fontSize: 18,
    fontWeight: '700'
  },

  company: {
    color: '#666',
    marginTop: 4
  },

  filterCard: {
    marginHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 4
  },

  label: {
    fontWeight: '700'
  },

  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12
  },

  row: {
    flexDirection: 'row',
    marginTop: 15
  },

  date: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginRight: 8
  },

  shift: {
    flex: 1,
    //borderWidth:1,
    //borderColor:'#ddd',
    //borderRadius:8
  },

  grid: {
    padding: 15
  },

  card: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 18
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 10
  },

  cardSub: {
    color: 'white',
    marginTop: 6,
    fontSize: 14
  }

});

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   LayoutAnimation,
//   Platform,
//   UIManager,
// } from 'react-native';

// import MaterialIcons from '@react-native-vector-icons/material-icons';
// import { useGrid } from '../../context/GridProvider';
// import DatePicker from '../../components/forms/DatePicker';
// import AppDropdown from '../../components/forms/AppDropdown';
// import { getCurrentShift } from '../../services/api/authApi';

// if (
//   Platform.OS === 'android' &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// type GroupItem = {
//   title: string;
//   icon: React.ComponentProps<typeof MaterialIcons>['name'];
//   color: string;
//   bg: string;
//   screen: string;
// };

// type Group = {
//   key: string;
//   title: string;
//   icon: React.ComponentProps<typeof MaterialIcons>['name'];
//   accentColor: string;
//   accentBg: string;
//   items: GroupItem[];
// };

// const groups: Group[] = [
//   {
//     key: 'abnormality',
//     title: 'Abnormality',
//     icon: 'warning',
//     accentColor: '#0C447C',
//     accentBg: '#EAF1FD',
//     items: [
//       { title: 'Dashboard', icon: 'analytics', color: '#2F6FED', bg: '#E6F1FB', screen: 'dashboard' },
//       { title: 'Identify', icon: 'search', color: '#2F6FED', bg: '#E6F1FB', screen: 'AbnForm' },
//       { title: 'Allocate', icon: 'groups', color: '#22A06B', bg: '#E6F9F0', screen: 'AbnAllocation' },
//       { title: 'Complete', icon: 'check-circle', color: '#7B5CF0', bg: '#F0EBFD', screen: 'AbnComp' },
//       { title: 'View', icon: 'visibility', color: '#E08A1E', bg: '#FDF1E1', screen: 'AbnView' },
//     ],
//   },
//   {
//     key: 'suggestions',
//     title: 'Suggestions',
//     icon: 'lightbulb',
//     accentColor: '#993C1D',
//     accentBg: '#FAECE7',
//     items: [
//       { title: 'Creation', icon: 'lightbulb', color: '#D8583A', bg: '#FDECE6', screen: 'Suggestion' },
//       { title: 'Modification', icon: 'edit', color: '#993556', bg: '#FBEAF0', screen: 'SuggestionModification' },
//       { title: 'View', icon: 'visibility', color: '#0F6E56', bg: '#E1F5EE', screen: 'SuggestionView' },
//       { title: 'Accept / reject', icon: 'fact-check', color: '#1D9E75', bg: '#E1F5EE', screen: 'SuggestionAcceptReject' },
//       { title: 'Kaizen approval', icon: 'approval', color: '#4C5FA6', bg: '#EEEDFE', screen: 'KaizenApproval' },
//     ],
//   },
//   {
//     key: 'Work Order',
//     title: 'Work Order',
//     icon: 'build',
//     accentColor: '#444441',
//     accentBg: '#F1EFE8',
//     items: [
//       { title: 'Work orders', icon: 'work-outline', color: '#5F5E5A', bg: '#F1EFE8', screen: 'WorkOrderList' },
//     ],
//   },
// ];

// export default function HomeScreen({ navigation }: any) {
//   const [date, setDate] = useState(new Date());
//   const [shift, setShift] = useState('');
//   const [expandedKey, setExpandedKey] = useState<string>('abnormality');
//   const { currentUser, currentRole } = useGrid();

//   const loadShift = async () => {
//     try {
//       const result = await getCurrentShift();
//       setShift(result);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     loadShift();
//   }, []);

//   const toggleGroup = (key: string) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedKey(prev => (prev === key ? '' : key));
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView>

//         <View style={styles.welcomeCard}>
//           <Text style={styles.user}>Welcome</Text>
//           <Text style={styles.company}>{currentUser.userName}</Text>
//           <Text style={styles.company}>
//             {currentRole.roleName} - {currentRole.fnlnDescription}
//           </Text>
//         </View>

//         <View style={styles.filterCard}>
//           <View style={styles.row}>
//             <DatePicker label="Date" disable={true} value={date} />
//             <View style={styles.shift}>
//               <AppDropdown
//                 label="Shift"
//                 disable={true}
//                 value={shift}
//                 endpoint="commonFilter/Shift"
//                 onChange={(value: any) => setShift(value)}
//               />
//             </View>
//           </View>
//         </View>

//         <View style={styles.groupsWrap}>
//           {groups.map(group => {
//             const isOpen = expandedKey === group.key;
//             return (
//               <View
//                 key={group.key}
//                 style={[styles.groupCard, { borderLeftColor: group.accentColor }]}>
//                 <TouchableOpacity
//                   style={[styles.groupHeader, isOpen && { backgroundColor: group.accentBg }]}
//                   activeOpacity={0.8}
//                   onPress={() => toggleGroup(group.key)}>
//                   <View style={[styles.groupIconBadge, { backgroundColor: group.accentBg }]}>
//                     <MaterialIcons name={group.icon} size={18} color={group.accentColor} />
//                   </View>
//                   <Text
//                     style={[
//                       styles.groupTitle,
//                       { color: isOpen ? group.accentColor : '#1a1a1a' },
//                     ]}>
//                     {group.title}
//                   </Text>
//                   {!isOpen && (
//                     <Text style={styles.groupCount}>{group.items.length} items</Text>
//                   )}
//                   <MaterialIcons
//                     name={isOpen ? 'expand-less' : 'expand-more'}
//                     size={20}
//                     color={isOpen ? group.accentColor : '#999'}
//                   />
//                 </TouchableOpacity>

//                 {isOpen && (
//                   <View style={styles.groupBody}>
//                     {group.items.map(item => (
//                       <TouchableOpacity
//                         key={item.title}
//                         style={styles.groupItem}
//                         activeOpacity={0.8}
//                         onPress={() => navigation.navigate(item.screen)}>
//                         <View style={[styles.itemIconBadge, { backgroundColor: item.bg }]}>
//                           <MaterialIcons name={item.icon} size={26} color={item.color} />
//                         </View>
//                         <Text style={styles.groupItemLabel} numberOfLines={1}>{item.title}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </View>

//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f2f2f3ff' },

//   welcomeCard: {
//     margin: 15,
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 12,
//     elevation: 4,
//   },
//   user: { fontSize: 18, fontWeight: '700' },
//   company: { color: '#666', marginTop: 4 },

//   filterCard: {
//     marginHorizontal: 15,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 15,
//     elevation: 4,
//   },
//   row: { flexDirection: 'row', marginTop: 15 },
//   shift: { flex: 1 },

//   groupsWrap: {
//     paddingHorizontal: 15,
//     marginTop: 15,
//     gap: 10,
//   },
//   groupCard: {
//     backgroundColor: 'white',
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#E9EAEC',
//     borderLeftWidth: 4,
//     overflow: 'hidden',
//     marginBottom: 10,
//     elevation: 2,
//   },
//   groupHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     gap: 10,
//   },
//   groupIconBadge: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   groupTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     flex: 1,
//   },
//   groupCount: {
//     fontSize: 11,
//     color: '#999',
//     marginRight: 4,
//   },
//   groupBody: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingHorizontal: 10,
//     paddingBottom: 16,
//     paddingTop: 6,
//   },
//   groupItem: {
//     width: '25%',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   itemIconBadge: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   groupItemLabel: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#444',
//     textAlign: 'center',
//   },
// });