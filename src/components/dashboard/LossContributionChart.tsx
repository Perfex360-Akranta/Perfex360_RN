import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {PieChart} from 'react-native-gifted-charts';

interface Props {
  data: any;
}

const LossContributionChart = ({
  data,
}: Props) => {

  if (
    !data ||
    !data.childContribution ||
    data.childContribution.length === 0
  ) {
    return null;
  }

  const colors = [
    '#506FD8',
    '#ACD52A',
    '#FFB718',
    '#B78AF5',
    '#50D9E8',
  ];

  const chartData =
    data.childContribution.map(
      (item: any, index: number) => ({
        value: item.contributionPercentage,

        color:
          colors[index % colors.length],

        text:
          `${item.contributionPercentage}%`,

        label: item.groupLabel,
      }),
    );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Loss Contribution
      </Text>

      <Text style={styles.subtitle}>
        Contribution by loss type
      </Text>

      <View style={styles.chartContainer}>

        <PieChart

          data={chartData}

          donut

          radius={105}

          innerRadius={65}

          innerCircleColor="#FFFFFF"

          showText

          textColor="#FFFFFF"

          textSize={12}

          fontWeight="700"

          focusOnPress

          sectionAutoFocus

          isAnimated

          animationDuration={700}

        />

      </View>

      {/* Legend */}

      <View style={styles.legend}>

        {data.childContribution.map(
          (item: any, index: number) => (

            <View
              key={item.groupKey}
              style={styles.legendItem}>

              <View
                style={[
                  styles.legendColor,

                  {
                    backgroundColor:
                      colors[
                        index %
                        colors.length
                      ],
                  },
                ]}
              />

              <View style={styles.legendText}>

                <Text style={styles.legendTitle}>
                  {item.groupLabel}
                </Text>

                <Text style={styles.legendValue}>
                  {item.contributionPercentage}%
                  {'  '}
                  ({item.lossText})
                </Text>

              </View>

            </View>
          ),
        )}

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

  chartContainer: {
    alignItems: 'center',

    marginTop: 15,
  },

  legend: {
    marginTop: 15,
  },

  legendItem: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 10,
  },

  legendColor: {
    width: 14,

    height: 14,

    borderRadius: 3,

    marginRight: 8,
  },

  legendText: {
    flex: 1,
  },

  legendTitle: {
    fontSize: 13,

    fontWeight: '600',

    color: '#263B4A',
  },

  legendValue: {
    marginTop: 2,

    fontSize: 11,

    color: '#607D8B',
  },

});

export default LossContributionChart;