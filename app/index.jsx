import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import Menu from './Components/Menu.jsx'
import Map from './Pages/Map.jsx'

const Home = () => {
  return (
    <View style={styles.container}>
      <Map/>
      <Menu/>
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
