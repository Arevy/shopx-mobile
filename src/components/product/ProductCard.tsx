import React from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {IconButton, Text, Button, useTheme} from 'react-native-paper';
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
  const {t} = useAppTranslation(['common', 'product']);
  const {colors} = useTheme();
  const imageUrl = resolveImageUrl(product.image?.url);
  return (
    <View
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.outlineVariant},
      ]}>
      <View style={styles.media}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={product.name}
          style={styles.imageLink}>
          {imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              resizeMode="contain"
              style={styles.image}
              accessibilityLabel={product.name}
            />
          ) : (
            <Text style={styles.placeholder}>{product.name}</Text>
          )}
        </Pressable>
        <IconButton
          icon={isFavourite ? 'heart' : 'heart-outline'}
          iconColor="#101112"
          containerColor={isFavourite ? '#c8ff5f' : '#ffffff'}
          style={styles.save}
          size={20}
          onPress={onToggleWishlist}
          disabled={loading}
          accessibilityLabel={
            isFavourite
              ? t('common.actions.removeFromWishlist')
              : t('common.actions.addToWishlist')
          }
          accessibilityState={{selected: isFavourite}}
        />
      </View>
      <View style={styles.body}>
        {categoryName ? (
          <Text
            numberOfLines={1}
            style={[styles.category, {color: colors.primary}]}>
            {categoryName}
          </Text>
        ) : null}
        <Pressable onPress={onPress} accessibilityRole="button">
          <Text numberOfLines={2} style={styles.title}>
            {product.name}
          </Text>
        </Pressable>
        <Text
          numberOfLines={2}
          style={[styles.description, {color: colors.onSurfaceVariant}]}>
          {product.description}
        </Text>
        <View style={styles.footer}>
          <Text variant="titleMedium" style={styles.price}>
            {formatCurrency(product.price)}
          </Text>
          <Text style={[styles.tax, {color: colors.onSurfaceVariant}]}>
            {t('common.vatIncluded')}
          </Text>
          <Button
            mode="contained"
            onPress={onAddToCart}
            loading={loading}
            disabled={loading}
            style={styles.add}
            labelStyle={styles.addLabel}
            contentStyle={styles.addContent}>
            {t('common.actions.addToCart')}
          </Button>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {flex: 1, borderRadius: 18, borderWidth: 1, overflow: 'hidden'},
  media: {backgroundColor: '#ffffff'},
  imageLink: {aspectRatio: 1.2, padding: 18},
  image: {width: '100%', height: '100%'},
  placeholder: {color: '#52595d', textAlign: 'center', marginTop: 24},
  save: {position: 'absolute', top: 4, right: 4},
  body: {padding: 14, gap: 8, flex: 1},
  category: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {fontSize: 15, lineHeight: 21, fontWeight: '600', minHeight: 42},
  description: {fontSize: 12, lineHeight: 18, minHeight: 36},
  footer: {marginTop: 'auto', paddingTop: 6},
  price: {fontWeight: '700'},
  tax: {fontSize: 10, marginTop: 2},
  add: {borderRadius: 10, marginTop: 14},
  addLabel: {fontSize: 12, marginHorizontal: 8},
  addContent: {minHeight: 44},
});
