import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  subtitle: string;
  variant: string;
  visible: boolean;
  levelCode: string;
}

interface Props {
  metric: DashboardMetric;
}

const DashboardMetricCard = ({metric}: Props) => {

  if (!metric.visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        {
          borderLeftColor:
            getVariantColor(metric.variant),
        },
      ]}>

      <Text style={styles.title}>
        {metric.title}
      </Text>

      <Text
        style={[
          styles.value,
          {
            color:
              getVariantColor(metric.variant),
          },
        ]}>
        {metric.value}
      </Text>

      <Text style={styles.subtitle}>
        {metric.subtitle}
      </Text>

    </View>
  );
};

const getVariantColor = (
  variant: string,
) => {

  switch (variant) {

    case 'blue':
      return '#4AA3DF';

    case 'cyan':
      return '#50D9E8';

    case 'orange':
      return '#FFB718';

    case 'purple':
      return '#B78AF5';

    case 'green':
      return '#5BD58B';

    case 'red':
      return '#FF6178';

    case 'yellow':
      return '#FFC107';

    default:
      return '#1597C5';
  }
};

const styles = StyleSheet.create({

  card: {
    width: '48%',
    margin: '1%',
    padding: 14,

    backgroundColor: '#F8FCFF',

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#B8D9EE',

    borderLeftWidth: 5,

    elevation: 3,
  },

  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#003B69',
    textTransform: 'uppercase',
  },

  value: {
    marginTop: 7,

    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 4,

    fontSize: 12,
    color: '#35617F',
  },

});

export default DashboardMetricCard;