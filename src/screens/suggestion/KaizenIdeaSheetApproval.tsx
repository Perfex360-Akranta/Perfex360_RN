import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { workFlowGridParams } from '../../types/workflow';

const KaizenIdeaSheetApproval: React.FC = () => {
    const { currentUser, currentRole, setFilter } = useGrid();
    const navigation = useNavigation<any>();
    const cardsRef = useRef<any>(null);
    const isFirstFocus = useRef(true);

    useEffect(() => {
        setFilter(prev => ({
            ...prev,
            monthWise: 'Y',
            fromDate: new Date(1801, 0, 1),
            toDate: new Date(2100, 11, 31),
            reload: new Date(),
        }));
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false;
                return;
            }
            cardsRef.current?.reload();
        }, [])
    );

    const getTransCode = (label?: string): string => {
        switch ((label || '').trim()) {
            case 'GE5':
                return 'BTSG5L';

            case 'NS':
                return 'BTSNOSAVIN';

            case 'S':
                return 'BTSSAFETY';

            case 'LE5':
                return 'BTSL5L';

            case 'GE1C':
                return 'BTSG1C';

            default:
                return '';
        }
    };

    const handleEdit = (row: any) => {
        const record: workFlowGridParams = {
            refId: row.imprvno,
            flid: row.flid,
            enable: 'Y',
            refType: 'KZNBTS',
            transCode: getTransCode(row.transcode),
        }
        console.log('Kaizen approval card edit tapped:', record);
        navigation.replace('WorkflowApprovalList', { record: record });
    };

    return (
        <View style={styles.container}>
            <Cards
                procedureName="kzn_fn_kaizenview_1_rn_sb"
                isEdit={true}
                onEdit={handleEdit}
                ref={cardsRef}
                conditionParams={{
                    DRILLFLAG: '',
                    ELEMENTID: 'CMP0000001',
                    //ROLELEVELNO: currentRole?.roleLevel ?? '',
                    ROLELEVELNO: '10000',
                    CHK_DETECTBY: currentUser?.employeeId ?? '',
                    FIRSTLEVEL: 'Y',
                    IMPRVDATE: '01-Jan-1801',
                    MAINGROUP: 'APPROVAL',
                    SUBGROUP: '',
                    FLID: currentRole?.flid ?? '',
                    MPWORTHY: '',
                    UTILISEFUTURE: '',
                    MULTIPLETYPE: '',
                    MULTIPLEVAL: '',
                    SECTIONID: '',
                    IMPROVENOID: '',
                    KZNSTATUS: '',
                    LOSSTYPE: '',
                    JHKZNCAT: '',
                    EMPPILLAR: '',
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
});

export default KaizenIdeaSheetApproval;