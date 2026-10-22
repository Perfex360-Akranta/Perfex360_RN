// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';

// import Cards from '../../components/grid/Cards';
// import WorkflowApprovalModel from '../../components/model/WorkflowApprovalModel';
// import { useGrid } from '../../context/GridProvider';
// import { workFlowGridParams } from '../../types/workflow';
// import { GridEditProps } from '../../types/GridFilters';

// const WorkflowApprovalListScreen: React.FC = () => {
//     const route = useRoute<any>();
//     const navigation = useNavigation<any>();

//     const record: workFlowGridParams = route.params?.record;

//     const {
//         currentRole,
//         currentUser, setFilter
//     } = useGrid();

//     const cardsRef = useRef<any>(null);

//     const [showEditModal, setShowEditModal] = useState(false);
//     const [selectedRow, setSelectedRow] = useState<any>(null);

//     useEffect(() => {
//         setFilter(prev => ({
//             ...prev,
//             flid: record.flid,
//         }));
//     }, [])

//     const employeeId = currentUser?.employeeId ?? '';

//     console.log('================ WORKFLOW APPROVAL ================');
//     console.log('record:', record);
//     console.log('refId:', record.refId);
//     console.log('transCode:', record.transCode);
//     console.log('employeeId:', employeeId);
//     console.log('roleId:', currentRole?.roleId);
//     //console.log('roleLevel:', currentRole?.roleLevel);
//     console.log('flid:', record.flid);
//     console.log('===================================================');

//     const handleEdit = (record: GridEditProps) => {
//         console.log('Workflow approval card edit tapped:', record.row);

//         setSelectedRow(record.row);
//         setShowEditModal(true);
//     };

//     const handleBack = () => {
//         if (navigation.canGoBack()) {
//             navigation.goBack();
//         } else {
//             navigation.navigate('KaizenApproval');
//         }
//     };

//     const formatWorkflowField = (field: string, value: any, item: any) => {
//         if (field !== 'currentstat') {
//             return undefined; // other fields render normally
//         }

//         const status = String(value ?? '').trim().toLowerCase();

//         switch (status) {
//             case 'accepted':
//                 return {
//                     text: 'Accepted',
//                     icon: 'check-circle',
//                     iconColor: '#2E7D32',
//                     textColor: '#2E7D32',
//                     backgroundColor: '#E8F5E9',
//                 };

//             case 'pending':
//                 return {
//                     text: 'Pending',
//                     icon: 'schedule',
//                     iconColor: '#F9A825',
//                     textColor: '#B7791F',
//                     backgroundColor: '#FFF8E1',
//                 };

//             case 'rework':
//                 return {
//                     text: 'Rework',
//                     icon: 'replay',
//                     iconColor: '#EF6C00',
//                     textColor: '#EF6C00',
//                     backgroundColor: '#FFF3E0',
//                 };

//             case 'rejected':
//                 return {
//                     text: 'Rejected',
//                     icon: 'cancel',
//                     iconColor: '#C62828',
//                     textColor: '#C62828',
//                     backgroundColor: '#FFEBEE',
//                 };

//             default:
//                 return undefined;
//         }
//     };

//     return (
//         <View style={styles.container}>

//             <View style={styles.headerBar}>
//                 <TouchableOpacity
//                     onPress={handleBack}
//                     style={styles.backBtn}
//                 >
//                     <Text style={styles.backText}>
//                         ‹ Back
//                     </Text>
//                 </TouchableOpacity>

//                 <Text
//                     style={styles.headerTitle}
//                     numberOfLines={1}
//                 >

//                 </Text>
//             </View>

//             <Cards
//                 procedureName="gen_tl_workflowapproval_rn_sb"
//                 isEdit={true}
//                 onEdit={handleEdit}
//                 ref={cardsRef}
//                 footer={false}
//                 formatField={formatWorkflowField}
//                 editCondition={(item) => item.enabl === "Y"}
//                 conditionParams={{
//                     REFID: record.refId,

//                     TRANSCODE: record.transCode,

//                     REFTYPE: record.refType,

//                     EMPLOYEEID: record.employeeId ?? employeeId,

//                     ROLEID: record.roleId ?? currentRole?.roleId ?? '',

//                     ENABLE: record.enable ?? 'N',

//                 }}
//             />

//             {showEditModal && (
//                 <WorkflowApprovalModel
//                     visible={showEditModal}
//                     record={record}
//                     row={selectedRow}
//                     onClose={() => setShowEditModal(false)}
//                     onSuccess={() => {
//                         cardsRef.current?.reload();
//                         setShowEditModal(false);
//                     }}
//                 />
//             )}

//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F5F5F5',
//     },

//     headerBar: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 12,
//         paddingVertical: 12,
//         backgroundColor: '#1976D2',
//     },

//     backBtn: {
//         paddingRight: 10,
//     },

//     backText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },

//     headerTitle: {
//         color: '#FFFFFF',
//         fontSize: 15,
//         fontWeight: '700',
//         flex: 1,
//     },
// });

// export default WorkflowApprovalListScreen;


import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import WorkflowApprovalModel from '../../components/model/WorkflowApprovalModel';
import { useGrid } from '../../context/GridProvider';
import { workFlowGridParams } from '../../types/workflow';
import { GridEditProps } from '../../types/GridFilters';

const WorkflowApprovalListScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const record: workFlowGridParams = route.params?.record;

    const {
        currentRole,
        currentUser, setFilter
    } = useGrid();

    const cardsRef = useRef<any>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    // Cards is rendered only after the shared filter holds this row's FLID,
    // so its very first load uses the right FLID (not the previous screen's one)
    const [flidReady, setFlidReady] = useState(false);

    useEffect(() => {
        setFilter(prev => ({
            ...prev,
            flid: record.flid,
        }));
        setFlidReady(true);
    }, [])

    const employeeId = currentUser?.employeeId ?? '';

    console.log('================ WORKFLOW APPROVAL ================');
    console.log('record:', record);
    console.log('refId:', record.refId);
    console.log('transCode:', record.transCode);
    console.log('employeeId:', employeeId);
    console.log('roleId:', currentRole?.roleId);
    //console.log('roleLevel:', currentRole?.roleLevel);
    console.log('flid:', record.flid);
    console.log('===================================================');

    const handleEdit = (record: GridEditProps) => {
        console.log('Workflow approval card edit tapped:', record.row);

        setSelectedRow(record.row);
        setShowEditModal(true);
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('KaizenApproval');
        }
    };

    const formatWorkflowField = (field: string, value: any, item: any) => {
        if (field !== 'currentstat') {
            return undefined; // other fields render normally
        }

        const status = String(value ?? '').trim().toLowerCase();

        switch (status) {
            case 'accepted':
                return {
                    text: 'Accepted',
                    icon: 'check-circle',
                    iconColor: '#2E7D32',
                    textColor: '#2E7D32',
                    backgroundColor: '#E8F5E9',
                };

            case 'pending':
                return {
                    text: 'Pending',
                    icon: 'schedule',
                    iconColor: '#F9A825',
                    textColor: '#B7791F',
                    backgroundColor: '#FFF8E1',
                };

            case 'rework':
                return {
                    text: 'Rework',
                    icon: 'replay',
                    iconColor: '#EF6C00',
                    textColor: '#EF6C00',
                    backgroundColor: '#FFF3E0',
                };

            case 'rejected':
                return {
                    text: 'Rejected',
                    icon: 'cancel',
                    iconColor: '#C62828',
                    textColor: '#C62828',
                    backgroundColor: '#FFEBEE',
                };

            default:
                return undefined;
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.headerBar}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backBtn}
                >
                    <Text style={styles.backText}>
                        ‹ Back
                    </Text>
                </TouchableOpacity>

                <Text
                    style={styles.headerTitle}
                    numberOfLines={1}
                >

                </Text>
            </View>

            {flidReady && (
                <Cards
                    procedureName="gen_tl_workflowapproval_rn_sb"
                    isEdit={true}
                    onEdit={handleEdit}
                    ref={cardsRef}
                    footer={false}
                    formatField={formatWorkflowField}
                    editCondition={(item) => item.enabl === "Y"}
                    conditionParams={{
                        REFID: record.refId,

                        TRANSCODE: record.transCode,

                        REFTYPE: record.refType,

                        EMPLOYEEID: record.employeeId ?? employeeId,

                        ROLEID: record.roleId ?? currentRole?.roleId ?? '',

                        ENABLE: record.enable ?? 'N',

                    }}
                />
            )}

            {showEditModal && (
                <WorkflowApprovalModel
                    visible={showEditModal}
                    record={record}
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
        backgroundColor: '#F5F5F5',
    },

    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#1976D2',
    },

    backBtn: {
        paddingRight: 10,
    },

    backText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
});

export default WorkflowApprovalListScreen;