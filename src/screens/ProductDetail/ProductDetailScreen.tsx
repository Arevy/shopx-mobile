import React, {useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {Button, Chip, Divider, Text} from 'react-native-paper';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {LoadingState} from '@/components/core/LoadingState';
import {ErrorState} from '@/components/core/ErrorState';
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetProductDetailQuery,
  useRemoveFromWishlistMutation,
} from '@/services/graphql/shopxGraphqlApi';
import {useAppSelector} from '@/store/hooks';
import {formatCurrency} from '@/utils/currency';
import type {HomeStackParamList} from '@/navigation/types';
import {resolveImageUrl} from '@/utils/images';

type ProductDetailRoute = RouteProp<HomeStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRoute>();
  const session = useAppSelector(state => state.session);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const [activeMutation, setActiveMutation] = useState<'cart' | 'wishlist' | null>(
    null,
  );
  const {t, i18n} = useAppTranslation(['product', 'common']);

  const {data, isLoading, error, refetch} = useGetProductDetailQuery({
    id: route.params.productId,
  });

  const product = data?.product;
  const reviews = data?.reviews ?? [];

  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isFavourite = product
    ? wishlistItems.some(item => item.id === product.id)
    : false;

  const productImage = useMemo(() => resolveImageUrl(product?.image?.url), [
    product?.image?.url,
  ]);

  const ensureAuthenticated = () => {
    if (!session?.token || !session.user?.id) {
      Alert.alert(
        t('common.errors.authRequiredTitle'),
        t('common.errors.authRequiredMessage'),
      );
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product || !ensureAuthenticated()) {
      return;
    }
    try {
      setActiveMutation('cart');
      await addToCart({
        userId: session.user!.id,
        productId: product.id,
        quantity: 1,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('product.alerts.addToCart'),
      );
      console.warn('addToCart failed', mutationError);
    } finally {
      setActiveMutation(null);
    }
  };

  const handleWishlist = async () => {
    if (!product || !ensureAuthenticated()) {
      return;
    }
    try {
      setActiveMutation('wishlist');
      if (isFavourite) {
        await removeFromWishlist({
          userId: session.user!.id,
          productId: product.id,
        }).unwrap();
      } else {
        await addToWishlist({
          userId: session.user!.id,
          productId: product.id,
        }).unwrap();
      }
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('product.alerts.wishlist'),
      );
      console.warn('wishlist toggle failed', mutationError);
    } finally {
      setActiveMutation(null);
    }
  };

  if (isLoading) {
    return <LoadingState label={t('product.loading')} />;
  }

  if (error || !product) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <Button onPress={() => navigation.goBack()} mode="text" icon="arrow-left">
        {t('product.back')}
      </Button>
      {productImage ? (
        <Image source={{uri: productImage}} style={styles.image} />
      ) : null}
      <Text variant="headlineSmall" style={styles.title}>
        {product.name}
      </Text>
      <Text variant="titleMedium" style={styles.price}>
        {formatCurrency(product.price)}
      </Text>
      {product.description ? (
        <Text variant="bodyLarge" style={styles.description}>
          {product.description}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          loading={activeMutation === 'cart'}>
          {t('product.addToCart')}
        </Button>
        <Button
          mode={isFavourite ? 'contained-tonal' : 'outlined'}
          onPress={handleWishlist}
          loading={activeMutation === 'wishlist'}>
          {isFavourite ? t('product.inWishlist') : t('product.addToWishlist')}
        </Button>
      </View>
      <Divider style={styles.divider} />
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('product.reviewsTitle', {count: reviews.length})}
      </Text>
      {reviews.length === 0 ? (
        <Text variant="bodyMedium" style={styles.muted}>
          {t('product.reviewsEmpty')}
        </Text>
      ) : (
        reviews.map(review => {
          const displayDate = new Date(review.createdAt).toLocaleDateString(
            i18n.language,
          );
          return (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text variant="titleSmall">
                  {t('product.reviewUser', {id: review.userId})}
                </Text>
                <Chip compact>
                  {t('product.ratingBadge', {rating: review.rating})}
                </Chip>
              </View>
              {review.reviewText ? (
                <Text variant="bodyMedium" style={styles.reviewText}>
                  {review.reviewText}
                </Text>
              ) : null}
              <Text variant="bodySmall" style={styles.reviewDate}>
                {displayDate}
              </Text>
            </View>
          );
        })
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 16,
  },
  title: {
    fontWeight: '700',
  },
  price: {
    fontWeight: '600',
  },
  description: {
    color: '#4b5563',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  muted: {
    color: '#6b7280',
  },
  reviewCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewText: {
    color: '#4b5563',
  },
  reviewDate: {
    color: '#9ca3af',
    textAlign: 'right',
  },
});
