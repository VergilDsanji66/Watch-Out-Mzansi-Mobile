# WatchOut Mzansi Mobile App

## Description
WatchOut Mzansi is a community-driven mobile application designed to enhance public safety in South Africa. The app enables real-time tracking and reporting of unsafe areas, helping users navigate their surroundings more safely by:

- Displaying real-time crime hotspots on an interactive map
- Providing community-driven incident reporting
- Offering alternative route suggestions to avoid dangerous areas
- Sending early warning notifications when approaching high-risk zones

## Features
- 📍 Real-time location tracking
- 🗺️ Interactive Google Maps integration
- ⚠️ Community incident reporting system
- 🔔 Early warning notifications
- 🛣️ Safe route navigation
- 📱 User-friendly interface

## Prerequisites
- Node.js (v18 or higher)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Running on android/Apple
```bash 
download/open expo Go and scan the QR Code
```

## Required Dependencies
```json
{
  "expo": "~54.0.22",
  "expo-location": "~19.0.7",
  "react-native-maps": "1.20.1",
  "@expo/vector-icons": "^15.0.3",
  "expo-router": "~6.0.14"
}
```

## Environment Setup
1. Get a Google Maps API key from the Google Cloud Console
2. Add your API key to `app.json` in the iOS and Android configurations

## Safety Notice
This app is designed to enhance safety awareness but should not be relied upon as the sole means of ensuring personal safety. Always exercise caution and contact emergency services (10111) in case of immediate danger.