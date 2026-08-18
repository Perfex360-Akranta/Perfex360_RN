import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

import {LineChart} from 'react-native-gifted-charts';

interface Props {
  data: any;
}

const {width} = Dimensions.get('window');

const LossTrendChart = ({data}: Props) => {

  if (
    !data ||
    !data.monthlyTrend ||
    data.monthlyTrend.length === 0
  ) {
    return null;
  }

  const chartData = data.monthlyTrend.map(
    (item: any) => ({
      value: item.lossHours,
      label: item.monthLabel
        ? item.monthLabel.substring(0, 3)
        : '',
    }),
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Loss Time Trend
      </Text>

      <Text style={styles.subtitle}>
        Monthly loss time
      </Text>

      {/* Total */}

      <View style={styles.summary}>

        <Text style={styles.summaryLabel}>
          Total Loss
        </Text>

        <Text style={styles.summaryValue}>
          {data.totalLossText}
        </Text>

        <Text style={styles.summaryHours}>
          {data.totalLossHours} hrs
        </Text>

      </View>

      <LineChart

        data={chartData}

        width={width - 70}

        height={230}

        thickness={3}

        curved

        areaChart

        isAnimated

        animationDuration={800}

        yAxisThickness={1}

        xAxisThickness={1}

        noOfSections={5}

        initialSpacing={15}

        endSpacing={15}

        yAxisTextStyle={{
          color: '#526B7A',
          fontSize: 10,
        }}

        xAxisLabelTextStyle={{
          color: '#526B7A',
          fontSize: 10,
        }}

        hideRules={false}

        rulesType="solid"

        showVerticalLines={false}

        dataPointsColor="#087DB4"

        dataPointsRadius={5}

        textColor="#333"

        textFontSize={10}

        showTextOnFocus

        focusEnabled

        showStripOnFocus

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

    color: '#46718E',

    fontSize: 12,
  },

  summary: {
    marginTop: 12,

    marginBottom: 5,

    flexDirection: 'row',

    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 12,

    color: '#526B7A',
  },

  summaryValue: {
    marginLeft: 8,

    fontSize: 16,

    fontWeight: '700',

    color: '#087DB4',
  },

  summaryHours: {
    marginLeft: 6,

    fontSize: 11,

    color: '#607D8B',
  },

});

export default LossTrendChart;