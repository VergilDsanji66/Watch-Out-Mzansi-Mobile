import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, StatusBar, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps'
import * as Location from 'expo-location'
import { ThemedView } from '@/components/themed-view'
import SearchLocation from '../components/SearchLocation'

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { ThemedText } from '@/components/themed-text'

const API_URL = 'http://192.168.110.185:8000'

type LocationType = {
  address: string
  lat: number | null
  lng: number | null
  
}

type ReportData = {
  id: number
  title: string
  description: string
  location_lat: number
  location_lng: number
}


const MainMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationType>({ address: '', lat: null, lng: null})
  const [data, setData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const [region, setRegion] = useState<{
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  } | null>(null)

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      });

      setCurrentLocation({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
    })();
  }, []);


  useEffect (() => {
    if (selectedLocation.lat && selectedLocation.lng && region) {
      setRegion({
        ...region,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      })
    }
  }, [selectedLocation]) 

  const faceNorth = () => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        heading: 0,
        pitch: 0,
      }, { duration: 500 })
    }
  }

  const centerOnUser = async () => {
    let { coords } = await Location.getCurrentPositionAsync({})
    mapRef.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    })
  }

  // Getting reported area data
  useEffect(() => {
    async function getReports() {
      try {
        const response = await fetch(`${API_URL}/reports/`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setData(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    getReports()
  }, [data])


  if (loading) {
    return (
      <ThemedView>
        <ActivityIndicator/>
        <ThemedText>Loading....</ThemedText>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView>
        <ThemedText>Error: {error.message}</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={{ flex: 1}}>
      <SearchLocation  onSelect={setSelectedLocation}/>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region ?? undefined}
        ref={mapRef}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Selected location marker */}
        {selectedLocation.lat !== null && selectedLocation.lng !== null && (
          <Marker
            coordinate={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng
            }}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setSelectedLocation(prev => ({
                ...prev,
                lat: latitude,
                lng: longitude
              }));
            }}
          />
        )}

        {/* Reports from DB */}
        {data.map(report => {
          const color = "#FFCC00";

          return (
            <React.Fragment key={report.id}>
              <Marker
                coordinate={{
                  latitude: Number(report.location_lat),
                  longitude: Number(report.location_lng),
                }}
              >
                <MaterialIcons name="warning" size={28} color={color} />
              </Marker>

              <Circle
                center={{
                  latitude: Number(report.location_lat),
                  longitude: Number(report.location_lng),
                }}
                radius={25}
                strokeColor="transparent"
                fillColor={`${color}33`}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Custom buttoms */}
      <View style={styles.customButtons}>
        <TouchableOpacity style={styles.myLocation} onPress={faceNorth}>
          <Entypo name='compass' size={35} color='#fff'/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.myLocation} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={35} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

export default MainMap

const styles = StyleSheet.create({
  map: { 
    flex: 1,
    position: 'relative'
  },
  customButtons:{
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    marginBottom: 20,
    bottom: 0,
    right: 20,
  },
  myLocation: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#ffffff3d',
  },
})
