import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {PieChart} from 'react-native-gifted-charts';

interface Props {
  data: {
    flid: string;
    fromDate: string;
    toDate: string;
    employeeCount: number;
    meetingCount: number;
    presentCount: number;
    onDutyCount: number;
    attendancePercentage: number;
  };
}

const AttendanceGauge = ({data}: Props) => {

  if (!data) {
    return null;
  }

  const percentage = Math.min(
    Math.max(data.attendancePercentage, 0),
    100,
  );

  const gaugeData = [
    {
      value: percentage,
      color: '#4CAF50',
    },
    {
      value: 100 - percentage,
      color: '#E8EEF2',
    },
  ];

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Attendance
      </Text>

      <Text style={styles.subtitle}>
        Attendance performance
      </Text>

      {/* Gauge */}

      <View style={styles.gaugeContainer}>

        <PieChart
          data={gaugeData}
          donut
          radius={105}
          innerRadius={78}
          innerCircleColor="#FFFFFF"
          showText={false}
          isAnimated
          animationDuration={800}
        />

        {/* Center value */}

        <View style={styles.centerText}>

          <Text style={styles.percentage}>
            {percentage.toFixed(2)}%
          </Text>

          <Text style={styles.attendanceText}>
            Attendance
          </Text>

        </View>

      </View>

      {/* Statistics */}

      <View style={styles.stats}>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {data.employeeCount}
          </Text>

          <Text style={styles.statLabel}>
            Employees
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {data.meetingCount}
          </Text>

          <Text style={styles.statLabel}>
            Meetings
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {data.presentCount}
          </Text>

          <Text style={styles.statLabel}>
            Present
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {data.onDutyCount}
          </Text>

          <Text style={styles.statLabel}>
            On Duty
          </Text>

        </View>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    margin: 10,
    padding: 15,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#D4E7F2',

    elevation: 3,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',

    color: '#003B69',
  },

  subtitle: {
    marginTop: 3,

    fontSize: 12,

    color: '#46718E',
  },

  gaugeContainer: {
    height: 230,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,
  },

  centerText: {
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',
  },

  percentage: {
    fontSize: 26,

    fontWeight: '800',

    color: '#087DB4',
  },

  attendanceText: {
    marginTop: 3,

    fontSize: 11,

    color: '#607D8B',
  },

  stats: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

    marginTop: 5,
  },

  statCard: {
    width: '48%',

    marginBottom: 8,

    paddingVertical: 10,

    alignItems: 'center',

    backgroundColor: '#F7FBFD',

    borderRadius: 8,

    borderWidth: 1,

    borderColor: '#E1EDF3',
  },

  statValue: {
    fontSize: 19,

    fontWeight: '700',

    color: '#003B69',
  },

  statLabel: {
    marginTop: 2,

    fontSize: 11,

    color: '#607D8B',
  },

});

export default AttendanceGauge;