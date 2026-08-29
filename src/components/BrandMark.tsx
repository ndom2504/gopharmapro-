import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

const mark = require('../../assets/mark.png');
const wordmark = require('../../assets/logo-auth.png');

export function BrandWordmark({
  width = 220,
  style,
}: {
  width?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={wordmark}
      accessibilityLabel="Go Pharma Pro"
      style={[{ width, height: width }, style]}
      resizeMode="contain"
    />
  );
}

export function BrandMark({ size = 112, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderRadius: 16, // Arrondi léger au lieu d'un cercle
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Image
        source={mark}
        accessibilityLabel="Go Pharma Pro"
        style={{ width: '90%', height: '90%' }}
        resizeMode="contain"
      />
    </View>
  );
}

export function BrandSplash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <BrandWordmark width={240} />
    </View>
  );
}
