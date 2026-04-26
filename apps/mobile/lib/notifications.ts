import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register device for push notifications
export const registerForPushNotifications = async (): Promise<string | null> => {
  // Push notifications only work on real devices
  if (!Device.isDevice) {
    console.log('Push notifications require a real device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask for permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get the Expo push token
    const token = await Notifications.getExpoPushTokenAsync({
    projectId: '1b67d243-5bed-46bd-bb2a-82a042995212',
    });

  console.log('Push token:', token.data);

  // Send token to Spring Boot backend
  try {
    await api.post('/notifications/register', {
      token: token.data,
    });
  } catch (err) {
    console.log('Could not register token with backend:', err);
  }

  return token.data;
};

// Listen for incoming notifications
export const addNotificationListener = (
  handler: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(handler);
};

// Listen for notification taps
export const addNotificationResponseListener = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};