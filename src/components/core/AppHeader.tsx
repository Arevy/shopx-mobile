import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text, useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {DrawerHeaderProps} from '@react-navigation/drawer';
import {DrawerActions} from '@react-navigation/native';

import {env} from '@/config/env';
import {useAppTranslation} from '@/hooks/useAppTranslation';

type AppHeaderProps = Pick<DrawerHeaderProps, 'navigation'>;

export const AppHeader: React.FC<AppHeaderProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {t} = useAppTranslation('common');

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <IconButton
        icon="menu"
        size={24}
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        iconColor={theme.colors.onSurface}
        accessibilityLabel={t('actions.openDrawer')}
      />
      <Text variant="titleLarge" style={styles.title} numberOfLines={1}>
        {env.SITE_NAME}
      </Text>
      <View style={styles.spacer} />
      <IconButton
        icon="magnify"
        size={24}
        onPress={() => navigation.navigate('HomeTabs', {screen: 'HomeStack'})}
        accessibilityLabel={t('inputs.search')}
        iconColor={theme.colors.onSurface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  spacer: {
    width: 4,
  },
});
