import React, { useRef, useState } from 'react';
import { View } from 'react-native';

import Cards from '../../components/grid/Cards';
import ActionPlanStatusModel, {
  ActionPlanRecord,
} from '../../components/model/ActionPlanStatusModel';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';

// "17-Jun-2017" -> Date (null if empty / invalid)
const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const months: any = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const [d, m, y] = value.split('-');
  const month = months[(m || '').toLowerCase()];
  if (!d || month === undefined || !y) return null;
  return new Date(Number(y), month, Number(d));
};

const ActionPlanCompletion: React.FC = () => {
  const { currentUser } = useGrid();
  const cardsRef = useRef<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [record, setRecord] = useState<ActionPlanRecord>({ keyid: '', status: 'P' });

  const handleEdit = (rec: GridEditProps) => {
    const row = rec.row;
    setRecord({
      keyid: row.apldkeyid,
      aplmkeyid: row.aplmkeyid,
      actionplan: row.actionplan,
      maintask: row.maintask,
      responsibilityby: row.responsibilityby,
      targetdate: row.targetdate,
      status: row.statusid || 'P',
      countermeasure: row.countermeasure,
      completedon: parseDate(row.completedon) ?? new Date(),
      remarks: row.remarks,
    });
    setShowModal(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <Cards
        procedureName="gen_fn_actionplancompletion_rn_sb"
        isEdit={true}
        onEdit={handleEdit}
        ref={cardsRef}
        conditionParams={{
          RESPONSIBILITY: currentUser.employeeId,
          STATUS: 'P',
        }}
      />

      <ActionPlanStatusModel
        record={record}
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={() => {
          cardsRef.current?.reload();
          setShowModal(false);
        }}
      />
    </View>
  );
};

export default ActionPlanCompletion;