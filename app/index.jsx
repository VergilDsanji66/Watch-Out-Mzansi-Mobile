import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import Map from './Components/Map.jsx'

const Home = () => {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Map />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight, // avoids overlap
    backgroundColor: '#fff',
  },
})
