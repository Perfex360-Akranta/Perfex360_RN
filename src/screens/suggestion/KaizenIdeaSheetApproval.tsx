// import React, { useRef, useCallback, useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';

// import Cards from '../../components/grid/Cards';
// import { useGrid } from '../../context/GridProvider';
// import { workFlowGridParams } from '../../types/workflow';
// import { GridEditProps } from '../../types/GridFilters';

// const KaizenIdeaSheetApproval: React.FC = () => {
//     const { currentUser, currentRole, setFilter } = useGrid();
//     const navigation = useNavigation<any>();
//     const cardsRef = useRef<any>(null);
//     const isFirstFocus = useRef(true);

//     useEffect(() => {
//         setFilter(prev => ({
//             ...prev,
//             monthWise: 'Y',
//             fromDate: new Date(1801, 0, 1),
//             toDate: new Date(2100, 11, 31),
//             reload: new Date(),
//         }));
//     }, []);

//     useFocusEffect(
//         useCallback(() => {
//             if (isFirstFocus.current) {
//                 isFirstFocus.current = false;
//                 return;
//             }
//             cardsRef.current?.reload();
//         }, [])
//     );

//     const getTransCode = (label?: string): string => {
//         switch ((label || '').trim()) {
//             case 'GE5':
//                 return 'BTSG5L';

//             case 'NS':
//                 return 'BTSNOSAVIN';

//             case 'S':
//                 return 'BTSSAFETY';

//             case 'LE5':
//                 return 'BTSL5L';

//             case 'GE1C':
//                 return 'BTSG1C';

//             default:
//                 return '';
//         }
//     };

//     const handleEdit = (record: GridEditProps) => {
//         const row = record.row;
//         const params: workFlowGridParams = {
//             refId: row.imprvno,
//             flid: row.flid,
//             enable: 'Y',
//             refType: 'KZNBTS',
//             transCode: getTransCode(row.transcode),
//         }
//         console.log('Kaizen approval card edit tapped:', params);
//         navigation.replace('WorkflowApprovalList', { record: params });
//     };

//     // Parses "A=2;P=1;E=0;R=0;" into { A: 2, P: 1, E: 0, R: 0 }
//     const parsePending = (value: any) => {
//         const result: Record<string, number> = { A: 0, P: 0, E: 0, R: 0 };
//         String(value ?? '')
//             .split(';')
//             .forEach(part => {
//                 const [k, v] = part.split('=');
//                 if (k && k.trim() in result) {
//                     result[k.trim()] = Number(v) || 0;
//                 }
//             });
//         return result;
//     };

//     const formatKaizenField = (field: string, value: any, item: any) => {

//         if (field === 'status') {
//             const text = String(value ?? '');
//             if (!text.toUpperCase().includes('PENDING')) {
//                 return undefined;
//             }

//             const started = parsePending(item.pending).A > 0;

//             return {
//                 text,
//                 textColor: '#000000',
//                 backgroundColor: started ? '#FFE0B2' : '#FFF59D',
//             };
//         }

//         if (field === 'pending') {
//             const c = parsePending(value);

//             let dots = '🟢'.repeat(c.A);
//             let waiting = c.P;

//             if (c.E > 0) {
//                 dots += '🟠'.repeat(c.E);
//             } else if (c.R > 0) {
//                 dots += '🔴'.repeat(c.R);
//             } else if (waiting > 0) {
//                 dots += c.A > 0 ? '🟠' : '🟡';
//                 waiting -= 1;
//             }

//             dots += '⚪'.repeat(waiting);

//             return { text: dots || '-', showIcon: false };
//         }

//         return undefined;
//     };


//     return (
//         <View style={styles.container}>
//             <Cards
//                 procedureName="kzn_fn_kaizenview_2_rn_sb"
//                 isEdit={true}
//                 onEdit={handleEdit}
//                 ref={cardsRef}
//                 formatField={formatKaizenField}
//                 conditionParams={{
//                     DRILLFLAG: '',
//                     ELEMENTID: 'CMP0000001',
//                     //ROLELEVELNO: currentRole?.roleLevel ?? '',
//                     ROLELEVELNO: '10000',
//                     CHK_DETECTBY: currentUser?.employeeId ?? '',
//                     FIRSTLEVEL: 'Y',
//                     IMPRVDATE: '01-Jan-1801',
//                     MAINGROUP: 'APPROVAL',
//                     SUBGROUP: '',
//                     FLID: currentRole?.flid ?? '',
//                     MPWORTHY: '',
//                     UTILISEFUTURE: '',
//                     MULTIPLETYPE: '',
//                     MULTIPLEVAL: '',
//                     SECTIONID: '',
//                     IMPROVENOID: '',
//                     KZNSTATUS: '',
//                     LOSSTYPE: '',
//                     JHKZNCAT: '',
//                     EMPPILLAR: '',
//                 }}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F5F5F5' },
// });

// export default KaizenIdeaSheetApproval;



import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import { useGrid } from '../../context/GridProvider';
import { workFlowGridParams } from '../../types/workflow';
import { GridEditProps } from '../../types/GridFilters';

const KaizenIdeaSheetApproval: React.FC = () => {
    const { currentUser, currentRole, filter, setFilter } = useGrid();
    const navigation = useNavigation<any>();
    const cardsRef = useRef<any>(null);
    const isFirstFocus = useRef(true);
    const savedFilter = useRef<any>(null);
    const ready = useRef(false);

    useEffect(() => {
        setFilter(prev => ({
            ...prev,
            monthWise: 'Y',
            fromDate: new Date(1801, 0, 1),
            toDate: new Date(2100, 11, 31),
            reload: new Date(),
        }));
    }, []);

    // After the first mount, start reacting to View-button changes
    useEffect(() => {
        const t = setTimeout(() => { ready.current = true; }, 0);
        return () => clearTimeout(t);
    }, []);

    // The View button changes filter.reload, so reload the cards when it does
    useEffect(() => {
        if (!ready.current || !navigation.isFocused()) return;
        const t = setTimeout(() => cardsRef.current?.reload(), 0);
        return () => clearTimeout(t);
    }, [filter.reload]);

    // When coming back from the approval list, restore the filter that was applied
    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false;
                return;
            }
            if (savedFilter.current) {
                setFilter({ ...savedFilter.current, reload: new Date() });
                savedFilter.current = null;
            } else {
                cardsRef.current?.reload();
            }
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

    // Open the list on top of this screen (not replace) so back returns here
    const handleEdit = (record: GridEditProps) => {
        const row = record.row;
        const params: workFlowGridParams = {
            refId: row.imprvno,
            flid: row.flid,
            enable: 'Y',
            refType: 'KZNBTS',
            transCode: getTransCode(row.transcode),
        };
        console.log('Kaizen approval card edit tapped:', params);
        savedFilter.current = filter;
        navigation.navigate('WorkflowApprovalList', { record: params });
    };

    // Parses "A=2;P=1;E=0;R=0;" into { A: 2, P: 1, E: 0, R: 0 }
    const parsePending = (value: any) => {
        const result: Record<string, number> = { A: 0, P: 0, E: 0, R: 0 };
        String(value ?? '')
            .split(';')
            .forEach(part => {
                const [k, v] = part.split('=');
                if (k && k.trim() in result) {
                    result[k.trim()] = Number(v) || 0;
                }
            });
        return result;
    };

    const formatKaizenField = (field: string, value: any, item: any) => {

        // if (field === 'status') {
        //     const text = String(value ?? '');
        //     if (!text.toUpperCase().includes('PENDING')) {
        //         return undefined;
        //     }

        //     const started = parsePending(item.pending).A > 0;

        //     return {
        //         text,
        //         textColor: '#000000',
        //         backgroundColor: started ? '#FFE0B2' : '#FFF59D',
        //     };
        // }
        if (field === 'status') {
            const c = parsePending(item.pending);

           
            const allDone = c.A > 0 && c.P === 0 && c.E === 0 && c.R === 0;
            if (allDone) {
                return {
                    text: ' ',                     
                    backgroundColor: '#C8E6C9',    
                };
            }

            const text = String(value ?? '');
            if (!text.toUpperCase().includes('PENDING')) {
                return undefined;
            }

            const started = c.A > 0;

            return {
                text,
                textColor: '#000000',
                backgroundColor: started ? '#FFE0B2' : '#FFF59D', // orange : yellow
            };
        }

        if (field === 'pending') {
            const c = parsePending(value);

            let dots = '🟢'.repeat(c.A);
            let waiting = c.P;

            if (c.E > 0) {
                dots += '🟠'.repeat(c.E);
            } else if (c.R > 0) {
                dots += '🔴'.repeat(c.R);
            } else if (waiting > 0) {
                dots += c.A > 0 ? '🟠' : '🟡';
                waiting -= 1;
            }

            dots += '⚪'.repeat(waiting);

            return { text: dots || '-', showIcon: false };
        }

        return undefined;
    };


    return (
        <View style={styles.container}>
            <Cards
                procedureName="kzn_fn_kaizenview_2_rn_sb"
                isEdit={true}
                onEdit={handleEdit}
                ref={cardsRef}
                formatField={formatKaizenField}
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