import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useGrid } from '../../context/GridProvider';
import DatePicker from '../../components/forms/DatePicker';
import AppDropdown from '../../components/forms/AppDropdown';
import { getCurrentShift } from '../../services/api/authApi';

type CardItem = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  screen: string;
};

type CardGroup = {
  label: string;
  band: string; 
  icon: string; 
  items: CardItem[];
};

// Cards are grouped under a coloured band per section, with each
// action as a compact icon + label row inside — matches "Option C".
const groups: CardGroup[] = [
  {
    label: 'Overview',
    band: '#CFDCEF',
    icon: '#9BB4D8',
    items: [
      { title: 'Dashboard', subtitle: 'View Dashboard', icon: 'analytics', screen: 'dashboard' },
    ],
  },
  {
    label: 'Abnormality',
    band: '#D3EBDB',
    icon: '#9AC7C0',
    items: [
      { title: 'Identify', subtitle: 'Create or identify a new abnormality', icon: 'search', screen: 'AbnForm' },
      { title: 'Allocate', subtitle: 'Allocate responsibility', icon: 'groups', screen: 'AbnAllocation' },
      { title: 'Complete', subtitle: 'Complete action', icon: 'check-circle', screen: 'AbnComp' },
      { title: 'View', subtitle: 'View abnormalities', icon: 'visibility', screen: 'AbnView' },
    ],
  },
  {
    label: 'Suggestion',
    band: '#F4CFCF',
    icon: '#E7A9A0',
    items: [
      { title: 'Raise', subtitle: 'Raise a Kaizen suggestion', icon: 'lightbulb', screen: 'Suggestion' },
      { title: 'Modify', subtitle: 'Modify a submitted suggestion', icon: 'edit', screen: 'SuggestionModification' },
      { title: 'View', subtitle: 'View submitted suggestions', icon: 'visibility', screen: 'SuggestionView' },
      { title: 'Accept / Reject', subtitle: 'Accept or reject pending suggestions', icon: 'fact-check', screen: 'SuggestionAcceptReject' },
    ],
  },
  {
    label: 'Breakdown',
    band: '#F6DFC2',
    icon: '#E29A9A',
    items: [
      { title: 'Booking', subtitle: 'Create a Breakdown Entry', icon: 'handyman', screen: 'BreakdownEntry' },
      { title: 'Allocation', subtitle: 'Breakdown Allocation', icon: 'engineering', screen: 'BreakdownAllocation' },
      { title: 'Completion', subtitle: 'Breakdown Completion', icon: 'verified', screen: 'BreakdownCompletion' },
    ],
  },
  {
    label: 'General maintenance',
    band: '#CEDEF2',
    icon: '#8FADD9',
    items: [
      { title: 'Booking', subtitle: 'Create a General Maintenance booking', icon: 'construction', screen: 'GeneralMaintenanceBooking' },
      { title: 'Completion', subtitle: 'Complete a General Maintenance booking', icon: 'verified', screen: 'GeneralMaintenanceCompletion' },
    ],
  },
  {
    label: 'Work order & Kaizen',
    band: '#E3D9F1',
    icon: '#C6B7E0',
    items: [
      { title: 'Work order list', subtitle: 'List of Work Orders', icon: 'work-outline', screen: 'WorkOrderList' },
      { title: 'Kaizen approval', subtitle: 'View pending approvals', icon: 'approval', screen: 'KaizenApproval' },
    ],
  },

  {
    label: 'CLTI',
    band: '#CEDEF2',
    icon: '#8FADD9',
    items: [
      { title: 'CLTI schedule', subtitle: 'CLTI schedule', icon: 'construction', screen: 'Cltischedule' },
    ],
  },
];

function getInitials(name?: string) {
  if (!name) return '·';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '·';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function HomeScreen({ navigation }: any) {
  const [date, setDate] = useState(new Date());
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Welcome / identity card */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(currentUser?.userName)}
            </Text>
          </View>

          <View style={styles.welcomeText}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {currentUser?.userName}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText} numberOfLines={1}>
                {currentRole?.roleName} · {currentRole?.fnlnDescription}
              </Text>
            </View>
          </View>
        </View>

        {/* Shift / date filter card */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Current shift</Text>
          <View style={styles.row}>
            <View style={styles.filterField}>
              <DatePicker label="Date" disable={true} value={date} />
            </View>
            <View style={styles.filterField}>
              <AppDropdown
                label="Shift"
                disable={true}
                value={shift}
                endpoint="commonFilter/Shift"
                onChange={(value: any) => setShift(value)}
              />
            </View>
          </View>
        </View>

        {/* Grouped action sections — each is a tinted band with
            compact icon + label rows for that section's actions. */}
        {groups.map(group => (
          <View
            key={group.label}
            style={[styles.band, { backgroundColor: group.band }]}>
            <View style={styles.bandHeadRow}>
              <View style={[styles.bandDot, { backgroundColor: group.icon }]} />
              <Text style={styles.bandTitle}>{group.label.toUpperCase()}</Text>
            </View>

            {group.items.map((item, idx) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
                style={[
                  styles.listRow,
                  idx === group.items.length - 1 && styles.listRowLast,
                ]}>
                <View style={styles.rowIcon}>
                  <MaterialIcons name={item.icon as any} color="#3B4652" size={18} />
                </View>

                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" color="#8B8B8B" size={20} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  scrollContent: {
    paddingBottom: 32,
  },

  // Welcome card
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#7C8A99',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DDE8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B4652',
  },

  welcomeText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 12,
    color: '#8C97A3',
    fontWeight: '500',
    marginBottom: 2,
  },

  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2E3841',
    marginBottom: 6,
  },

  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1E9F7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '100%',
  },

  rolePillText: {
    fontSize: 12,
    color: '#5E5470',
    fontWeight: '500',
  },

  // Filter card
  filterCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#7C8A99',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7683',
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    marginTop: 4,
  },

  filterField: {
    flex: 1,
    marginRight: 10,
  },

  // Colour band sections
  band: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    padding: 14,
  },

  bandHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  bandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  bandTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#3B4652',
    opacity: 0.75,
    letterSpacing: 0.3,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
  },

  listRowLast: {
    marginBottom: 0,
  },

  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  rowTextWrap: {
    flex: 1,
    marginRight: 8,
  },

  rowTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2E3841',
  },

  rowSub: {
    fontSize: 11,
    color: '#6B7683',
    marginTop: 1,
  },
});