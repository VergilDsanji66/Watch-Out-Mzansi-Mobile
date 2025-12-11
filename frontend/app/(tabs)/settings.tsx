import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const settings = () => {
  return (
    <ThemedView style={{flex: 1, paddingTop: StatusBar.currentHeight }}>
      <ThemedText type="title">Welcome!</ThemedText>
    </ThemedView>
  )
}

export default settings