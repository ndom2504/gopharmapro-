import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import type { RxKind } from './rxGate';

const DIR = (FileSystem.documentDirectory || '') + 'prescriptions/';

export type PickedRx = { uri: string; fileName: string; kind: RxKind };

function extOf(name: string, mime?: string | null) {
  const lower = (name || '').toLowerCase();
  if (lower.endsWith('.pdf') || mime === 'application/pdf') return 'pdf';
  if (lower.endsWith('.png') || mime === 'image/png') return 'png';
  return 'jpg';
}

async function persist(uri: string, fileName: string, mime?: string | null): Promise<PickedRx | null> {
  try {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
    const ext = extOf(fileName, mime);
    const dest = DIR + Date.now() + '-' + Math.round(Math.random() * 1e6) + '.' + ext;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return { uri: dest, fileName: fileName || 'ordonnance.' + ext, kind: ext === 'pdf' ? 'pdf' : 'image' };
  } catch {
    Alert.alert('Ordonnance', 'Impossible d’enregistrer le fichier. Réessayez.');
    return null;
  }
}

export async function takeRxPhoto(): Promise<PickedRx | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Appareil photo', 'Autorisez l’appareil photo pour photographier l’ordonnance.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled || !result.assets[0]) return null;
  return persist(result.assets[0].uri, 'ordonnance.jpg', result.assets[0].mimeType);
}

export async function pickRxFromLibrary(): Promise<PickedRx | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Photos', 'Autorisez l’accès à la galerie pour choisir une photo d’ordonnance.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return persist(asset.uri, asset.fileName || 'ordonnance.jpg', asset.mimeType);
}

export async function pickRxDocument(): Promise<PickedRx | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return persist(asset.uri, asset.name || 'ordonnance', asset.mimeType);
}
