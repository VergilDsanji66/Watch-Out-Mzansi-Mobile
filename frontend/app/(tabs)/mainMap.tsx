import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region, Polyline, LatLng } from 'react-native-maps'
import Constants from "expo-constants"
import * as Location from 'expo-location'

import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import SearchLocation from '../components/SearchLocation'

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

const GOOGLE_API_KEY = Constants?.expoConfig?.extra?.googleApiKey
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reports, setReports] = useState<ReportData[]>([])
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<LocationType>({
    address: '',
    lat: null,
    lng: null
  })

  const mapRef = useRef<MapView>(null)

  const destination = {
    latitude: -22.9757,
    longitude: 30.4444,
}

  
  // 1) Get user location
  
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required.')
          return
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        })

        const userCoords = { latitude: coords.latitude, longitude: coords.longitude }
        setUserLocation(userCoords)

        const newRegion: Region = {
          ...userCoords,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }

        setRegion(newRegion)

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [userCoords, destination],
            {
              edgePadding: {top: 80, right: 80, bottom: 80, left: 80},
              animated: true,
            }
          )
        }
      } catch (err) {
        Alert.alert("Location Error", "Unable to fetch your location.");
      }
    }

    getLocation()
  }, [])

  
  // 2) Fetch DB reports
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/reports/`)
        if (!response.ok) throw new Error(`HTTP error ${response.status}`)
        const json = await response.json()
        setReports(json)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  
  // 3) Update region when selecting a location
  
  useEffect(() => {
    if (selectedLocation.lat && selectedLocation.lng && region) {
      const newRegion: Region = {
        ...region,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      }
      setRegion(newRegion)
      mapRef.current?.animateToRegion(newRegion, 600)
    }
  }, [selectedLocation])

  // 4) Advanced features for GPS route
  const fetchRouteCoordinates = async (source: LatLng, description: LatLng) => {
    try {
      const ROUTE_URL = `https://maps.googleapis.com/maps/api/directions/json?origin=${source.latitude},${source.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}`
      
      const response = await fetch(ROUTE_URL)
      const json = await response.json()

      if (json.routes.length) {
        const points = decodePolyline(json.routes[0].overview_polyline.points)
        return points
      } else {
        Alert.alert('Route not found')
        return []
      }

    } catch(err) {
      Alert.alert('Error fetching route', String(err))
    }
  }

  // Polyline decoder
  const decodePolyline = (t: string, precision: number = 5) : {latitude: number, longitude: number}[] => {
    let points:{latitude: number, longitude: number}[] = []
    let index = 0
    let lat = 0
    let lng = 0

    const factor = Math.pow(10, precision)

    while (index < t.length) {
      let b:number , shift = 0, results = 0

      // decoder for latitude
      do {
        b = t.charCodeAt(index++) - 63
        results |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlat = (results & 1) ? ~(results >> 1) : results >> 1
      lat += dlat

      shift = 0
      results = 0
      do {
        b = t.charCodeAt(index++) - 63
        results |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlng = (results & 1) ? ~(results >> 1) : results >> 1
      lng += dlng

      points.push({
        latitude: lat / factor,
        longitude: lng / factor
      })
    }

    return points
  }

  useEffect(() => {
      const getRoute = async () => {
        if (!userLocation) return;

        try {
          const ROUTE_URL = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}`;

          const response = await fetch(ROUTE_URL);
          const json = await response.json();

          if (json.routes.length) {
            const points = decodePolyline(json.routes[0].overview_polyline.points);
            setRouteCoordinates(points);
          } else {
            Alert.alert('Route not found');
          }
        } catch (err) {
          Alert.alert('Error fetching route', String(err));
        }
      };

      getRoute();
    }, [userLocation]);
  
  // Loading UI
  if (!region || loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading map...</ThemedText>
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
  
  // MAIN UI
  return (
    <ThemedView style={{ flex: 1 }}>
      <SearchLocation onSelect={setSelectedLocation} />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* User-selected marker */}
        {selectedLocation.lat && selectedLocation.lng && (
          <Marker
            draggable
            coordinate={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng,
            }}
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate
              setSelectedLocation(prev => ({ ...prev, lat: latitude, lng: longitude }))
            }}
          />
        )}

        <Marker coordinate={destination} title="Destination" />
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#1E90FF"
            strokeWidth={4}
          />
        )}

        {/* DB Report markers */}
        {reports.map(report => {
          const color = "#FFCC00"
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
                fillColor={`${color}33`}
                strokeColor="transparent"
              />
            </React.Fragment>
          )
        })}
      </MapView>

      {/* Buttons */}
      <View style={styles.customButtons}>
        <TouchableOpacity style={styles.myLocation} onPress={() => {
          if (region && mapRef.current) {
            mapRef.current.animateCamera({ heading: 0, pitch: 0 }, { duration: 500 })
          }
        }}>
          <Entypo name="compass" size={35} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.myLocation} onPress={async () => {
          const { coords } = await Location.getCurrentPositionAsync({})
          mapRef.current?.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }, 800)
        }}>
          <MaterialIcons name="my-location" size={35} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

export default MainMap

// Styles

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  customButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 7,
    flexDirection: 'column',
  },
  myLocation: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#ffffff3d',
  },
})
