import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useAppTranslation} from '@/hooks/useAppTranslation';

type LoadingStateProps = {
  label?: string;
};

export const LoadingState: React.FC<LoadingStateProps> = ({label}) => {
  const theme = useTheme();
  const {t} = useAppTranslation('common');

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.label}>{label ?? t('states.loading')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  label: {
    fontSize: 16,
  },
});
