import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

import {BarChart} from 'react-native-gifted-charts';

const {width} = Dimensions.get('window');

interface Props {
  data: any;
}

const AbnormalityClosureChart = ({data}: Props) => {

  if (!data?.rows?.length) {
    return null;
  }

  // const chartData = data.rows.map((item: any) => ({
  //   label: item.groupLabel,
  //   value: item.identifiedCount,
  //   value2: item.closedCount,
  // }));
  const chartData = data.rows.flatMap((item: any) => [
  {
    value: item.identifiedCount,
    label: item.groupLabel,
    frontColor: '#506FD8',
  },
  {
    value: item.closedCount,
    frontColor: '#ACD52A',
    label: '',
  },
]);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Abnormality Closure
      </Text>

      <Text style={styles.subtitle}>
        Closed vs identified abnormalities
      </Text>

      <View style={styles.legend}>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendBox,
              {backgroundColor: '#506FD8'},
            ]}
          />
          <Text>Identified</Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendBox,
              {backgroundColor: '#ACD52A'},
            ]}
          />
          <Text>Closed</Text>
        </View>

      </View>
<BarChart
  data={chartData}
  barWidth={18}
  spacing={25}
  roundedTop
  yAxisThickness={1}
  xAxisThickness={1}
  height={240}
  isAnimated
/>
      {/* <BarChart
        data={chartData}
        data2={chartData.map((item: any) => ({
          value: item.value2,
          label: item.label,
        }))}

        width={width - 50}
        height={240}

        barWidth={20}
        spacing={35}

        roundedTop

        frontColor="#506FD8"
        frontColor2="#ACD52A"

        yAxisThickness={1}
        xAxisThickness={1}

        xAxisLabelTextStyle={{
          color: '#4D5B66',
          fontSize: 12,
          width: 70,
          textAlign: 'center',
        }}

        yAxisTextStyle={{
          color: '#4D5B66',
          fontSize: 11,
        }}

        noOfSections={6}

        isAnimated

        showFractionalValues={false}
        showYAxisIndices={false}
      /> */}

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    margin: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#003B69',
  },

  subtitle: {
    marginTop: 3,
    marginBottom: 12,
    color: '#46718E',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    gap: 18,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },

});

export default AbnormalityClosureChart;