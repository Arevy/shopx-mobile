import DeviceInfo from 'react-native-device-info';

export const getDeviceSnapshot = async () => {
  const [name, systemVersion, appVersion] = await Promise.all([
    DeviceInfo.getDeviceName(),
    DeviceInfo.getSystemVersion(),
    DeviceInfo.getVersion(),
  ]);

  return {
    name,
    systemVersion,
    appVersion,
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    buildNumber: await DeviceInfo.getBuildNumber(),
  };
};
