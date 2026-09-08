import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { getEquipmentDetailsByNo } from '../../services/api/WorkOrderApi';

export interface EquipmentHeaderProps {
    equipmentNo?: string | null;
    onScanPress: () => void;
    title?: string; // optional override, defaults to "Equipment"
    onEquipmentLoaded?: (details: { equipmentNo: string; equipmentName: string; machineid: string; flid: string }) => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({
    equipmentNo,
    onScanPress,
    title = 'Equipment',
    onEquipmentLoaded,
}) => {
    const [equipmentName, setEquipmentName] = useState<string | null>(null);

    useEffect(() => {
        if (!equipmentNo) {
            setEquipmentName(null);
            return;
        }

        getEquipmentDetailsByNo(equipmentNo)
            .then(details => {
                setEquipmentName(details?.equipmentName ?? null);
                if (details) {
                    onEquipmentLoaded?.(details);
                }
            })
            .catch(error => {
                console.error('Failed to fetch equipment name:', error);
                setEquipmentName(null);
            });
    }, [equipmentNo]);

    return (
        <View style={styles.header}>
            <View style={styles.headerTextWrap}>
                <Text style={styles.headerLabel}>{title}</Text>
                <Text style={styles.headerValue} numberOfLines={1}>
                    {equipmentNo ?? 'No equipment selected'}
                    {equipmentName ? ` - ${equipmentName}` : ''}
                </Text>
            </View>

            <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
                <MaterialIcons name="qr-code-scanner" size={22} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTextWrap: {
        flex: 1,
        marginRight: 12,
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
    scanButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0D5DB8',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
});

export default EquipmentHeader;