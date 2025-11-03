import React from 'react';
import {StyleSheet, View} from 'react-native';
import {RadioButton, Text} from 'react-native-paper';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setLanguage} from '@/store/slices/uiSlice';
import type {SupportedLanguage} from '@/i18n';
import {i18n} from '@/i18n';

const supportedLanguages = Object.keys(
  i18n.options?.resources ?? {},
) as SupportedLanguage[];

export const SettingsScreen: React.FC = () => {
  const {t} = useAppTranslation(['settings', 'common']);
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.ui.language);

  const handleLanguageChange = (value: string) => {
    dispatch(setLanguage(value as SupportedLanguage));
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>
        {t('settings.title')}
      </Text>
      <View style={styles.section}>
        <Text variant="titleMedium">{t('settings.language')}</Text>
        <RadioButton.Group onValueChange={handleLanguageChange} value={language}>
          {supportedLanguages.map(code => (
            <View key={code} style={styles.radioRow}>
              <RadioButton value={code} />
              <Text variant="bodyMedium">
                {t('common.language.options.' + code)}
              </Text>
            </View>
          ))}
        </RadioButton.Group>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  header: {
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
