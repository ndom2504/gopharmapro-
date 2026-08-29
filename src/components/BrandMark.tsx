import { Image, ImageStyle, StyleProp, View } from 'react-native';

const mark = require('../../assets/mark.png');

export function BrandMark({ size = 112, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={mark}
      accessibilityLabel="Gopharmapro"
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      resizeMode="contain"
    />
  );
}

export function BrandSplash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
      <BrandMark size={200} />
    </View>
  );
}
