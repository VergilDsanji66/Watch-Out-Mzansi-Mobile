// Map.jsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Pressable } from 'react-native';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import Menu from '../Components/Menu';
import { reportsDB } from '../../data/data'; // Temporary until SQL is used

const Map = () => {
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [typeOfMap, setTypeOfMap] = useState("CurrentLocation");
  const [address, setAddress] = useState('');
  const [reports, setReports] = useState([]);

  const GOOGLE_API_KEY = Constants?.expoConfig?.extra?.googleApiKey;
  const params = useLocalSearchParams();

  // Handle Map Type 
  useEffect(() => {
    if (params.id === "selectLocation") {
      setTypeOfMap("SelectLocation");
    } else {
      setTypeOfMap("CurrentLocation");
    }
  }, [params]);

  // Fetch Address from Lat/Lng 
  const fetchAddress = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data?.results?.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.log("Geocode error:", error);
      setAddress("Error fetching address");
    }
  };

  // Handle User Actions 
  const handleMapPress = ({ nativeEvent: { coordinate } }) => {
    setSelectedLocation(coordinate);
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  const handleMarkerDragEnd = ({ nativeEvent: { coordinate } }) => {
    setSelectedLocation(coordinate);
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  // Get User Location 
  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation(loc);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLoc) => setLocation(newLoc)
      );
    })();

    return () => subscription && subscription.remove();
  }, []);

  // Load Reports 
  useEffect(() => {
    setReports([...reportsDB]); // Load initial reports
  }, []);

  // Loading State 
  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Getting your location…</Text>
        {errorMsg && <Text>{errorMsg}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Location Map */}
      {typeOfMap === "CurrentLocation" && (
        <>
          <MapView
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation
            followsUserLocation
          >
            {reports.map((report) => {
              if (!report.latLng) return null;

              return (
                <React.Fragment key={report.id}>
                  <Marker
                    coordinate={{
                      latitude: Number(report.latLng.lat),
                      longitude: Number(report.latLng.lng),
                    }}
                  >
                    <View>
                      <MaterialIcons name="report-problem" size={24} color="#FFCC00" />
                    </View>
                  </Marker>
                  <Circle
                    center={{
                      latitude: Number(report.latLng.lat),
                      longitude: Number(report.latLng.lng),
                    }}
                    radius={100}
                    strokeColor="rgba(255,204,0, 0.8)"
                    fillColor="rgba(138, 111, 0, 0.2)"
                  />
                </React.Fragment>
              );
            })}
          </MapView>
          <Menu prop="Map" />
        </>
      )}

      {/* Select Location Map */}
      {typeOfMap === "SelectLocation" && (
        <>
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <>
                <Marker
                  coordinate={selectedLocation}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
                <Circle
                  center={selectedLocation}
                  radius={100}
                  strokeColor="rgba(0, 122, 255, 0.8)"
                  fillColor="rgba(0, 122, 255, 0.2)"
                />
              </>
            )}
          </MapView>

          <View style={styles.addressBox}>
            <Text style={{ color: '#000' }}>
              {address
                ? address
                : "Tap the map or drag the marker to select a location"}
            </Text>
          </View>

          <View style={styles.bottomView}>
            <Pressable
              style={styles.button}
              onPress={() => {
                if (!selectedLocation) return;

                router.push({
                  pathname: "/Pages/Reports",
                  params: {
                    address,
                    lat: selectedLocation.latitude,
                    lng: selectedLocation.longitude,
                  },
                });
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Done</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addressBox: {
    position: 'absolute',
    top: 50,
    right: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  bottomView: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 80,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
});
