import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { isLoggedIn } from '../lib/auth';
import { initI18n } from '../lib/i18n';
import { router } from 'expo-router';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await initI18n();
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/welcome');
    }
    setReady(true);
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}