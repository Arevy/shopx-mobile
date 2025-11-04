import React, {useEffect, useMemo, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  HelperText,
  RadioButton,
  SegmentedButtons,
  Surface,
  Text,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {Screen} from '@/components/core/Screen';
import {AddressFormFields, AddressFormValues} from '@/components/forms/AddressFormFields';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {formatCurrency} from '@/utils/currency';
import {
  useAddAddressMutation,
  useCreateOrderMutation,
  useCreatePaymentMutation,
  useGetAddressesQuery,
  useGetOrdersQuery,
} from '@/services/graphql/shopxGraphqlApi';
import type {CartStackNavigation, RootDrawerNavigation} from '@/navigation/types';
import {useAppTranslation} from '@/hooks/useAppTranslation';
import {clearCart} from '@/store/slices/cartSlice';
import {setOrders} from '@/store/slices/ordersSlice';

type PaymentMethodId = 'CARD' | 'TRANSFER' | 'CASH';

const defaultAddressForm: AddressFormValues = {
  street: '',
  city: '',
  postalCode: '',
  country: '',
};

export const CheckoutScreen: React.FC = () => {
  const {t} = useAppTranslation(['checkout', 'common', 'cart']);
  const navigation = useNavigation<CartStackNavigation>();
  const drawerNavigation = useNavigation<RootDrawerNavigation>();
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.session);
  const cart = useAppSelector(state => state.cart);

  const userId = session.user?.id;
  const isAuthenticated = Boolean(userId);

  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [addressForm, setAddressForm] = useState<AddressFormValues>(
    defaultAddressForm,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('CARD');
  const [orderCompletedId, setOrderCompletedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    refetch: refetchAddresses,
  } = useGetAddressesQuery(
    {userId: userId ?? ''},
    {
      skip: !isAuthenticated,
    },
  );

  const {refetch: refetchOrders} = useGetOrdersQuery(
    {userId: userId ?? ''},
    {skip: !isAuthenticated},
  );

  useEffect(() => {
    if (addresses.length && selectedAddressId === 'new') {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const [addAddress, {isLoading: isSavingAddress}] = useAddAddressMutation();
  const [createOrder, {isLoading: isPlacingOrder}] = useCreateOrderMutation();
  const [createPayment, {isLoading: isCreatingPayment}] =
    useCreatePaymentMutation();

  const isBusy = isSavingAddress || isPlacingOrder || isCreatingPayment;

  const cartItems = cart.items;
  const hasItems = cartItems.length > 0;

  const paymentOptions = useMemo(
    () => [
      {value: 'CARD', label: 'Card'},
      {value: 'TRANSFER', label: 'Bank transfer'},
      {value: 'CASH', label: 'Cash'},
    ],
    [],
  );

  const handleAddressFormChange = <K extends keyof AddressFormValues>(
    field: K,
    value: AddressFormValues[K],
  ) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const ensureAuthenticated = (): boolean => {
    if (!isAuthenticated) {
      Alert.alert(
        t('checkout.guard.title', 'Sign in required'),
        t(
          'checkout.guard.subtitle',
          'You need to be signed in to complete your purchase.',
        ),
        [
          {
            text: t('common.actions.cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: t('common.actions.login', 'Sign in'),
            onPress: () =>
              drawerNavigation.navigate('HomeTabs', {screen: 'Account'}),
          },
        ],
      );
      return false;
    }
    return true;
  };

  const ensureAddressFormValid = (): boolean => {
    if (selectedAddressId !== 'new') {
      return true;
    }
    return Object.values(addressForm).every(field => field.trim().length > 0);
  };

  const handlePlaceOrder = async () => {
    if (!ensureAuthenticated()) {
      return;
    }

    if (!hasItems) {
      Alert.alert(
        t('checkout.empty.title', 'Your cart is empty'),
        t('checkout.empty.subtitle', 'Add products to the cart before checkout.'),
      );
      return;
    }

    if (!ensureAddressFormValid()) {
      setError(
        t(
          'checkout.errors.addressRequired',
          'Please complete all address fields.',
        ),
      );
      return;
    }

    setError(null);

    try {
      let addressId = selectedAddressId;

      if (addressId === 'new') {
        const address = await addAddress({
          userId: userId!,
          ...addressForm,
        }).unwrap();
        addressId = address.id;
        setSelectedAddressId(address.id);
        setAddressForm(defaultAddressForm);
        await refetchAddresses();
      }

      const order = await createOrder({
        userId: userId!,
        products: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      }).unwrap();

      await createPayment({
        orderId: order.id,
        amount: order.total,
        method: paymentMethod,
      }).unwrap();

      dispatch(clearCart());
      setOrderCompletedId(order.id);
      setSelectedAddressId(addressId);
      const refreshedOrders = await refetchOrders();
      if (refreshedOrders.data) {
        dispatch(setOrders(refreshedOrders.data));
      }
    } catch (mutationError) {
      console.warn('Checkout failed', mutationError);
      setError(
        t(
          'checkout.errors.generic',
          'We could not complete your order. Please try again later.',
        ),
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen contentContainerStyle={styles.guardContainer}>
        <Surface elevation={1} style={styles.guardCard}>
          <Text variant="headlineSmall">
            {t('checkout.guard.title', 'Sign in required')}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {t(
              'checkout.guard.subtitle',
              'Sign in to use saved addresses, your wishlist, and to track orders.',
            )}
          </Text>
          <Button
            mode="contained"
            icon="log-in"
            onPress={() =>
              drawerNavigation.navigate('HomeTabs', {screen: 'Account'})
            }>
            {t('common.actions.login', 'Sign in')}
          </Button>
          <Button
            mode="text"
            onPress={() =>
              drawerNavigation.navigate('HomeTabs', {
                screen: 'HomeStack',
                params: {screen: 'Home'},
              })
            }>
            {t('checkout.guard.actions.browse', 'Continue shopping')}
          </Button>
        </Surface>
      </Screen>
    );
  }

  if (!hasItems && orderCompletedId) {
    return (
      <Screen contentContainerStyle={styles.successContainer}>
        <Surface elevation={1} style={styles.successCard}>
          <Text variant="headlineSmall">
            {t('checkout.success.title', 'Order placed successfully')}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {t(
              'checkout.success.subtitle',
              'Thank you for your purchase. You can view the order in your account.',
            )}
          </Text>
          <Text variant="bodyMedium">
            {t('checkout.success.orderNumber', 'Order ID')}: {orderCompletedId}
          </Text>
          <Button
            mode="contained"
            onPress={() =>
              drawerNavigation.navigate('HomeTabs', {
                screen: 'HomeStack',
                params: {screen: 'Home'},
              })
            }>
            {t('checkout.success.actions.continue', 'Back to home')}
          </Button>
          <Button
            mode="text"
            onPress={() =>
              drawerNavigation.navigate('HomeTabs', {screen: 'Account'})
            }>
            {t('checkout.success.actions.orders', 'View orders')}
          </Button>
        </Surface>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text variant="headlineSmall">
            {t('checkout.intro.title', 'Checkout')}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {t(
              'checkout.intro.subtitle',
              'Confirm your delivery details and preferred payment method.',
            )}
          </Text>
        </View>

        <Surface elevation={1} style={styles.sectionCard}>
          <Text variant="titleMedium">
            {t('checkout.address.heading', 'Delivery address')}
          </Text>
          {addressesLoading ? (
            <Text variant="bodyMedium">
              {t('checkout.address.loading', 'Loading saved addresses…')}
            </Text>
          ) : (
            <RadioButton.Group
              onValueChange={setSelectedAddressId}
              value={selectedAddressId}>
              {addresses.map(address => (
                <RadioButton.Item
                  key={address.id}
                  label={`${address.street}, ${address.city}`}
                  value={address.id}
                  mode="android"
                />
              ))}
              <RadioButton.Item
                label={t(
                  'checkout.address.new',
                  'Use a different address',
                )}
                value="new"
                mode="android"
              />
            </RadioButton.Group>
          )}

          {selectedAddressId === 'new' ? (
            <AddressFormFields
              values={addressForm}
              onChange={handleAddressFormChange}
              disabled={isBusy}
            />
          ) : null}
        </Surface>

        <Surface elevation={1} style={styles.sectionCard}>
          <Text variant="titleMedium">
            {t('checkout.payment.heading', 'Payment method')}
          </Text>
          <SegmentedButtons
            value={paymentMethod}
            onValueChange={value =>
              setPaymentMethod(value as PaymentMethodId)
            }
            buttons={paymentOptions.map(option => ({
              value: option.value,
              label: option.label,
            }))}
            density="regular"
          />
        </Surface>

        <Surface elevation={1} style={styles.sectionCard}>
          <Text variant="titleMedium">
            {t('checkout.summary.heading', 'Order summary')}
          </Text>
          {cartItems.map(item => (
            <View key={item.product.id} style={styles.summaryRow}>
              <View style={styles.summaryText}>
                <Text variant="bodyMedium">{item.product.name}</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {t('cart.labels.quantity', {
                    value: item.quantity,
                  })}
                </Text>
              </View>
              <Text variant="bodyMedium">
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryTotal}>
            <Text variant="titleMedium">
              {t('cart.totalLabel', 'Total')}
            </Text>
            <Text variant="titleMedium">
              {formatCurrency(cart.total)}
            </Text>
          </View>
        </Surface>

        {error ? (
          <HelperText type="error" visible style={styles.errorText}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          icon="check-circle"
          onPress={handlePlaceOrder}
          loading={isBusy}
          disabled={isBusy}>
          {isBusy
            ? t('checkout.actions.processing', 'Placing order…')
            : t('checkout.actions.submit', 'Place order')}
        </Button>
        <Button
          mode="text"
          disabled={isBusy}
          onPress={() => navigation.navigate('CartHome')}>
          {t('checkout.actions.backToCart', 'Back to cart')}
        </Button>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 4,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  muted: {
    color: '#6b7280',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    gap: 2,
  },
  summaryTotal: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 4,
  },
  guardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  guardCard: {
    padding: 24,
    borderRadius: 20,
    gap: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    padding: 24,
    borderRadius: 20,
    gap: 16,
    alignItems: 'flex-start',
  },
});
