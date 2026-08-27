import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Cards from '../../components/grid/Cards';
import WorkflowApprovalModel from '../../components/model/WorkflowApprovalModel';
import { useGrid } from '../../context/GridProvider';
import { workFlowGridParams } from '../../types/workflow';



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

    useEffect(() => {
        setFilter(prev => ({
            ...prev,
            flid: record.flid,
        }));
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

    const handleEdit = (row: any) => {
        console.log('Workflow approval card edit tapped:', row);

        setSelectedRow(row);
        setShowEditModal(true);
    };

    const handleBack = () => {
        navigation.replace('KaizenApproval');
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

            <Cards
                procedureName="gen_tl_workflowapproval_rn_sb"
                isEdit={true}
                onEdit={handleEdit}
                ref={cardsRef}
                conditionParams={{

                    REFID: record.refId,

                    TRANSCODE: record.transCode,

                    REFTYPE: record.refType,

                    EMPLOYEEID: record.employeeId ?? employeeId,

                    ROLEID: record.roleId ?? currentRole?.roleId ?? '',

                    ENABLE: record.enable ?? 'N',

                }}
            />

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