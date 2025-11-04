import React, {useEffect} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {Button, IconButton, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {ErrorState} from '@/components/core/ErrorState';
import {LoadingState} from '@/components/core/LoadingState';
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useAddToCartMutation,
} from '@/services/graphql/shopxGraphqlApi';
import {useAppSelector} from '@/store/hooks';
import type {
  CartStackNavigation,
  MainTabNavigation,
  RootDrawerNavigation,
} from '@/navigation/types';
import {formatCurrency} from '@/utils/currency';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartStackNavigation>();
  const tabNavigation = navigation.getParent<MainTabNavigation>();
  const drawerNavigation = tabNavigation?.getParent<RootDrawerNavigation>();
  const session = useAppSelector(state => state.session);
  const cart = useAppSelector(state => state.cart);
  const {t} = useAppTranslation(['cart', 'common']);

  const shouldFetch = Boolean(session.user?.id);
  const {isLoading, error, refetch} = useGetCartQuery(
    {userId: session.user?.id ?? ''},
    {skip: !shouldFetch},
  );

  const [addToCart] = useAddToCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch]);

  if (!session.user?.id) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Text variant="titleMedium" style={styles.centerText}>
          {t('cart.alerts.loginPromptTitle')}
        </Text>
        <Button
          mode="contained"
          onPress={() =>
            drawerNavigation?.navigate('HomeTabs', {screen: 'Account'})
          }
          icon="log-in">
          {t('common.actions.login')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => {
            if (drawerNavigation) {
              drawerNavigation.navigate('HomeTabs', {
                screen: 'HomeStack',
                params: {screen: 'Home'},
              });
            } else {
              tabNavigation?.navigate('HomeStack', {screen: 'Home'});
            }
          }}>
          {t('cart.actions.goShopping')}
        </Button>
      </Screen>
    );
  }

  if (isLoading && !cart.items.length) {
    return <LoadingState label={t('cart.loading')} />;
  }

  if (error) {
    return (
      <ErrorState
        message={t('cart.errors.load')}
        onRetry={() => refetch()}
      />
    );
  }

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart({
        userId: session.user!.id,
        productId,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('cart.errors.remove'),
      );
      console.warn('removeFromCart failed', mutationError);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart({userId: session.user!.id}).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('cart.errors.clear'),
      );
      console.warn('clearCart failed', mutationError);
    }
  };

  const handleIncrease = async (productId: string) => {
    try {
      await addToCart({
        userId: session.user!.id,
        productId,
        quantity: 1,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t(
          'cart.errors.add',
          'Unable to update the product quantity. Please try again.',
        ),
      );
      console.warn('increase quantity failed', mutationError);
    }
  };

  const handleDecrease = async (productId: string, quantity: number) => {
    if (quantity <= 1) {
      await handleRemove(productId);
      return;
    }
    try {
      await addToCart({
        userId: session.user!.id,
        productId,
        quantity: -1,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t(
          'cart.errors.update',
          'Unable to update the product quantity. Please try again.',
        ),
      );
      console.warn('decrease quantity failed', mutationError);
    }
  };

  return (
    <Screen>
      <FlatList
        data={cart.items}
        keyExtractor={item => item.product.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text variant="headlineSmall">{t('cart.title')}</Text>
            <Text variant="bodyMedium" style={styles.subheader}>
              {t('cart.subtitle', {count: cart.items.length})}
            </Text>
          </View>
        )}
        renderItem={({item}) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text variant="titleMedium">{item.product.name}</Text>
              <View style={styles.quantityControls}>
                <IconButton
                  icon="minus"
                  mode="contained-tonal"
                  onPress={() => handleDecrease(item.product.id, item.quantity)}
                />
                <Text variant="titleMedium">{item.quantity}</Text>
                <IconButton
                  icon="plus"
                  mode="contained-tonal"
                  onPress={() => handleIncrease(item.product.id)}
                />
              </View>
              <Text variant="bodyMedium" style={styles.price}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <IconButton
                icon="eye"
                mode="contained-tonal"
                onPress={() =>
                  tabNavigation?.navigate('HomeStack', {
                    screen: 'ProductDetail',
                    params: {productId: item.product.id},
                  })
                }
              />
              <IconButton
                icon="delete"
                mode="contained"
                onPress={() => handleRemove(item.product.id)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">{t('cart.emptyTitle')}</Text>
            <Text variant="bodyMedium" style={styles.muted}>
              {t('cart.emptySubtitle')}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                if (drawerNavigation) {
                  drawerNavigation.navigate('HomeTabs', {
                    screen: 'HomeStack',
                    params: {screen: 'Home'},
                  });
                } else {
                  tabNavigation?.navigate('HomeStack', {screen: 'Home'});
                }
              }}>
              {t('common.actions.viewProducts')}
            </Button>
          </View>
        )}
        ListFooterComponent={() => (
          cart.items.length ? (
            <View style={styles.footer}>
              <View style={styles.summaryRow}>
                <Text variant="titleMedium">{t('cart.totalLabel')}</Text>
                <Text variant="titleMedium">{formatCurrency(cart.total)}</Text>
              </View>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Checkout')}>
                {t('cart.actions.checkout')}
              </Button>
              <Button mode="text" onPress={handleClear}>
                {t('cart.actions.clear')}
              </Button>
            </View>
          ) : null
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
  },
  header: {
    marginBottom: 8,
  },
  subheader: {
    color: '#6b7280',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f9fafc',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  price: {
    fontWeight: '600',
  },
  muted: {
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    marginTop: 48,
  },
  footer: {
    marginTop: 24,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  centerText: {
    textAlign: 'center',
  },
});
