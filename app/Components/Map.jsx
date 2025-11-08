import { View, StyleSheet} from 'react-native'
import React, {useState} from 'react'
import MapView, { Marker } from 'react-native-maps'

const Map = () => {
    const [marker, setMarker] = useState({
        latitude: -23.8,
        longitude: 29.4,
    })

  return (
    <View style={styles.container}>
    <MapView
        style={styles.map}
        provider={MapView.PROVIDER_GOOGLE}
        initialRegion={{
            latitude: marker.latitude,
            longitude: marker.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }}
        onPress={(event) => {
            const {latitude, longitude} = event.nativeEvent.coordinate;
            setMarker({latitude, longitude});
        }}>
        <Marker
            coordinate={marker}
            title='Report Location'
            description='Tap on the map to move me'
        />
    </MapView>    
    </View>
  )
}

export default Map

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
})