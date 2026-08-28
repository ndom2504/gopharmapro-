import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const DIR = (FileSystem.documentDirectory || '') + 'product-photos/';
const MAX = 5;

async function persist(uri: string) {
  try {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + '.jpg';
    const dest = DIR + name;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return uri;
  }
}

export async function pickProductImages(current: string[]) {
  const remaining = MAX - current.length;
  if (remaining <= 0) {
    Alert.alert('Photos', 'Vous pouvez ajouter jusqu’à 5 photos par produit.');
    return current;
  }
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Photos', 'Autorisez l’accès à la galerie pour téléverser les images du produit.');
    return current;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 0.7,
  });
  if (result.canceled) return current;
  const saved = await Promise.all(result.assets.map((a) => persist(a.uri)));
  return [...current, ...saved].slice(0, MAX);
}

export async function takeProductPhoto(current: string[]) {
  if (current.length >= MAX) {
    Alert.alert('Photos', 'Vous pouvez ajouter jusqu’à 5 photos par produit.');
    return current;
  }
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Appareil photo', 'Autorisez l’appareil photo pour photographier le produit.');
    return current;
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled || !result.assets[0]) return current;
  const saved = await persist(result.assets[0].uri);
  return [...current, saved].slice(0, MAX);
}
