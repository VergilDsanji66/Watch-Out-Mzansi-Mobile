import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import Map from './Pages/Map.jsx'

const Home = () => {
  return (
    <View style={styles.container}>
      <Map/>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
