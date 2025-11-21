import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Menu from '../Components/Menu';
import { reportsDB } from '../../data/data';
import LocationSearch from '../Components/LocationSearch';

// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

const CRIME_COLORS = {
  Theft: "#1E90FF",
  Robbery: "#FF4500",
  Assault: "#8B0000",
  Murder: "#FF0000",
  Burglary: "#800080",
  "Car Hijacking": "#000000",
  Kidnapping: "#FF1493",
  Fraud: "#228B22",
  Vandalism: "#A0522D",
  "Drug Trafficking": "#708090"
};

const MainMap = () => {
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({ address: '', lat: null, lng: null });

  const mapRef = useRef(null);

  // Custom centerIcon function
  const centerOnUser = async () => {
    let { coords } = await Location.getCurrentPositionAsync({});
    mapRef.current.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    })
  }

  // custom compass function
  const faceNorth = () => {
    mapRef.current.animateCamera({
      heading: 0,
      pitch: 0,
    })
  }

  // Load reports
  useEffect(() => {
    setReports([...reportsDB]);
  }, []);

  // Get user location
  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });

      setLocation(loc);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
        (newLoc) => setLocation(newLoc)
      );
    })();

    return () => subscription && subscription.remove();
  }, []);

  // Animate to selected location whenever it changes
  useEffect(() => {
    if (selectedLocation.lat && selectedLocation.lng && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        },
        zoom: 17 // closer zoom
      });
    }
  }, [selectedLocation]);

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
      <LocationSearch onSelect={setSelectedLocation} />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={MapView.PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Selected location marker */}
        {selectedLocation.lat && selectedLocation.lng && (
          <Marker
            coordinate={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng
            }}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setSelectedLocation((prev) => ({
                ...prev,
                lat: latitude,
                lng: longitude
              }));
            }}
          />
        )}

        {/* Crime reports */}
        {reports.map((report) => {
          if (!report.latLng) return null;
          const crime = report.crimes?.[0];
          const color = CRIME_COLORS[crime] || "#FFCC00";

          return (
            <React.Fragment key={report.id}>
              <Marker
                coordinate={{
                  latitude: Number(report.latLng.lat),
                  longitude: Number(report.latLng.lng),
                }}
              >
                <MaterialCommunityIcons name="sign-caution" size={28} color={color} />
              </Marker>

              <Circle
                center={{
                  latitude: Number(report.latLng.lat),
                  longitude: Number(report.latLng.lng),
                }}
                radius={20}
                strokeColor="transparent"
                fillColor={`${color}33`}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      <View style={styles.customButtons}>
        {/* Custom compass */}
        <TouchableOpacity style={styles.myLocation} onPress={faceNorth}>
          <Entypo name="compass" size={35} color="#fff" />
        </TouchableOpacity>
        {/* Show my Location custom button */}
        <TouchableOpacity style={styles.myLocation} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={35} color="#fff" />
        </TouchableOpacity>
      </View>

      <Menu prop="Map" />
    </View>
  );
};

export default MainMap;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  customButtons:{
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    bottom: 115,
    right: 20,
  },
  myLocation: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#ffffff3d',
  },
});
