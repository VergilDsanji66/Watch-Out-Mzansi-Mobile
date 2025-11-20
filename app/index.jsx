import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import MainMap from './Pages/MainMap'


const Home = () => {
  return (
    <View style={styles.container}>
      <MainMap/>
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
