import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';

type WorkOrderCompletionRouteParams = {
  workorderno?: string;
};

const WorkOrderCompletion: React.FC = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<
      RouteProp<{ params: WorkOrderCompletionRouteParams }, 'params'>
    >();
  const cardsRef = useRef<any>(null);

  const { currentRole } = useGrid();
  const workorderno = route.params?.workorderno;

  
  const conditionParams = useMemo(() => {
    if (!workorderno) {
      return null;
    }

    return {
      WORKORDERNO: workorderno,
      ROLELEVELNO: currentRole?.roleLevel ?? '',
    };
  }, [workorderno, currentRole]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerLabel}>Work Order</Text>
          <Text style={styles.headerValue} numberOfLines={1}>
            {workorderno ?? '-'}
          </Text>
        </View>
      </View>

      {conditionParams == null ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No work order specified</Text>
          <Text style={styles.emptyText}>
            Navigate here from a work order's Edit action.
          </Text>
        </View>
      ) : (
        <Cards
          key={workorderno}
          procedureName="plm_fn_getsqlfromwo_rn_sb"
          isEdit={false}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
  },
  headerValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default WorkOrderCompletion;