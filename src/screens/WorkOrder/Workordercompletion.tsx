// import React, { useMemo, useRef } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// import Cards from '../../components/grid/Cards';
// import { useGrid } from '../../context/GridProvider';

// type WorkOrderCompletionRouteParams = {
//   workorderno?: string;
// };

// const WorkOrderCompletion: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const route =
//     useRoute<
//       RouteProp<{ params: WorkOrderCompletionRouteParams }, 'params'>
//     >();
//   const cardsRef = useRef<any>(null);

//   const { currentRole } = useGrid();
//   const workorderno = route.params?.workorderno;

//   const conditionParams = useMemo(() => {
//     if (!workorderno) {
//       return null;
//     }

//     return {
//       WORKORDERNO: workorderno,
//       ROLELEVELNO: currentRole?.roleLevel ?? '',
//     };
//   }, [workorderno, currentRole]);

//   return (
//     <View style={styles.container}>
//       {conditionParams == null ? (
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyTitle}>No work order specified</Text>
//           <Text style={styles.emptyText}>
//             Navigate here from a work order's Edit action.
//           </Text>
//         </View>
//       ) : (
//         <Cards
//           key={workorderno}
//           procedureName="plm_fn_getsqlfromwo_rn_sb"
//           isEdit={true}
//           ref={cardsRef}
//           conditionParams={conditionParams}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   emptyState: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   emptyText: {
//     marginTop: 8,
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 14,
//   },
// });

// export default WorkOrderCompletion;

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import WorkOrderCompletionModel from '../../components/model/WorkOrderCompletionModel';

type WorkOrderCompletionRouteParams = {
  workorderno?: string;
};

const WorkOrderCompletion: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as WorkOrderCompletionRouteParams | undefined;
  const workorderno = params?.workorderno;

  const cardsRef = useRef<any>(null);
  const { currentRole } = useGrid();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const conditionParams = useMemo(() => {
    if (!workorderno) {
      return null;
    }

    return {
      WORKORDERNO: workorderno,
      ROLELEVELNO: currentRole?.roleLevel ?? '',
    };
  }, [workorderno, currentRole]);

  const handleEdit = (row: any) => {
    setSelectedRow(row);
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
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
          isEdit={true}
          onEdit={handleEdit}
          ref={cardsRef}
          conditionParams={conditionParams}
        />
      )}

      {showEditModal && (
        <WorkOrderCompletionModel
          visible={showEditModal}
          workorderno={workorderno}
          row={selectedRow}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            cardsRef.current?.reload();
            setShowEditModal(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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