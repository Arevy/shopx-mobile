import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {
  Button,
  Divider,
  HelperText,
  Portal,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
  Dialog,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {useAppTranslation} from '@/hooks/useAppTranslation';
import {Screen} from '@/components/core/Screen';
import {ErrorState} from '@/components/core/ErrorState';
import {LoadingState} from '@/components/core/LoadingState';
import {
  AddressFormFields,
  type AddressFormValues,
} from '@/components/forms/AddressFormFields';
import {
  useAddAddressMutation,
  useChangeUserPasswordMutation,
  useGetAddressesQuery,
  useGetOrdersQuery,
  useGetUserContextQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserProfileMutation,
} from '@/services/graphql/shopxGraphqlApi';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setTheme} from '@/store/slices/uiSlice';
import type {ThemePreference} from '@/store/slices/uiSlice';
import {formatCurrency} from '@/utils/currency';
import {getDeviceSnapshot} from '@/services/native/device';
import type {MainTabNavigation} from '@/navigation/types';

type DeviceSnapshot = Awaited<ReturnType<typeof getDeviceSnapshot>>;
type AuthMode = 'login' | 'register';
type AccountSection = 'overview' | 'security' | 'orders';

const defaultAddressForm: AddressFormValues = {
  street: '',
  city: '',
  postalCode: '',
  country: '',
};

export const AccountScreen: React.FC = () => {
  const session = useAppSelector(state => state.session);
  const themePreference = useAppSelector(state => state.ui.theme);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<MainTabNavigation>();
  const {t} = useAppTranslation(['account', 'common']);

  const [deviceInfo, setDeviceInfo] = useState<DeviceSnapshot | null>(null);

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<AccountSection>('overview');
  const [profileForm, setProfileForm] = useState(() => ({
    name: session.user?.name ?? '',
    email: session.user?.email ?? '',
  }));
  const [profilePassword, setProfilePassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [addressDialogVisible, setAddressDialogVisible] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormValues>(
    defaultAddressForm,
  );
  const [addressError, setAddressError] = useState<string | null>(null);

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

  const {
    data: addresses = [],
    refetch: refetchAddresses,
    isFetching: addressesLoading,
  } = useGetAddressesQuery(
    {userId: session.user?.id ?? ''},
    {skip: !shouldFetch},
  );

  const {
    data: ordersData,
    isFetching: ordersLoading,
    refetch: refetchOrders,
  } = useGetOrdersQuery(
    {userId: session.user?.id ?? ''},
    {skip: !shouldFetch},
  );

  const orders = ordersData ?? [];

  const [registerUser, {isLoading: isRegistering}] = useRegisterMutation();
  const [login, {isLoading: isLoggingIn}] = useLoginMutation();
  const [logout, {isLoading: isLoggingOut}] = useLogoutMutation();
  const [updateProfile, {isLoading: isUpdatingProfile}] =
    useUpdateUserProfileMutation();
  const [changePassword, {isLoading: isChangingPassword}] =
    useChangeUserPasswordMutation();
  const [addAddress, {isLoading: isAddingAddress}] = useAddAddressMutation();

  useEffect(() => {
    getDeviceSnapshot().then(setDeviceInfo).catch(console.warn);
  }, []);

  useEffect(() => {
    setProfileForm({
      name: session.user?.name ?? '',
      email: session.user?.email ?? '',
    });
  }, [session.user?.name, session.user?.email]);

  const handleChangeTheme = (value: string) => {
    dispatch(setTheme(value as ThemePreference));
  };

  const handleLogin = async () => {
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(
        t(
          'account.errors.loginFailed',
          'Please enter both email and password.',
        ),
      );
      return;
    }

    try {
      await login({email: loginEmail.trim(), password: loginPassword}).unwrap();
      Alert.alert(t('common.success.login', 'Signed in successfully.'));
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      console.warn('login failed', err);
      setLoginError(
        t(
          'account.errors.loginFailed',
          'We could not sign you in with those credentials.',
        ),
      );
    }
  };

  const handleRegister = async () => {
    setRegisterError(null);
    if (!registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError(
        t(
          'account.errors.registerRequired',
          'Email and password are required to create an account.',
        ),
      );
      return;
    }
    if (registerPassword !== registerConfirm) {
      setRegisterError(
        t(
          'account.errors.passwordMismatch',
          'Passwords do not match.',
        ),
      );
      return;
    }

    try {
      await registerUser({
        email: registerEmail.trim(),
        password: registerPassword,
        name: registerName.trim() || undefined,
      }).unwrap();

      await login({
        email: registerEmail.trim(),
        password: registerPassword,
      }).unwrap();

      Alert.alert(
        t('account.register.successTitle', 'Account created'),
        t(
          'account.register.successMessage',
          'Welcome to ShopX! You are now signed in.',
        ),
      );

      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirm('');
      setAuthMode('login');
    } catch (err) {
      console.warn('register failed', err);
      setRegisterError(
        t(
          'account.errors.registerFailed',
          'We could not create your account. Please try again.',
        ),
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      Alert.alert(
        t('account.logout', 'Signed out'),
        t('common.success.logout', 'You have been signed out.'),
      );
      setActiveSection('overview');
    } catch (err) {
      console.warn('logout failed', err);
      Alert.alert(
        t('common.errors.genericTitle', 'Something went wrong'),
        t(
          'common.errors.genericMessage',
          'Please try again in a moment.',
        ),
      );
    }
  };

  const handleRefetch = () => {
    if (shouldFetch) {
      refetch();
      refetchAddresses();
      refetchOrders();
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

  const handleProfileSave = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();
    const currentName = session.user?.name ?? '';
    const currentEmail = session.user?.email ?? '';

    if (
      trimmedName === currentName &&
      trimmedEmail.toLowerCase() === currentEmail.toLowerCase()
    ) {
      setProfileSuccess(
        t('account.profile.noChanges', 'No changes detected.'),
      );
      setProfilePassword('');
      return;
    }

    if (!profilePassword.trim()) {
      setProfileError(
        t(
          'account.profile.passwordRequired',
          'Please confirm with your current password.',
        ),
      );
      return;
    }

    try {
      const result = await updateProfile({
        input: {
          name: trimmedName,
          email: trimmedEmail,
          currentPassword: profilePassword,
        },
      }).unwrap();

      setProfilePassword('');
      setProfileSuccess(result.message ?? 'Profile updated successfully.');
    } catch (err) {
      console.warn('update profile failed', err);
      setProfileError(
        t(
          'account.profile.updateFailed',
          'We could not update your profile. Please try again.',
        ),
      );
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError(
        t('account.security.mismatch', 'New passwords do not match.'),
      );
      return;
    }

    if (passwordForm.next.length < 8) {
      setPasswordError(
        t(
          'account.security.tooShort',
          'New password should be at least 8 characters long.',
        ),
      );
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      }).unwrap();

      setPasswordForm({current: '', next: '', confirm: ''});
      setPasswordSuccess(
        t(
          'account.security.changed',
          'Password updated successfully.',
        ),
      );
    } catch (err) {
      console.warn('change password failed', err);
      setPasswordError(
        t(
          'account.security.error',
          'We could not update your password. Please try again.',
        ),
      );
    }
  };

  const handleAddressFormChange = <K extends keyof AddressFormValues>(
    field: K,
    value: AddressFormValues[K],
  ) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSubmit = async () => {
    setAddressError(null);
    const isValid = Object.values(addressForm).every(
      value => value.trim().length > 0,
    );
    if (!isValid) {
      setAddressError(
        t(
          'account.addresses.required',
          'Please complete all address fields.',
        ),
      );
      return;
    }

    try {
      await addAddress({
        userId: session.user!.id,
        ...addressForm,
      }).unwrap();
      setAddressDialogVisible(false);
      setAddressForm(defaultAddressForm);
      await refetchAddresses();
    } catch (err) {
      console.warn('add address failed', err);
      setAddressError(
        t(
          'account.addresses.failed',
          'We could not store this address. Please try again.',
        ),
      );
    }
  };

  if (!session.user?.id) {
    return (
      <Screen scrollable contentContainerStyle={styles.loginContainer}>
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.centerText}>
            {t('account.anonymousTitle', 'Welcome to ShopX')}
          </Text>
          <Text variant="bodyMedium" style={styles.centerSubtext}>
            {t(
              'account.anonymousSubtitle',
              'Sign in to sync your cart, wishlist, and order history across devices.',
            )}
          </Text>
        </View>

        <SegmentedButtons
          value={authMode}
          onValueChange={value => setAuthMode(value as AuthMode)}
          buttons={[
            {value: 'login', label: t('common.actions.login', 'Sign in')},
            {
              value: 'register',
              label: t('account.actions.register', 'Create account'),
            },
          ]}
        />

        {authMode === 'login' ? (
          <View style={styles.card}>
            <Text variant="titleMedium">
              {t('account.login.heading', 'Sign in to your account')}
            </Text>
            <View style={styles.form}>
              <TextInput
                label={t('account.forms.emailLabel', 'Email')}
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
              <TextInput
                label={t('account.forms.passwordLabel', 'Password')}
                value={loginPassword}
                onChangeText={setLoginPassword}
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
                loading={isLoggingIn}
                disabled={isLoggingIn}>
                {isLoggingIn
                  ? t('account.forms.submitting', 'Signing in…')
                  : t('account.forms.submit', 'Sign in')}
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text variant="titleMedium">
              {t('account.register.heading', 'Create a new account')}
            </Text>
            <View style={styles.form}>
              <TextInput
                label={t('account.register.nameLabel', 'Full name')}
                value={registerName}
                onChangeText={setRegisterName}
                autoCapitalize="words"
                autoComplete="name"
              />
              <TextInput
                label={t('account.forms.emailLabel', 'Email')}
                value={registerEmail}
                onChangeText={setRegisterEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <TextInput
                label={t('account.forms.passwordLabel', 'Password')}
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry
                autoComplete="new-password"
              />
              <TextInput
                label={t('account.register.confirmLabel', 'Confirm password')}
                value={registerConfirm}
                onChangeText={setRegisterConfirm}
                secureTextEntry
                autoComplete="new-password"
              />
              {registerError ? (
                <HelperText type="error" visible>
                  {registerError}
                </HelperText>
              ) : null}
              <Button
                mode="contained"
                onPress={handleRegister}
                icon="account-plus"
                loading={isRegistering}
                disabled={isRegistering}>
                {isRegistering
                  ? t('account.forms.submitting', 'Working…')
                  : t('account.register.submit', 'Create account')}
              </Button>
            </View>
          </View>
        )}

        <Button
          mode="text"
          onPress={() => navigation.navigate('HomeStack', {screen: 'Home'})}>
          {t('common.actions.viewProducts', 'Browse products')}
        </Button>
      </Screen>
    );
  }

  if (isFetching && !userContext) {
    return <LoadingState label={t('account.info.sessionHydrating', 'Loading profile…')} />;
  }

  if (error) {
    return (
      <ErrorState
        message={t('common.errors.genericMessage', 'Something went wrong.')}
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

      <SegmentedButtons
        value={activeSection}
        onValueChange={value => setActiveSection(value as AccountSection)}
        buttons={[
          {
            value: 'overview',
            label: t('account.sections.overview', 'Overview'),
          },
          {
            value: 'security',
            label: t('account.sections.security', 'Security'),
          },
          {
            value: 'orders',
            label: t('account.sections.orders', 'Orders'),
          },
        ]}
      />

      {activeSection === 'overview' ? (
        <>
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium">
              {t('account.profile.heading', 'Profile details')}
            </Text>
            <View style={styles.form}>
              <TextInput
                label={t('account.forms.nameLabel', 'Full name')}
                value={profileForm.name}
                onChangeText={value =>
                  setProfileForm(prev => ({...prev, name: value}))
                }
              />
              <TextInput
                label={t('account.forms.emailLabel', 'Email')}
                value={profileForm.email}
                onChangeText={value =>
                  setProfileForm(prev => ({...prev, email: value}))
                }
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <TextInput
                label={t('account.profile.passwordLabel', 'Current password')}
                value={profilePassword}
                onChangeText={setProfilePassword}
                secureTextEntry
              />
              {profileError ? (
                <HelperText type="error" visible>
                  {profileError}
                </HelperText>
              ) : null}
              {profileSuccess ? (
                <HelperText type="info" visible>
                  {profileSuccess}
                </HelperText>
              ) : null}
              <Button
                mode="contained"
                icon="content-save"
                onPress={handleProfileSave}
                loading={isUpdatingProfile}
                disabled={isUpdatingProfile}>
                {t('account.profile.save', 'Save changes')}
              </Button>
            </View>
          </Surface>

          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium">{t('account.theme', 'Theme')}</Text>
            <SegmentedButtons
              value={themePreference}
              onValueChange={handleChangeTheme}
              buttons={[
                {
                  value: 'system',
                  label: t('account.themeOptions.system', 'System'),
                },
                {
                  value: 'light',
                  label: t('account.themeOptions.light', 'Light'),
                },
                {
                  value: 'dark',
                  label: t('account.themeOptions.dark', 'Dark'),
                },
              ]}
            />
          </Surface>

          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium">
              {t('account.activity', 'Your activity')}
            </Text>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">
                {t('account.cartItems', 'Cart items')}
              </Text>
              <Text variant="bodyMedium">{cartItems}</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">
                {t('account.wishlistItems', 'Wishlist items')}
              </Text>
              <Text variant="bodyMedium">{wishlistItemsCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">
                {t('account.wishlistValue', 'Wishlist value')}
              </Text>
              <Text variant="bodyMedium">
                {formatCurrency(totalWishlistValue)}
              </Text>
            </View>
          </Surface>

          <Surface style={styles.card} elevation={1}>
            <View style={styles.addressHeader}>
              <Text variant="titleMedium">
                {t('account.addresses', 'Saved addresses')}
              </Text>
              <Button
                mode="text"
                onPress={() => setAddressDialogVisible(true)}
                icon="plus"
                compact>
                {t('account.addresses.add', 'Add address')}
              </Button>
            </View>
            <Divider />
            {addressesLoading ? (
              <Text variant="bodyMedium">
                {t('account.addresses.loading', 'Loading addresses…')}
              </Text>
            ) : addresses.length ? (
              addresses.map(address => (
                <View key={address.id} style={styles.addressItem}>
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
                {t(
                  'account.noAddresses',
                  'No saved addresses yet. Add one to speed up checkout.',
                )}
              </Text>
            )}
          </Surface>

          {deviceInfo ? (
            <Surface style={styles.card} elevation={1}>
              <Text variant="titleMedium">
                {t('account.device', 'Signed in on')}
              </Text>
              <View style={styles.deviceInfo}>
                <Text variant="bodyMedium">{deviceInfo.name}</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {deviceInfo.brand} {deviceInfo.model} ·{' '}
                  {deviceInfo.systemVersion}
                </Text>
                <Text variant="bodySmall" style={styles.muted}>
                  App v{deviceInfo.appVersion} ({deviceInfo.buildNumber})
                </Text>
              </View>
            </Surface>
          ) : null}
        </>
      ) : null}

      {activeSection === 'security' ? (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">
            {t('account.security.heading', 'Change password')}
          </Text>
          <View style={styles.form}>
            <TextInput
              label={t('account.security.current', 'Current password')}
              value={passwordForm.current}
              onChangeText={value =>
                setPasswordForm(prev => ({...prev, current: value}))
              }
              secureTextEntry
            />
            <TextInput
              label={t('account.security.new', 'New password')}
              value={passwordForm.next}
              onChangeText={value =>
                setPasswordForm(prev => ({...prev, next: value}))
              }
              secureTextEntry
            />
            <TextInput
              label={t('account.security.confirm', 'Confirm password')}
              value={passwordForm.confirm}
              onChangeText={value =>
                setPasswordForm(prev => ({...prev, confirm: value}))
              }
              secureTextEntry
            />
            {passwordError ? (
              <HelperText type="error" visible>
                {passwordError}
              </HelperText>
            ) : null}
            {passwordSuccess ? (
              <HelperText type="info" visible>
                {passwordSuccess}
              </HelperText>
            ) : null}
            <Button
              mode="contained"
              icon="lock-reset"
              onPress={handlePasswordChange}
              loading={isChangingPassword}
              disabled={isChangingPassword}>
              {t('account.security.update', 'Update password')}
            </Button>
          </View>
        </Surface>
      ) : null}

      {activeSection === 'orders' ? (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">
            {t('account.orders.heading', 'Order history')}
          </Text>
          {ordersLoading ? (
            <Text variant="bodyMedium">
              {t('account.orders.loading', 'Loading orders…')}
            </Text>
          ) : orders.length ? (
            <View style={styles.ordersList}>
              {orders.map(order => (
                <Surface key={order.id} style={styles.orderCard} elevation={0}>
                  <View style={styles.orderHeader}>
                    <Text variant="titleSmall">
                      #{order.id} · {order.status}
                    </Text>
                    <Text variant="bodySmall" style={styles.muted}>
                      {order.createdAt ?? ''}
                    </Text>
                  </View>
                  <Divider />
                  <View style={styles.orderBody}>
                    <Text variant="bodyMedium">
                      {t('account.orders.total', 'Total')}: {formatCurrency(order.total)}
                    </Text>
                    <Text variant="bodySmall" style={styles.muted}>
                      {t('account.orders.itemsLabel', 'Items')}:{' '}
                      {order.products.reduce(
                        (sum, product) => sum + product.quantity,
                        0,
                      )}
                    </Text>
                  </View>
                </Surface>
              ))}
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.muted}>
              {t('account.orders.empty', 'No orders placed yet.')}
            </Text>
          )}
        </Surface>
      ) : null}

      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="log-out"
        loading={isLoggingOut}
        disabled={isLoggingOut}>
        {t('account.logout', 'Sign out')}
      </Button>

      <Portal>
        <Dialog
          visible={addressDialogVisible}
          onDismiss={() => setAddressDialogVisible(false)}>
          <Dialog.Title>
            {t('account.addresses.add', 'Add address')}
          </Dialog.Title>
          <Dialog.Content>
            <AddressFormFields
              values={addressForm}
              onChange={handleAddressFormChange}
              disabled={isAddingAddress}
            />
            {addressError ? (
              <HelperText type="error" visible>
                {addressError}
              </HelperText>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddressDialogVisible(false)}>
              {t('common.actions.cancel', 'Cancel')}
            </Button>
            <Button
              onPress={handleAddressSubmit}
              loading={isAddingAddress}
              disabled={isAddingAddress}
              mode="contained">
              {t('account.addresses.save', 'Save address')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
    backgroundColor: '#f9fafc',
  },
  muted: {
    color: '#6b7280',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centerText: {
    textAlign: 'center',
  },
  centerSubtext: {
    textAlign: 'center',
    color: '#6b7280',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressItem: {
    gap: 2,
    paddingVertical: 6,
  },
  deviceInfo: {
    gap: 4,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderBody: {
    gap: 4,
  },
});
