import React, {useEffect, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {Button, IconButton, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {ErrorState} from '@/components/core/ErrorState';
import {LoadingState} from '@/components/core/LoadingState';
import {
  useAddToCartMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '@/services/graphql/shopxGraphqlApi';
import {useAppSelector} from '@/store/hooks';
import type {MainTabNavigation} from '@/navigation/types';
import {formatCurrency} from '@/utils/currency';

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<MainTabNavigation>();
  const session = useAppSelector(state => state.session);
  const wishlist = useAppSelector(state => state.wishlist.items);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const {t} = useAppTranslation(['wishlist', 'common']);

  const shouldFetch = Boolean(session.user?.id);
  const {isLoading, error, refetch} = useGetWishlistQuery(
    {userId: session.user?.id ?? ''},
    {skip: !shouldFetch},
  );

  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

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
          {t('wishlist.alerts.loginPromptTitle')}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Account')}
          icon="log-in">
          {t('common.actions.login')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('HomeStack', {screen: 'Home'})}>
          {t('wishlist.actions.goShopping')}
        </Button>
      </Screen>
    );
  }

  if (isLoading && !wishlist.length) {
    return <LoadingState label={t('wishlist.loading')} />;
  }

  if (error) {
    return (
      <ErrorState
        message={t('wishlist.errors.load')}
        onRetry={() => refetch()}
      />
    );
  }

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist({
        userId: session.user!.id,
        productId,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('wishlist.errors.remove'),
      );
      console.warn('removeFromWishlist failed', mutationError);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingProductId(productId);
      await addToCart({
        userId: session.user!.id,
        productId,
        quantity: 1,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('wishlist.errors.addToCart'),
      );
      console.warn('addToCart from wishlist failed', mutationError);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <Screen>
      <FlatList
        data={wishlist}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodyMedium" style={styles.muted}>
                {item.description}
              </Text>
              <Text variant="bodyMedium" style={styles.price}>
                {formatCurrency(item.price)}
              </Text>
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="cart"
                mode="contained"
                loading={addingProductId === item.id}
                onPress={() => handleAddToCart(item.id)}
              />
              <IconButton
                icon="delete"
                mode="contained-tonal"
                onPress={() => handleRemove(item.id)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">{t('wishlist.emptyTitle')}</Text>
            <Text variant="bodyMedium" style={styles.muted}>
              {t('wishlist.emptySubtitle')}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('HomeStack', {screen: 'Home'})}>
              {t('common.actions.viewProducts')}
            </Button>
          </View>
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f9fafc',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  muted: {
    color: '#6b7280',
  },
  price: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    marginTop: 48,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  centerText: {
    textAlign: 'center',
  },
});
