import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Link, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import Menu from '../Components/Menu';

const CRIME_TYPES = [
  "Theft", "Robbery", "Assault", "Murder", "Burglary",
  "Car Hijacking", "Kidnapping", "Fraud", "Vandalism",
  "Drug Trafficking", "Other"
];

const GOOGLE_API_KEY = Constants?.expoConfig?.extra?.googleApiKey;

const Reports = () => {
  const params = useLocalSearchParams();

  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [query, setQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(params?.address || '');
  const [selectedLatLng, setSelectedLatLng] = useState({
    lat: params?.lat || null,
    lng: params?.lng || null
  });

  const [additionalInfo, setAdditionalInfo] = useState('');
  const [image, setImage] = useState(null);

  // Crime Search
  const handleSearch = (text) => {
    setSearchText(text);
    if (!text) {
      setFilteredList([]);
      setShowDropdown(false);
      return;
    }
    const results = CRIME_TYPES.filter((crime) =>
      crime.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredList(results);
    setShowDropdown(true);
  };

  const toggleCrimeSelection = (crime) => {
    if (selectedCrime.includes(crime)) {
      setSelectedCrime(selectedCrime.filter((item) => item !== crime));
    } else {
      setSelectedCrime([...selectedCrime, crime]);
    }
    setShowDropdown(false);
  };

  const removeCrime = (crime) => {
    setSelectedCrime(selectedCrime.filter(c => c !== crime));
  };

  // Date + Time Picker Handler
  const onChange = (_, selectedDate) => {
    setShowDatePicker(false);
    setShowTimePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // Google Places Search Handler
  const fetchPlaces = async (text) => {
    setQuery(text);

    if (text.length < 2) {
      setLocationResults([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) setLocationResults(data.predictions);
    } catch (error) {
      console.log("Location Error →", error);
    }
  };

  // Select location from search
  const selectLocationResult = (item) => {
    setQuery(item.description);
    setLocationResults([]);
    setSelectedAddress(item.description);
    setSelectedLatLng({ lat: null, lng: null }); // Not from map
  };

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return alert("Permission denied to access images!");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Submit Handler
  const handleSubmit = () => {
    const reportData = {
      date: date.toString(),
      crimes: selectedCrime,
      additionalInfo,
      address: selectedAddress,
      latLng: selectedLatLng,
      image
    };
    console.log("Report Submitted →", reportData);
    alert("Report submitted! Check console for data.");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.ReportContainer}
          enableOnAndroid
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <Text style={styles.title}>Make Your Report</Text>
          <Text style={styles.description}>
            Your experience matters. Help protect others by sharing what happened.
          </Text>

          {/* Crime Type Search */}
          <View>
            <TextInput
              style={styles.input}
              placeholder="Search Crime Type"
              value={searchText}
              onChangeText={handleSearch}
            />

            {showDropdown && filteredList.length > 0 && (
              <View style={styles.dropdown}>
                {filteredList.map((item) => (
                  <TouchableOpacity key={item} onPress={() => toggleCrimeSelection(item)}>
                    <Text style={styles.item}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Selected Crime Tags */}
          <View style={styles.selectedContainer}>
            {selectedCrime.map((crime) => (
              <View key={crime} style={styles.selectedWrapper}>
                <Text style={styles.selected}>{crime}</Text>
                <Pressable onPress={() => removeCrime(crime)}>
                  <Text style={styles.removeX}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* Date Selector */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.selector}
          >
            <Text>Select Date: {date.toDateString()}</Text>
          </Pressable>

          {/* Time Selector */}
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={styles.selector}
          >
            <Text>Select Time: {date.toLocaleTimeString()}</Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={onChange}
            />
          )}

          {/* Additional Info */}
          <TextInput
            style={[styles.input, { height: 100, marginTop: 10 }]}
            placeholder="Additional Details (optional)"
            multiline
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
          />

          {/* Map Address */}
          <Text style={styles.underline}>Select Location:</Text>
          <Link
            href={{ pathname: "/Pages/Map", params: { id: "selectLocation" } }}
            asChild
          >
            <Pressable style={{ marginTop: 10 }}>
              <Text style={styles.input}>Use Google Maps</Text>
            </Pressable>
          </Link>

          {selectedAddress ? (
            <View style={styles.selectedAddressWrapper}>
              <Text style={styles.selectedAddress}>{selectedAddress}</Text>
              <Pressable onPress={() => setSelectedAddress('')}>
                <Text style={styles.removeX}>✕</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.centerText}>OR</Text>

          {/* Search by address */}
          <TextInput
            style={styles.input}
            placeholder="Type address or area"
            value={query}
            onChangeText={fetchPlaces}
          />

          {locationResults.length > 0 && (
            <View style={styles.dropdown}>
              {locationResults.map((item) => (
                <View key={item.place_id} style={styles.resultRow}>
                  <TouchableOpacity onPress={() => selectLocationResult(item)}>
                    <Text style={styles.item}>{item.description}</Text>
                  </TouchableOpacity>
                  <Pressable onPress={() => setLocationResults(locationResults.filter(i => i.place_id !== item.place_id))}>
                    <Text style={styles.removeX}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Image Upload */}
          <Text style={styles.underline}>Optional Image Upload:</Text>
          <Pressable style={styles.selector} onPress={pickImage}>
            <Text>{image ? "Change Image" : "Upload Image"}</Text>
          </Pressable>
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

          {/* Submit */}
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Submit Report</Text>
          </Pressable>

        </KeyboardAwareScrollView>

        <Menu prop="Reports" />

      </View>
    </TouchableWithoutFeedback>
  );
};

export default Reports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },

  ReportContainer: {
    padding: 15,
    paddingBottom: 120,
  },

  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },

  description: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },

  input: {
    width: '100%',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },

  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },

  item: {
    padding: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },

  selectedWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 2,
  },

  selected: {
    backgroundColor: '#4a90e2',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 4,
  },

  removeX: {
    fontSize: 16,
    color: '#ff0000',
    marginLeft: 4,
    fontWeight: 'bold',
  },

  selector: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#aaa",
    marginTop: 10,
    alignItems: 'center'
  },

  underline: {
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 15,
  },

  centerText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
  },

  selectedAddressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 10,
    backgroundColor: '#d0f0c0',
    borderRadius: 8,
  },

  selectedAddress: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },

  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  }
});
