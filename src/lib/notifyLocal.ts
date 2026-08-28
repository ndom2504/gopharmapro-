import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { NotificationType, notifyMeta } from './notifyUi';

let handlerReady = false;
let asked = false;

/** Push Android retiré d’Expo Go (SDK 53+) : importer le package plante. */
function skipSystemNotifications() {
  return Platform.OS === 'web' || (Platform.OS === 'android' && isRunningInExpoGo());
}

async function notifications() {
  return import('expo-notifications');
}

export async function setupLocalNotifications() {
  if (skipSystemNotifications()) return;
  try {
    const Notifications = await notifications();
    if (!handlerReady) {
      handlerReady = true;
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('payments', {
        name: 'Paiements',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 240, 80, 240, 80, 320],
        sound: 'payment.wav',
        enableVibrate: true,
        lightColor: '#087F5B',
      });
      await Notifications.setNotificationChannelAsync('catalog', {
        name: 'Médicaments',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 160, 90, 160],
        sound: 'catalog.wav',
        enableVibrate: true,
        lightColor: '#1C7ED6',
      });
    }
  } catch {
    //
  }
}

export async function presentLocalNotification(
  title: string,
  body: string,
  type: NotificationType = 'catalog_new',
  playSound = true,
) {
  if (skipSystemNotifications()) return;
  try {
    await setupLocalNotifications();
    const Notifications = await notifications();
    if (!asked) {
      asked = true;
      const current = await Notifications.getPermissionsAsync();
      if (current.status !== 'granted') await Notifications.requestPermissionsAsync();
    }
    const granted = await Notifications.getPermissionsAsync();
    if (granted.status !== 'granted') return;
    const meta = notifyMeta[type];
    const soundFile = meta.sound + '.wav';
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: playSound ? soundFile : false,
        vibrate: playSound ? [0, 220, 100, 220] : [],
      },
      trigger: null,
      ...(Platform.OS === 'android' ? { android: { channelId: meta.channel } } : {}),
    } as Parameters<typeof Notifications.scheduleNotificationAsync>[0]);
  } catch {
    // Expo Go / permission
  }
}
