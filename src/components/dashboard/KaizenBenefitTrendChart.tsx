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

const KaizenBenefitTrendChart = ({data}: Props) => {

  if (
    !data ||
    !data.monthlyTrend ||
    data.monthlyTrend.length === 0
  ) {
    return null;
  }

  /*
   * Create two bars for every month:
   *
   * Benefit
   * Verify
   */

  const chartData = data.monthlyTrend.flatMap(
    (item: any) => [

      {
        value: item.benefitAmount,

        label: item.monthLabel
          ? item.monthLabel.substring(0, 3)
          : '',

        frontColor: '#506FD8',

        spacing: 2,
      },

      {
        value: item.verifyAmount,

        label: '',

        frontColor: '#38B978',

        spacing: 18,
      },

    ],
  );

  /*
   * Convert large amounts to Lakhs/Crores
   * for displaying on Y axis.
   */

  const formatAmount = (value: number) => {

    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)} Cr`;
    }

    if (value >= 100000) {
      return `${(value / 100000).toFixed(1)} L`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} K`;
    }

    return `${value}`;
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <Text style={styles.title}>
        Kaizen Benefit Trend
      </Text>

      <Text style={styles.subtitle}>
        Monthly benefit and verified amount
      </Text>

      {/* TOTALS */}

      <View style={styles.summary}>

        <View style={styles.summaryItem}>

          <Text style={styles.summaryLabel}>
            Total Benefit
          </Text>

          <Text style={styles.benefitValue}>
            ₹{formatAmount(data.totalBenefitAmount)}
          </Text>

        </View>

        <View style={styles.summaryItem}>

          <Text style={styles.summaryLabel}>
            Total Verified
          </Text>

          <Text style={styles.verifyValue}>
            ₹{formatAmount(data.totalVerifyAmount)}
          </Text>

        </View>

      </View>

      {/* LEGEND */}

      <View style={styles.legend}>

        <View style={styles.legendItem}>

          <View
            style={[
              styles.legendColor,
              {
                backgroundColor:
                  '#506FD8',
              },
            ]}
          />

          <Text style={styles.legendText}>
            Benefit
          </Text>

        </View>

        <View style={styles.legendItem}>

          <View
            style={[
              styles.legendColor,
              {
                backgroundColor:
                  '#38B978',
              },
            ]}
          />

          <Text style={styles.legendText}>
            Verified
          </Text>

        </View>

      </View>

      {/* CHART */}

      <BarChart

        data={chartData}

        width={width - 70}

        height={250}

        barWidth={18}

        spacing={18}

        roundedTop

        isAnimated

        animationDuration={800}

        yAxisThickness={1}

        xAxisThickness={1}

        noOfSections={5}

        showYAxisIndices={false}

        yAxisTextStyle={{
          color: '#526B7A',
          fontSize: 9,
        }}

        xAxisLabelTextStyle={{
          color: '#526B7A',
          fontSize: 10,
          width: 45,
          textAlign: 'center',
        }}

        hideRules={false}

        rulesType="solid"

        showVerticalLines={false}

      />

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

  summary: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: 14,

    paddingBottom: 10,

    borderBottomWidth: 1,

    borderBottomColor: '#E5EEF4',
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 11,

    color: '#607D8B',
  },

  benefitValue: {
    marginTop: 3,

    fontSize: 17,

    fontWeight: '700',

    color: '#506FD8',
  },

  verifyValue: {
    marginTop: 3,

    fontSize: 17,

    fontWeight: '700',

    color: '#38B978',
  },

  legend: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginTop: 10,

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

});

export default KaizenBenefitTrendChart;