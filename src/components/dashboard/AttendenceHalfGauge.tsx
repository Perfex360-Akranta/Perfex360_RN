import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Svg, {Path} from 'react-native-svg';

interface AttendanceGaugeData {
  employeeCount: number;
  meetingCount: number;
  presentCount: number;
  onDutyCount: number;
  attendancePercentage: number;
}

interface Props {
  data: AttendanceGaugeData;
}

const {width} = Dimensions.get('window');

const AttendanceHalfGauge = ({data}: Props) => {
  if (!data) {
    return null;
  }

  const percentage = Math.min(
    Math.max(data.attendancePercentage, 0),
    100,
  );

  const gaugeWidth = Math.min(width - 40, 360);

  const radius = gaugeWidth / 2 - 30;
  const strokeWidth = 24;

  const centerX = gaugeWidth / 2;
  const centerY = radius + 10;

  /*
   * Start = 180°  -> bottom-left
   * End   = 360°  -> bottom-right
   *
   * This produces an upper semicircle.
   */

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angle: number,
  ) => {
    const radians = (angle * Math.PI) / 180;

    return {
      x: cx + r * Math.cos(radians),
      y: cy + r * Math.sin(radians),
    };
  };

  const createArc = (
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(
      centerX,
      centerY,
      radius,
      startAngle,
    );

    const end = polarToCartesian(
      centerX,
      centerY,
      radius,
      endAngle,
    );

    const largeArcFlag =
      endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius}
      0 ${largeArcFlag} 1
      ${end.x} ${end.y}
    `;
  };

  // Complete background semicircle
  const backgroundArc = createArc(180, 360);

  // Percentage arc
  const percentageEnd =
    180 + (percentage * 180) / 100;

  const valueArc =
    percentage > 0
      ? createArc(180, percentageEnd)
      : '';

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Attendance
      </Text>

      <Text style={styles.subtitle}>
        Attendance performance
      </Text>

      {/* GAUGE */}

      <View style={styles.gaugeContainer}>

        <Svg
          width={gaugeWidth}
          height={radius + 45}
          viewBox={`0 0 ${gaugeWidth} ${radius + 45}`}>

          {/* Background */}

          <Path
            d={backgroundArc}
            fill="none"
            stroke="#E7EDF1"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress */}

          {valueArc ? (
            <Path
              d={valueArc}
              fill="none"
              stroke="#38B978"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ) : null}

        </Svg>

        {/* CENTER VALUE */}

        <View style={styles.centerText}>

          <Text style={styles.percentage}>
            {percentage.toFixed(2)}%
          </Text>

          <Text style={styles.attendance}>
            Attendance
          </Text>

        </View>

      </View>

      {/* STATISTICS */}

      <View style={styles.stats}>

        <Stat
          value={data.employeeCount}
          label="Employees"
        />

        <Stat
          value={data.meetingCount}
          label="Meetings"
        />

        <Stat
          value={data.presentCount}
          label="Present"
        />

        <Stat
          value={data.onDutyCount}
          label="On Duty"
        />

      </View>

    </View>
  );
};

const Stat = ({
  value,
  label,
}: {
  value: number;
  label: string;
}) => (
  <View style={styles.stat}>

    <Text style={styles.statValue}>
      {value}
    </Text>

    <Text style={styles.statLabel}>
      {label}
    </Text>

  </View>
);

const styles = StyleSheet.create({

  container: {
    margin: 10,
    padding: 15,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#D7E7EF',

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
    color: '#607D8B',
  },

  gaugeContainer: {
    marginTop: 10,

    height: 205,

    alignItems: 'center',

    position: 'relative',
  },

  centerText: {
    position: 'absolute',

    top: 105,

    left: 0,
    right: 0,

    alignItems: 'center',
  },

  percentage: {
    fontSize: 28,

    fontWeight: '800',

    color: '#087DB4',
  },

  attendance: {
    marginTop: 2,

    fontSize: 12,

    color: '#607D8B',
  },

  stats: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor: '#E7EEF3',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,

    fontWeight: '700',

    color: '#003B69',
  },

  statLabel: {
    marginTop: 3,

    fontSize: 10,

    color: '#607D8B',

    textAlign: 'center',
  },

});

export default AttendanceHalfGauge;