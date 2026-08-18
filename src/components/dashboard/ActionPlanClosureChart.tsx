import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

import {BarChart} from 'react-native-gifted-charts';

interface Props {
  data: any;
}

const {width} = Dimensions.get('window');

const ActionPlanClosureChart = ({
  data,
}: Props) => {

  if (
    !data ||
    !data.rows ||
    data.rows.length === 0
  ) {
    return null;
  }

  /*
   * One bar group per location.
   *
   * Completed + Pending = Identified
   */

  const chartData = data.rows.flatMap(
    (item: any) => [

      {
        value: item.completedCount,

        label: item.groupLabel,

        frontColor: '#5BCB88',

        spacing: 0,
      },

      {
        value: item.pendingCount,

        label: '',

        frontColor: '#F4B942',

        spacing: 25,
      },

    ],
  );

  return (
    <View style={styles.container}>

      {/* TITLE */}

      <Text style={styles.title}>
        Action Plan Closure
      </Text>

      <Text style={styles.subtitle}>
        Completed vs pending action plans
      </Text>

      {/* LEGEND */}

      <View style={styles.legend}>

        <View style={styles.legendItem}>

          <View
            style={[
              styles.legendColor,
              {
                backgroundColor:
                  '#5BCB88',
              },
            ]}
          />

          <Text style={styles.legendText}>
            Completed
          </Text>

        </View>

        <View style={styles.legendItem}>

          <View
            style={[
              styles.legendColor,
              {
                backgroundColor:
                  '#F4B942',
              },
            ]}
          />

          <Text style={styles.legendText}>
            Pending
          </Text>

        </View>

      </View>

      {/* CHART */}

      <BarChart

        data={chartData}

        width={width - 65}

        height={250}

        barWidth={20}

        spacing={18}

        roundedTop

        yAxisThickness={1}

        xAxisThickness={1}

        noOfSections={5}

        isAnimated

        animationDuration={800}

        showYAxisIndices={false}

        yAxisTextStyle={{
          color: '#526B7A',
          fontSize: 10,
        }}

        xAxisLabelTextStyle={{
          color: '#526B7A',
          fontSize: 10,
          width: 55,
          textAlign: 'center',
        }}

        hideRules={false}

        rulesType="solid"

        showVerticalLines={false}

      />

      {/* COMPLETION % */}

      <View style={styles.percentContainer}>

        {data.rows.map((item: any) => (

          <View
            key={item.groupKey}
            style={styles.percentRow}>

            <Text style={styles.location}>
              {item.groupLabel}
            </Text>

            <Text style={styles.percentage}>
              {item.completionPercentage}%
            </Text>

          </View>

        ))}

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

    color: '#46718E',

    fontSize: 12,
  },

  legend: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginTop: 12,

    marginBottom: 5,
  },

  legendItem: {
    flexDirection: 'row',

    alignItems: 'center',

    marginLeft: 18,
  },

  legendColor: {
    width: 12,

    height: 12,

    borderRadius: 2,

    marginRight: 5,
  },

  legendText: {
    fontSize: 11,

    color: '#526B7A',
  },

  percentContainer: {
    marginTop: 12,

    borderTopWidth: 1,

    borderTopColor: '#E5EEF4',

    paddingTop: 8,
  },

  percentRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingVertical: 5,
  },

  location: {
    fontSize: 12,

    color: '#405968',
  },

  percentage: {
    fontSize: 12,

    fontWeight: '700',

    color: '#087DB4',
  },

});

export default ActionPlanClosureChart;