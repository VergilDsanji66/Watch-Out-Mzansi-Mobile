import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { ThemedView } from '@/components/themed-view'
import SearchLocation from '../components/SearchLocation'

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Entypo from '@expo/vector-icons/Entypo'

type LocationType = {
  address: string
  lat: number | null
  lng: number | null
}

type SelectLocationProps = {
  onLocationSelect: (location: LocationType) => void
}

const SelectLocation = ({ onLocationSelect }: SelectLocationProps) => {
  const [region, setRegion] = useState<{
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  } | null>(null)

  const [selectedLocation, setSelectedLocation] = useState<LocationType>({
    address: '',
    lat: null,
    lng: null,
  })

  const mapRef = useRef<MapView>(null)

  // Request user location on startup
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      })

      // Set initial marker at user location
      const address = await fetchAddress(latitude, longitude)
      setSelectedLocation({ lat: latitude, lng: longitude, address })
      onLocationSelect({ lat: latitude, lng: longitude, address })
    })()
  }, [])

  // Fetch address from coordinates
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (result) {
        return `${result.name || ''} ${result.street || ''}`.trim() || 'Unnamed Location'
      }
    } catch (err) {
      console.log('Reverse geocode error', err)
    }
    return 'Unknown Location'
  }

  // Update marker when search selects a location
  useEffect(() => {
    if (selectedLocation.lat !== null && selectedLocation.lng !== null) {
      onLocationSelect(selectedLocation)
      mapRef.current?.animateCamera({
        center: { latitude: selectedLocation.lat, longitude: selectedLocation.lng },
      })
    }
  }, [selectedLocation])

  const faceNorth = () => {
    if (mapRef.current) {
      mapRef.current.animateCamera({ heading: 0, pitch: 0 }, { duration: 500 })
    }
  }

  const centerOnUser = async () => {
    if (!region) return
    mapRef.current?.animateToRegion({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    })
  }

  // Show loading while fetching user location
  if (!region) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Search / Select Location */}
      <SearchLocation onSelect={setSelectedLocation} />

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        ref={mapRef}
        showsMyLocationButton={false}
        showsCompass={false}
        initialRegion={region}
        onPress={async (e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate
          const address = await fetchAddress(latitude, longitude)
          setSelectedLocation({ lat: latitude, lng: longitude, address })
        }}
      >
        {selectedLocation.lat !== null && selectedLocation.lng !== null && (
          <Marker
            coordinate={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng,
            }}
            draggable
            title="Tap or drag to mark area of accident"
            description={selectedLocation.address || 'unkownlocation'}
            onDragEnd={async (e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate
              const address = await fetchAddress(latitude, longitude)
              setSelectedLocation({ lat: latitude, lng: longitude, address })
            }}
          />
        )}
      </MapView>

      {/* Custom buttons */}
      <View style={styles.customButtons}>
        <TouchableOpacity style={styles.myLocation} onPress={faceNorth}>
          <Entypo name="compass" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.myLocation} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

export default SelectLocation

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  customButtons: {
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
