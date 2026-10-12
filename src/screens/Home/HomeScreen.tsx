import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {Button, Chip, Searchbar, Text, useTheme} from 'react-native-paper';
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
  const {width} = useWindowDimensions();
  const {colors} = useTheme();
  const columns = width >= 1100 ? 4 : width >= 760 ? 3 : width < 360 ? 1 : 2;
  const [limit, setLimit] = useState(24);
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
      limit,
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
    setLimit(24);
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
    <Screen edges={['left', 'right']}>
      <FlatList
        key={columns}
        data={productList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.column : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.eyebrow, {color: colors.primary}]}>
              {t('home.eyebrow')}
            </Text>
            <Text variant="headlineLarge" style={styles.headline}>
              {t('home.title')}
            </Text>
            <Text style={[styles.intro, {color: colors.onSurfaceVariant}]}>
              {t('home.intro')}
            </Text>
            <Searchbar
              value={searchTerm}
              onChangeText={value => {
                setSearchTerm(value);
                setLimit(24);
              }}
              placeholder={t('home.searchPlaceholder')}
              autoCorrect={false}
              style={styles.searchBar}
            />
            {categories?.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipContainer}>
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
              </ScrollView>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={[styles.cardWrapper, {flex: 1 / columns}]}>
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
        ListFooterComponent={
          productList.length >= limit ? (
            <Button
              mode="outlined"
              loading={isFetching}
              disabled={isFetching}
              onPress={() => setLimit(value => value + 24)}>
              {t('common.actions.loadMore')}
            </Button>
          ) : null
        }
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
    paddingTop: 24,
    width: '100%',
    maxWidth: 1320,
    alignSelf: 'center',
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
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  intro: {fontSize: 15, lineHeight: 24, maxWidth: 640},
  headline: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.3,
    fontWeight: '700',
  },
  searchBar: {
    borderRadius: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    gap: 8,
  },
  emptySubtext: {
    textAlign: 'center',
  },
});
