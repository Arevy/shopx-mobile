import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {
  Button,
  Divider,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {ErrorState} from '@/components/core/ErrorState';
import {LoadingState} from '@/components/core/LoadingState';
import {
  useGetAddressesQuery,
  useGetUserContextQuery,
  useLoginMutation,
  useLogoutMutation,
} from '@/services/graphql/shopxGraphqlApi';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setTheme} from '@/store/slices/uiSlice';
import type {ThemePreference} from '@/store/slices/uiSlice';
import {formatCurrency} from '@/utils/currency';
import {getDeviceSnapshot} from '@/services/native/device';
import type {MainTabNavigation} from '@/navigation/types';

type DeviceSnapshot = Awaited<ReturnType<typeof getDeviceSnapshot>>;

export const AccountScreen: React.FC = () => {
  const session = useAppSelector(state => state.session);
  const themePreference = useAppSelector(state => state.ui.theme);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<MainTabNavigation>();
  const {t} = useAppTranslation(['account', 'common']);
  const [deviceInfo, setDeviceInfo] = useState<DeviceSnapshot | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const shouldFetch = Boolean(session.user?.id);
  const {
    data: userContext,
    isFetching,
    error,
    refetch,
  } = useGetUserContextQuery(
    {userId: session.user?.id ?? ''},
    {skip: !shouldFetch},
  );

  const {data: addresses} = useGetAddressesQuery(
    {userId: session.user?.id ?? ''},
    {skip: !shouldFetch},
  );

  const [login, {isLoading: isLoggingIn}] = useLoginMutation();
  const [logout, {isLoading: isLoggingOut}] = useLogoutMutation();

  useEffect(() => {
    getDeviceSnapshot().then(setDeviceInfo).catch(console.warn);
  }, []);

  const handleChangeTheme = (value: string) => {
    dispatch(setTheme(value as ThemePreference));
  };

  const handleLogin = async () => {
    setLoginError(null);
    if (!email.trim() || !password.trim()) {
      setLoginError(t('account.errors.loginFailed'));
      return;
    }

    try {
      await login({email: email.trim(), password}).unwrap();
      Alert.alert(t('common.success.login'));
      setEmail('');
      setPassword('');
    } catch (err) {
      setLoginError(t('account.errors.loginFailed'));
      console.warn('login failed', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      Alert.alert(t('account.logout'), t('common.success.logout'));
    } catch (err) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('common.errors.genericMessage'),
      );
      console.warn('logout failed', err);
    }
  };

  const handleRefetch = () => {
    if (shouldFetch) {
      refetch();
    }
  };

  const totalWishlistValue = useMemo(
    () =>
      userContext?.wishlist.products.reduce<number>(
        (sum, product) => sum + product.price,
        0,
      ) ?? 0,
    [userContext?.wishlist.products],
  );

  const cartItems = userContext?.cart.items.length ?? 0;
  const wishlistItemsCount = userContext?.wishlist.products.length ?? 0;

  if (!session.user?.id) {
    return (
      <Screen scrollable contentContainerStyle={styles.loginContainer}>
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.centerText}>
            {t('account.anonymousTitle')}
          </Text>
          <Text variant="bodyMedium" style={styles.centerSubtext}>
            {t('account.anonymousSubtitle')}
          </Text>
        </View>
        <View style={styles.form}>
          <TextInput
            label={t('account.forms.emailLabel')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
          <TextInput
            label={t('account.forms.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          {loginError ? (
            <HelperText type="error" visible>
              {loginError}
            </HelperText>
          ) : null}
          <Button
            mode="contained"
            onPress={handleLogin}
            icon="log-in"
            loading={isLoggingIn}>
            {isLoggingIn
              ? t('account.forms.submitting')
              : t('account.forms.submit')}
          </Button>
        </View>
        <Button
          mode="text"
          onPress={() => navigation.navigate('HomeStack', {screen: 'Home'})}
          icon="grid">
          {t('common.actions.viewProducts')}
        </Button>
      </Screen>
    );
  }

  if (isFetching && !userContext) {
    return <LoadingState label={t('account.info.sessionHydrating')} />;
  }

  if (error) {
    return (
      <ErrorState
        message={t('common.errors.genericMessage')}
        onRetry={handleRefetch}
      />
    );
  }

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text variant="headlineSmall">
          {t('account.greeting', {
            name: session.user?.name ?? session.user?.email,
          })}
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          {t('account.role', {
            role: t(`account.roles.${session.user?.role ?? 'CUSTOMER'}`),
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">{t('account.theme')}</Text>
        <SegmentedButtons
          value={themePreference}
          onValueChange={handleChangeTheme}
          buttons={[
            {value: 'system', label: t('account.themeOptions.system')},
            {value: 'light', label: t('account.themeOptions.light')},
            {value: 'dark', label: t('account.themeOptions.dark')},
          ]}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">{t('account.activity')}</Text>
        <View style={styles.statRow}>
          <Text variant="bodyMedium">{t('account.cartItems')}</Text>
          <Text variant="bodyMedium">{cartItems}</Text>
        </View>
        <View style={styles.statRow}>
          <Text variant="bodyMedium">{t('account.wishlistItems')}</Text>
          <Text variant="bodyMedium">{wishlistItemsCount}</Text>
        </View>
        <View style={styles.statRow}>
          <Text variant="bodyMedium">{t('account.wishlistValue')}</Text>
          <Text variant="bodyMedium">{formatCurrency(totalWishlistValue)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">{t('account.addresses')}</Text>
        <Divider />
        {addresses?.length ? (
          addresses.map(address => (
            <View key={address.id} style={styles.addressCard}>
              <Text variant="bodyMedium">
                {address.street}, {address.city}
              </Text>
              <Text variant="bodySmall" style={styles.muted}>
                {address.postalCode}, {address.country}
              </Text>
            </View>
          ))
        ) : (
          <Text variant="bodyMedium" style={styles.muted}>
            {t('account.noAddresses')}
          </Text>
        )}
      </View>

      {deviceInfo ? (
        <View style={styles.section}>
          <Text variant="titleMedium">{t('account.device')}</Text>
          <Text variant="bodyMedium">{deviceInfo.name}</Text>
          <Text variant="bodySmall" style={styles.muted}>
            {deviceInfo.brand} {deviceInfo.model} · {deviceInfo.systemVersion}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            App v{deviceInfo.appVersion} ({deviceInfo.buildNumber})
          </Text>
        </View>
      ) : null}

      <Button
        mode="contained"
        onPress={handleLogout}
        icon="log-out"
        loading={isLoggingOut}>
        {t('account.logout')}
      </Button>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  loginContainer: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  form: {
    gap: 12,
  },
  muted: {
    color: '#6b7280',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressCard: {
    paddingVertical: 8,
  },
  centerText: {
    textAlign: 'center',
  },
  centerSubtext: {
    textAlign: 'center',
    color: '#6b7280',
  },
});
