import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, IconButton, Text, Button} from 'react-native-paper';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import type {Product} from '@/types/product';
import {formatCurrency} from '@/utils/currency';
import {resolveImageUrl} from '@/utils/images';

type ProductCardProps = {
  product: Product;
  categoryName?: string;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isFavourite: boolean;
  loading?: boolean;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isFavourite,
  loading = false,
}) => {
  const priceLabel = formatCurrency(product.price);
  const {t} = useAppTranslation(['common', 'product']);

  const imageUrl = resolveImageUrl(product.image?.url);

  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      {imageUrl ? (
        <Card.Cover source={{uri: imageUrl}} resizeMode="cover" />
      ) : null}
      <Card.Title
        titleNumberOfLines={2}
        title={product.name}
        subtitle={categoryName}
        right={() => (
          <IconButton
            mode="contained-tonal"
            icon={isFavourite ? 'heart' : 'heart-outline'}
            onPress={onToggleWishlist}
            accessibilityLabel={
              isFavourite
                ? t('common.actions.removeFromWishlist')
                : t('common.actions.addToWishlist')
            }
            disabled={loading}
          />
        )}
      />
      <Card.Content>
        {product.description ? (
          <Text variant="bodyMedium" style={styles.description}>
            {product.description}
          </Text>
        ) : null}
        <Text variant="titleMedium" style={styles.price}>
          {priceLabel}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={onAddToCart} loading={loading}>
          {t('common.actions.addToCart')}
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  description: {
    marginBottom: 8,
    color: '#4b5563',
  },
  price: {
    fontWeight: '600',
  },
});
