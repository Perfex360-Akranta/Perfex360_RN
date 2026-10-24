import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVoiceControl } from '../../context/VoiceControlContext';

export default function VoiceControlButton() {
    const { listening, lastHeard, startListening, stopListening } = useVoiceControl();

    return (
        <View pointerEvents="box-none" style={styles.wrap}>
            {listening && !!lastHeard && (
                <View style={styles.bubble}>
                    <Text style={styles.bubbleText} numberOfLines={2}>
                        {lastHeard}
                    </Text>
                </View>
            )}
            <TouchableOpacity
                style={[styles.fab, listening && styles.fabOn]}
                onPress={() => (listening ? stopListening() : startListening())}>
                <Text style={styles.icon}>{listening ? '⏹' : '🎤'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        right: 16,
        bottom: 20,
        alignItems: 'flex-end',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1976D2',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
    },
    fabOn: {
        backgroundColor: '#D32F2F',
    },
    icon: {
        fontSize: 24,
        color: '#fff',
    },
    bubble: {
        maxWidth: 240,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 8,
    },
    bubbleText: {
        color: '#fff',
        fontSize: 13,
    },
});