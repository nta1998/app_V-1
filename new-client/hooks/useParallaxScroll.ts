import { useRef } from 'react';
import { Animated } from 'react-native';

export function useParallaxScroll() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroScale = scrollY.interpolate({
    inputRange: [-300, 0],
    outputRange: [2.5, 1],
    extrapolateRight: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [-300, 0],
    outputRange: [-150, 0],
    extrapolateRight: 'clamp',
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  return { scrollY, heroScale, heroTranslateY, onScroll };
}
