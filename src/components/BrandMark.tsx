import { Image, StyleProp, View, ViewStyle } from 'react-native';

const mark = require('../../assets/mark.png');

export function BrandMark({ size = 112, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#E4EBE6',
        },
        style,
      ]}
    >
      <Image
        source={mark}
        accessibilityLabel="Gopharmapro"
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}

export function BrandSplash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
      <BrandMark size={200} />
    </View>
  );
}
