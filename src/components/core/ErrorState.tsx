import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useAppTranslation} from '@/hooks/useAppTranslation';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => {
  const {t} = useAppTranslation('common');

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title ?? t('errors.genericTitle')}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message ?? t('errors.genericMessage')}
      </Text>
      {onRetry ? (
        <Button mode="contained" onPress={onRetry}>
          {t('actions.retry')}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#6b7280',
  },
});
