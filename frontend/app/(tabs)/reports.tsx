import React, { useEffect, useState } from 'react'
import { View, StyleSheet, StatusBar, Text, TextInput, TouchableOpacity, Pressable, Platform, Image, ScrollView } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { ThemedView } from '@/components/themed-view'
import SelectLocation from '../components/SelectLocation'


// Type for CrimeType from backend
type CrimeType = {
  id: number
  name: string
}

// Default user_id
const USER_ID = 1

const Reports = () => {
  const [crimetypes, setCrimeTypes] = useState<CrimeType[]>([])
  const [selectedCrime, setSelectedCrime] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [filteredList, setFilteredList] = useState<CrimeType[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const [additionalInfo, setAdditionalInfo] = useState('')
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const [image, setImage] = useState<string | null>(null)

  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null)

  // Fetch crime types
  useEffect(() => {
    async function fetchCrimeTypes() {
      try {
        const res = await fetch('http://192.168.110.185:8000/crimetype/')
        if (!res.ok) throw new Error('Failed to fetch crime types')
        const data: CrimeType[] = await res.json()
        setCrimeTypes(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCrimeTypes()
  }, [])

  // Crime search
  const handleSearch = (text: string) => {
    setSearchText(text)
    if (!text) {
      setFilteredList([])
      setShowDropdown(false)
      return
    }
    const results = crimetypes.filter(c => c.name.toLowerCase().includes(text.toLowerCase()))
    setFilteredList(results)
    setShowDropdown(true)
  }

  const toggleCrimeSelection = (crimeName: string) => {
    if (selectedCrime.includes(crimeName)) {
      setSelectedCrime(selectedCrime.filter(c => c !== crimeName))
    } else {
      setSelectedCrime([...selectedCrime, crimeName])
    }
    setShowDropdown(false)
    setSearchText('')
  }

  const removeCrime = (crime: string) => {
    setSelectedCrime(selectedCrime.filter(c => c !== crime))
  }

  // Date/Time picker
  
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false)
    setShowTimePicker(false)
    if (selectedDate) setDate(selectedDate)
  }

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return alert('Permission denied to access images!')

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    })

    if (!result.canceled) setImage(result.assets[0].uri)
  }

  // Submit report
  const handleSubmit = async () => {
    if (!selectedCrime.length) return alert('Select at least one crime type')

    try {
      for (let crimeName of selectedCrime) {
        const crime = crimetypes.find(c => c.name === crimeName)
        if (!crime) continue

        const reportData = {
          user_id: USER_ID,
          title: crimeName,
          description: additionalInfo,
          crime_type_id: crime.id,
          verification_id: 1, // temporary
          location_lat: selectedLatLng?.lat || 0,
          location_lng: selectedLatLng?.lng || 0,
          date_time: date.toISOString(),
          status: 'pending',
          img_url: image || null
        }

        const res = await fetch('http://192.168.110.185:8000/reports/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData),
        })

        console.log(reportData)

        if (!res.ok) throw new Error('Failed to submit report')
      }

      alert('Report submitted successfully!')
      // Reset form
      setSelectedCrime([])
      setAdditionalInfo('')
      setDate(new Date())
      setSelectedAddress('')
      setSelectedLatLng(null)
      setImage(null)
      setSearchText('')
    } catch (err) {
      console.error(err)
      alert('Error submitting report. Check console.')
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ReportContainer}
      >
        <Text style={styles.title}>Make Your Report</Text>
        <Text style={styles.description}>Help protect others by sharing what happened.</Text>

        {/* Crime Type */}
        <View>
          <TextInput
            style={styles.input}
            placeholder="Search Crime Type"
            value={searchText}
            onChangeText={handleSearch}
          />
          {showDropdown && filteredList.length > 0 && (
            <View style={styles.dropdown}>
              {filteredList.map(item => (
                <TouchableOpacity key={item.id} onPress={() => toggleCrimeSelection(item.name)}>
                  <Text style={styles.item}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Selected */}
        <View style={styles.selectedContainer}>
          {selectedCrime.map(crime => (
            <View key={crime} style={styles.selectedWrapper}>
              <Text style={styles.selected}>{crime}</Text>
              <Pressable onPress={() => removeCrime(crime)}>
                <Text style={styles.removeX}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Date + Time */}
        <Pressable onPress={() => setShowDatePicker(true)} style={styles.selector}>
          <Text>Select Date: {date.toDateString()}</Text>
        </Pressable>
        <Pressable onPress={() => setShowTimePicker(true)} style={styles.selector}>
          <Text>Select Time: {date.toLocaleTimeString()}</Text>
        </Pressable>
        {showDatePicker && <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChange} />}
        {showTimePicker && <DateTimePicker value={date} mode="time" onChange={onChange} />}

        <View style={{marginTop: 10}}>
          <SelectLocation
            onLocationSelect={(location: { address: string; lat: number | null; lng: number | null }) => {
              if (location.lat !== null && location.lng !== null) {
                setSelectedAddress(location.address)
                setSelectedLatLng({ lat: location.lat, lng: location.lng })
              }
            }}
          />
        </View>
        
        {/* Additional Info */}
        <TextInput
          style={[styles.input, { height: 100, marginTop: 10 }]}
          placeholder="Additional Details (optional)"
          multiline
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
        />

        {/* Image Upload */}
        <Pressable style={styles.selector} onPress={pickImage}>
          <Text>{image ? 'Change Image' : 'Upload Image'}</Text>
        </Pressable>
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        {/* Submit */}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Submit Report</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </ThemedView>
  )
}

export default Reports

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0 },
  ReportContainer: { 
      padding: 15, 
      paddingBottom: 120 
    },
  title: {
     textAlign: 'center', 
     fontSize: 26, 
     fontWeight: 'bold', 
     marginBottom: 10, textDecorationLine: 'underline' },
  description: {
     textAlign: 'center', 
     fontSize: 16, 
     marginBottom: 20 },
  input: {
     width: '100%', 
     textAlign: 'center', 
     borderWidth: 2, 
     borderColor: '#000', borderRadius: 5, padding: 10,  },
  dropdown: {
     marginTop: 5, 
     borderWidth: 1, 
     borderColor: '#ccc', 
     backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  item: {
     padding: 12, 
     textAlign: 'center', 
     borderBottomWidth: 1, 
     borderBottomColor: '#ccc' },
  selectedContainer: {
     flexDirection: 'row', 
     flexWrap: 'wrap', 
     marginTop: 10, 
     marginBottom: 10 },
  selectedWrapper: {
     flexDirection: 'row', 
     alignItems: 'center', 
     margin: 2 },
  selected: {
     backgroundColor: '#4a90e2', 
     color: '#fff', 
     paddingHorizontal: 10, 
     paddingVertical: 6, borderRadius: 20, marginRight: 4 },
  removeX: {
     fontSize: 16, 
     color: '#ff0000', 
     marginLeft: 4, 
     fontWeight: 'bold' },
  selector: {
     padding: 12, 
     borderWidth: 1, 
     borderRadius: 8, 
     borderColor: "#aaa", marginTop: 10, alignItems: 'center' },
  imagePreview: {
     width: '100%', 
     height: 200, 
     marginTop: 10, 
     borderRadius: 10 },
  submitButton: {
     backgroundColor: '#4a90e2', 
     padding: 15, 
     borderRadius: 10, 
     marginVertical: 20, alignItems: 'center' },
})
