import {StyleSheet, StatusBar, View, TextInput, TouchableOpacity, Pressable, Text
} from "react-native"
import React, { useState } from "react"
import Constants from "expo-constants"
import Feather from "@expo/vector-icons/Feather"
import { ThemedView } from "@/components/themed-view"

const GOOGLE_API_KEY = Constants?.expoConfig?.extra?.googleApiKey

type SearchLocationProps = {
  onSelect: (location: {
    address: string
    lat: number | null
    lng: number | null
  }) => void
}

const SearchLocation = ({ onSelect }: SearchLocationProps) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState<string | null>(null)

  // Fetch autocomplete suggestions
  const fetchPlaces = async (text: string) => {
    setQuery(text)

    if (text.length < 2) {
      setResults([])
      return
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${GOOGLE_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (data?.predictions) setResults(data.predictions)
    } catch (error) {
      console.log("Location search error:", error)
    }
  }

  // Handle selecting a suggestion
  const handleSelect = async (item: any) => {
    setSelected(item.description)
    setResults([])
    setQuery(item.description)

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        item.description
      )}&key=${GOOGLE_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (data?.results?.length > 0) {
        const { lat, lng } = data.results[0].geometry.location

        onSelect({ address: item.description, lat, lng })
      } else {
        onSelect({ address: item.description, lat: null, lng: null })
      }
    } catch (err) {
      console.log("Geocode error:", err)
      onSelect({ address: item.description, lat: null, lng: null })
    }
  }

  // Clear text & selection
  const clearSelection = () => {
    setSelected(null)
    setQuery("")
    setResults([])

    onSelect({ address: "", lat: null, lng: null })
  }

  return (
    <View style={styles.container}>
      <ThemedView style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search location..."
          value={selected || query}
          onChangeText={fetchPlaces}
        />

        {selected && (
          <Pressable style={styles.clearBtn} onPress={clearSelection}>
            <Feather name="x" size={18} color="black" />
          </Pressable>
        )}
      </ThemedView>

      {results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((item: any) => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.item}
              onPress={() => handleSelect(item)}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

export default SearchLocation

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: StatusBar.currentHeight || 20,
    left: 10,
    right: 10,
    zIndex: 10,
  },

  searchBox: {
    backgroundColor: '#0000005b'
  },

  input: {
    height: 40,
    fontSize: 16,
  },

  clearBtn: {
    position: "absolute",
    right: 12,
    top: 10,
  },

  dropdown: {
    marginTop: 5,
    backgroundColor: "#7b7b7b56",
    borderRadius: 10,
    paddingVertical: 5,
    maxHeight: 200,
    overflow: "hidden",
    elevation: 3,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
})
