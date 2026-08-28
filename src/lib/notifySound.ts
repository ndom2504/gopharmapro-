import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { NotificationType, notifyMeta } from './notifyUi';

const files = {
  payment: require('../../assets/sounds/payment.wav'),
  payout: require('../../assets/sounds/payout.wav'),
  catalog: require('../../assets/sounds/catalog.wav'),
};

type AudioModule = typeof import('expo-audio');
type Player = ReturnType<AudioModule['createAudioPlayer']>;

let audioMod: AudioModule | null | undefined;
let modeReady = false;
let current: Player | null = null;

async function loadAudio() {
  if (audioMod !== undefined) return audioMod;
  try {
    audioMod = await import('expo-audio');
    return audioMod;
  } catch {
    audioMod = null;
    return null;
  }
}

function releasePlayer(player: Player | null) {
  if (!player) return;
  try {
    player.pause();
  } catch {
    //
  }
  try {
    player.remove();
  } catch {
    //
  }
}

export async function playNotifySound(type: NotificationType) {
  try {
    const Audio = await loadAudio();
    if (!Audio) return;
    if (!modeReady) {
      await Audio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        allowsRecording: false,
        interruptionMode: 'mixWithOthers',
      });
      modeReady = true;
    }
    releasePlayer(current);
    current = null;
    const player = Audio.createAudioPlayer(files[notifyMeta[type].sound]);
    current = player;
    player.volume = 1;
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish) return;
      sub.remove();
      releasePlayer(player);
      if (current === player) current = null;
    });
    player.play();
  } catch {
    audioMod = null;
    current = null;
  }
}

export async function notifyHaptic(type: NotificationType) {
  if (Platform.OS === 'web') return;
  try {
    if (type === 'payment' || type === 'payout') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch {
    //
  }
}
