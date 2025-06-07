import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

const SuccessNotification = ({onHide,notificationText}) => {
    const [notificationVisible, setNotificationVisible] = useState(true)
    
    
       useEffect(() => {
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
            setNotificationVisible(false);
            if (onHide) onHide(); // Call parent callback when hidden
        }, 3000); // 5 seconds
        
        // Cleanup timer if component unmounts
        return () => clearTimeout(timer);
    }, [onHide]);

      if (!notificationVisible) return null;

    return (
        <View style={styles.notificationBody}>
            <View style={styles.notificationMain}>
                <View style={styles.notificationShadow}/>
                <View style={styles.notificationSection}>
                    <Text style={styles.notificationText}>
                        {notificationText}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default SuccessNotification

const styles = StyleSheet.create({
    notificationBody: {
        position: 'absolute',
        top: 100,
        left: 2,
        
        zIndex: 2,
        // Remove width: 100 as it's too small
    },
    notificationMain: {
        position: 'relative',
        alignSelf: 'flex-start', // Don't stretch full width
    },
    notificationSection: {
        backgroundColor: '#000',
        padding: 8,
        borderWidth: 2,
        borderColor: '#000',
        zIndex: 2,
    },
    notificationShadow: {
        backgroundColor: '#e1fa57',
        position: 'absolute',
        top: 3,
        left: -3,
        right: 3,
        bottom: -3,
        zIndex: 1,
    },
    notificationText: {
        fontWeight: '600',
        color:'#fff'
    }
})