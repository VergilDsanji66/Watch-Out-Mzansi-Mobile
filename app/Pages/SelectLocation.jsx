import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator, Animated } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Link, router } from 'expo-router';
import { useReportStore } from '../../data/reportStore';

// ⭐ ADD THIS
import LocationSearch from '../Components/LocationSearch';

const SelectLocation = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const mapRef = useRef(null); // ⭐ Needed to move map after search

  const { setSelectedAddress, setSelectedLatLng } = useReportStore();
  const GOOGLE_API_KEY = Constants?.expoConfig?.extra?.googleApiKey;

  const doneOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const isEnabled = selectedLocation && address && !loadingAddress;
    Animated.timing(doneOpacity, {
      toValue: isEnabled ? 1 : 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedLocation, address, loadingAddress]);

  const handleDone = () => {
    if (!selectedLocation || !address || loadingAddress) return;
    setSelectedAddress(address);
    setSelectedLatLng({
      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude,
    });
    router.back();
  };

  // Load user location
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
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
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

  // Reverse geocode
  const fetchAddress = async (lat, lng) => {
    setLoadingAddress(true);
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
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapPress = ({ nativeEvent }) => {
    const coordinate = nativeEvent.coordinate;
    setSelectedLocation(coordinate);
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  const handleDragEnd = ({ nativeEvent }) => {
    const coordinate = nativeEvent.coordinate;
    setSelectedLocation(coordinate);
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  // ⭐ Called when user selects from LocationSearch
  const onSelectFromSearch = ({ address, lat, lng }) => {
    if (!lat || !lng) return;

    setSelectedLocation({ latitude: lat, longitude: lng });
    setAddress(address);

    // Move map to position
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });
  };

  const isDoneDisabled = !selectedLocation || !address || loadingAddress;

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

      {/* ⭐ LOCATION SEARCH BAR */}
      <LocationSearch onSelect={onSelectFromSearch} />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        onPress={handleMapPress}
      >
        {selectedLocation && (
          <>
            <Marker
              draggable
              coordinate={selectedLocation}
              onDragEnd={handleDragEnd}
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
          {loadingAddress
            ? "Fetching address..."
            : address
              ? address
              : "Tap the map or drag the marker to select a location"}
        </Text>
      </View>

      <View style={styles.bottomView}>
        <Link style={styles.button} href={{ pathname: '/Pages/Reports' }}>
          <Text style={{ fontWeight: 'bold', color: '#ff0000ff' }}>Cancel</Text>
        </Link>
        <Animated.View style={{ opacity: doneOpacity, flex: 1, marginLeft: 10 }}>
          <Pressable
            style={[styles.button, isDoneDisabled && { backgroundColor: '#ccc' }]}
            onPress={handleDone}
            disabled={isDoneDisabled}
          >
            <Text style={{ fontWeight: 'bold', color: isDoneDisabled ? '#888' : '#000' }}>Done</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

export default SelectLocation;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addressBox: {
    position: 'absolute',
    top: 90,   // ⭐ moved DOWN because of search bar
    right: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  bottomView: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    bottom: 30,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
});
