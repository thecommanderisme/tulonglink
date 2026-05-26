import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import { initI18n } from '../lib/i18n';
import { isLoggedIn } from '../lib/auth';
import {
  registerForPushNotifications,
  addNotificationListener,
  addNotificationResponseListener
} from '../lib/notifications';
import { router } from 'expo-router';

export default function RootLayout() {
  const notificationsSetup = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    init();
    setupNotifications();
  }, [mounted]);

  const init = async () => {
    await initI18n();
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  const setupNotifications = async () => {
    if (notificationsSetup.current) return;
    notificationsSetup.current = true;
    await registerForPushNotifications();
    const notifListener = addNotificationListener(notification => {
      console.log('Notification received:', notification);
    });
    const responseListener = addNotificationResponseListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'job') router.push('/(tabs)/jobs');
      else if (data?.type === 'announcement') router.push('/(tabs)/feed');
    });
    return () => {
      notifListener.remove();
      responseListener.remove();
    };
  };

  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </I18nextProvider>
  );
}
