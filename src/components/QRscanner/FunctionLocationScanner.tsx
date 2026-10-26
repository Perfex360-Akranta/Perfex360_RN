import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { getEquipmentDetailsByNo } from '../../services/api/WorkOrderApi';
import { get } from '../../services/axiosService';
import { useAppTheme } from '../../theme/ThemeContext';

export interface EquipmentHeaderProps {
    originalid?: string | null;
    flid?: string | null;
    onScanPress: () => void;
    title?: string; // optional override, defaults to "Equipment"
    onFunctionLoaded?: (details: any) => void;
}

const FunctionLocationScanner: React.FC<EquipmentHeaderProps> = ({
    originalid,
    flid,
    onScanPress,
    title = 'JH',
    onFunctionLoaded,
}) => {

    const { colors } = useAppTheme();

    const [fnlnName, setFnlnName] = useState<string | null>(null);
    const [fnlnId, setFnlnId] = useState<string | null>(null);
    const [showFlid, setShowFlid] = useState<boolean>(true);

    const loadFunctionalLocation = async (
          originalId?: string,
          flid?: string
        ) => {
          try {
            const result = await get(
              'dropdown/functional-location/hierarchy',
              {
                flid : flid,
                originalId : originalId
            }
            );
            
           if (result) {
                    onFunctionLoaded?.(result);
                    const cellId = result.cellId ? String(result.cellId).trim(): '';
                    const cellLabel = result.cellLabel ? String(result.cellLabel).trim(): '';
                   setFnlnName(cellLabel || null);
                   setFnlnId(cellId || null);
                }
            
          } catch (error) {
            console.log(error);
          }
        };
    useEffect(() => {
        if (!originalid) {
            setFnlnName(null);
            setFnlnId(null);
            return;
        }
        
        loadFunctionalLocation(originalid,undefined);

    }, [originalid]);

    useEffect(() => {
        if (flid && !fnlnId) {
        loadFunctionalLocation(undefined,flid);
        setShowFlid(false);
        }
        
    }, [flid]);

    return (
        <View style={[styles.header,{borderColor:colors.border,backgroundColor:colors.surface}]}>
            <View style={styles.headerTextWrap}>
                <Text style={[styles.headerLabel,{color:colors.textSecondary}]}>{title}</Text>
                <Text style={[styles.headerValue,{color:colors.text}]} numberOfLines={1}>
                    {fnlnId ?? 'No Function Location selected'}
                    {fnlnName ? ` - ${fnlnName}` : ''}
                </Text>
            </View>

            <TouchableOpacity style={[styles.scanButton,{backgroundColor: colors.primary,shadowColor: colors.shadow,}]} onPress={onScanPress}>
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
        minHeight: 76,
        backgroundColor: '#FFFFFF',
        // borderBottomWidth: 1,
        // borderBottomColor: '#E5E5E5',
        borderColor:'#999',
        borderRadius: 15,
    },
    headerTextWrap: {
        flex: 1,
        minWidth: 0,
        marginRight: 12,
        justifyContent: 'center',
    },
    headerLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#999',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerValue: {
        marginTop: 2,
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        lineHeight: 21,
        flexShrink: 1,
    },
    scanButton: {
        width: 44,
        height: 44,
        // borderRadius: 20,
        borderRadius: 13,
        backgroundColor: '#0D5DB8',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
});

export default FunctionLocationScanner;