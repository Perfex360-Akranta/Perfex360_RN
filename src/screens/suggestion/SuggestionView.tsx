// screens/SuggestionView.tsx
import React from 'react';
import { View } from 'react-native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';

const SuggestionView: React.FC = () => {

  const { currentUser, currentRole } = useGrid();

  return (
    <View style={{ flex: 1 }}>
      <Cards
        procedureName="kzn_fn_kaizenbankmaigrid_rn_sb"
        conditionParams={{
          DRILLFLAG: '',
          ELEMENTID: 'CMP0000001',
          ROLELEVELNO: currentRole.roleLevel,
          STATUS: '-',
          KZNVIEWTYPE: 'I',
          SUGGESTEDBY: currentUser.employeeId,
          EXCEL: 'NOEXCEL',
          STATUSNEW: '-',
        }}
      />
    </View>
  );
};

export default SuggestionView;