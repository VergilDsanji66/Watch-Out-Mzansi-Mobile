// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Wait a tiny moment to ensure RootLayout is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/mainMap');
    }, 0); // 0ms timeout works

    return () => clearTimeout(timer);
  }, []);

  // render a simple blank view while redirecting
  return <View style={{ flex: 1, paddingTop: StatusBar.currentHeight  }} />;
}
