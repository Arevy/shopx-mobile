declare module 'react-native-reanimated/mock' {
  import type ReanimatedModule from 'react-native-reanimated';

  export * from 'react-native-reanimated';
  const ReanimatedMock: ReanimatedModule;
  export default ReanimatedMock;
}
