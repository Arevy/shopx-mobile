import React from 'react';
import {StyleSheet} from 'react-native';
import {BottomTabBar, type BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useDrawerProgress} from '@react-navigation/drawer';

export const AnimatedBottomTabBar: React.FC<BottomTabBarProps> = props => {
  const drawerProgress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const progressValue = drawerProgress?.value ?? 0;
    const translateY = interpolate(progressValue, [0, 1], [0, 72], Extrapolation.CLAMP);
    const opacity = interpolate(progressValue, [0, 1], [1, 0], Extrapolation.CLAMP);
    return {
      transform: [{translateY}],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 8,
  },
});
