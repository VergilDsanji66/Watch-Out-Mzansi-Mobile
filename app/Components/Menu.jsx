import { View, StyleSheet, Text } from 'react-native'
import React from 'react'
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'

const Menu = () => {
  return (
  <View style={styles.menuContainer}>
    <View style={styles.menuItems}>
      <Ionicons name="map-outline" size={24} color="#1E90FF" />
      <Text>Map</Text>
    </View>

    <View style={styles.menuItems}>
      <Feather name="alert-triangle" size={24} color="#FF4500" />
      <Text>Reports</Text>
    </View>

    <View style={styles.menuItems}>
      <Ionicons name="settings-outline" size={24} color="#444" />
      <Text>Settings</Text>
    </View>
  </View>

  )
}

export default Menu

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    bottom: 24,          
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  menuItems: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})
