import {Animated as RNAnimated} from 'react-native';

type SharedValue<T> = {value: T};

type AnimatedStyle = Record<string, unknown>;

type AnimatedDerivedValue<T> = {
  value: T;
};

const noop = () => {};
const identity = <T>(value: T): T => value;

export const useSharedValue = <T>(initial: T): SharedValue<T> => ({value: initial});

export const useDerivedValue = <T>(factory: () => T): AnimatedDerivedValue<T> => ({
  value: factory(),
});

export const useAnimatedStyle = <T extends AnimatedStyle>(factory: () => T): T => factory();
export const useAnimatedProps = <T>(factory: () => T): T => factory();
export const useAnimatedReaction = noop;
export const useAnimatedScrollHandler = () => noop;
export const useAnimatedKeyboard = () => ({height: 0, state: 0});
export const useAnimatedSensor = () => ({
  sensor: {value: {x: 0, y: 0, z: 0, interfaceOrientation: 0, qw: 0, qx: 0, qy: 0, qz: 0, yaw: 0, pitch: 0, roll: 0}},
  unregister: noop,
  isAvailable: false,
  config: {interval: 0, adjustToInterfaceOrientation: false, iosReferenceFrame: 0},
});
export const useAnimatedRef = <T>() => ({current: null as T | null});
export const useScrollViewOffset = () => ({value: 0});
export const useScrollOffset = () => ({value: 0});

export const runOnJS = <T extends (...args: any[]) => any>(fn: T): T => fn;
export const runOnUI = <T extends (...args: any[]) => any>(fn: T): T => fn;

export const Extrapolation = {
  IDENTITY: 'identity',
  CLAMP: 'clamp',
  EXTEND: 'extend',
} as const;

const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolate: keyof typeof Extrapolation = 'CLAMP',
): number => {
  if (inputRange.length === 0 || inputRange.length !== outputRange.length) {
    return outputRange[0] ?? value;
  }

  const start = inputRange[0];
  const end = inputRange[inputRange.length - 1];

  if (start === end) {
    return outputRange[outputRange.length - 1];
  }

  const progress = (value - start) / (end - start);
  const clampedProgress = extrapolate === 'EXTEND' ? progress : clamp(progress, 0, 1);

  const from = outputRange[0];
  const to = outputRange[outputRange.length - 1];
  return from + (to - from) * clampedProgress;
};

export const withTiming = <T>(toValue: T): T => toValue;
export const withSpring = <T>(toValue: T): T => toValue;
export const withDelay = <T>(_delay: number, animation: T): T => animation;
export const withRepeat = <T>(animation: T): T => animation;
export const withSequence = <T>(...values: T[]): T => values[values.length - 1];
export const cancelAnimation = noop;

export const Layout = {
  duration: () => Layout,
  delay: () => Layout,
  springify: () => Layout,
  easing: () => Layout,
  withCallback: () => Layout,
  build: () => ({initialValues: {}, animations: {}}),
};

export const Easing = {
  linear: identity,
  ease: identity,
  quad: identity,
  cubic: identity,
  poly: identity,
  sin: identity,
  circle: identity,
  exp: identity,
  elastic: () => identity,
  back: () => identity,
  bounce: identity,
  bezier: () => ({factory: identity}),
  bezierFn: () => identity,
  steps: () => identity,
  in: identity,
  out: identity,
  inOut: identity,
};

export const processColor = identity;
export const measure = () => ({x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0});
export const scrollTo = noop;

const Animated: any = {
  ...RNAnimated,
  View: RNAnimated.View,
  Text: RNAnimated.Text,
  Image: RNAnimated.Image,
  ScrollView: RNAnimated.ScrollView,
  FlatList: RNAnimated.FlatList,
  createAnimatedComponent: (Component: any) => Component,
  addWhitelistedUIProps: noop,
  addWhitelistedNativeProps: noop,
  Extrapolate: Extrapolation,
  interpolate,
  interpolateColor: () => 0,
  clamp: (value: number) => value,
};

export default Animated;
