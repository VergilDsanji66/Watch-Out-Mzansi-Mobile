// Map.jsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

const Map = () => {
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // initial position
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

      // live updates (including heading)
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,      // ms
          distanceInterval: 1,     // meters
        },
        (newLoc) => {
          setLocation(newLoc);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Getting your location…</Text>
        {errorMsg && <Text>{errorMsg}</Text>}
      </View>
    );
  }

  const heading = location?.coords.heading; // in degrees, 0 = North

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={MapView.PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        followsUserLocation
      />
      <View style={styles.headingBox}>
        <Text style={styles.headingText}>
          Heading: {Number.isFinite(heading) ? `${Math.round(heading)}°` : 'N/A'}
        </Text>
      </View>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBox: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headingText: {
    color: '#fff',
    fontWeight: '600',
  },
});
