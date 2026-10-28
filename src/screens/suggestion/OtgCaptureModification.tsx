import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { GridEditProps } from '../../types/GridFilters';

const OtgCaptureModification: React.FC = ({ navigation }: any) => {

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

        navigation.navigate('OtgCapture', {
            editRecord: row,
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <Cards
                procedureName="gen_fn_otgcapturegrid_rn_sb"
                isEdit={true}
                onEdit={handleEdit}
                ref={cardsRef}
                conditionParams={{
                    FLID: currentRole.flid,
                    CHK_DETECTBY: currentUser.employeeId,
                    SUGGESTEDBY: currentUser.employeeId,
                }}
            />
        </View>
    );
};

export default OtgCaptureModification;