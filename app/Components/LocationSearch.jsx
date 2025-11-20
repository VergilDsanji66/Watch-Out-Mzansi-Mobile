import { View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Constants from 'expo-constants';
import Feather from '@expo/vector-icons/Feather';

const GOOGLE_API_KEY = Constants?.expoConfig?.extra?.googleApiKey;

const LocationSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch autocomplete suggestions
  const fetchPlaces = async (text) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.predictions) setResults(data.predictions);
    } catch (error) {
      console.log('Location search error:', error);
    }
  };

  // Handle selecting a location
  const handleSelect = async (item) => {
    setSelected(item.description);
    setResults([]);
    setQuery(item.description);

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        item.description
      )}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.results?.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        onSelect({ address: item.description, lat, lng }); // Move map marker
      } else {
        onSelect({ address: item.description, lat: null, lng: null });
      }
    } catch (err) {
      console.log('Geocode error:', err);
      onSelect({ address: item.description, lat: null, lng: null });
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    onSelect({ address: '', lat: null, lng: null });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Search Location..."
          value={selected || query}
          onChangeText={fetchPlaces}
        />
        {selected && (
          <Pressable style={styles.clearBtn} onPress={clearSelection}>
            <Feather name="x" size={20} color="black" />
          </Pressable>
        )}
      </View>

      {results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((item) => (
            <TouchableOpacity key={item.place_id} onPress={() => handleSelect(item)}>
              <Text style={styles.item}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default LocationSearch;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    zIndex: 10,
    top: 30,
    left: 16,
    right: 16,
    borderRadius: 5,
    position: 'absolute',
    backgroundColor: '#ffffffaa',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 40,
    borderColor: '#000000ff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingRight: 30,
  },
  clearBtn: {
    position: 'absolute',
    right: 5,
    top: 8,
    padding: 2,
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'center',
  },
});
