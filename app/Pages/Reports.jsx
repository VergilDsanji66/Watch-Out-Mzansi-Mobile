import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import Menu from '../Components/Menu';

const CRIME_TYPES = [
  "Theft",
  "Robbery",
  "Assault",
  "Murder",
  "Burglary",
  "Car Hijacking",
  "Kidnapping",
  "Fraud",
  "Vandalism",
  "Drug Trafficking",
  "Other"
];

const Reports = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
      <View style={styles.container}>
        
        <View style={styles.ReportContainer}>
          <Text style={styles.title}>Make Your Report</Text>
          <Text style={styles.description}>
            Your experience matters. Help protect others by sharing what happened.
            Your report will warn the community and help build a safer environment
            for everyone.
          </Text>

          {/* Search Input */}
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="Search Crime Type"
              value={searchText}
              onChangeText={handleSearch}
            />

            {showDropdown && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDropdown(false)}
              >
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdown */}
          {showDropdown && filteredList.length > 0 && (
            <FlatList
              style={styles.dropdown}
              data={filteredList}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleCrimeSelection(item)}>
                  <Text style={styles.item}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Selected Tags */}
          <View style={styles.selectedContainer}>
            {selectedCrime.map((crime) => (
              <Text key={crime} style={styles.selected}>
                {crime}
              </Text>
            ))}
          </View>
        </View>

        {/* Bottom Menu */}
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
    padding: 10,
  },

  title: {
    textAlign: 'center',
    fontSize: 24,
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
    borderColor: '#000000ff',
    borderRadius: 5,
    padding: 10,
  },

  dropdown: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#e9e9e998',
    maxHeight: 150,
    marginTop: 5,
    borderRadius: 5,
  },

  item: {
    width: '100%',
    textAlign: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  selected: {
    backgroundColor: '#4a90e2',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },

  closeButton: {
    position: 'absolute',
    right: 10,
    top: 8,
    zIndex: 10,
    padding: 4,
  },

  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
