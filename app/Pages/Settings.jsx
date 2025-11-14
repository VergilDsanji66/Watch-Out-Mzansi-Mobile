import { View,StyleSheet, StatusBar ,Text } from 'react-native'
import React from 'react'
import Menu from '../Components/Menu'

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <Menu prop="Settings"/>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight, // avoids overlap
    backgroundColor: '#fff',
  },
})