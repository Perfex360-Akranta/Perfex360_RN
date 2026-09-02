// screens/SuggestionModification.tsx
import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';

const SuggestionModification: React.FC = ({ navigation }: any) => {

    const { currentUser, currentRole } = useGrid();
    const cardsRef = useRef<any>(null);

    useFocusEffect(
        useCallback(() => {
            cardsRef.current?.reload();
        }, [])
    );

    const handleEdit = (record : GridEditProps) => {
        const row = record.row;
        console.log('Modification row tapped:', row);

        navigation.navigate('Suggestion', {
            editRecord: row,
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <Cards
                procedureName="kzn_fn_kaizenbankmaigrid_rn_sb"
                isEdit={true}
                onEdit={handleEdit}
                ref={cardsRef}
                conditionParams={{
                    DRILLFLAG: '',
                    ELEMENTID: 'CMP0000001',
                    FLID: currentRole.flid,
                    ROLELEVELNO: currentRole.roleLevel,
                    CHK_DETECTBY: currentUser.employeeId,
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

export default SuggestionModification;