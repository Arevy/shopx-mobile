import React, {useEffect, useMemo, useState} from 'react';
import {Alert, FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {Chip, Searchbar, Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {LoadingState} from '@/components/core/LoadingState';
import {ErrorState} from '@/components/core/ErrorState';
import {ProductCard} from '@/components/product/ProductCard';
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useRemoveFromWishlistMutation,
} from '@/services/graphql/shopxGraphqlApi';
import {useAppSelector} from '@/store/hooks';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import type {HomeStackNavigation, HomeStackParamList} from '@/navigation/types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeStackNavigation>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Home'>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const session = useAppSelector(state => state.session);
  const [activeProductMutation, setActiveProductMutation] = useState<
    string | null
  >(null);
  const {t} = useAppTranslation(['home', 'common']);

  const {data: categories} = useGetCategoriesQuery();

  const categoryMap = useMemo(() => {
    if (!categories) {
      return new Map<string, string>();
    }
    return new Map(categories.map(category => [category.id, category.name]));
  }, [categories]);

  const {
    data: products,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery(
    {
      limit: 40,
      categoryId,
      name: debouncedSearch.length > 0 ? debouncedSearch : undefined,
    },
    {refetchOnFocus: true},
  );

  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const productList = products ?? [];

  const isFavourite = useMemo(() => {
    const ids = new Set(wishlistItems.map(item => item.id));
    return (productId: string) => ids.has(productId);
  }, [wishlistItems]);

  const routeCategoryId = route.params?.categoryId;

  useEffect(() => {
    if (routeCategoryId !== categoryId) {
      setCategoryId(routeCategoryId);
    }
  }, [routeCategoryId, categoryId]);

  const handleSelectCategory = (id?: string) => {
    const nextCategoryId = categoryId === id ? undefined : id;
    setCategoryId(nextCategoryId);
    navigation.setParams({categoryId: nextCategoryId});
  };

  const ensureAuthenticated = () => {
    if (!session?.token || !session.user?.id) {
      Alert.alert(
        t('home.alerts.authRequiredTitle'),
        t('home.alerts.authRequiredMessage'),
      );
      return false;
    }
    return true;
  };

  const handleAddToCart = async (productId: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    try {
      setActiveProductMutation(productId);
      await addToCart({
        userId: session.user!.id,
        productId,
        quantity: 1,
      }).unwrap();
    } catch (mutationError) {
      Alert.alert(t('common.errors.genericTitle'), t('home.errors.addToCart'));
      console.warn('addToCart failed', mutationError);
    } finally {
      setActiveProductMutation(null);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    try {
      setActiveProductMutation(productId);
      if (isFavourite(productId)) {
        await removeFromWishlist({
          userId: session.user!.id,
          productId,
        }).unwrap();
      } else {
        await addToWishlist({
          userId: session.user!.id,
          productId,
        }).unwrap();
      }
    } catch (mutationError) {
      Alert.alert(
        t('common.errors.genericTitle'),
        t('home.errors.toggleWishlist'),
      );
      console.warn('toggle wishlist failed', mutationError);
    } finally {
      setActiveProductMutation(null);
    }
  };

  if (isLoading && !productList.length) {
    return <LoadingState label={t('home.loading')} />;
  }

  if (error) {
    return (
      <ErrorState message={t('home.errors.load')} onRetry={() => refetch()} />
    );
  }

  return (
    <Screen>
      <FlatList
        data={productList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.column}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.headline}>
              {t('home.title')}
            </Text>
            <Searchbar
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={t('home.searchPlaceholder')}
              autoCorrect={false}
              style={styles.searchBar}
            />
            {categories?.length ? (
              <View style={styles.chipContainer}>
                <Chip
                  selected={!categoryId}
                  onPress={() => handleSelectCategory(undefined)}>
                  {t('home.categoriesAll')}
                </Chip>
                {categories.map(category => (
                  <Chip
                    key={category.id}
                    selected={categoryId === category.id}
                    onPress={() => handleSelectCategory(category.id)}>
                    {category.name}
                  </Chip>
                ))}
              </View>
            ) : null}
          </View>
        )}
        renderItem={({item}) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              categoryName={
                item.categoryId ? categoryMap.get(item.categoryId) : undefined
              }
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  productId: item.id,
                })
              }
              onAddToCart={() => handleAddToCart(item.id)}
              onToggleWishlist={() => handleToggleWishlist(item.id)}
              isFavourite={isFavourite(item.id)}
              loading={activeProductMutation === item.id}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">{t('home.emptyTitle')}</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {t('home.emptySubtitle')}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  column: {
    gap: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  header: {
    width: '100%',
    gap: 16,
    marginBottom: 16,
  },
  headline: {
    fontWeight: '700',
  },
  searchBar: {
    borderRadius: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    gap: 8,
  },
  emptySubtext: {
    color: '#6b7280',
    textAlign: 'center',
  },
});
